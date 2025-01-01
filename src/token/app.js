import fs from "node:fs";
import expired from "./expired.js";
import get from "./../functions/get.js";
import validate from "./validate.js";

export default async function (options) {
  // Set variable for later use.
  let token = {};

  // If a token already exists, use that.
  if (fs.existsSync("./tokens/tokenApp.json")) {
    try {
      token = JSON.parse(await fs.readFileSync("./tokens/tokenApp.json", "utf8"));
    } catch (error) {
      console.error(error);
    }

    if (!expired(token)) {
      return token;
    }
  }

  // Get the token.
  try {
    token = await get("https://id.twitch.tv/oauth2/token", options);
  } catch (error) {
    console.info(error);
  }

  // Validate the token, not needed, but still, good to do.
  // Do nothing, for now.
  validate(token);

  // Sort the Object
  token = Object.fromEntries(Object.entries(token).sort(([, a], [, b]) => a - b));

  // Store the object.
  try {
    await fs.writeFileSync("./tokens/tokenApp.json", await JSON.stringify(token));
  } catch (error) {
    console.error(error);
  }

  return token;
}
