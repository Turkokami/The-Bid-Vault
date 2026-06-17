import { chromium } from "playwright";
import type { ScrapedOpportunity } from "../types.js";

export async function scrapeColorado(): Promise<ScrapedOpportunity[]> {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const results: ScrapedOpportunity[] = [];

  try {
    await page.goto(
      "https://bids.colorado.gov/psc/COBIDSPRD/SUPPLIER/ERP/c/SCP_PUBLIC_MENU_FL.SCP_PUB_SRCH_FL.GBL",
      { waitUntil: "networkidle", timeout: 30000 }
    );

    await page.waitForSelector(".ps_grid-row, table tr", { timeout: 15000 }).catch(() => null);

    const rows = await page.$$eval(
      ".ps_grid-row, table tr",
      (els) =>
        els.map((el) => {
          const cells = Array.from(el.querySelectorAll("td, .ps_grid-cell")).map(
            (td) => (td as HTMLElement).innerText.trim()
          );
          const link = el.querySelector("a");
          return { cells, href: link ? (link as HTMLAnchorElement).href : "" };
        })
    );

    for (const row of rows) {
      const { cells, href } = row;
      if (cells.length < 2 || !cells[0]) continue;

      results.push({
        sourceCode: "colorado-bids",
        stateCode: "CO",
        title: cells[1] || cells[0],
        issuingEntity: cells[2] || "CO State Agency",
        opportunityType: "Solicitation",
        status: "Open",
        sourceUrl: href || "https://bids.colorado.gov",
      });
    }
  } finally {
    await browser.close();
  }

  return results;
}
