import WebSocket from "ws";
import * as dotenv from "dotenv";
import fs from "node:fs";
import get from "./functions/get.js";

dotenv.config();

// let tokenApp = undefined;
let tokenUsers = undefined;

// if (fs.existsSync("./tokens/tokenApp.json")) {
//   try {
//     tokenApp = JSON.parse(fs.readFileSync("./tokens/tokenApp.json", "utf8"));
//   } catch (err) {
//     console.error(err);
//   }
// }

if (fs.existsSync("./tokens/tokenUsers.json")) {
  try {
    tokenUsers = JSON.parse(
      fs.readFileSync("./tokens/tokenUsers.json", "utf8")
    );
  } catch (err) {
    console.error(err);
  }
}

// if (tokenApp === undefined) {
//   process.exit(1);
// }

if (tokenUsers === undefined) {
  process.exit(1);
}

const bot = await get("https://api.twitch.tv/helix/users", {
  headers: {
    Authorization: `Bearer ${tokenUsers.bot.access_token}`,
    "Client-Id": `${process.env.BOT_CLIENT_ID}`,
  },
});

const streamer = await get("https://api.twitch.tv/helix/users", {
  headers: {
    Authorization: `Bearer ${tokenUsers.streamer.access_token}`,
    "Client-Id": `${process.env.STREAMER_CLIENT_ID}`,
  },
});

const BOT_USER_ID = bot.data[0].id;
const STREAMER_USER_ID = streamer.data[0].id;
const EVENTSUB_WEBSOCKET_URL = "wss://eventsub.wss.twitch.tv/ws";

const startWebSocketClient = () => {
  let websocketClient = new WebSocket(EVENTSUB_WEBSOCKET_URL);

  websocketClient.on("error", console.error);
  websocketClient.on("open", () => {
    console.log("WebSocket connection opened to " + EVENTSUB_WEBSOCKET_URL);
  });
  websocketClient.on("message", (data) => {
    handleWebSocketMessage(JSON.parse(data.toString()));
  });

  return websocketClient;
};

const registerEventSubListeners = async (websocketSessionId) => {
  const response = await fetch(
    "https://api.twitch.tv/helix/eventsub/subscriptions",
    {
      body: JSON.stringify({
        type: "channel.chat.message",
        version: "1",
        condition: {
          broadcaster_user_id: STREAMER_USER_ID,
          user_id: BOT_USER_ID,
        },
        transport: {
          method: "websocket",
          session_id: websocketSessionId,
        },
      }),
      headers: {
        Authorization: `Bearer ${tokenUsers.bot.access_token}`,
        "Client-Id": `${process.env.BOT_CLIENT_ID}`,
        "Content-Type": "application/json",
      },
      method: "POST",
    }
  );

  if (!response.ok) {
    //
    console.info(await response.json());
    process.exit(1);
  } else if (response.status != 202) {
    console.error(
      "Failed to subscribe to channel.chat.message. API call returned status code " +
        response.status
    );
    console.info(await response.json());
    process.exit(1);
  } else {
    const data = await response.json();
    console.log(`Subscribed to channel.chat.message [${data.data[0].id}]`);
  }
};

const sendChatMessage = async (chatMessage) => {
  let response = await fetch("https://api.twitch.tv/helix/chat/messages", {
    body: JSON.stringify({
      broadcaster_id: STREAMER_USER_ID,
      sender_id: BOT_USER_ID,
      message: chatMessage,
    }),
    headers: {
      Authorization: `Bearer ${tokenUsers.bot.access_token}`,
      "Client-Id": `${process.env.BOT_CLIENT_ID}`,
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

const handleWebSocketMessage = (data) => {
  switch (data.metadata.message_type) {
    case "session_welcome":
      registerEventSubListeners(data.payload.session.id);
      break;

    case "notification":
      switch (data.metadata.subscription_type) {
        case "channel.chat.message":
          console.log(
            `MSG #${data.payload.event.broadcaster_user_login}` +
              ` ` +
              `<${data.payload.event.chatter_user_login}>` +
              ` ` +
              `${data.payload.event.message.text}`
          );

          if (data.payload.event.message.text.trim() == "HeyGuys") {
            sendChatMessage("VoHiYo");
          }
          break;
      }
      break;
  }
};

startWebSocketClient();
