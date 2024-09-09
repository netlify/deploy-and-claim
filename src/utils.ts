import { createWriteStream } from "fs";
import archiver from "archiver";

export async function post(
  url: string,
  options: RequestInit,
) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: options.headers,
      body: options.body,
      duplex: options.duplex || 'half'
    });
    if (!response.ok) {
      console.error("Response is not ok", response);
      throw new Error("Response is not ok");
    }
    if (!(options.headers?.["Content-Type"] || options.headers?.["Accept"])) {
      return response;
    }
    const json = await response.json();
    return json;
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
}

export function getEnv(env: Record<string, string> = {}) {
  return Object.entries(env).map(([key, value]) => ({
    key,
    scopes: ["builds", "functions", "runtime", "post_processing"],
    values: [
      {
        context: "all",
        value: value as string,
      },
    ],
  }));
}

export function zipFiles({zipPath, glob}: {zipPath: string, glob: string}) {
  return new Promise((resolve) => {
    // create a file to stream archive data to.
    const output = createWriteStream(zipPath);
    const archive = archiver('zip', {
      zlib: { level: 9 } // Sets the compression level.
    });

    // listen for all archive data to be written
    // 'close' event is fired only when a file descriptor is involved
    output.on('close', function () {
      resolve({ zipPath });
    });

    // good practice to catch this error explicitly
    archive.on('error', function (err) {
      throw err;
    });

    // pipe archive data to the file
    archive.pipe(output);

    // append a file from stream
    // archive.append(readFileSync('index.html'), { name: 'index.html' });
    archive.glob(glob);

    // finalize the archive (ie we are done appending files but streams have to finish yet)
    // 'close', 'end' or 'finish' may be fired right after calling this method so register to them beforehand
    archive.finalize();
  });
}
