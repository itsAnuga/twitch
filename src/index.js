import fs from "node:fs";
// import { URLSearchParams } from 'node:url'
import * as dotenv from "dotenv";

dotenv.config();

function capitalize(word) {
  return String(word).charAt(0).toUpperCase() + String(word).slice(1);
}

async function getData(url = "", options = {}) {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(error.message);
  }
}

async function refresh(token) {
  return await getData("https://id.twitch.tv/oauth2/token", {
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: `${token.refresh_token}`,
      client_id: `${process.env.CLIENT_ID}`,
      client_secret: `${process.env.CLIENT_SECRET}`,
    }).toString(),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });
}

async function validate(token) {
  return await getData("https://id.twitch.tv/oauth2/validate", {
    headers: { Authorization: capitalize(token.token_type) + " " + token.access_token },
    method: "GET",
  });
}

let response = {};
let token = undefined;

if (fs.existsSync("token.json")) {
  try {
    token = JSON.parse(fs.readFileSync("./token.json", "utf8"));
  } catch (err) {
    console.error(err);
  }
}

if (token === undefined) {
  let url =
    "https://id.twitch.tv/oauth2/token" +
    "?" +
    "client_id=" +
    process.env.CLIENT_ID +
    "&" +
    "client_secret=" +
    process.env.CLIENT_SECRET +
    "&" +
    "grant_type=" +
    process.env.GRANT_TYPE;

  token = await getData(url, { method: "POST" });

  console.info(token);

  try {
    fs.writeFileSync("token.json", await JSON.stringify(token));
    // file written successfully
  } catch (err) {
    console.error(err);
  }
}

console.info(await validate(token));

// response = await refresh(token);

// console.info(response);

// console.info(await validate(token));
