import emotes from '../emotes.json' with { type: 'json' }

// console.info(emotes.data)

for (const { versions } of emotes.data) {
  for (const version of versions) {
    for (const [key, value] of new Map(Object.entries(version)).entries()) {
      if (/image_url/.test(key)) {
        console.info(key, value)
      }
    }
  }
}
