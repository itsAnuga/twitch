const emotes = async (env: Object, token: Object) => {
  const Emotes: Map<String, Object> = new Map()

  let Levels: Map<Number|String, Map<String, String>>
  let Sizes: Array<String> | Map<String, String>
  let response: Response

  try {
    response = await fetch('https://api.twitch.tv/helix/chat/badges/global', {
      headers: {
        Authorization: `Bearer ${token.bot.access_token}`,
        'Client-Id': `${env.bot}`,
      },
    })
  } catch (error) {
    console.log(error)
  }

  if (!response.ok) {
    return false
  }

  response = await response.json()

  for (const { set_id: Emote, versions } of response.data) {
    // console.info('emote', id)
    Levels = new Map()

    for (const version of versions) {
      // console.info(version.id)
      // Sizes = new Map()
      Sizes = []

      for (const [key, value] of new Map(Object.entries(version)).entries()) {
        if (/image_url/.test(key)) {
          // console.info(key, value)
          // Sizes.set(key, value)
          Sizes.push(value)
        }
      }
      Levels.set(version.id, Sizes)
    }
    Emotes.set(Emote, Levels)
  }

  return Emotes
}

export { emotes }
