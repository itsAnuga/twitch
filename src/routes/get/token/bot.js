import { URLSearchParams } from "node:url";

export default function (req, res) {
  //
  const uri = new URLSearchParams({
    client_id: `${process.env.BOT_CLIENT_ID}`,
    redirect_uri: `http://localhost:3000/api/code?user=bot`,
    response_type: `code`,
    // response_type: `token`,
    scope: ["channel:bot", "user:bot", "user:read:chat", "user:write:chat"].join(" "),
  });

  //
  res.redirect(`https://id.twitch.tv/oauth2/authorize?${uri}`);
}
