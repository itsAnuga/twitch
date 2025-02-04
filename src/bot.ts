// import ws from 'ws'

/**
 *
 * @param {Object} data
 * @param {Object} token
 * @param {Object} env
 * @param {Object} broadcaster_id's
 */
const handleWebSocketMessage = (data, token, env, ids) => {
  data = JSON.parse(data.data);

  // console.info(data)

  switch (data.metadata.message_type) {
    case "session_welcome":
      registerEventSubListeners(data.payload.session.id, token, env, ids);
      break;

    case "notification":
      switch (data.metadata.subscription_type) {
        case "channel.chat.message":
          // console.log(data.payload.event)
          // Send reply message here if the parsed message contains a command etc.
          // sendChatMessage(`hey, I'm a bot`, token, env, ids)
          return data.payload.event;
      }
      break;
  }

  return false;
};

/**
 *
 * @param {String} websocketSessionId
 * @param {Object} token
 * @param {Object} env
 * @param {Object} ids
 */
const registerEventSubListeners = async (
  websocketSessionId,
  token,
  env,
  ids,
) => {
  const response = await fetch(
    "https://api.twitch.tv/helix/eventsub/subscriptions",
    {
      body: JSON.stringify({
        type: "channel.chat.message",
        version: "1",
        condition: {
          broadcaster_user_id: ids.streamer,
          user_id: ids.bot,
        },
        transport: {
          method: "websocket",
          session_id: websocketSessionId,
        },
      }),
      headers: {
        Authorization: `Bearer ${token.bot.access_token}`,
        "Client-Id": `${env.bot}`,
        "Content-Type": "application/json",
      },
      method: "POST",
    },
  );

  if (!response.ok) {
    console.info(await response.json());
  } else if (response.status != 202) {
    console.error(
      `Failed to subscribe to channel.chat.message. API call returned status code ${response.status}`,
    );
    console.info(await response.json());
  } else {
    // const data = await response.json()
    // console.log(`Subscribed to channel.chat.message [${data.data[0].id}]`)
  }
};

/**
 *
 * @param {String} chatMessage
 * @param {Object} token
 * @param {Object} env
 * @param {Object} ids
 */
const sendChatMessage = async (chatMessage, token, env, ids) => {
  const response = await fetch("https://api.twitch.tv/helix/chat/messages", {
    body: JSON.stringify({
      broadcaster_id: env.streamer,
      sender_id: env.bot,
      message: chatMessage,
    }),
    headers: {
      Authorization: `Bearer ${token.bot.access_token}`,
      "Client-Id": `${env.bot}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    console.error("Not ok!");
    console.error(response.status);
  } else if (response.status != 200) {
    console.error("Failed to send chat message");
    console.error(await response.json());
  } else {
    console.log("Sent chat message: " + chatMessage);
  }
};

/**
 *
 * @param {Object} token
 * @param {Object} env
 * @param {Object} ids
 * @returns
 */
const WebSocketClient = (token, env, ids) => {
  const Client = new WebSocket("wss://eventsub.wss.twitch.tv/ws");

  Client.addEventListener("error", console.error);
  Client.addEventListener("message", (data) => {
    handleWebSocketMessage(data, token, env, ids);
  });
  Client.addEventListener("open", console.log);
};

export {
  handleWebSocketMessage,
  registerEventSubListeners,
  sendChatMessage,
  WebSocketClient,
};
