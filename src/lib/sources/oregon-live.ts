import type { NormalizedStateLocalOpportunity } from "@/lib/sources/types";
import { buildStateLocalOpportunityId } from "@/lib/sources/normalizers";

// Oregon Procurement Information Network (ORPIN) public bid list
const OREGON_ORPIN_URL = "https://orpin.oregon.gov/open.dll/showBids?sessionID=0&appID=13&action=bidsListing";
const OREGON_ROOT_URL = "https://orpin.oregon.gov";
const OREGON_MAX_ROWS = 150;

function decodeHtml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function stripHtml(value: string) {
  return decodeHtml(value)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toIsoDate(value?: string) {
  if (!value) return "";
  const cleaned = value.trim();
  const mdy = cleaned.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (mdy) {
    const [, m, d, y] = mdy;
    const year = y.length === 2 ? `20${y}` : y;
    return `${year}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  const ts = Date.parse(cleaned);
  if (!Number.isNaN(ts)) return new Date(ts).toISOString().slice(0, 10);
  return "";
}

function buildStatus(dueDate: string): NormalizedStateLocalOpportunity["status"] {
  if (!dueDate) return "Open";
  const due = Date.parse(dueDate);
  if (Number.isNaN(due)) return "Open";
  const days = (due - Date.now()) / 86400000;
  if (days < 0) return "Closed";
  if (days <= 5) return "Closing Soon";
  return "Open";
}

export async function fetchLiveOregonOpportunities(): Promise<NormalizedStateLocalOpportunity[]> {
  const response = await fetch(OREGON_ORPIN_URL, {
    next: { revalidate: 1800 },
    signal: AbortSignal.timeout(7000),
    headers: {
      "user-agent": "The Bid Vault/1.0",
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
  });

  if (!response.ok) {
    throw new Error(`Oregon ORPIN request failed with ${response.status}`);
  }

  const html = await response.text();

  // ORPIN is a CGI-based portal — bids are listed in table rows with showBid links
  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  const rows = Array.from(html.matchAll(rowRegex)).map((m) => m[1]);

  const results: NormalizedStateLocalOpportunity[] = [];
  const scanLimit = OREGON_MAX_ROWS * 4;

  for (const row of rows.slice(0, scanLimit)) {
    const linkMatch =
      row.match(
        /<a[^>]+href="([^"]*(?:showBid|BidDetail|bidDetail|viewBid)[^"]*)"[^>]*>([\s\S]*?)<\/a>/i,
      ) ?? row.match(/<a[^>]+href="([^"]*open\.dll[^"]*)"[^>]*>([\s\S]*?)<\/a>/i);
    if (!linkMatch) continue;

    const href = linkMatch[1];
    const title = stripHtml(linkMatch[2]);
    if (!title || title.length < 4) continue;

    const cells = Array.from(row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)).map((m) =>
      stripHtml(m[1]),
    );

    const solId =
      cells.find((c) => /[A-Z0-9]{2,}-?\d{3,}/i.test(c)) ?? `or-${results.length + 1}`;
    const dueDateRaw = cells.find((c) => /\d{1,2}\/\d{1,2}\/\d{2,4}/.test(c)) ?? "";
    const dueDate = toIsoDate(dueDateRaw.match(/\d{1,2}\/\d{1,2}\/\d{2,4}/)?.[0]);
    const agency =
      cells.find(
        (c) =>
          c.length > 6 &&
          c !== title &&
          !/\d{1,2}\/\d{1,2}\/\d{2,4}/.test(c) &&
          c !== solId,
      ) ?? "Oregon State Agency";
    const sourceUrl = href.startsWith("http")
      ? href
      : `${OREGON_ROOT_URL}/${href.replace(/^\//, "")}`;

    results.push({
      id: buildStateLocalOpportunityId("oregon", solId),
      externalId: solId,
      sourceName: "Oregon ORPIN",
      sourceCode: "oregon",
      stateCode: "OR",
      title,
      issuingEntity: agency,
      opportunityType: "Open for Bids",
      status: buildStatus(dueDate),
      categoryCode: "Not listed",
      postedDate: "",
      dueDate,
      summary: `Oregon ORPIN solicitation: ${title}. Issued by ${agency}.`,
      description: `Live solicitation from the Oregon Procurement Information Network (ORPIN). Open the original posting for full specifications, attachments, and submission requirements.`,
      location: "Oregon, OR",
      sourceUrl,
      registrationRequired: true,
      registrationNotes:
        "ORPIN may require vendor registration before downloading bid documents or submitting a formal response.",
      contactName: "See original ORPIN posting",
      contactEmail: "",
      contactPhone: "",
      createdAt: "",
      updatedAt: new Date().toISOString().slice(0, 10),
    });

    if (results.length >= OREGON_MAX_ROWS) break;
  }

  if (results.length === 0) {
    throw new Error("Oregon ORPIN returned no recognizable bid rows");
  }

  return results;
}
