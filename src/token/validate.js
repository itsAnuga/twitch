import capitalize from "../functions/capitalize.js";
import get from "./../functions/get.js";

// Validate the token.
export default async function validate(token) {
  try {
    // Request
    token = await get("https://id.twitch.tv/oauth2/validate", {
      headers: {
        Authorization: capitalize(token.token_type) + ` ${token.access_token}`,
      },
      method: "GET",
    });
  } catch (error) {
    // Error
    console.info(error);
  }

  // Return token information.
  return token;
}
