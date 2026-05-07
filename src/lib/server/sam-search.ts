import type {
  DataSourceCoverage,
  ExtractedContractRecord,
  SyncActivity,
} from "@/lib/demo-data";
import { getSamApiKey, samLiveConfigured } from "@/lib/sources/source-runtime";

export type SamSearchStatus = "all" | "available" | "closing-soon" | "needs-review";
export type SamSearchSort = "due-soon" | "newest" | "agency" | "title";
export type SamKeywordMode = "all" | "any" | "exact";
export type SamSetAsideFilter =
  | "all"
  | "small-business"
  | "veteran"
  | "women-owned"
  | "8a"
  | "hubzone"
  | "minority"
  | "unrestricted";
export type SamContractValueBand =
  | "all"
  | "under-250k"
  | "under-1m"
  | "1m-10m"
  | "over-10m";

export type SamSearchQuery = {
  keywords?: string[];
  keywordMode?: SamKeywordMode;
  naics?: string;
  agency?: string;
  state?: string;
  industry?: string;
  status?: SamSearchStatus;
  sort?: SamSearchSort;
  browseAll?: boolean;
  setAside?: SamSetAsideFilter;
  valueBand?: SamContractValueBand;
};

export type SamOpportunityRecord = ExtractedContractRecord & {
  noticeId: string;
  sourceUrl: string;
  attachmentsUrl: string;
  postedDate: string;
  updatedDate: string;
  office: string;
  pscCode: string;
  setAside: string;
  fullDescription: string;
  estimatedValue: number | null;
  estimatedValueLabel: string;
  agencyCode: string;
  contractingAgency: string;
  contractingDepartment: string;
  congressionalDistrict: string;
  cageCode: string;
  primaryContactName: string;
  primaryContactEmail: string;
  primaryContactPhone: string;
  descriptionOfRequirement: string;
  bondingRequired: boolean;
  bondingLevel: string;
};

type SamSearchSnapshot = {
  records: SamOpportunityRecord[];
  sources: DataSourceCoverage[];
  activities: SyncActivity[];
  liveConfigured: boolean;
  errorMessage?: string;
};

type SamSnapshotCacheEntry = {
  cachedAt: number;
  snapshot: SamSearchSnapshot;
};

const SAM_SNAPSHOT_CACHE_TTL_MS = 1000 * 60 * 15;
const SAM_API_PAGE_SIZE = 100;
const SAM_MAX_BROWSE_PAGES = 8;
const SAM_MAX_FILTERED_PAGES = 5;
const samSnapshotCache = new Map<string, SamSnapshotCacheEntry>();

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function buildSnapshotCacheKey(query: SamSearchQuery) {
  return JSON.stringify({
    keywords: (query.keywords ?? []).map((keyword) => normalize(keyword)).sort(),
    keywordMode: query.keywordMode ?? "all",
    naics: normalize(query.naics ?? ""),
    agency: normalize(query.agency ?? ""),
    state: normalizeSamState(query.state ?? ""),
    industry: normalize(query.industry ?? ""),
    status: query.status ?? "all",
    sort: query.sort ?? "due-soon",
    browseAll: !!query.browseAll,
  });
}

function readCachedSnapshot(query: SamSearchQuery) {
  const cacheKey = buildSnapshotCacheKey(query);
  const entry = samSnapshotCache.get(cacheKey);

  if (!entry) {
    return null;
  }

  if (Date.now() - entry.cachedAt > SAM_SNAPSHOT_CACHE_TTL_MS) {
    samSnapshotCache.delete(cacheKey);
    return null;
  }

  return entry.snapshot;
}

function writeCachedSnapshot(query: SamSearchQuery, snapshot: SamSearchSnapshot) {
  samSnapshotCache.set(buildSnapshotCacheKey(query), {
    cachedAt: Date.now(),
    snapshot,
  });
}

const stateNameToCode = new Map<string, string>([
  ["alabama", "AL"],
  ["alaska", "AK"],
  ["arizona", "AZ"],
  ["arkansas", "AR"],
  ["california", "CA"],
  ["colorado", "CO"],
  ["connecticut", "CT"],
  ["delaware", "DE"],
  ["district of columbia", "DC"],
  ["florida", "FL"],
  ["georgia", "GA"],
  ["hawaii", "HI"],
  ["idaho", "ID"],
  ["illinois", "IL"],
  ["indiana", "IN"],
  ["iowa", "IA"],
  ["kansas", "KS"],
  ["kentucky", "KY"],
  ["louisiana", "LA"],
  ["maine", "ME"],
  ["maryland", "MD"],
  ["massachusetts", "MA"],
  ["michigan", "MI"],
  ["minnesota", "MN"],
  ["mississippi", "MS"],
  ["missouri", "MO"],
  ["montana", "MT"],
  ["nebraska", "NE"],
  ["nevada", "NV"],
  ["new hampshire", "NH"],
  ["new jersey", "NJ"],
  ["new mexico", "NM"],
  ["new york", "NY"],
  ["north carolina", "NC"],
  ["north dakota", "ND"],
  ["ohio", "OH"],
  ["oklahoma", "OK"],
  ["oregon", "OR"],
  ["pennsylvania", "PA"],
  ["rhode island", "RI"],
  ["south carolina", "SC"],
  ["south dakota", "SD"],
  ["tennessee", "TN"],
  ["texas", "TX"],
  ["utah", "UT"],
  ["vermont", "VT"],
  ["virginia", "VA"],
  ["washington", "WA"],
  ["west virginia", "WV"],
  ["wisconsin", "WI"],
  ["wyoming", "WY"],
]);

function normalizeSamState(value?: string) {
  const input = pickString(value).trim();
  if (!input) {
    return "";
  }

  if (/^[a-z]{2}$/i.test(input)) {
    return input.toUpperCase();
  }

  return stateNameToCode.get(input.toLowerCase()) ?? input;
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

function pickNumber(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string") {
      const cleaned = value.replace(/[$,\s]/g, "");
      const parsed = Number(cleaned);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return null;
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

function slugifySamId(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatCurrencyLabel(value: number | null) {
  if (value === null || !Number.isFinite(value)) {
    return "Not listed";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function matchesSetAsideFilter(setAside: string, filter: SamSetAsideFilter) {
  if (filter === "all") {
    return true;
  }

  const text = normalize(setAside);

  if (filter === "small-business") {
    return text.includes("small business") || text.includes("sba");
  }

  if (filter === "veteran") {
    return (
      text.includes("veteran") ||
      text.includes("sdvosb") ||
      text.includes("service-disabled")
    );
  }

  if (filter === "women-owned") {
    return text.includes("women") || text.includes("wosb") || text.includes("edwosb");
  }

  if (filter === "8a") {
    return text.includes("8(a)") || text.includes("8a");
  }

  if (filter === "hubzone") {
    return text.includes("hubzone");
  }

  if (filter === "minority") {
    return text.includes("minority") || text.includes("sdb");
  }

  if (filter === "unrestricted") {
    return (
      text.includes("full and open") ||
      text.includes("unrestricted") ||
      text.includes("not set aside")
    );
  }

  return true;
}

function matchesValueBand(value: number | null, band: SamContractValueBand) {
  if (band === "all") {
    return true;
  }

  if (value === null) {
    return false;
  }

  if (band === "under-250k") {
    return value < 250000;
  }

  if (band === "under-1m") {
    return value < 1000000;
  }

  if (band === "1m-10m") {
    return value >= 1000000 && value <= 10000000;
  }

  if (band === "over-10m") {
    return value > 10000000;
  }

  return true;
}

function buildSamCompositeKey(record: Pick<
  SamOpportunityRecord,
  "title" | "agency" | "naicsCode" | "location" | "responseDeadline"
>) {
  return [
    normalize(record.title),
    normalize(record.agency),
    normalize(record.naicsCode),
    normalize(record.location),
    normalize(record.responseDeadline),
  ].join("|");
}

function getSamRecordAliases(record: SamOpportunityRecord) {
  const aliases = new Set<string>();
  if (record.noticeId) {
    aliases.add(`notice:${normalize(record.noticeId)}`);
  }
  if (record.sourceUrl) {
    aliases.add(`source:${normalize(record.sourceUrl)}`);
  }
  aliases.add(`composite:${buildSamCompositeKey(record)}`);
  return aliases;
}

function scoreSamRecord(record: SamOpportunityRecord) {
  let score = 0;
  if (record.noticeId) score += 5;
  if (record.sourceUrl?.startsWith("http")) score += 4;
  if (record.fullDescription && record.fullDescription !== record.synopsis) score += 3;
  if (record.responseDeadline) score += 2;
  if (record.postedDate) score += 1;
  if (record.updatedDate) score += 1;
  if (record.office && record.office !== "See SAM posting") score += 1;
  if (record.pscCode && record.pscCode !== "Not listed") score += 1;
  if (record.setAside && record.setAside !== "Not listed") score += 1;
  return score;
}

function dedupeRecords(records: SamOpportunityRecord[]) {
  const aliasToIndex = new Map<string, number>();
  const deduped: SamOpportunityRecord[] = [];

  for (const record of records) {
    const aliases = getSamRecordAliases(record);
    const existingIndex = Array.from(aliases)
      .map((alias) => aliasToIndex.get(alias))
      .find((index): index is number => typeof index === "number");

    if (existingIndex === undefined) {
      const nextIndex = deduped.length;
      deduped.push(record);
      aliases.forEach((alias) => aliasToIndex.set(alias, nextIndex));
      continue;
    }

    const existing = deduped[existingIndex];
    const preferred = scoreSamRecord(record) > scoreSamRecord(existing) ? record : existing;
    deduped[existingIndex] = preferred;

    getSamRecordAliases(preferred).forEach((alias) => aliasToIndex.set(alias, existingIndex));
  }

  return deduped;
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
  const rawUrl = pickString(record.uiLink, record.link, record.url);
  const oppId = rawUrl.match(/\/opp\/([^/?#]+)\/view/i)?.[1];

  if (oppId) {
    return `https://sam.gov/opp/${encodeURIComponent(oppId)}/view`;
  }

  return rawUrl || `https://sam.gov/search/?index=opp&keywords=${encodeURIComponent(noticeId)}`;
}

function buildAttachmentsUrl(record: Record<string, unknown>, noticeId: string) {
  const directAttachmentUrl = pickString(
    record.attachment,
    record.attachmentsUrl,
    record.attachmentUrl,
  );

  if (/^https?:\/\//i.test(directAttachmentUrl)) {
    return directAttachmentUrl;
  }

  const sourceUrl = buildSourceUrl(record, noticeId);
  const oppId = sourceUrl.match(/\/opp\/([^/?#]+)\/view/i)?.[1];

  if (oppId) {
    return `https://sam.gov/opp/${encodeURIComponent(oppId)}/view#attachments-links`;
  }

  return `https://sam.gov/search/?index=opp&keywords=${encodeURIComponent(noticeId)}`;
}

function buildBondingLevel(record: Record<string, unknown>) {
  const levelType = pickString(
    record.bondingLevelType,
    record.bondingType,
    record.bondType,
  );
  const levelValue = pickString(
    record.bondingLevelValue,
    record.bondingValue,
    record.bondAmount,
  );

  return [levelType, levelValue].filter(Boolean).join(": ") || "Not listed";
}

function buildBondingRequired(record: Record<string, unknown>) {
  const flag = pickString(
    record.bondingToBidFlag,
    record.bidBondRequired,
    record.bondRequired,
  ).toLowerCase();

  return flag === "yes" || flag === "true" || flag === "required";
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

function readSamApiError(payload: unknown, rawText: string) {
  const text = rawText.trim();
  const loweredText = text.toLowerCase();

  if (loweredText.includes("api_key_invalid") || loweredText.includes("invalid api key")) {
    return "The current SAM.gov API key was rejected. Update SAM_GOV_API_KEY with a valid key to load live federal opportunities.";
  }

  if (!payload || typeof payload !== "object") {
    return "";
  }

  const record = payload as Record<string, unknown>;
  const nestedError = record.error as Record<string, unknown> | undefined;
  const messages = [
    typeof record.message === "string" ? record.message : "",
    typeof record.errorMessage === "string" ? record.errorMessage : "",
    typeof nestedError?.message === "string" ? nestedError.message : "",
    typeof nestedError?.code === "string" ? nestedError.code : "",
  ]
    .filter(Boolean)
    .join(" ");

  const loweredMessage = messages.toLowerCase();

  if (loweredMessage.includes("api_key_invalid") || loweredMessage.includes("invalid api key")) {
    return "The current SAM.gov API key was rejected. Update SAM_GOV_API_KEY with a valid key to load live federal opportunities.";
  }

  return "";
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
  const setAside = query.setAside ?? "all";
  const valueBand = query.valueBand ?? "all";

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
    const matchesSetAside = matchesSetAsideFilter(record.setAside, setAside);
    const matchesValue = matchesValueBand(record.estimatedValue, valueBand);

    return (
      matchesNaics &&
      matchesAgency &&
      matchesState &&
      matchesStatus &&
      matchesSetAside &&
      matchesValue &&
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
  const attachmentsUrl = buildAttachmentsUrl(record, noticeId);
  const location = buildLocation(record);
  const award = record.award as Record<string, unknown> | undefined;
  const estimatedValue = pickNumber(
    record.awardAmount,
    record.estimatedValue,
    record.amount,
    record.baseAndAllOptionsValue,
    record.baseAndAllOptionsValueAmount,
    record.ceilingAmount,
    award?.amount,
  );
  const primaryContact = Array.isArray(record.pointOfContact)
    ? (record.pointOfContact[0] as Record<string, unknown> | undefined)
    : undefined;
  const organizationHierarchy = pickString(
    record.fullParentPathName,
    record.organizationHierarchy,
  );
  const contractingDepartment = pickString(
    record.department,
    record.departmentName,
    organizationHierarchy.split("/")[0],
  );
  const contractingAgency = pickString(
    record.organizationName,
    record.subTier,
    record.subtier,
    organizationHierarchy.split("/").at(-1),
  );
  const descriptionOfRequirement =
    pickString(
      record.descriptionOfRequirement,
      record.description,
      record.summary,
      record.additionalInfo,
    ) || buildSynopsis(record, title, agency);
  const stableIdSeed =
    noticeId ||
    sourceUrl ||
    `${title}|${agency}|${pickString(record.naicsCode, record.naics, record.classificationCode)}|${location}`;

  return {
    id: slugifySamId(stableIdSeed) || "sam-record",
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
    attachmentsUrl,
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
    fullDescription: descriptionOfRequirement,
    estimatedValue,
    estimatedValueLabel: formatCurrencyLabel(estimatedValue),
    agencyCode: pickString(record.agencyCode, record.officeCode, record.organizationCode) || "Not listed",
    contractingAgency: contractingAgency || "Not listed",
    contractingDepartment: contractingDepartment || "Not listed",
    congressionalDistrict:
      pickString(
        record.congressionalDistrict,
        record.placeOfPerformanceCongDist,
        primaryContact?.congressionalDistrict,
      ) || "Not listed",
    cageCode: pickString(record.cageCode, record.cage, award?.awardeeCageCode) || "Not listed",
    primaryContactName:
      pickString(primaryContact?.fullName, primaryContact?.name, record.primaryContactName) || "Not listed",
    primaryContactEmail:
      pickString(primaryContact?.email, record.primaryContactEmail, record.email) || "Not listed",
    primaryContactPhone:
      pickString(primaryContact?.phone, record.primaryContactPhone, record.phone) || "Not listed",
    descriptionOfRequirement,
    bondingRequired: buildBondingRequired(record),
    bondingLevel: buildBondingLevel(record),
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
  const hasTargetedFilters = !!(
    options?.searchPhrase ||
    options?.naics ||
    options?.agency ||
    options?.state
  );
  const limit = SAM_API_PAGE_SIZE;
  const maxPages = options?.noticeId
    ? 1
    : hasTargetedFilters
      ? SAM_MAX_FILTERED_PAGES
      : SAM_MAX_BROWSE_PAGES;
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
      url.searchParams.set("state", normalizeSamState(options.state));
    }

    const response = await fetch(url.toString(), {
      next: { revalidate: 900 },
      headers: {
        "user-agent": "The Bid Vault/1.0",
        accept: "application/json",
      },
    });

    const rawText = await response.text();
    let payload: unknown = {};

    try {
      payload = rawText ? JSON.parse(rawText) : {};
    } catch {
      payload = rawText;
    }

    const samApiError = readSamApiError(payload, rawText);
    if (samApiError) {
      throw new Error(samApiError);
    }

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error(
          "SAM.gov is rate limiting requests right now. Your API key is configured, but the service needs a short cooldown before trying again.",
        );
      }

      throw new Error(`SAM API request failed with ${response.status}`);
    }

    const payloadRecord =
      payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};
    const pageRecords = getResponseArray(payload).map(mapSamRecord);
    fetched.push(...pageRecords);

    const nextTotal =
      typeof payloadRecord.totalRecords === "number"
        ? payloadRecord.totalRecords
        : typeof payloadRecord.totalrecords === "number"
          ? payloadRecord.totalrecords
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

  const hasSearchIntent =
    !!query.browseAll ||
    !!query.keywords?.length ||
    !!pickString(query.industry, query.naics, query.agency, query.state);

  if (!hasSearchIntent) {
    return {
      records: [],
      sources: [baseSource],
      activities: [],
      liveConfigured: true,
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

    const rawRecords = dedupeRecords(primaryRecords);
    const records = sortRecords(
      filterRecords(rawRecords, { ...query, keywords: searchKeywords }),
      query.sort,
    );
    const snapshot: SamSearchSnapshot = {
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

    if (records.length > 0) {
      writeCachedSnapshot(query, snapshot);
    }

    return snapshot;
  } catch (error) {
    const cachedSnapshot = readCachedSnapshot(query);
    const errorMessage =
      error instanceof Error ? error.message : "Search SAM could not load live records.";

    if (cachedSnapshot && /rate limiting|429/i.test(errorMessage)) {
      return {
        ...cachedSnapshot,
        errorMessage:
          "SAM.gov is rate limiting requests right now. Showing the last successful live results for this search while the service cools down.",
      };
    }

    return {
      records: [],
      sources: [{ ...baseSource, status: "Needs Setup" }],
      activities: [],
      liveConfigured: true,
      errorMessage,
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
    const cachedMatch = Array.from(samSnapshotCache.values())
      .flatMap((entry) => entry.snapshot.records)
      .find((record) => normalize(record.noticeId) === normalize(id) || record.id === id);

    return cachedMatch ?? null;
  }

  return null;
}
