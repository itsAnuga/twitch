import * as dotenv from "dotenv";
import { URLSearchParams } from "node:url";
import tokenApp from "./token/app.js";

dotenv.config();

await tokenApp({
  body: new URLSearchParams({
    client_id: `${process.env.BOT_CLIENT_ID}`,
    client_secret: `${process.env.BOT_CLIENT_SECRET}`,
    grant_type: `${process.env.BOT_GRANT_TYPE}`,
    scope: ["user:bot", "user:read:chat", "user:write:chat"].join(" "),
  }),
  method: "POST",
});
