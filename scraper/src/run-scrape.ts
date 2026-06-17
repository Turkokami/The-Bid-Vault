// One-shot script — run locally with: npm run scrape
import { runAllScrapers } from "./orchestrator.js";

console.log("Starting manual scrape run...");
runAllScrapers()
  .then((results) => {
    console.log("\n=== Scrape Results ===");
    for (const [name, result] of Object.entries(results)) {
      console.log(`${name}: ${result.status} — ${result.count} opportunities${result.error ? ` (${result.error})` : ""}`);
    }
    process.exit(0);
  })
  .catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
  });
