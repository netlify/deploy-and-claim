# Creating claimable sites

This repo shows how to create a claimable site via uploading files as a zip. Note, if you want to create claimable sites from GitHub repos, you might want to use the [build and claim](https://github.com/netlify/build-and-claim/) approach.

When creating claimable sites, you're uploading the site to your Netlify account, and then generating a claimable link for end users to transfer ownership of the site to them. This is why in the set up, there will be some steps that are specific to your Netlify account and others that are more "application" specific.


## Setup

You can use the `.env` file to see and add the values for testing the flow.

### Get your team's info

- `NETLIFY_TEAM_SLUG` env var is needed and you can find this by going to your team's General settings. Find the `slug` value for the team.

### Create a Netlify OAuth Application and PAT

Go to the [Netlify UI](https://app.netlify.com) and log into the user account that you intend to be the initial owner of all new sites.

First, [create a new OAuth App](https://app.netlify.com/user/applications#oauth).

- The `Client ID` value corresponds to the `OAUTH_APP_CLIENT_ID` env var.
- The `Secret` value corresponds to the `OAUTH_APP_SECRET` env var.

Then, [create a new personal access token](https://app.netlify.com/user/applications#personal-access-tokens). It's important for the PAT to be created by the same user who created the OAuth App. Be sure to select the SAML checkbox if you log in with SSO. Also, do not set an expiry, unless you want to be responsible for eventually rotating the PAT.

- The token's value corresponds to the `NETLIFY_ADMIN_PAT` env var.


## Running

There are two scripts in this repo that are used for illustrative purposes. You can run them locally to try them out / verify them, but for production usage, you should copy them into your own web applications, adjusting to your codebases' conventions where needed.

1. Clone this repo
1. `npm i`
1. `npx tsx ./src/index.ts` will perform the following steps.

- Generates a new "session ID" for the user.
- Creates a new (empty) site on your team's account
- Generates a zip file of the `/public` directory of this repo
- Uploads the zip file to the site as a deploy to this site.
- Generates a claimable link for the site using the session ID.

Take this code and modify as needed for your own application!
