// import { URLSearchParams } from "node:url";
// Options:
// {
//   body: new URLSearchParams({
//     grant_type: "refresh_token",
//     refresh_token: `${token.refresh_token}`,
//     client_id: `${process.env.USER_CLIENT_ID}`,
//     client_secret: `${process.env.USER_CLIENT_SECRET}`,
//   }),
//   headers: {
//     "Content-Type": "application/x-www-form-urlencoded",
//   },
//   method: "POST",
// }
export default async function refresh(options) {
  return await getData("https://id.twitch.tv/oauth2/token", options);
}
