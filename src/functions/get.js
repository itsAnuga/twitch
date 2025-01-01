export default async function get(url = "", options = {}) {
  let response = {};
  let token = {};

  try {
    response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    token = await response.json();
    token.expires_in_seconds = new Date(response.headers.get("date")).getTime() + token.expires_in;

    return token;
  } catch (error) {
    console.error(error.message);
  }
}
