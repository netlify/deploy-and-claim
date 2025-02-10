import "dotenv/config";
import { getEnv, post, zipFiles } from "./utils.ts";
import { randomUUID } from "crypto";
import { createReadStream, createWriteStream, read, readFileSync } from "fs";
import jwt from 'jsonwebtoken'

interface Props {
  user: {
    sessionId: string;
  },
  netlify: {
    team: {
      slug: string;
    };
    site: {
      name: string;
      publishDir: string;
      env?: Record<string, string>;
      zipPath: string;
    };
  };
}

const { NETLIFY_ADMIN_PAT, NETLIFY_TEAM_SLUG, OAUTH_CLIENT_ID, OAUTH_CLIENT_SECRET } = process.env;

export const netlifyHeaders = {
  Authorization: `Bearer ${NETLIFY_ADMIN_PAT}`,
  "Content-Type": "application/json",
};

async function createClaimableSite({ netlify,user }: Props) {

  console.log("Creating claimable site...");
  const site = await post("https://api.netlify.com/api/v1/sites", {
    headers: netlifyHeaders,
    body: JSON.stringify({

      // initially the site will be connected to your team
      // then it will be able to be claimed/transferred to another user
      account_slug: netlify.team.slug,
      name: netlify.site.name,

      // arbitrary value
      created_via: "deploy-and-claim",

      // what env vars should be set on the site?
      env: getEnv(netlify.site.env),

      // This session id is what will be used to link the current user
      // with their claim url.
      session_id: user.sessionId,
    }),
  });

  console.log("");
  console.log("Site created successfully!");
  console.log("Site ID:  ", site.id);
  console.log("Admin URL:", site.admin_url);

  console.log('Zipping site files...')
  await zipFiles({zipPath: netlify.site.zipPath, glob:'public/**/*'})


  console.log("Deploying site...");
  const deploy = await post(`https://api.netlify.com/api/v1/sites/${site.id}/deploys`, {
    headers: {
      ...netlifyHeaders,
      "Content-Type": "application/zip",
    },
    body: createReadStream(netlify.site.zipPath),
    //@ts-ignore
    duplex: "half",
  });


  console.log("Creating claim url...");
  const token = jwt.sign({ client_id: OAUTH_CLIENT_ID, session_id: user.sessionId }, OAUTH_CLIENT_SECRET);
  console.log("Link to claim the site:")
  console.log("https://app.netlify.com/claim?token=" + token)

}


// Example usage...
createClaimableSite({
  user: {
    sessionId: randomUUID()
  },
  netlify: {
    team: {
      slug: NETLIFY_TEAM_SLUG || '',
    },
    site: {
      name: `b-and-c-${randomUUID()}`.slice(0, 16),
      publishDir: "/public",
      env: {
        MY_API_KEY: "my-api-key-value",
      },
      zipPath: "site.zip",
    },
  },
});
