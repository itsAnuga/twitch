<script lang="ts" setup>
const { messages } = defineProps(['messages'])

const message = (message) => {
  return message;
}
</script>

<style>
@media (min-width: 1024px) {
  .messages {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .message {
    align-content: center;
    display: flex;
    flex-direction: row;
    gap: 10px;
    justify-content: flex-start;
  }

  /* .message > span {
    display: flex;
  } */

  .message > .message {
    background-color: pink;
    border: 1px solid plum;
    /* display: flex; */
  }

  .message > .username {
    background-color: pink;
    border: 1px solid plum;
    /* display: flex; */
  }

  .message > .message,
  .message > .username {
    border-radius: 4px;
    padding: 4px 8px;
  }
}
</style>

<template>
  <div class="messages">
    <div class="message" v-bind:key="message.message_id" v-for="message in messages">
      <div class="username" v-html="message.chatter_user_name" />
      <span>:</span>
      <div class="message" v-html="message.message.text" />
    </div>
  </div>
</template>
