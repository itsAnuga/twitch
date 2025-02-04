<script lang="ts" setup>
import { onBeforeMount, onMounted, ref, type Ref } from "vue";
import { emotes as Emotes } from "@/twitch";
import { useRoute } from "vue-router";

const emotes: Ref = ref({});
const route = useRoute();

// console.info(route);

onBeforeMount(async () => {
  emotes.value = await Emotes(
    { bot: import.meta.env.VITE_BOT_CLIENT_ID },
    { bot: { access_token: route.query.access_token } },
  );
});

onMounted(async () => {});
</script>

<template>
  <div class="chat">
    <h1>Emojis</h1>
    <!-- <ChatMessages v-bind:messages="messages" v-if="messages.length > 0" /> -->
  </div>
</template>
