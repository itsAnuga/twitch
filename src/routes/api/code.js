import fs from "node:fs";
import { URLSearchParams } from "node:url";

import * as dotenv from "dotenv";
import get from "./../../functions/get.js";

dotenv.config();

export default async function (req, res, next) {
  const { code, user } = req.query;

  let client_id = "";
  let client_secret = "";

  switch (user) {
    case "bot":
      client_id = `${process.env.BOT_CLIENT_ID}`;
      client_secret = `${process.env.BOT_CLIENT_SECRET}`;
      break;
    case "streamer":
      client_id = `${process.env.STREAMER_CLIENT_ID}`;
      client_secret = `${process.env.STREAMER_CLIENT_SECRET}`;
      break;
    default:
      console.error("No matching username.");
      process.exit(1);
  }

  let tokens = await get("https://id.twitch.tv/oauth2/token", {
    body: new URLSearchParams({
      client_id,
      client_secret,
      code: `${code}`,
      grant_type: "authorization_code",
      redirect_uri: `http://localhost:3000/api/token?user=${user}`,
    }),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });

  // If a token already exists, create array and append to that.
  if (fs.existsSync("./tokens/tokenUsers.json")) {
    let token = {};

    try {
      token = JSON.parse(
        await fs.readFileSync("./tokens/tokenUsers.json", "utf8")
      );
    } catch (error) {
      console.error(error);
    }

    tokens = {
      bot: token,
      streamer: tokens,
    };
  }

  try {
    fs.writeFileSync("./tokens/tokenUsers.json", JSON.stringify(tokens));
  } catch (err) {
    console.error(err);
  }

  switch (user) {
    case "bot":
      res.redirect("/");
      break;
    case "streamer":
      res.redirect("/");
      break;
    default:
      res.redirect("/");
      break;
  }

  next();
}
