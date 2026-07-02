import type { NormalizedStateLocalOpportunity } from "@/lib/sources/types";
import { buildStateLocalOpportunityId } from "@/lib/sources/normalizers";

// Florida My Florida Marketplace - Vendor Bid System (VBS) public search
const FLORIDA_VBS_URL =
  "https://www.myfloridamarketplace.com/mfmp/apps/bso/bizproc/ControllerServlet?event=list&type=Solicitation&status=POSTED";
const FLORIDA_MAX_ROWS = 150;

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

export async function fetchLiveFloridaOpportunities(): Promise<NormalizedStateLocalOpportunity[]> {
  const response = await fetch(FLORIDA_VBS_URL, {
    next: { revalidate: 1800 },
    signal: AbortSignal.timeout(7000),
    headers: {
      "user-agent": "The Bid Vault/1.0",
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
    signal: AbortSignal.timeout(20000),
  });

  if (!response.ok) {
    throw new Error(`Florida VBS request failed with ${response.status}`);
  }

  const html = await response.text();

  // VBS renders a table — look for rows with solicitation links
  const rowRegex =
    /<tr[^>]*class="[^"]*(?:odd|even|result|row)[^"]*"[^>]*>([\s\S]*?)<\/tr>/gi;
  const fallbackRowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let rows = Array.from(html.matchAll(rowRegex)).map((m) => m[1]);
  if (rows.length < 3) {
    rows = Array.from(html.matchAll(fallbackRowRegex)).map((m) => m[1]);
  }

  const results: NormalizedStateLocalOpportunity[] = [];
  const scanLimit = FLORIDA_MAX_ROWS * 4;

  for (const row of rows.slice(0, scanLimit)) {
    const linkMatch =
      row.match(
        /<a[^>]+href="([^"]*(?:ViewSolicitation|solicitation|Solicitation)[^"]*)"[^>]*>([\s\S]*?)<\/a>/i,
      ) ?? row.match(/<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i);
    if (!linkMatch) continue;

    const href = linkMatch[1];
    const title = stripHtml(linkMatch[2]);
    if (!title || title.length < 5) continue;

    const cells = Array.from(row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)).map((m) =>
      stripHtml(m[1]),
    );

    const solId =
      cells.find((c) => /[A-Z0-9]{3,}-?\d{4,}/i.test(c)) ?? `fl-${results.length + 1}`;
    const dueDateRaw = cells.find((c) => /\d{1,2}\/\d{1,2}\/\d{2,4}/.test(c)) ?? "";
    const dueDate = toIsoDate(dueDateRaw.match(/\d{1,2}\/\d{1,2}\/\d{2,4}/)?.[0]);
    const agency =
      cells.find(
        (c) =>
          c.length > 8 &&
          c !== title &&
          !/\d{1,2}\/\d{1,2}\/\d{2,4}/.test(c) &&
          c !== solId,
      ) ?? "Florida State Agency";
    const sourceUrl = href.startsWith("http")
      ? href
      : `https://www.myfloridamarketplace.com${href.startsWith("/") ? "" : "/mfmp/apps/bso/bizproc/"}${href}`;

    results.push({
      id: buildStateLocalOpportunityId("florida", solId),
      externalId: solId,
      sourceName: "Florida MFMP / VBS",
      sourceCode: "florida",
      stateCode: "FL",
      title,
      issuingEntity: agency,
      opportunityType: "Open for Bids",
      status: buildStatus(dueDate),
      categoryCode: "Not listed",
      postedDate: "",
      dueDate,
      summary: `Florida state procurement opportunity: ${title}. Issued by ${agency}.`,
      description: `Live solicitation from Florida MyFloridaMarketplace (MFMP) Vendor Bid System. Open the original posting for full specifications and submission instructions.`,
      location: "Florida, FL",
      sourceUrl,
      registrationRequired: false,
      registrationNotes:
        "Florida VBS is publicly viewable. Review the posting to confirm any MFMP vendor registration requirements before submitting a response.",
      contactName: "See original VBS posting",
      contactEmail: "",
      contactPhone: "",
      createdAt: "",
      updatedAt: new Date().toISOString().slice(0, 10),
    });

    if (results.length >= FLORIDA_MAX_ROWS) break;
  }

  if (results.length === 0) {
    throw new Error("Florida VBS returned no recognizable solicitation rows");
  }

  return results;
}
