import * as dotenv from "dotenv";
import express from "express";
import getTokenBot from "./routes/get/token/bot.js";
import getTokenStreamer from "./routes/get/token/streamer.js";
import apiCode from "./routes/api/code.js";

const app = express();

dotenv.config();

app.get("/", function (req, res) {
  res.send(
    `<a href="/get/token/bot">Step 1</a>` +
      ` / ` +
      `<a href="/get/token/streamer">Step 2</a>`
  );
});

app.get("/get/token/bot", getTokenBot);
app.get("/get/token/streamer", getTokenStreamer);
app.use("/api/code", apiCode);

app.get("/api/token", function (req, res) {
  console.info(req.body);
  console.info(req.baseUrl);
  console.info(req.originalUrl);
  console.info(req.url);
  console.info(req.path);
  console.info(req.params);
  console.info(req.query);
  res.send(`Success!`);
});

app.listen(3000);
