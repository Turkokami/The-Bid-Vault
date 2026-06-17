import { chromium } from "playwright";
import type { ScrapedOpportunity } from "../types.js";

export async function scrapeWashington(): Promise<ScrapedOpportunity[]> {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const results: ScrapedOpportunity[] = [];

  try {
    await page.goto(
      "https://pr-webs-vendor.des.wa.gov/BidOpportunities.aspx",
      { waitUntil: "networkidle", timeout: 30000 }
    );

    // Wait for bid rows to load
    await page.waitForSelector("table tr", { timeout: 15000 });

    const rows = await page.$$eval("table tr", (trs) =>
      trs.slice(1).map((tr) => {
        const cells = Array.from(tr.querySelectorAll("td")).map((td) =>
          td.innerText.trim()
        );
        const link = tr.querySelector("a");
        return {
          cells,
          href: link ? (link as HTMLAnchorElement).href : "",
        };
      })
    );

    for (const row of rows) {
      const { cells, href } = row;
      if (cells.length < 3 || !cells[0]) continue;

      const title = cells[1] || cells[0];
      const agency = cells[2] || "WA State Agency";
      const dueDateRaw = cells[4] || cells[3] || "";

      let dueDate: Date | undefined;
      if (dueDateRaw) {
        const parsed = new Date(dueDateRaw);
        if (!isNaN(parsed.getTime())) dueDate = parsed;
      }

      results.push({
        sourceCode: "washington-webs",
        stateCode: "WA",
        title,
        issuingEntity: agency,
        opportunityType: "Solicitation",
        status: "Open",
        dueDate,
        sourceUrl: href || "https://pr-webs-vendor.des.wa.gov/BidOpportunities.aspx",
      });
    }
  } finally {
    await browser.close();
  }

  return results;
}
