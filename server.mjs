// server.mjs
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const dist = path.join(__dirname, "dist");

app.use(express.static(dist, { index: false }));

// Healthcheck (optional)
app.get("/health", (_req, res) => res.send("ok"));

// SPA-Fallback
app.get("*", (_req, res) => {
  res.sendFile(path.join(dist, "index.html"));
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on :${port}`));
