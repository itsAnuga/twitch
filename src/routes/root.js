export default function (req, res) {
  res.send(
    `<a href="/get/token/bot">Step 1</a>` +
      ` / ` +
      `<a href="/get/token/streamer">Step 2</a>`
  );
}
