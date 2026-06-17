import { chromium } from "playwright";
import type { ScrapedOpportunity } from "../types.js";

export async function scrapeNewYork(): Promise<ScrapedOpportunity[]> {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const results: ScrapedOpportunity[] = [];

  try {
    // NY State Contract Reporter public search
    await page.goto(
      "https://www.nyscr.ny.gov/siteUser/publicSearch.cfm",
      { waitUntil: "networkidle", timeout: 30000 }
    );

    await page.waitForSelector("table tr", { timeout: 15000 }).catch(() => null);

    const rows = await page.$$eval("table tr", (trs) =>
      trs.slice(1).map((tr) => {
        const cells = Array.from(tr.querySelectorAll("td")).map((td) =>
          (td as HTMLElement).innerText.trim()
        );
        const link = tr.querySelector("a");
        return { cells, href: link ? (link as HTMLAnchorElement).href : "" };
      })
    );

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
