import { URLSearchParams } from "node:url";

export default function (req, res) {
  //
  const uri = new URLSearchParams({
    client_id: `${process.env.VITE_STREAMER_CLIENT_ID}`,
    redirect_uri: `http://localhost:3000/api/code?user=streamer`,
    response_type: `code`,
    // response_type: `token`,
    scope: ["channel:bot"].join(" "),
  });

  //
  res.redirect(`https://id.twitch.tv/oauth2/authorize?${uri}`);
}
