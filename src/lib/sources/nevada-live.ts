import type { NormalizedStateLocalOpportunity } from "@/lib/sources/types";
import { buildStateLocalOpportunityId } from "@/lib/sources/normalizers";

const NEVADA_OPEN_BIDS_URL =
  "https://nevadaepro.com/bso/view/search/external/advancedSearchBid.xhtml?openBids=true";
const NEVADA_ROOT_URL = "https://nevadaepro.com";

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

function toIsoDateTime(value: string) {
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})$/);
  if (!match) {
    return "";
  }

  const [, month, day, year, hour, minute, second] = match;
  return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
}

function toIsoDate(value: string) {
  const dateOnly = toIsoDateTime(value);
  return dateOnly ? dateOnly.slice(0, 10) : "";
}

function buildStatus(dueDate: string) {
  const due = Date.parse(dueDate);
  if (!Number.isNaN(due)) {
    const daysUntilDue = (due - Date.now()) / (1000 * 60 * 60 * 24);
    if (daysUntilDue < 0) return "Closed" as const;
    if (daysUntilDue <= 5) return "Closing Soon" as const;
  }

  return "Open" as const;
}

export async function fetchLiveNevadaOpportunities(): Promise<NormalizedStateLocalOpportunity[]> {
  const response = await fetch(NEVADA_OPEN_BIDS_URL, {
    next: { revalidate: 1800 },
    headers: {
      "user-agent": "The Bid Vault/1.0",
    },
  });

  if (!response.ok) {
    throw new Error(`NevadaEPro request failed with ${response.status}`);
  }

  const html = await response.text();
  const rowRegex = /<tr data-ri="\d+"[\s\S]*?<\/tr>/gi;
  const rows = Array.from(html.matchAll(rowRegex)).map((match) => match[0]);

  return rows.slice(0, 40).flatMap((row) => {
    const cells = Array.from(row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)).map((match) =>
      stripHtml(match[1]),
    );
    const hrefMatch = row.match(/<a href="([^"]*bidDetail\.sda\?docId=[^"]+)"/i);
    const docIdMatch = row.match(/<a href="[^"]*bidDetail\.sda\?docId=[^"]+">([^<]+)<\/a>/i);

    if (cells.length < 11 || !hrefMatch || !docIdMatch) {
      return [];
    }

    const externalId = stripHtml(docIdMatch[1]);
    const agency = cells[2] || "NevadaEPro Posting";
    const contact = cells[5] || "See original NevadaEPro posting";
    const title = cells[6] || externalId;
    const dueDateTime = cells[7] || "";
    const categoryCode = cells[11] || "Not listed";
    const sourceUrl = new URL(hrefMatch[1], NEVADA_ROOT_URL).toString();
    const dueDate = toIsoDate(dueDateTime);

    return [
      {
        id: buildStateLocalOpportunityId("nevada", externalId),
        externalId,
        sourceName: "NEVADAePro",
        sourceCode: "nevada",
        stateCode: "NV",
        title,
        issuingEntity: agency,
        opportunityType: "Open for Bids",
        status: buildStatus(dueDate),
        categoryCode,
        postedDate: "",
        dueDate,
        summary: `${agency} opportunity in NevadaEPro for ${title}.`,
        description: `${agency} opportunity in NevadaEPro for ${title}. Open the original posting to review full bid information, attachments, and vendor requirements.`,
        location: "Nevada, NV",
        sourceUrl,
        registrationRequired: true,
        registrationNotes:
          "NevadaEPro lets the public view opportunities, but vendor registration may still be required before full participation or final submission.",
        contactName: contact,
        contactEmail: "",
        contactPhone: "",
        createdAt: dueDate,
        updatedAt: dueDate,
      },
    ];
  });
}
