import fs from "node:fs";
import * as dotenv from "dotenv";

dotenv.config();

const url = "https://id.twitch.tv/oauth2/token";

async function getData(url) {
  try {
    url +=
      "?" +
      "client_id=" +
      process.env.CLIENT_ID +
      "&" +
      "client_secret=" +
      process.env.CLIENT_SECRET +
      "&" +
      "grant_type=" +
      process.env.GRANT_TYPE;

    const response = await fetch(url, { method: "POST" });

    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(error.message);
  }
}

let response = await getData(url);

console.info(response);

try {
  fs.writeFileSync("response.json", await JSON.stringify(response));
  // file written successfully
} catch (err) {
  console.error(err);
}
