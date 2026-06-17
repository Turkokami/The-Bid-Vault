import type { NormalizedStateLocalOpportunity } from "@/lib/sources/types";
import { buildStateLocalOpportunityId } from "@/lib/sources/normalizers";

const PENN_SOLICITATIONS_URL = "https://www.emarketplace.state.pa.us/Solicitations.aspx";
const PENN_ROOT_URL = "https://www.emarketplace.state.pa.us";
const PENN_MAX_ROWS = 150;

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

export async function fetchLivePennsylvaniaOpportunities(): Promise<
  NormalizedStateLocalOpportunity[]
> {
  const response = await fetch(PENN_SOLICITATIONS_URL, {
    next: { revalidate: 1800 },
    headers: {
      "user-agent": "The Bid Vault/1.0",
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
    signal: AbortSignal.timeout(20000),
  });

  if (!response.ok) {
    throw new Error(`PA eMarketplace request failed with ${response.status}`);
  }

  const html = await response.text();

  // PA eMarketplace renders a grid / table with solicitation rows and anchor links
  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  const rows = Array.from(html.matchAll(rowRegex)).map((m) => m[1]);

  const results: NormalizedStateLocalOpportunity[] = [];
  const scanLimit = PENN_MAX_ROWS * 4;

  for (const row of rows.slice(0, scanLimit)) {
    const linkMatch = row.match(
      /<a[^>]+href="([^"]*(?:SolicitationDetails|SolicDetail|Solicitation)[^"]*)"[^>]*>([\s\S]*?)<\/a>/i,
    ) ?? row.match(/<a[^>]+href="([^"]*\.aspx[^"]*)"[^>]*>([\s\S]*?)<\/a>/i);
    if (!linkMatch) continue;

    const href = linkMatch[1];
    const title = stripHtml(linkMatch[2]);
    if (!title || title.length < 5) continue;

    const cells = Array.from(row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)).map((m) =>
      stripHtml(m[1]),
    );

    const solId =
      cells.find((c) => /[A-Z0-9]{2,}-?\d{4,}/i.test(c)) ?? `pa-${results.length + 1}`;
    const dueDateRaw = cells.find((c) => /\d{1,2}\/\d{1,2}\/\d{2,4}/.test(c)) ?? "";
    const dueDate = toIsoDate(dueDateRaw.match(/\d{1,2}\/\d{1,2}\/\d{2,4}/)?.[0]);
    const agency =
      cells.find(
        (c) =>
          c.length > 8 &&
          c !== title &&
          !/\d{1,2}\/\d{1,2}\/\d{2,4}/.test(c) &&
          c !== solId,
      ) ?? "Pennsylvania State Agency";
    const sourceUrl = href.startsWith("http")
      ? href
      : `${PENN_ROOT_URL}/${href.replace(/^\//, "")}`;

    results.push({
      id: buildStateLocalOpportunityId("pennsylvania", solId),
      externalId: solId,
      sourceName: "PA eMarketplace",
      sourceCode: "pennsylvania",
      stateCode: "PA",
      title,
      issuingEntity: agency,
      opportunityType: "Open for Bids",
      status: buildStatus(dueDate),
      categoryCode: "Not listed",
      postedDate: "",
      dueDate,
      summary: `Pennsylvania eMarketplace solicitation: ${title}. Issued by ${agency}.`,
      description: `Live solicitation from Pennsylvania eMarketplace. Open the original posting for full specifications, attachments, and submission requirements.`,
      location: "Pennsylvania, PA",
      sourceUrl,
      registrationRequired: true,
      registrationNotes:
        "Pennsylvania eMarketplace may require SRM (JAGGAER) vendor registration before submitting a formal response.",
      contactName: "See original eMarketplace posting",
      contactEmail: "",
      contactPhone: "",
      createdAt: "",
      updatedAt: new Date().toISOString().slice(0, 10),
    });

    if (results.length >= PENN_MAX_ROWS) break;
  }

  if (results.length === 0) {
    throw new Error("PA eMarketplace returned no recognizable solicitation rows");
  }

  return results;
}
