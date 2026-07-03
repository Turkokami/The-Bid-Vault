import type { NormalizedStateLocalOpportunity } from "@/lib/sources/types";
import { buildStateLocalOpportunityId } from "@/lib/sources/normalizers";

const GEORGIA_GPR_URL = "https://ssl.doas.state.ga.us/gpr/";
const GEORGIA_MAX_ROWS = 150;

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

export async function fetchLiveGeorgiaOpportunities(): Promise<NormalizedStateLocalOpportunity[]> {
  const response = await fetch(GEORGIA_GPR_URL, {
    next: { revalidate: 1800 },
    signal: AbortSignal.timeout(7000),
    headers: {
      "user-agent": "The Bid Vault/1.0",
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
  });

  if (!response.ok) {
    throw new Error(`Georgia GPR request failed with ${response.status}`);
  }

  const html = await response.text();

  // GPR renders a table of solicitations — look for table rows with links
  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  const rows = Array.from(html.matchAll(rowRegex)).map((m) => m[1]);

  const results: NormalizedStateLocalOpportunity[] = [];

  for (const row of rows.slice(0, GEORGIA_MAX_ROWS * 2)) {
    const linkMatch = row.match(/<a[^>]+href="([^"]*SolicitationSearch[^"]*)"[^>]*>([\s\S]*?)<\/a>/i)
      ?? row.match(/<a[^>]+href="([^"]*solicitation[^"]*)"[^>]*>([\s\S]*?)<\/a>/i);
    if (!linkMatch) continue;

    const href = linkMatch[1];
    const title = stripHtml(linkMatch[2]);
    if (!title || title.length < 5) continue;

    const cells = Array.from(row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)).map(
      (m) => stripHtml(m[1]),
    );

    const solId = cells.find((c) => /[A-Z0-9]{3,}-\d{4,}/i.test(c)) ?? `ga-${results.length + 1}`;
    const dueDateRaw = cells.find((c) => /\d{1,2}\/\d{1,2}\/\d{2,4}/.test(c)) ?? "";
    const dueDate = toIsoDate(dueDateRaw.match(/\d{1,2}\/\d{1,2}\/\d{2,4}/)?.[0]);
    const agency = cells.find((c) => c.length > 10 && c !== title && !/\d{1,2}\/\d{1,2}\/\d{2,4}/.test(c)) ?? "Georgia State Agency";
    const sourceUrl = href.startsWith("http") ? href : `https://ssl.doas.state.ga.us${href.startsWith("/") ? "" : "/gpr/"}${href}`;

    results.push({
      id: buildStateLocalOpportunityId("georgia", solId),
      externalId: solId,
      sourceName: "Georgia Procurement Registry",
      sourceCode: "georgia",
      stateCode: "GA",
      title,
      issuingEntity: agency,
      opportunityType: "Open for Bids",
      status: buildStatus(dueDate),
      categoryCode: "Not listed",
      postedDate: "",
      dueDate,
      summary: `Georgia state procurement opportunity: ${title}. Issued by ${agency}.`,
      description: `Live solicitation from the Georgia Procurement Registry (GPR). Open the original posting to review full specifications and submission requirements.`,
      location: "Georgia, GA",
      sourceUrl,
      registrationRequired: false,
      registrationNotes: "Georgia GPR is a public portal. Review the posting to confirm any registration requirements before submitting.",
      contactName: "See original GPR posting",
      contactEmail: "",
      contactPhone: "",
      createdAt: "",
      updatedAt: new Date().toISOString().slice(0, 10),
    });

    if (results.length >= GEORGIA_MAX_ROWS) break;
  }

  if (results.length === 0) {
    throw new Error("Georgia GPR returned no recognizable solicitation rows");
  }

  return results;
}
