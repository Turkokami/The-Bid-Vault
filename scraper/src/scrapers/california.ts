import { chromium } from "playwright";
import type { ScrapedOpportunity } from "../types.js";

export async function scrapeCaliforia(): Promise<ScrapedOpportunity[]> {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const results: ScrapedOpportunity[] = [];

  try {
    await page.goto(
      "https://caleprocure.ca.gov/pages/Events-BS3/event-search.aspx",
      { waitUntil: "networkidle", timeout: 45000 }
    );

    // Submit empty search to show all open bids
    const searchBtn = await page.$('input[type="submit"], button[type="submit"], button:has-text("Search"), input[value="Search"]');
    if (searchBtn) {
      await searchBtn.click();
      await page.waitForTimeout(4000);
    }

    // Also try clicking any "Search" button with text
    await page.click('button:has-text("Search")').catch(() => null);
    await page.waitForTimeout(3000);

    await page.waitForSelector("table tr, .event-row, .bid-row, tr[class*='row']", { timeout: 20000 }).catch(() => null);

    const rows = await page.$$eval(
      "table tr",
      (els) =>
        els.map((el) => {
          const cells = Array.from(el.querySelectorAll("td")).map(
            (td) => (td as HTMLElement).innerText.trim()
          );
          const link = el.querySelector("a");
          return {
            cells,
            href: link ? (link as HTMLAnchorElement).href : "",
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

    console.log(`[CA] Page title: ${await page.title()}, rows found: ${rows.length}`);
  } finally {
    await browser.close();
  }

  return results;
}
