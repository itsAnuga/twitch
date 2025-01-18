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

// if (tokenApp === undefined) {
//   process.exit(1);
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

if (tokenUsers === undefined) {
  process.exit(1);
}

let bot = await get("https://api.twitch.tv/helix/users", {
  headers: {
    Authorization: `Bearer ${tokenUsers.bot.access_token}`,
    "Client-Id": `${process.env.BOT_CLIENT_ID}`,
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

let streamer = await get(`https://api.twitch.tv/helix/users${user}`, {
  headers: {
    Authorization: `Bearer ${tokenUsers.streamer.access_token}`,
    "Client-Id": `${process.env.STREAMER_CLIENT_ID}`,
  },
});

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

const startWebSocketClient = () => {
  let websocketClient = new WebSocket("wss://eventsub.wss.twitch.tv/ws");

  websocketClient.on("error", console.error);
  websocketClient.on("open", () => {
    console.log("WebSocket connection opened to wss://eventsub.wss.twitch.tv/ws");
  });
  websocketClient.on("message", (data) => {
    console.info(data.toString());
    handleWebSocketMessage(JSON.parse(data.toString()));
  });

  return websocketClient;
};

const registerEventSubListeners = async (websocketSessionId, token) => {
  const response = await fetch(
    "https://api.twitch.tv/helix/eventsub/subscriptions",
    {
      body: JSON.stringify({
        type: "channel.chat.message",
        version: "1",
        condition: {
          broadcaster_user_id: token.streamer.id,
          user_id: token.bot.id,
        },
        transport: {
          method: "websocket",
          session_id: websocketSessionId,
        },
      }),
      headers: {
        Authorization: `Bearer ${token.bot.access_token}`,
        "Client-Id": `${token.bot.client_id}`,
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

const sendChatMessage = async (chatMessage, token) => {
  let response = await fetch("https://api.twitch.tv/helix/chat/messages", {
    body: JSON.stringify({
      broadcaster_id: token.streamer.id,
      sender_id: token.bot.id,
      message: chatMessage,
    }),
    headers: {
      Authorization: `Bearer ${token.bot.access_token}`,
      "Client-Id": `${token.bot.client_id}`,
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
            `MSG` +
              ` ` +
              `#${data.payload.event.broadcaster_user_login}` +
              ` ` +
              `<${data.payload.event.chatter_user_login}>` +
              ` ` +
              `${data.payload.event.message.text}`
          );

          // if (data.payload.event.message.text.trim() == "HeyGuys") {
          //   sendChatMessage("VoHiYo");
          // }
          break;
      }
      break;
  }
};

export default async function (req, res, next) {
  startWebSocketClient();
  res.send()
  next();
}
