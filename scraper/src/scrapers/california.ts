import { chromium } from "playwright";
import type { ScrapedOpportunity } from "../types.js";

export async function scrapeCaliforia(): Promise<ScrapedOpportunity[]> {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const results: ScrapedOpportunity[] = [];

  try {
    // Cal eProcure public bid list
    await page.goto(
      "https://caleprocure.ca.gov/pages/Events-BS3/event-search.aspx",
      { waitUntil: "networkidle", timeout: 30000 }
    );

    await page.waitForSelector(".event-row, table tr, .bid-row", { timeout: 15000 }).catch(() => null);

    const rows = await page.$$eval(
      "table tr, .event-row",
      (els) =>
        els.map((el) => {
          const cells = Array.from(el.querySelectorAll("td, .cell")).map(
            (td) => (td as HTMLElement).innerText.trim()
          );
          const link = el.querySelector("a");
          return {
            cells,
            href: link ? (link as HTMLAnchorElement).href : "",
            text: (el as HTMLElement).innerText.trim(),
          };
        })
    );

    for (const row of rows) {
      const { cells, href } = row;
      if (cells.length < 2 || !cells[0]) continue;

      results.push({
        sourceCode: "california-caleprocure",
        stateCode: "CA",
        title: cells[1] || cells[0],
        issuingEntity: cells[2] || "CA State Agency",
        opportunityType: "Solicitation",
        status: "Open",
        sourceUrl: href || "https://caleprocure.ca.gov/pages/Events-BS3/event-search.aspx",
      });
    }
  } finally {
    await browser.close();
  }

  return results;
}
