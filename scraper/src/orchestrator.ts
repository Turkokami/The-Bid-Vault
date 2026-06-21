import { upsertOpportunity, logSync } from "./db.js";
import { scrapeWashington } from "./scrapers/washington.js";
import { scrapeCaliforia } from "./scrapers/california.js";
import { scrapeNewYork } from "./scrapers/new-york.js";
import { scrapeColorado } from "./scrapers/colorado.js";
import type { ScrapedOpportunity } from "./types.js";

type Scraper = {
  name: string;
  sourceCode: string;
  fn: () => Promise<ScrapedOpportunity[]>;
};

const scrapers: Scraper[] = [
  { name: "Washington WEBS", sourceCode: "washington-webs", fn: scrapeWashington },
  { name: "California Cal eProcure", sourceCode: "california-caleprocure", fn: scrapeCaliforia },
  { name: "New York NYSCR", sourceCode: "new-york-nyscr", fn: scrapeNewYork },
  { name: "Colorado BIDS", sourceCode: "colorado-bids", fn: scrapeColorado },
];

export async function runAllScrapers() {
  const results: Record<string, { status: string; count: number; error?: string }> = {};

  for (const scraper of scrapers) {
    console.log(`[${scraper.name}] Starting...`);
    let added = 0;
    let updated = 0;

    try {
      const opportunities = await scraper.fn();

      for (const opp of opportunities) {
        const result = await upsertOpportunity(opp);
        if (result === "inserted") added++;
        else updated++;
      }

      await logSync(scraper.sourceCode, "success", added, updated);
      results[scraper.name] = { status: "success", count: opportunities.length };
      console.log(`[${scraper.name}] Done — ${opportunities.length} opportunities (${added} new, ${updated} updated)`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[${scraper.name}] Failed: ${message}`);
      await logSync(scraper.sourceCode, "failed", 0, 0, message).catch(() => null);
      results[scraper.name] = { status: "failed", count: 0, error: message };
    }
  }

  return results;
}
