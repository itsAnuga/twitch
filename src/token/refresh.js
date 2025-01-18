import get from "../functions/get.js";

export default async function refresh(options) {
  return await get("https://id.twitch.tv/oauth2/token", options);
}
