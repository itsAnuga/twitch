import capitalize from "../functions/capitalize.js";
import get from "./../functions/get.js";

// Validating the token.
export default async function validate(token) {
  try {
    token = await get("https://id.twitch.tv/oauth2/validate", {
      headers: {
        Authorization: `${capitalize(token.token_type)} ${token.access_token}`,
      },
      method: "GET",
    });
  } catch (error) {
    console.info(error);
  }
  return token;
}
