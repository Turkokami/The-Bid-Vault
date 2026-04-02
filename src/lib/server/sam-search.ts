import type {
  DataSourceCoverage,
  ExtractedContractRecord,
  SyncActivity,
} from "@/lib/demo-data";
import { getSamApiKey, samLiveConfigured } from "@/lib/sources/source-runtime";

export type SamSearchStatus = "all" | "available" | "closing-soon" | "needs-review";
export type SamSearchSort = "due-soon" | "newest" | "agency" | "title";
export type SamKeywordMode = "all" | "any" | "exact";

export type SamSearchQuery = {
  keywords?: string[];
  keywordMode?: SamKeywordMode;
  naics?: string;
  agency?: string;
  state?: string;
  industry?: string;
  status?: SamSearchStatus;
  sort?: SamSearchSort;
};

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

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function formatSamApiDate(date: Date) {
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${month}/${day}/${date.getFullYear()}`;
}

function parseMultiValue(value?: string | null) {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

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

function dedupeRecords(records: SamOpportunityRecord[]) {
  const seen = new Set<string>();

  return records.filter((record) => {
    const key = normalize(record.noticeId || record.id || record.title);
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
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
  const placeOfPerformance = record.placeOfPerformance as Record<string, unknown> | undefined;
  const cityRecord = placeOfPerformance?.city as Record<string, unknown> | undefined;
  const stateRecord = placeOfPerformance?.state as Record<string, unknown> | undefined;
  const city = pickString(record.placeOfPerformanceCity, cityRecord?.name, cityRecord?.code);
  const state = pickString(record.placeOfPerformanceState, stateRecord?.code, stateRecord?.name, record.state);

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

function matchesKeywords(
  record: SamOpportunityRecord,
  keywords: string[],
  keywordMode: SamKeywordMode,
) {
  if (keywords.length === 0) {
    return true;
  }

  const blob = [
    record.title,
    record.synopsis,
    record.fullDescription,
    record.agency,
    record.location,
    record.noticeId,
    record.naicsCode,
    record.pscCode,
    record.office,
    record.opportunityType,
    ...record.keyTerms,
  ]
    .join(" ")
    .toLowerCase();

  if (keywordMode === "exact") {
    return blob.includes(keywords.join(" ").toLowerCase());
  }

  if (keywordMode === "any") {
    return keywords.some((keyword) => blob.includes(keyword.toLowerCase()));
  }

  return keywords.every((keyword) => blob.includes(keyword.toLowerCase()));
}

function filterRecords(records: SamOpportunityRecord[], query: SamSearchQuery) {
  const keywords = query.keywords ?? [];
  const keywordMode = query.keywordMode ?? "all";
  const naicsCodes = parseMultiValue(query.naics);
  const agency = normalize(query.agency ?? "");
  const state = normalize(query.state ?? "");
  const status = query.status ?? "all";

  return records.filter((record) => {
    const matchesNaics = naicsCodes.length > 0 ? naicsCodes.includes(record.naicsCode) : true;
    const matchesAgency = agency ? normalize(record.agency).includes(agency) : true;
    const matchesState =
      state ? normalize(record.state) === state || normalize(record.location).includes(state) : true;
    const matchesStatus =
      status === "all"
        ? true
        : status === "available"
          ? record.availabilityStatus === "Available"
          : status === "closing-soon"
            ? record.availabilityStatus === "Closing Soon"
            : record.availabilityStatus === "Needs Review";

    return (
      matchesNaics &&
      matchesAgency &&
      matchesState &&
      matchesStatus &&
      matchesKeywords(record, keywords, keywordMode)
    );
  });
}

function sortRecords(records: SamOpportunityRecord[], sort: SamSearchSort = "due-soon") {
  const sorted = [...records];

  sorted.sort((left, right) => {
    if (sort === "newest") {
      return (
        Date.parse(right.postedDate || right.updatedDate || "1970-01-01") -
        Date.parse(left.postedDate || left.updatedDate || "1970-01-01")
      );
    }

    if (sort === "agency") {
      return left.agency.localeCompare(right.agency) || left.title.localeCompare(right.title);
    }

    if (sort === "title") {
      return left.title.localeCompare(right.title);
    }

    return (
      Date.parse(left.responseDeadline || "9999-12-31") -
      Date.parse(right.responseDeadline || "9999-12-31")
    );
  });

  return sorted;
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
  const primaryContact = Array.isArray(record.pointOfContact)
    ? (record.pointOfContact[0] as Record<string, unknown> | undefined)
    : undefined;

  return {
    id: noticeId.toLowerCase().replace(/[^a-z0-9]+/g, "-") || `sam-${Date.now()}`,
    sourceDocumentId: "sam-live",
    noticeId,
    title,
    agency,
    naicsCode: pickString(record.naicsCode, record.naics, record.classificationCode) || "Not listed",
    state: location.split(", ").at(-1) ?? "US",
    location,
    opportunityType: pickString(record.type, record.noticeType, record.baseType) || "Federal opportunity",
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
    office:
      pickString(
        record.office,
        record.officeAddress,
        record.subTier,
        record.subtier,
        primaryContact?.fullName,
      ) || "See SAM posting",
    pscCode: pickString(record.pscCode, record.classificationCode) || "Not listed",
    setAside:
      pickString(record.typeOfSetAsideDescription, record.typeOfSetAside, record.setAside) || "Not listed",
    fullDescription:
      pickString(record.description, record.additionalInfoLink, record.additionalInfo) ||
      buildSynopsis(record, title, agency),
  };
}

async function fetchSamRecords(options?: {
  searchPhrase?: string;
  noticeId?: string;
  naics?: string;
  agency?: string;
  state?: string;
  activeOnly?: boolean;
}): Promise<SamOpportunityRecord[]> {
  const apiKey = getSamApiKey();
  if (!apiKey) {
    return [];
  }

  const now = new Date();
  const postedTo = formatSamApiDate(now);
  const postedFrom = formatSamApiDate(new Date(now.getTime() - 1000 * 60 * 60 * 24 * 364));
  const baseUrl = "https://api.sam.gov/opportunities/v2/search";
  const limit = options?.searchPhrase ? 1000 : 250;
  const maxPages = options?.searchPhrase ? 3 : 4;
  const fetched: SamOpportunityRecord[] = [];
  let totalRecords = Number.POSITIVE_INFINITY;
  let offset = 0;
  let page = 0;

  while (offset < totalRecords && page < maxPages) {
    const url = new URL(baseUrl);
    url.searchParams.set("api_key", apiKey);
    url.searchParams.set("limit", String(limit));
    url.searchParams.set("offset", String(offset));
    url.searchParams.set("postedFrom", postedFrom);
    url.searchParams.set("postedTo", postedTo);

    if (options?.activeOnly !== false) {
      url.searchParams.set("active", "Yes");
    }

    if (options?.searchPhrase) {
      url.searchParams.set("title", options.searchPhrase);
    }

    if (options?.noticeId) {
      url.searchParams.set("noticeid", options.noticeId);
    }

    if (options?.naics) {
      url.searchParams.set("ncode", options.naics);
    }

    if (options?.agency) {
      url.searchParams.set("organizationName", options.agency);
    }

    if (options?.state) {
      url.searchParams.set("state", options.state);
    }

    const response = await fetch(url.toString(), {
      next: { revalidate: 900 },
      headers: {
        "user-agent": "The Bid Vault/1.0",
        accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`SAM API request failed with ${response.status}`);
    }

    const payload = (await response.json()) as Record<string, unknown>;
    const pageRecords = getResponseArray(payload).map(mapSamRecord);
    fetched.push(...pageRecords);

    const nextTotal =
      typeof payload.totalRecords === "number"
        ? payload.totalRecords
        : typeof payload.totalrecords === "number"
          ? payload.totalrecords
          : offset + pageRecords.length;

    totalRecords = nextTotal;
    offset += limit;
    page += 1;

    if (pageRecords.length < limit) {
      break;
    }
  }

  return dedupeRecords(fetched);
}

export async function getSamSearchSnapshot(query: SamSearchQuery = {}): Promise<SamSearchSnapshot> {
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
    lastSyncedAt: configured
      ? new Date().toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          timeZoneName: "short",
        })
      : "SAM API key needed",
  };

  if (!configured) {
    return {
      records: [],
      sources: [baseSource],
      activities: [],
      liveConfigured: false,
      errorMessage: "Search SAM is not live yet because SAM_GOV_API_KEY is not configured.",
    };
  }

  try {
    const searchKeywords = query.keywords?.length
      ? query.keywords
      : query.industry
        ? [query.industry]
        : [];
    const searchPhrase = searchKeywords.join(" ").trim();

    const primaryRecords = await fetchSamRecords({
      searchPhrase: searchPhrase || undefined,
      naics: query.naics,
      agency: query.agency,
      state: query.state,
    });

    const fallbackRecords =
      searchPhrase && primaryRecords.length < 25
        ? await fetchSamRecords({
            naics: query.naics,
            agency: query.agency,
            state: query.state,
          })
        : [];

    const rawRecords = dedupeRecords([...primaryRecords, ...fallbackRecords]);
    const records = sortRecords(
      filterRecords(rawRecords, { ...query, keywords: searchKeywords }),
      query.sort,
    );

    return {
      records,
      sources: [baseSource],
      activities: [
        {
          id: `sam-live-${Date.now()}`,
          sourceId: baseSource.id,
          sourceName: baseSource.name,
          runLabel: searchPhrase ? `Live SAM search for "${searchPhrase}"` : "Live SAM browse",
          ranAt: baseSource.lastSyncedAt,
          result: "Success",
          recordsAdded: records.length,
          notes: searchPhrase
            ? "Queried live federal opportunity records from SAM.gov using your search terms."
            : "Loaded live federal opportunity records from SAM.gov for browsing.",
        },
      ],
      liveConfigured: true,
    };
  } catch (error) {
    return {
      records: [],
      sources: [{ ...baseSource, status: "Needs Setup" }],
      activities: [],
      liveConfigured: true,
      errorMessage:
        error instanceof Error ? error.message : "Search SAM could not load live records.",
    };
  }
}

export async function getSamOpportunityById(id: string) {
  const configured = samLiveConfigured();

  if (!configured) {
    return null;
  }

  try {
    const byNoticeId = await fetchSamRecords({ noticeId: id });
    const directMatch =
      byNoticeId.find((record) => normalize(record.noticeId) === normalize(id)) ??
      byNoticeId.find((record) => record.id === id);

    if (directMatch) {
      return directMatch;
    }
  } catch {
    // Fall through to broader search snapshot below.
  }

  const snapshot = await getSamSearchSnapshot();
  return (
    snapshot.records.find(
      (record) => record.id === id || normalize(record.noticeId) === normalize(id),
    ) ?? null
  );
}
