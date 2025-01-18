import WebSocket from "ws";
import * as dotenv from "dotenv";
import fs from "node:fs";
import get from "./functions/get.js";
import refresh from "./token/refresh.js";
import { URLSearchParams } from "node:url";

dotenv.config();

// const user = ``;
const user = `?login=AnnieFuchsia`;
// let tokenApp = undefined;
let tokenUsers = undefined;
let tokenUpdated = false;

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

let bot = await get("https://api.twitch.tv/helix/users", {
  headers: {
    Authorization: `Bearer ${tokenUsers.bot.access_token}`,
    "Client-Id": `${process.env.BOT_CLIENT_ID}`,
  },
});

let streamer = await get(`https://api.twitch.tv/helix/users${user}`, {
  headers: {
    Authorization: `Bearer ${tokenUsers.streamer.access_token}`,
    "Client-Id": `${process.env.STREAMER_CLIENT_ID}`,
  },
});

if (bot === undefined) {
  tokenUsers.bot = await refresh({
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: `${tokenUsers.bot.refresh_token}`,
      client_id: `${process.env.BOT_CLIENT_ID}`,
      client_secret: `${process.env.BOT_CLIENT_SECRET}`,
    }),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });
  bot = await get("https://api.twitch.tv/helix/users", {
    headers: {
      Authorization: `Bearer ${tokenUsers.bot.access_token}`,
      "Client-Id": `${process.env.BOT_CLIENT_ID}`,
    },
  });
  tokenUpdated = true;
}

if (streamer === undefined) {
  tokenUsers.streamer = await refresh({
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: `${tokenUsers.streamer.refresh_token}`,
      client_id: `${process.env.STREAMER_CLIENT_ID}`,
      client_secret: `${process.env.STREAMER_CLIENT_SECRET}`,
    }),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });
  streamer = await get(`https://api.twitch.tv/helix/users${user}`, {
    headers: {
      Authorization: `Bearer ${tokenUsers.streamer.access_token}`,
      "Client-Id": `${process.env.STREAMER_CLIENT_ID}`,
    },
  });
  tokenUpdated = true;
}

if (tokenUpdated) {
  try {
    fs.writeFileSync("./tokens/tokenUsers.json", JSON.stringify(tokenUsers));
  } catch (err) {
    console.error(err);
  }
}

/**
 *
 * @param {Object} data
 * @param {Object} token
 * @param {Object} env
 * @param {Object} broadcaster_id's
 */
const handleWebSocketMessage = (data, token, env, ids) => {
  data = JSON.parse(data.toString());

  console.info(data);

  switch (data.metadata.message_type) {
    case "session_welcome":
      registerEventSubListeners(data.payload.session.id, token, env, ids);
      break;

    case "notification":
      switch (data.metadata.subscription_type) {
        case "channel.chat.message":
          const message = data.payload.event;
          console.log(
            `MSG` +
              ` ` +
              `#${message.broadcaster_user_login}` +
              ` ` +
              `<${message.chatter_user_login}>` +
              ` ` +
              `${message.message.text}`
          );

          // if (message.message.text.trim() == "HeyGuys") {
          //   sendChatMessage("VoHiYo", token, env, ids);
          // }
          break;
      }
      break;
  }
};

/**
 *
 * @param {*} websocketSessionId
 * @param {*} token
 * @param {*} env
 * @param {*} ids
 */
const registerEventSubListeners = async (
  websocketSessionId,
  token,
  env,
  ids
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
    }
  );

  if (!response.ok) {
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

/**
 *
 * @param {*} chatMessage
 * @param {*} token
 * @param {*} env
 * @param {*} ids
 */
const sendChatMessage = async (chatMessage, token, env, ids) => {
  let response = await fetch("https://api.twitch.tv/helix/chat/messages", {
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
 * @param {*} token
 * @param {*} env
 * @param {*} ids
 * @returns
 */
const startWebSocketClient = (token, env, ids) => {
  let websocketClient = new WebSocket("wss://eventsub.wss.twitch.tv/ws");

  websocketClient.on("error", console.error);
  websocketClient.on("message", (data) => {
    handleWebSocketMessage(data, token, env, ids);
  });
  websocketClient.on("open", console.log);

  return websocketClient;
};

startWebSocketClient(
  tokenUsers,
  { bot: process.env.BOT_CLIENT_ID },
  {
    bot: bot.data[0].id,
    streamer: streamer.data[0].id,
  }
);

export {
  handleWebSocketMessage,
  registerEventSubListeners,
  sendChatMessage,
  startWebSocketClient,
};
