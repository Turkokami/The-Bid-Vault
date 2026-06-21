import { chromium } from "playwright";
import type { ScrapedOpportunity } from "../types.js";

export async function scrapeNewYork(): Promise<ScrapedOpportunity[]> {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const results: ScrapedOpportunity[] = [];

  try {
    await page.goto(
      "https://www.nyscr.ny.gov/siteUser/publicSearch.cfm",
      { waitUntil: "networkidle", timeout: 45000 }
    );

    // Submit empty search to show current opportunities
    await page.click('input[type="submit"], button[type="submit"], input[value="Search"], button:has-text("Search")').catch(() => null);
    await page.waitForTimeout(4000);

    await page.waitForSelector("table tr", { timeout: 20000 }).catch(() => null);

    const rows = await page.$$eval("table tr", (trs) =>
      trs.slice(1).map((tr) => {
        const cells = Array.from(tr.querySelectorAll("td")).map((td) =>
          (td as HTMLElement).innerText.trim()
        );
        const link = tr.querySelector("a");
        return { cells, href: link ? (link as HTMLAnchorElement).href : "" };
      })
    );

    console.log(`[NY] Page title: ${await page.title()}, rows found: ${rows.length}`);

    for (const row of rows) {
      const { cells, href } = row;
      if (cells.length < 2 || !cells[0]) continue;

      let dueDate: Date | undefined;
      const dateCell = cells[3] || cells[4] || "";
      if (dateCell) {
        const parsed = new Date(dateCell);
        if (!isNaN(parsed.getTime())) dueDate = parsed;
      }

      results.push({
        sourceCode: "new-york-nyscr",
        stateCode: "NY",
        title: cells[1] || cells[0],
        issuingEntity: cells[2] || "NY State Agency",
        opportunityType: "Solicitation",
        status: "Open",
        dueDate,
        sourceUrl: href || "https://www.nyscr.ny.gov/siteUser/publicSearch.cfm",
      });
    }
  } finally {
    await browser.close();
  }

  return results;
}
