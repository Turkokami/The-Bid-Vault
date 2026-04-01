import type {
  DataSourceCoverage,
  ExtractedContractRecord,
  SyncActivity,
} from "@/lib/demo-data";
import { getSamApiKey, samLiveConfigured } from "@/lib/sources/source-runtime";

export type SamOpportunityRecord = ExtractedContractRecord & {
  noticeId: string;
  sourceUrl: string;
  postedDate: string;
  updatedDate: string;
  office: string;
  pscCode: string;
  setAside: string;
  fullDescription: string;
};

type SamSearchSnapshot = {
  records: SamOpportunityRecord[];
  sources: DataSourceCoverage[];
  activities: SyncActivity[];
  liveConfigured: boolean;
  errorMessage?: string;
};

function toIsoDate(value?: string | null) {
  if (!value) {
    return "";
  }

  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) {
    return "";
  }

  return new Date(timestamp).toISOString().slice(0, 10);
}

function pickString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

function buildAvailabilityStatus(dueDate: string) {
  if (!dueDate) {
    return "Needs Review" as const;
  }

  const dueTimestamp = Date.parse(dueDate);
  if (Number.isNaN(dueTimestamp)) {
    return "Needs Review" as const;
  }

  const daysUntilDue = (dueTimestamp - Date.now()) / (1000 * 60 * 60 * 24);
  if (daysUntilDue < 0) {
    return "Needs Review" as const;
  }

  if (daysUntilDue <= 5) {
    return "Closing Soon" as const;
  }

  return "Available" as const;
}

function buildAgency(record: Record<string, unknown>) {
  return (
    pickString(
      record.fullParentPathName,
      record.department,
      record.departmentName,
      record.organizationName,
      record.office,
      record.officeAddress,
    ) || "Federal agency"
  );
}

function buildLocation(record: Record<string, unknown>) {
  const city = pickString(
    record.placeOfPerformanceCity,
    (record.placeOfPerformance as Record<string, unknown> | undefined)?.city,
  );
  const state = pickString(
    record.placeOfPerformanceState,
    (record.placeOfPerformance as Record<string, unknown> | undefined)?.state,
    record.state,
  );

  return [city, state].filter(Boolean).join(", ") || state || "United States";
}

function buildSynopsis(record: Record<string, unknown>, title: string, agency: string) {
  const raw = pickString(
    record.description,
    record.summary,
    record.uiLink,
    record.solicitationNumber,
  );

  if (raw && raw !== title) {
    return raw.slice(0, 320);
  }

  return `Live federal contract posting from ${agency}. Open the detail page to review the source record and next steps.`;
}

function buildSourceUrl(record: Record<string, unknown>, noticeId: string) {
  return (
    pickString(record.uiLink, record.link, record.url) ||
    `https://sam.gov/opp/${encodeURIComponent(noticeId)}/view`
  );
}

function getResponseArray(payload: unknown): Record<string, unknown>[] {
  if (Array.isArray(payload)) {
    return payload as Record<string, unknown>[];
  }

  if (payload && typeof payload === "object") {
    const objectPayload = payload as Record<string, unknown>;
    const arrays = [
      objectPayload.opportunitiesData,
      objectPayload.opportunities,
      objectPayload.data,
      objectPayload.records,
    ];

    for (const value of arrays) {
      if (Array.isArray(value)) {
        return value as Record<string, unknown>[];
      }
    }
  }

  return [];
}

function mapSamRecord(record: Record<string, unknown>): SamOpportunityRecord {
  const noticeId = pickString(
    record.noticeId,
    record.solicitationNumber,
    record.id,
    record._id,
  );
  const title = pickString(record.title, record.noticeTitle, record.subject) || "Untitled federal opportunity";
  const agency = buildAgency(record);
  const responseDeadline = toIsoDate(
    pickString(record.responseDeadLine, record.responseDeadline, record.closeDate),
  );
  const postedDate = toIsoDate(pickString(record.postedDate, record.publishDate, record.archiveDate));
  const updatedDate = toIsoDate(pickString(record.lastModifiedDate, record.modifiedDate, record.updatedDate));
  const sourceUrl = buildSourceUrl(record, noticeId);
  const location = buildLocation(record);

  return {
    id: noticeId.toLowerCase().replace(/[^a-z0-9]+/g, "-") || `sam-${Date.now()}`,
    sourceDocumentId: "sam-live",
    noticeId,
    title,
    agency,
    naicsCode: pickString(record.naicsCode, record.naics, record.classificationCode) || "Not listed",
    state: location.split(", ").at(-1) ?? "US",
    location,
    opportunityType: pickString(record.noticeType, record.type, record.baseType) || "Federal opportunity",
    synopsis: buildSynopsis(record, title, agency),
    responseDeadline,
    availabilityStatus: buildAvailabilityStatus(responseDeadline),
    keyTerms: [title, agency]
      .join(" ")
      .toLowerCase()
      .split(/\W+/)
      .filter((term) => term.length > 4)
      .slice(0, 8),
    sourceUrl,
    postedDate,
    updatedDate,
    office: pickString(record.office, record.officeAddress, record.subTier, record.subtier) || "See SAM posting",
    pscCode: pickString(record.pscCode, record.classificationCode) || "Not listed",
    setAside: pickString(record.typeOfSetAside, record.setAside) || "Not listed",
    fullDescription: pickString(record.description, record.additionalInfoLink, record.additionalInfo) || buildSynopsis(record, title, agency),
  };
}

async function fetchSamRecords(): Promise<SamOpportunityRecord[]> {
  const apiKey = getSamApiKey();
  if (!apiKey) {
    return [];
  }

  const now = new Date();
  const postedFrom = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 90)
    .toISOString()
    .slice(0, 10);
  const url = new URL("https://api.sam.gov/prod/opportunities/v2/search");
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("limit", "100");
  url.searchParams.set("postedFrom", postedFrom);

  const response = await fetch(url.toString(), {
    next: { revalidate: 1800 },
    headers: {
      "user-agent": "The Bid Vault/1.0",
      accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`SAM API request failed with ${response.status}`);
  }

  const payload = (await response.json()) as unknown;
  return getResponseArray(payload).map(mapSamRecord);
}

export async function getSamSearchSnapshot(): Promise<SamSearchSnapshot> {
  const configured = samLiveConfigured();
  const baseSource: DataSourceCoverage = {
    id: "source-sam-opps",
    name: "SAM.gov Opportunities",
    cadence: "Live API",
    coverage: "Live federal contract opportunities",
    status: configured ? "Connected" : "Needs Setup",
    sourceType: "Opportunities",
    description: configured
      ? "Live federal opportunities from the official SAM.gov API."
      : "Add a SAM_GOV_API_KEY to enable live federal opportunity search.",
    officialUrl: "https://sam.gov/content/opportunities",
    lastSyncedAt: configured ? new Date().toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short" }) : "SAM API key needed",
  };

  if (!configured) {
    return {
      records: [],
      sources: [baseSource],
      activities: [],
      liveConfigured: false,
      errorMessage: "SAM Search is not live yet because SAM_GOV_API_KEY is not configured.",
    };
  }

  try {
    const records = await fetchSamRecords();
    return {
      records,
      sources: [baseSource],
      activities: [
        {
          id: `sam-live-${Date.now()}`,
          sourceId: baseSource.id,
          sourceName: baseSource.name,
          runLabel: "Live SAM API sync",
          ranAt: baseSource.lastSyncedAt,
          result: "Success",
          recordsAdded: records.length,
          notes: "Fetched live federal opportunity records from the official SAM API.",
        },
      ],
      liveConfigured: true,
    };
  } catch (error) {
    return {
      records: [],
      sources: [
        {
          ...baseSource,
          status: "Needs Setup",
        },
      ],
      activities: [],
      liveConfigured: true,
      errorMessage:
        error instanceof Error ? error.message : "SAM Search could not load live records.",
    };
  }
}

export async function getSamOpportunityById(id: string) {
  const snapshot = await getSamSearchSnapshot();
  return snapshot.records.find((record) => record.id === id) ?? null;
}

