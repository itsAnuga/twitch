import * as dotenv from "dotenv";
import express from "express";
import getTokenBot from "./routes/get/token/bot.js";
import getTokenStreamer from "./routes/get/token/streamer.js";
import apiCode from "./routes/api/code.js";
import chat from "./routes/chat.js";
import root from "./routes/root.js";

const app = express();

dotenv.config();

app.get("/", root);
app.get("/chat", chat);
app.get("/get/token/bot", getTokenBot);
app.get("/get/token/streamer", getTokenStreamer);

app.use("/api/code", apiCode);

app.listen(3000);
