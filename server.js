const express = require("express");
const path = require("path");
const app = express();

// statische Dateien aus /dist
app.use(express.static(path.join(__dirname, "dist")));

// SPA-Fallback
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on :${port}`));