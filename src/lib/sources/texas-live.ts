import type { NormalizedStateLocalOpportunity } from "@/lib/sources/types";
import { buildStateLocalOpportunityId } from "@/lib/sources/normalizers";

const TEXAS_ESBD_URL = "https://www.txsmartbuy.gov/esbd";
const TEXAS_ROOT_URL = "https://www.txsmartbuy.gov";

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

  return `${year.padStart(4, "20")}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function buildStatus(statusText: string, dueDate: string) {
  const lower = statusText.toLowerCase();

  if (lower.includes("award") || lower.includes("no award")) {
    return "Closed" as const;
  }

  const due = Date.parse(dueDate);
  if (!Number.isNaN(due)) {
    const daysUntilDue = (due - Date.now()) / (1000 * 60 * 60 * 24);
    if (daysUntilDue < 0) return "Closed" as const;
    if (daysUntilDue <= 5) return "Closing Soon" as const;
  }

  return "Open" as const;
}

function inferOpportunityType(statusText: string, title: string) {
  const lower = `${statusText} ${title}`.toLowerCase();

  if (lower.includes("pre-solicitation") || lower.includes("presolicitation")) {
    return "Coming Soon" as const;
  }

  if (lower.includes("award")) {
    return "Contract Already Awarded" as const;
  }

  return "Open for Bids" as const;
}

export async function fetchLiveTexasOpportunities(): Promise<NormalizedStateLocalOpportunity[]> {
  const response = await fetch(TEXAS_ESBD_URL, {
    next: { revalidate: 1800 },
    headers: {
      "user-agent": "The Bid Vault/1.0",
    },
  });

  if (!response.ok) {
    throw new Error(`Texas ESBD request failed with ${response.status}`);
  }

  const html = await response.text();
  const rows = Array.from(
    html.matchAll(/<div class="esbd-result-row">([\s\S]*?)<\/div><\/div>/gi),
  ).map((match) => match[1]);

  return rows.slice(0, 40).flatMap((row) => {
    const titleMatch = row.match(/<div class="esbd-result-title"><a href="([^"]+)">([\s\S]*?)<\/a><\/div>/i);
    const solicitationId = stripHtml(row.match(/<strong>Solicitation ID:\s*<\/strong>\s*([^<]+)/i)?.[1] ?? "");
    const dueDateRaw = stripHtml(row.match(/<strong>Due Date:\s*<\/strong>\s*([^<]+)/i)?.[1] ?? "");
    const dueTimeRaw = stripHtml(row.match(/<strong>Due Time:\s*<\/strong>\s*([^<]+)/i)?.[1] ?? "");
    const agencyNumber = stripHtml(
      row.match(/<strong>Agency\/Texas SmartBuy Member Number:\s*<\/strong>\s*([^<]+)/i)?.[1] ?? "",
    );
    const statusText = stripHtml(row.match(/<strong>Status:\s*<\/strong>\s*([^<]+)/i)?.[1] ?? "");
    const postedDateRaw = stripHtml(row.match(/<strong>Posting Date:\s*<\/strong>\s*([^<]+)/i)?.[1] ?? "");
    const updatedDateRaw = stripHtml(row.match(/<strong>Last Updated:\s*<\/strong>\s*([^<]+)/i)?.[1] ?? "");

    if (!titleMatch || !solicitationId) {
      return [];
    }

    const href = titleMatch[1];
    const title = stripHtml(titleMatch[2]);
    const summary = `${statusText || "Posted"} opportunity in Texas ESBD for ${title}.`;
    const postedDate = toIsoDate(postedDateRaw);
    const dueDate = toIsoDate(dueDateRaw);
    const updatedDate = toIsoDate(updatedDateRaw.split(" ")[0] ?? updatedDateRaw);
    const sourceUrl = new URL(href, TEXAS_ROOT_URL).toString();

    return [
      {
        id: buildStateLocalOpportunityId("texas", solicitationId),
        externalId: solicitationId,
        sourceName: "Texas ESBD / TxSmartBuy",
        sourceCode: "texas",
        stateCode: "TX",
        title,
        issuingEntity: agencyNumber ? `Texas SmartBuy Member ${agencyNumber}` : "Texas ESBD Posting",
        opportunityType: inferOpportunityType(statusText, title),
        status: buildStatus(statusText, dueDate),
        categoryCode: "Not listed",
        postedDate,
        dueDate,
        summary,
        description: `${summary} Due time: ${dueTimeRaw || "See source"}. Open the original posting for full bid files and instructions.`,
        location: "Texas, TX",
        sourceUrl,
        registrationRequired: false,
        registrationNotes:
          "Texas ESBD search is public. Review the original posting to confirm whether vendor registration or portal actions are required before submission.",
        contactName: "See original ESBD posting",
        contactEmail: "",
        contactPhone: "",
        createdAt: postedDate,
        updatedAt: updatedDate || postedDate,
      },
    ];
  });
}
