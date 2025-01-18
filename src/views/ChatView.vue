<script lang="ts" setup>
import { onBeforeMount, onMounted, ref, type Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  handleWebSocketMessage /* , registerEventSubListeners */ /* , sendChatMessage */ /* , WebSocketClient */,
} from '@/bot'
import { emotes as Emotes } from '@/twitch'
import ChatMessages from '@/components/chat/ChatMessages.vue'

const emotes: Ref = ref({})
const message: Ref = ref({})
const messages: Ref = ref([])
const router = useRouter()
const route = useRoute()

const WebSocketClient = (token: Object, env: Object, ids: Object) => {
  const Client = new WebSocket('wss://eventsub.wss.twitch.tv/ws')

  Client.addEventListener('error', console.error)

  Client.addEventListener('message', (data) => {
    message.value = handleWebSocketMessage(data, token, env, ids)

    if (message.value === false) {
      return
    }

    if (message.value.chatter_user_id === '19264788') {
      return
    }

    if (message.value.chatter_user_id === '93467980') {
      return
    }

    messages.value.push(message.value)

    if (messages.value.length > 12) {
      messages.value.shift()
    }
  })

  Client.addEventListener('open', console.log)
}

onBeforeMount(async () => {
  let username = ''

  if (route.query.username !== undefined) {
    username = `?username=${route.query.username}`
  }

  if (route.query.access_token === undefined && route.query.id === undefined) {
    router.push(`/api/token/refresh${username}`)
  }
})

onMounted(async () => {
  emotes.value = await Emotes(
    { bot: import.meta.env.VITE_BOT_CLIENT_ID },
    { bot: { access_token: route.query.access_token } },
  )

  console.info(emotes.value)

  WebSocketClient(
    { bot: { access_token: route.query.access_token } },
    { bot: import.meta.env.VITE_BOT_CLIENT_ID },
    {
      bot: route.query.bot_id,
      streamer: route.query.streamer_id,
    },
  )
})
</script>

<!-- <style></style> -->

<template>
  <div class="chat">
    <h1>Chat logging</h1>
    <ChatMessages v-bind:messages="messages" v-if="messages.length > 0" />
  </div>
</template>
