import express from "express";
import { runAllScrapers } from "./orchestrator.js";

const app = express();
const PORT = process.env.PORT || 3100;

// Secret token to protect the scrape endpoint
const SCRAPE_TOKEN = process.env.SCRAPE_TOKEN || "";

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "bid-vault-scraper", time: new Date().toISOString() });
});

app.post("/scrape", async (req, res) => {
  const token = req.headers["x-scrape-token"] || req.query.token;

  if (SCRAPE_TOKEN && token !== SCRAPE_TOKEN) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  console.log("Scrape triggered at", new Date().toISOString());

  // Respond immediately so Railway doesn't time out the HTTP request
  res.json({ status: "started", message: "Scrape running in background" });

  // Run async after response
  runAllScrapers()
    .then((results) => console.log("Scrape complete:", JSON.stringify(results, null, 2)))
    .catch((err) => console.error("Scrape error:", err));
});

// Also allow GET /scrape for Railway cron (which uses GET)
app.get("/scrape", async (req, res) => {
  const token = req.headers["x-scrape-token"] || req.query.token;

  if (SCRAPE_TOKEN && token !== SCRAPE_TOKEN) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  console.log("Scrape triggered (GET) at", new Date().toISOString());
  res.json({ status: "started" });

  runAllScrapers()
    .then((results) => console.log("Scrape complete:", JSON.stringify(results, null, 2)))
    .catch((err) => console.error("Scrape error:", err));
});

app.listen(PORT, () => {
  console.log(`Bid Vault Scraper running on port ${PORT}`);
});
