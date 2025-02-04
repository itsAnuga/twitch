import * as dotenv from "dotenv";
import { URLSearchParams } from "node:url";
import tokenApp from "./token/app.js";

dotenv.config();

await tokenApp({
  body: new URLSearchParams({
    client_id: `${process.env.VITE_BOT_CLIENT_ID}`,
    client_secret: `${process.env.VITE_BOT_CLIENT_SECRET}`,
    grant_type: `${process.env.VITE_BOT_GRANT_TYPE}`,
    scope: ["user:bot", "user:read:chat", "user:write:chat"].join(" "),
  }),
  method: "POST",
});
