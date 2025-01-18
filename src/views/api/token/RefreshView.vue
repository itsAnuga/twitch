<script lang="ts" setup>
import tokenUsers from '@/../tokenUsers.json'
import { onBeforeMount, ref, type Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const User: Ref = ref('annieFuchsia')
const bot: Ref = ref({})
const information: Ref = ref({})
const streamer: Ref = ref({})
const tokens: Ref = ref({})
const router = useRouter()
const route = useRoute()

/**
 * Refresh Bot Token
 * @param token
 * @param env
 */
async function token(token: Object, env: Object): Promise<Response> {
  return await fetch('https://id.twitch.tv/oauth2/token', {
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: `${token.refresh_token}`,
      client_id: `${env.VITE_BOT_CLIENT_ID}`,
      client_secret: `${env.VITE_BOT_CLIENT_SECRET}`,
    }),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    method: 'POST',
  })
}

/**
 * Fetch Streamer Information
 * @param token
 * @param env
 */
async function user(token: Object, env: Object, User: String): Promise<Response> {
  return await fetch(`https://api.twitch.tv/helix/users${User}`, {
    headers: {
      Authorization: `Bearer ${token.access_token}`,
      'Client-Id': `${env.VITE_BOT_CLIENT_ID}`,
    },
  })
}

tokens.value = tokenUsers

if (route.query.username !== undefined) {
  User.value = route.query.username
}

onBeforeMount(async function () {
  let temp = {}
  let token_bot = undefined

  const bot_token: Response = await token(tokenUsers.bot, import.meta.env)

  if (bot_token.ok) {
    token_bot = await bot_token.json()

    tokens.value.bot = token_bot
  }

  const bot_information: Response = await user(token_bot, import.meta.env, ``)

  if (bot_information.ok) {
    temp = await bot_information.json()

    information.value.bot = temp
  }

  const streamer_information: Response = await user(token_bot, import.meta.env, `?login=${User.value}`)

  if (streamer_information.ok) {
    temp = await streamer_information.json()

    information.value.streamer = temp

    router.push(
      `/chat` +
        `?access_token=${tokens.value.bot.access_token}` +
        `&bot_id=${information.value.bot.data[0].id}` +
        `&streamer_id=${information.value.streamer.data[0].id}`,
    )
  }
})
</script>

<template>
  <main>
    <Suspense>
      <pre>{{ information }}</pre>
    </Suspense>
  </main>
</template>
