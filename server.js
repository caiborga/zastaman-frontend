// server.js (CJS)
const express = require("express");
const path = require("path");
const app = express();

const dist = path.join(__dirname, "dist");
app.use(express.static(dist, { etag: true, maxAge: "1y", index: false }));

app.get("/health", (_req, res) => res.send("ok"));

app.get("*", (_req, res) => {
  res.sendFile(path.join(dist, "index.html"));
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on :${port}`));
