import { normalizeWebsOpportunity } from "@/lib/sources/normalizers";
import type { RawWebsOpportunity } from "@/lib/sources/types";

const WEBS_BID_CALENDAR_URL = "https://pr-webs-vendor.des.wa.gov/BidCalendar.aspx";
const WEBS_ROOT_URL = "https://pr-webs-vendor.des.wa.gov/";

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
  if (!value) {
    return "";
  }

  const [month, day, year] = value.split("/");
  if (!month || !day || !year) {
    return "";
  }

  const fullYear = year.length === 2 ? `20${year}` : year;
  return `${fullYear}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function buildStatus(dueDate?: string) {
  const isoDate = toIsoDate(dueDate);
  if (!isoDate) {
    return "Open" as const;
  }

  const due = Date.parse(isoDate);
  const now = Date.now();
  const daysUntilDue = (due - now) / (1000 * 60 * 60 * 24);

  if (daysUntilDue < 0) {
    return "Closed" as const;
  }

  if (daysUntilDue <= 5) {
    return "Closing Soon" as const;
  }

  return "Open" as const;
}

function inferOpportunityType(title: string) {
  const lower = title.toLowerCase();

  if (lower.includes("sources sought") || lower.includes("market research")) {
    return "Early Opportunity (Government is researching vendors)" as const;
  }

  if (lower.includes("award")) {
    return "Contract Already Awarded" as const;
  }

  if (lower.includes("pre-solicitation") || lower.includes("presolicitation")) {
    return "Coming Soon" as const;
  }

  return "Open for Bids" as const;
}

function inferCommodityCode(text: string) {
  const match = text.match(/\b\d{3}-\d{2}\b/);
  return match?.[0] ?? "Not listed";
}

function inferContactName(text: string) {
  const refIndex = text.search(/Ref #:/i);
  if (refIndex === -1) {
    return "See original WEBS posting";
  }

  const afterRef = text.slice(refIndex).replace(/Ref #:\s*[^\s]+\s*/i, "").trim();
  const words = afterRef.split(/\s+/).slice(0, 4);
  return words.join(" ") || "See original WEBS posting";
}

function buildSummary(text: string, title: string) {
  const cleaned = text.replace(title, "").trim();
  if (!cleaned) {
    return `Live WEBS posting for ${title}. Open the original source to review full bid information.`;
  }

  return cleaned.slice(0, 280);
}

export async function fetchLiveWebsRawOpportunities(): Promise<RawWebsOpportunity[]> {
  const response = await fetch(WEBS_BID_CALENDAR_URL, {
    next: { revalidate: 1800 },
    headers: {
      "user-agent": "The Bid Vault/1.0",
    },
  });

  if (!response.ok) {
    throw new Error(`WEBS bid calendar request failed with ${response.status}`);
  }

  const html = await response.text();
  const anchorRegex =
    /<a[^>]+href="(Search_BidDetails\.aspx\?ID=\d+)"[^>]*>([\s\S]*?)<\/a>/gi;

  const matches = Array.from(html.matchAll(anchorRegex));

  return matches.slice(0, 40).map((match, index) => {
    const href = match[1];
    const title = stripHtml(match[2]);
    const start = match.index ?? 0;
    const end = matches[index + 1]?.index ?? html.length;
    const block = html.slice(start, end);
    const text = stripHtml(block);
    const dates = Array.from(text.matchAll(/\b\d{2}\/\d{2}\/\d{2}\b/g)).map(
      (item) => item[0],
    );
    const refMatch = text.match(/Ref #:\s*([A-Z0-9-]+)/i);
    const solicitationNumber = refMatch?.[1] ?? `WEBS-LIVE-${index + 1}`;
    const dueDate = toIsoDate(dates[0]);
    const postedDate = toIsoDate(dates[1] ?? dates[0]);
    const fullUrl = new URL(href, WEBS_ROOT_URL).toString();

    return {
      solicitationNumber,
      title,
      issuingEntity: "Washington WEBS Posting",
      opportunityType: inferOpportunityType(title),
      status: buildStatus(dates[0]),
      commodityCode: inferCommodityCode(text),
      postedDate,
      dueDate,
      summary: buildSummary(text, title),
      description: buildSummary(text, title),
      city: "Washington",
      stateCode: "WA",
      sourceUrl: fullUrl,
      registrationRequired: true,
      registrationNotes:
        "WEBS may require vendor registration before full file access or final bid submission.",
      contactName: inferContactName(text),
      contactEmail: "",
      contactPhone: "",
      updatedAt: postedDate || new Date().toISOString().slice(0, 10),
    };
  });
}

export async function fetchLiveWebsOpportunities() {
  const raws = await fetchLiveWebsRawOpportunities();
  return raws.map(normalizeWebsOpportunity);
}

