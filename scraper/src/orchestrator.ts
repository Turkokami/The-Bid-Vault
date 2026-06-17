import { db } from "./db.js";
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

async function upsertOpportunities(opportunities: ScrapedOpportunity[]) {
  let added = 0;
  let updated = 0;

  for (const opp of opportunities) {
    const existing = await db.stateLocalOpportunity.findFirst({
      where: {
        sourceName: opp.sourceCode,
        title: opp.title,
        issuingEntity: opp.issuingEntity,
      },
    });

    if (existing) {
      await db.stateLocalOpportunity.update({
        where: { id: existing.id },
        data: {
          status: opp.status,
          dueDate: opp.dueDate,
          sourceUrl: opp.sourceUrl,
          updatedAt: new Date(),
        },
      });
      updated++;
    } else {
      await db.stateLocalOpportunity.create({
        data: {
          sourceName: opp.sourceCode,
          stateCode: opp.stateCode,
          title: opp.title,
          issuingEntity: opp.issuingEntity,
          opportunityType: opp.opportunityType,
          status: opp.status,
          dueDate: opp.dueDate,
          postedDate: opp.postedDate,
          summary: opp.summary,
          sourceUrl: opp.sourceUrl,
          categoryCode: opp.categoryCode,
          registrationRequired: opp.registrationRequired ?? false,
        },
      });
      added++;
    }
  }

  return { added, updated };
}

export async function runAllScrapers() {
  const results: Record<string, { status: string; count: number; error?: string }> = {};

  for (const scraper of scrapers) {
    console.log(`[${scraper.name}] Starting...`);
    const startedAt = new Date();

    try {
      const opportunities = await scraper.fn();
      const { added, updated } = await upsertOpportunities(opportunities);

      await db.sourceSyncLog.create({
        data: {
          sourceName: scraper.sourceCode,
          syncStatus: "success",
          recordsAdded: added,
          recordsUpdated: updated,
          lastRunAt: startedAt,
        },
      });

      results[scraper.name] = { status: "success", count: opportunities.length };
      console.log(`[${scraper.name}] Done — ${opportunities.length} opportunities (${added} new, ${updated} updated)`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[${scraper.name}] Failed: ${message}`);

      await db.sourceSyncLog.create({
        data: {
          sourceName: scraper.sourceCode,
          syncStatus: "failed",
          recordsAdded: 0,
          recordsUpdated: 0,
          errorMessage: message,
          lastRunAt: startedAt,
        },
      });

      results[scraper.name] = { status: "failed", count: 0, error: message };
    }
  }

  return results;
}
