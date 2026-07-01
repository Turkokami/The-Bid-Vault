import { fetchLiveTexasOpportunities } from "@/lib/sources/texas-live";
import { fetchLiveGeorgiaOpportunities } from "@/lib/sources/georgia-live";
import { fetchLiveFloridaOpportunities } from "@/lib/sources/florida-live";
import { fetchLiveOregonOpportunities } from "@/lib/sources/oregon-live";
import { fetchLivePennsylvaniaOpportunities } from "@/lib/sources/pennsylvania-live";
import { stateDirectory } from "@/lib/sources/state-registry";
import { websSourceSummary } from "@/lib/sources/webs";
import { fetchLiveWebsRawOpportunities } from "@/lib/sources/webs-live";
import { db } from "@/lib/db";
import type {
  NormalizedStateLocalOpportunity,
  StateLocalOpportunityStatus,
  StateLocalOpportunityType,
  StateLocalSourceSummary,
  StateLocalSourceSyncLog,
} from "@/lib/sources/types";

const SCRAPER_SOURCE_NAMES = [
  "california-caleprocure",
  "new-york-nyscr",
  "washington-webs",
  "colorado-bids",
] as const;

const SCRAPER_SOURCE_META: Record<string, { sourceCode: string; stateCode: string; label: string }> = {
  "california-caleprocure": { sourceCode: "california", stateCode: "CA", label: "California Cal eProcure" },
  "new-york-nyscr": { sourceCode: "new-york", stateCode: "NY", label: "New York State Contract Reporter" },
  "washington-webs": { sourceCode: "washington", stateCode: "WA", label: "Washington WEBS" },
  "colorado-bids": { sourceCode: "colorado", stateCode: "CO", label: "Colorado Bids" },
};

async function fetchScraperDbOpportunities(): Promise<{
  opportunities: NormalizedStateLocalOpportunity[];
  logs: StateLocalSourceSyncLog[];
}> {
  try {
    const rows = await db.stateLocalOpportunity.findMany({
      where: { sourceName: { in: [...SCRAPER_SOURCE_NAMES] } },
      orderBy: { dueDate: "asc" },
      take: 500,
    });

    const opportunities: NormalizedStateLocalOpportunity[] = rows.map((row) => {
      const meta = SCRAPER_SOURCE_META[row.sourceName] ?? { sourceCode: row.sourceName, stateCode: row.stateCode, label: row.sourceName };
      return {
        id: row.id,
        externalId: row.id,
        sourceName: meta.label,
        sourceCode: meta.sourceCode,
        stateCode: row.stateCode,
        title: row.title,
        issuingEntity: row.issuingEntity,
        opportunityType: (row.opportunityType as StateLocalOpportunityType) ?? "Open for Bids",
        status: (row.status as StateLocalOpportunityStatus) ?? "Open",
        categoryCode: row.categoryCode ?? "",
        postedDate: row.postedDate ? row.postedDate.toISOString() : row.createdAt.toISOString(),
        dueDate: row.dueDate ? row.dueDate.toISOString() : "",
        summary: row.summary ?? "",
        description: row.summary ?? "",
        location: row.location ?? row.stateCode,
        sourceUrl: row.sourceUrl ?? "",
        registrationRequired: row.registrationRequired,
        registrationNotes: row.registrationNotes ?? "",
        contactName: row.contactName ?? "",
        contactEmail: row.contactEmail ?? "",
        contactPhone: "",
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
      };
    });

    const countsBySource: Record<string, number> = {};
    for (const opp of opportunities) {
      countsBySource[opp.sourceCode] = (countsBySource[opp.sourceCode] ?? 0) + 1;
    }

    const logs: StateLocalSourceSyncLog[] = Object.entries(countsBySource).map(([sourceCode, count]) => ({
      id: `sync-db-${sourceCode}-${count}`,
      sourceName: SCRAPER_SOURCE_META[Object.keys(SCRAPER_SOURCE_META).find((k) => SCRAPER_SOURCE_META[k].sourceCode === sourceCode)!]?.label ?? sourceCode,
      sourceCode,
      syncStatus: "Success" as const,
      lastRunAt: formatSyncTime(),
      recordsAdded: count,
      recordsUpdated: 0,
      notes: `${count} records loaded from Railway scraper database.`,
    }));

    return { opportunities, logs };
  } catch (err) {
    console.error("[sync-state-local] DB fetch failed:", err);
    return { opportunities: [], logs: [] };
  }
}

let cachedWebsOpportunities: NormalizedStateLocalOpportunity[] = [];
let cachedTexasOpportunities: NormalizedStateLocalOpportunity[] = [];
let cachedGeorgiaOpportunities: NormalizedStateLocalOpportunity[] = [];
let cachedFloridaOpportunities: NormalizedStateLocalOpportunity[] = [];
let cachedOregonOpportunities: NormalizedStateLocalOpportunity[] = [];
let cachedPennsylvaniaOpportunities: NormalizedStateLocalOpportunity[] = [];
const STATE_LOCAL_SNAPSHOT_CACHE_TTL_MS = 1000 * 60 * 10;

type StateLocalSnapshot = {
  opportunities: NormalizedStateLocalOpportunity[];
  syncLogs: StateLocalSourceSyncLog[];
  sources: StateLocalSourceSummary[];
};

let cachedStateLocalSnapshot:
  | {
      cachedAt: number;
      snapshot: StateLocalSnapshot;
    }
  | null = null;

const localAndRegionalSources: StateLocalSourceSummary[] = [
  {
    id: "source-flagstaff",
    sourceCode: "flagstaff",
    sourceName: "City of Flagstaff Bids",
    stateCode: "AZ",
    sourceType: "County / City",
    regionLabel: "Northern Arizona",
    status: "Planned",
    cadence: "Planned",
    description:
      "Planned City of Flagstaff opportunity coverage through its OpenGov eProcurement bid opportunities page.",
    helperText:
      "Flagstaff is a key Northern Arizona market. This source will help contractors catch city-level work that may not appear in federal searches.",
    portalUrl: "https://flagstaff.az.gov/3922/Bid-Opportunities",
    lastSyncedAt: "Not connected yet",
  },
  {
    id: "source-coconino",
    sourceCode: "coconino",
    sourceName: "Coconino County Purchasing",
    stateCode: "AZ",
    sourceType: "County / City",
    regionLabel: "Northern Arizona",
    status: "Planned",
    cadence: "Planned",
    description:
      "Planned Coconino County coverage through its Purchasing division and Ion Wave supplier portal.",
    helperText:
      "Coconino County is important for contractors serving Flagstaff, parks, rural facilities, and regional public agencies.",
    portalUrl: "https://www.coconino.az.gov/316/Purchasing",
    lastSyncedAt: "Not connected yet",
  },
  {
    id: "source-yavapai",
    sourceCode: "yavapai",
    sourceName: "Yavapai County Procurement",
    stateCode: "AZ",
    sourceType: "County / City",
    regionLabel: "Northern Arizona",
    status: "Planned",
    cadence: "Planned",
    description:
      "Planned Yavapai County opportunity coverage through its OpenGov Procure solicitation portal.",
    helperText:
      "This extends the Northern Arizona watch area beyond Flagstaff so businesses can monitor nearby county-level opportunities.",
    portalUrl: "https://www.yavapaiaz.gov/County-Government/Bids",
    lastSyncedAt: "Not connected yet",
  },
  {
    id: "source-mohave",
    sourceCode: "mohave",
    sourceName: "Mohave County Procurement",
    stateCode: "AZ",
    sourceType: "County / City",
    regionLabel: "Northwest Arizona",
    status: "Planned",
    cadence: "Planned",
    description:
      "Planned Mohave County coverage through its OpenGov procurement portal for Kingman, Lake Havasu, Bullhead City area service providers, and county departments.",
    helperText:
      "Mohave County says vendors should use its OpenGov Projects Portal for solicitations and its Contracts Portal for awarded contract information.",
    portalUrl: "https://procurement.opengov.com/portal/mohavecounty",
    lastSyncedAt: "Not connected yet",
  },
  {
    id: "source-white-pine",
    sourceCode: "white-pine",
    sourceName: "White Pine County Bid Postings",
    stateCode: "NV",
    sourceType: "County / City",
    regionLabel: "Eastern Nevada",
    status: "Planned",
    cadence: "Planned",
    description:
      "Planned White Pine County coverage for Ely-area county bid postings, public works, facilities, parks, and service contracts.",
    helperText:
      "White Pine County posts bid opportunities on its county bid postings page, which can be monitored for new open solicitations.",
    portalUrl: "https://www.whitepinecounty.net/Bids.aspx",
    lastSyncedAt: "Not connected yet",
  },
  {
    id: "source-nye",
    sourceCode: "nye",
    sourceName: "Nye County Bid Postings",
    stateCode: "NV",
    sourceType: "County / City",
    regionLabel: "Southern Nevada",
    status: "Planned",
    cadence: "Planned",
    description:
      "Planned Nye County coverage for Pahrump, Tonopah, county facilities, utilities, detention, roads, and local service opportunities.",
    helperText:
      "Nye County publishes bid and contract opportunities on its public bid postings page, including current open solicitations and bid details.",
    portalUrl: "https://www.nyecountynv.gov/Bids.aspx?CatID=showStatus&Status=open&showAllBids=&txtSort=BidNumberAsc",
    lastSyncedAt: "Not connected yet",
  },
  {
    id: "source-mecklenburg",
    sourceCode: "mecklenburg",
    sourceName: "Mecklenburg County Procurement",
    stateCode: "NC",
    sourceType: "County / City",
    regionLabel: "Charlotte region",
    status: "Connected",
    connectionMode: "portal-assisted",
    cadence: "Portal-assisted",
    description:
      "Mecklenburg County procurement coverage through the county's official Financial Services procurement page and MeckProcure vendor workflow.",
    helperText:
      "Use this page to review Mecklenburg County procurement guidance and jump into the county's vendor portal for current opportunities around Charlotte and nearby service areas.",
    portalUrl: "https://fin.mecknc.gov/procurement",
    lastSyncedAt: "Portal-assisted mode ready",
  },
  {
    id: "source-guilford",
    sourceCode: "guilford",
    sourceName: "Guilford County Purchasing",
    stateCode: "NC",
    sourceType: "County / City",
    regionLabel: "Piedmont Triad",
    status: "Connected",
    connectionMode: "portal-assisted",
    cadence: "Portal-assisted",
    description:
      "Guilford County purchasing coverage through the county's official purchasing page and vendor self-service resources.",
    helperText:
      "Guilford County publishes bids and RFP notices through its purchasing division. This page keeps that county visible for contractors serving Greensboro, High Point, and nearby public agencies.",
    portalUrl: "https://www.guilfordcountync.gov/government/departments-and-agencies/finance/purchasing",
    lastSyncedAt: "Portal-assisted mode ready",
  },
];

const statewideSources: StateLocalSourceSummary[] = stateDirectory.map((state) => ({
  id: `source-${state.slug}`,
  sourceCode: state.slug,
  sourceName: state.portalName,
  stateCode: state.stateCode,
  sourceType: "State",
  regionLabel: `${state.name} statewide`,
  status: state.status,
  connectionMode: state.connectionMode,
  cadence:
    state.connectionMode === "live"
      ? "Live public site"
      : state.connectionMode === "portal-assisted"
        ? "Portal-assisted"
        : "Planned",
  description: state.description,
  helperText: state.helperText,
  portalUrl: state.portalUrl,
  lastSyncedAt:
    state.connectionMode === "live"
      ? "Loading live records"
      : state.connectionMode === "portal-assisted"
        ? "Portal-assisted mode ready"
        : "Not connected yet",
}));

function cloneSnapshot(snapshot: StateLocalSnapshot): StateLocalSnapshot {
  return {
    opportunities: snapshot.opportunities.map((opportunity) => ({ ...opportunity })),
    syncLogs: snapshot.syncLogs.map((log) => ({ ...log })),
    sources: snapshot.sources.map((source) => ({ ...source })),
  };
}

export function getStateLocalSourceCatalog(): StateLocalSourceSummary[] {
  return [...statewideSources, ...localAndRegionalSources].map((source) => ({ ...source }));
}

function formatSyncTime() {
  return new Date().toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

function updateConnectedSource(
  sources: StateLocalSourceSummary[],
  sourceCode: StateLocalSourceSummary["sourceCode"],
  helperText?: string,
  overrides?: Partial<StateLocalSourceSummary>,
) {
  const index = sources.findIndex((source) => source.sourceCode === sourceCode);
  if (index === -1) return;

  sources[index] = {
    ...sources[index],
    status: "Connected",
    cadence: "Live public site",
    lastSyncedAt: formatSyncTime(),
    helperText: helperText ?? sources[index].helperText,
    connectionMode: "live",
    ...overrides,
  };
}

export async function getStateLocalSyncSnapshot(options?: {
  forceRefresh?: boolean;
}): Promise<StateLocalSnapshot> {
  if (
    !options?.forceRefresh &&
    cachedStateLocalSnapshot &&
    Date.now() - cachedStateLocalSnapshot.cachedAt < STATE_LOCAL_SNAPSHOT_CACHE_TTL_MS
  ) {
    return cloneSnapshot(cachedStateLocalSnapshot.snapshot);
  }

  const opportunities: NormalizedStateLocalOpportunity[] = [];
  const syncLogs: StateLocalSourceSyncLog[] = [];
  const sources = getStateLocalSourceCatalog();

  // Load Railway scraper results from Neon DB
  const { opportunities: dbOpps, logs: dbLogs } = await fetchScraperDbOpportunities();
  opportunities.push(...dbOpps);
  syncLogs.push(...dbLogs);
  // Mark DB-sourced states as connected in the source catalog
  for (const opp of dbOpps) {
    updateConnectedSource(sources, opp.sourceCode, `${opp.sourceName} — loaded from Railway scraper database.`);
  }

  try {
    const raws = await fetchLiveWebsRawOpportunities();
    const mappedWebsOpportunities = raws.map((record) => ({
        id: `washington-${record.solicitationNumber.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
        externalId: record.solicitationNumber,
        sourceName: "WEBS",
        sourceCode: "washington" as const,
        stateCode: record.stateCode,
        title: record.title,
        issuingEntity: record.issuingEntity,
        opportunityType: record.opportunityType,
        status: record.status,
        categoryCode: record.commodityCode,
        postedDate: record.postedDate,
        dueDate: record.dueDate,
        summary: record.summary,
        description: record.description,
        location: `${record.city}, ${record.stateCode}`,
        sourceUrl: record.sourceUrl,
        registrationRequired: record.registrationRequired,
        registrationNotes: record.registrationNotes,
        contactName: record.contactName,
        contactEmail: record.contactEmail,
        contactPhone: record.contactPhone,
        createdAt: record.postedDate,
        updatedAt: record.updatedAt,
      }));
    opportunities.push(...mappedWebsOpportunities);
    cachedWebsOpportunities = mappedWebsOpportunities;
    syncLogs.push({
      id: `sync-webs-live-${raws.length}`,
      sourceName: "WEBS",
      sourceCode: "washington",
      syncStatus: "Success",
      lastRunAt: formatSyncTime(),
      recordsAdded: raws.length,
      recordsUpdated: 0,
      notes: "Live WEBS postings were loaded directly from Washington's public bid portal.",
    });
  } catch {
    if (cachedWebsOpportunities.length > 0) {
      opportunities.push(...cachedWebsOpportunities);
      syncLogs.push({
        id: "sync-webs-cached",
        sourceName: "WEBS",
        sourceCode: "washington",
        syncStatus: "Partial",
        lastRunAt: formatSyncTime(),
        recordsAdded: cachedWebsOpportunities.length,
        recordsUpdated: 0,
        notes:
          "WEBS live refresh did not return new records, so the app is showing the last successful Washington results instead.",
      });
    } else {
      syncLogs.push({
        id: "sync-webs-failed",
        sourceName: "WEBS",
        sourceCode: "washington",
        syncStatus: "Failed",
        lastRunAt: formatSyncTime(),
        recordsAdded: 0,
        recordsUpdated: 0,
        errorMessage: "Live WEBS records did not load.",
        notes: "WEBS is connected as a live public source, but the latest fetch did not return records.",
      });
    }
  }

  try {
    const texasOpportunities = await fetchLiveTexasOpportunities();
    opportunities.push(...texasOpportunities);
    cachedTexasOpportunities = texasOpportunities;
    updateConnectedSource(sources, "texas");
    syncLogs.push({
      id: `sync-texas-live-${texasOpportunities.length}`,
      sourceName: "Texas ESBD / TxSmartBuy",
      sourceCode: "texas",
      syncStatus: "Success",
      lastRunAt: formatSyncTime(),
      recordsAdded: texasOpportunities.length,
      recordsUpdated: 0,
      notes: "Live Texas ESBD opportunities were loaded directly from the public ESBD search page.",
    });
  } catch {
    if (cachedTexasOpportunities.length > 0) {
      opportunities.push(...cachedTexasOpportunities);
      updateConnectedSource(
        sources,
        "texas",
        "Texas ESBD live refresh did not return new records, so the app is showing the last successful Texas results instead.",
      );
      syncLogs.push({
        id: "sync-texas-cached",
        sourceName: "Texas ESBD / TxSmartBuy",
        sourceCode: "texas",
        syncStatus: "Partial",
        lastRunAt: formatSyncTime(),
        recordsAdded: cachedTexasOpportunities.length,
        recordsUpdated: 0,
        notes:
          "Texas ESBD live refresh did not return new rows, so the app is using the last successful Texas result set.",
      });
    } else {
      updateConnectedSource(
        sources,
        "texas",
        "Texas ESBD is configured as a live public source, but the latest fetch did not return records. Try refreshing later.",
      );
      syncLogs.push({
        id: "sync-texas-failed",
        sourceName: "Texas ESBD / TxSmartBuy",
        sourceCode: "texas",
        syncStatus: "Failed",
        lastRunAt: formatSyncTime(),
        recordsAdded: 0,
        recordsUpdated: 0,
        errorMessage: "Live Texas ESBD records did not load.",
        notes: "Texas ESBD is configured for live public search, but the latest fetch did not return usable records.",
      });
    }
  }

  // Georgia GPR
  try {
    const georgiaOpportunities = await fetchLiveGeorgiaOpportunities();
    opportunities.push(...georgiaOpportunities);
    cachedGeorgiaOpportunities = georgiaOpportunities;
    updateConnectedSource(sources, "georgia");
    syncLogs.push({
      id: `sync-georgia-live-${georgiaOpportunities.length}`,
      sourceName: "Georgia Procurement Registry",
      sourceCode: "georgia",
      syncStatus: "Success",
      lastRunAt: formatSyncTime(),
      recordsAdded: georgiaOpportunities.length,
      recordsUpdated: 0,
      notes: "Live Georgia GPR solicitations were loaded from the public procurement registry.",
    });
  } catch {
    if (cachedGeorgiaOpportunities.length > 0) {
      opportunities.push(...cachedGeorgiaOpportunities);
      updateConnectedSource(sources, "georgia", "Showing last successful Georgia GPR results.");
      syncLogs.push({
        id: "sync-georgia-cached",
        sourceName: "Georgia Procurement Registry",
        sourceCode: "georgia",
        syncStatus: "Partial",
        lastRunAt: formatSyncTime(),
        recordsAdded: cachedGeorgiaOpportunities.length,
        recordsUpdated: 0,
        notes: "Georgia GPR live refresh did not return new records — showing last successful results.",
      });
    } else {
      updateConnectedSource(sources, "georgia", "Georgia GPR live fetch did not return records. Try refreshing.", { connectionMode: "portal-assisted", cadence: "Portal-assisted" });
      syncLogs.push({
        id: "sync-georgia-failed",
        sourceName: "Georgia Procurement Registry",
        sourceCode: "georgia",
        syncStatus: "Failed",
        lastRunAt: formatSyncTime(),
        recordsAdded: 0,
        recordsUpdated: 0,
        errorMessage: "Live Georgia GPR records did not load.",
        notes: "Georgia GPR is configured as a live public source, but the latest fetch did not return usable records.",
      });
    }
  }

  // Florida MFMP VBS
  try {
    const floridaOpportunities = await fetchLiveFloridaOpportunities();
    opportunities.push(...floridaOpportunities);
    cachedFloridaOpportunities = floridaOpportunities;
    updateConnectedSource(sources, "florida");
    syncLogs.push({
      id: `sync-florida-live-${floridaOpportunities.length}`,
      sourceName: "Florida MFMP / VBS",
      sourceCode: "florida",
      syncStatus: "Success",
      lastRunAt: formatSyncTime(),
      recordsAdded: floridaOpportunities.length,
      recordsUpdated: 0,
      notes: "Live Florida VBS solicitations were loaded from the MFMP Vendor Bid System.",
    });
  } catch {
    if (cachedFloridaOpportunities.length > 0) {
      opportunities.push(...cachedFloridaOpportunities);
      updateConnectedSource(sources, "florida", "Showing last successful Florida VBS results.");
      syncLogs.push({
        id: "sync-florida-cached",
        sourceName: "Florida MFMP / VBS",
        sourceCode: "florida",
        syncStatus: "Partial",
        lastRunAt: formatSyncTime(),
        recordsAdded: cachedFloridaOpportunities.length,
        recordsUpdated: 0,
        notes: "Florida VBS live refresh did not return new records — showing last successful results.",
      });
    } else {
      updateConnectedSource(sources, "florida", "Florida VBS live fetch did not return records. Try refreshing.", { connectionMode: "portal-assisted", cadence: "Portal-assisted" });
      syncLogs.push({
        id: "sync-florida-failed",
        sourceName: "Florida MFMP / VBS",
        sourceCode: "florida",
        syncStatus: "Failed",
        lastRunAt: formatSyncTime(),
        recordsAdded: 0,
        recordsUpdated: 0,
        errorMessage: "Live Florida VBS records did not load.",
        notes: "Florida VBS is configured as a live public source, but the latest fetch did not return usable records.",
      });
    }
  }

  // Oregon ORPIN
  try {
    const oregonOpportunities = await fetchLiveOregonOpportunities();
    opportunities.push(...oregonOpportunities);
    cachedOregonOpportunities = oregonOpportunities;
    updateConnectedSource(sources, "oregon");
    syncLogs.push({
      id: `sync-oregon-live-${oregonOpportunities.length}`,
      sourceName: "Oregon ORPIN",
      sourceCode: "oregon",
      syncStatus: "Success",
      lastRunAt: formatSyncTime(),
      recordsAdded: oregonOpportunities.length,
      recordsUpdated: 0,
      notes: "Live Oregon ORPIN bids were loaded from the public procurement network.",
    });
  } catch {
    if (cachedOregonOpportunities.length > 0) {
      opportunities.push(...cachedOregonOpportunities);
      updateConnectedSource(sources, "oregon", "Showing last successful Oregon ORPIN results.");
      syncLogs.push({
        id: "sync-oregon-cached",
        sourceName: "Oregon ORPIN",
        sourceCode: "oregon",
        syncStatus: "Partial",
        lastRunAt: formatSyncTime(),
        recordsAdded: cachedOregonOpportunities.length,
        recordsUpdated: 0,
        notes: "Oregon ORPIN live refresh did not return new records — showing last successful results.",
      });
    } else {
      updateConnectedSource(sources, "oregon", "Oregon ORPIN live fetch did not return records. Try refreshing.", { connectionMode: "portal-assisted", cadence: "Portal-assisted" });
      syncLogs.push({
        id: "sync-oregon-failed",
        sourceName: "Oregon ORPIN",
        sourceCode: "oregon",
        syncStatus: "Failed",
        lastRunAt: formatSyncTime(),
        recordsAdded: 0,
        recordsUpdated: 0,
        errorMessage: "Live Oregon ORPIN records did not load.",
        notes: "Oregon ORPIN is configured as a live public source, but the latest fetch did not return usable records.",
      });
    }
  }

  // Pennsylvania eMarketplace
  try {
    const pennsylvaniaOpportunities = await fetchLivePennsylvaniaOpportunities();
    opportunities.push(...pennsylvaniaOpportunities);
    cachedPennsylvaniaOpportunities = pennsylvaniaOpportunities;
    updateConnectedSource(sources, "pennsylvania");
    syncLogs.push({
      id: `sync-pennsylvania-live-${pennsylvaniaOpportunities.length}`,
      sourceName: "PA eMarketplace",
      sourceCode: "pennsylvania",
      syncStatus: "Success",
      lastRunAt: formatSyncTime(),
      recordsAdded: pennsylvaniaOpportunities.length,
      recordsUpdated: 0,
      notes: "Live Pennsylvania eMarketplace solicitations were loaded from the public portal.",
    });
  } catch {
    if (cachedPennsylvaniaOpportunities.length > 0) {
      opportunities.push(...cachedPennsylvaniaOpportunities);
      updateConnectedSource(sources, "pennsylvania", "Showing last successful PA eMarketplace results.");
      syncLogs.push({
        id: "sync-pennsylvania-cached",
        sourceName: "PA eMarketplace",
        sourceCode: "pennsylvania",
        syncStatus: "Partial",
        lastRunAt: formatSyncTime(),
        recordsAdded: cachedPennsylvaniaOpportunities.length,
        recordsUpdated: 0,
        notes: "Pennsylvania eMarketplace live refresh did not return new records — showing last successful results.",
      });
    } else {
      updateConnectedSource(sources, "pennsylvania", "PA eMarketplace live fetch did not return records. Try refreshing.", { connectionMode: "portal-assisted", cadence: "Portal-assisted" });
      syncLogs.push({
        id: "sync-pennsylvania-failed",
        sourceName: "PA eMarketplace",
        sourceCode: "pennsylvania",
        syncStatus: "Failed",
        lastRunAt: formatSyncTime(),
        recordsAdded: 0,
        recordsUpdated: 0,
        errorMessage: "Live Pennsylvania eMarketplace records did not load.",
        notes: "Pennsylvania eMarketplace is configured as a live public source, but the latest fetch did not return usable records.",
      });
    }
  }

  // Portal-assisted states — public portals available, automated extraction not yet active
  const portalAssistedStates: Array<{
    sourceCode: string;
    sourceName: string;
    helperText: string;
    portalUrl: string;
  }> = [
    {
      sourceCode: "california",
      sourceName: "Cal eProcure",
      helperText: "California eProcure is the statewide solicitation portal. Use The Bid Vault to prepare your NAICS codes and search strategy, then open Cal eProcure to browse live California state bids.",
      portalUrl: "https://caleprocure.ca.gov/pages/public-search.aspx",
    },
    {
      sourceCode: "colorado",
      sourceName: "Colorado BIDS",
      helperText: "Colorado Bidnet (BIDS) is the statewide procurement portal. Use The Bid Vault to align category codes, then open the Colorado portal to browse live solicitations.",
      portalUrl: "https://www.colorado.gov/app/oit/apps/bids/",
    },
    {
      sourceCode: "illinois",
      sourceName: "Illinois BidBuy",
      helperText: "Illinois BidBuy is the state procurement portal. Use The Bid Vault to align your NAICS codes, then open BidBuy to review live Illinois solicitations.",
      portalUrl: "https://bidbuy.illinois.gov/BidBuy/",
    },
    {
      sourceCode: "michigan",
      sourceName: "Michigan SIGMA",
      helperText: "Michigan SIGMA is the statewide vendor portal. Align your codes in The Bid Vault, then open SIGMA to browse active Michigan state solicitations.",
      portalUrl: "https://sigma.michigan.gov/webapp/PRDVSS2X1/AltSelfService",
    },
    {
      sourceCode: "minnesota",
      sourceName: "Minnesota MMD Solicitations",
      helperText: "Minnesota's Materials Management Division (MMD) posts solicitations publicly. Use The Bid Vault for code research, then open MMD to view live Minnesota bids.",
      portalUrl: "https://www.mmd.admin.state.mn.us/solicitation/",
    },
    {
      sourceCode: "ohio",
      sourceName: "Ohio Procurement Portal",
      helperText: "Ohio's central procurement portal lists active solicitations statewide. Use The Bid Vault for category research, then jump into Ohio Procure to review live bids.",
      portalUrl: "https://procure.ohio.gov/",
    },
    {
      sourceCode: "virginia",
      sourceName: "Virginia eVA",
      helperText: "Virginia eVA is the commonwealth's eProcurement system. Prepare your codes in The Bid Vault, then open eVA to search live Virginia solicitations.",
      portalUrl: "https://eva.virginia.gov/",
    },
    {
      sourceCode: "new-york",
      sourceName: "New York State Contract Reporter",
      helperText: "New York State Contract Reporter is the official statewide solicitation publication. Use The Bid Vault to prepare NAICS and PSC codes, then open the portal to browse live NY bids.",
      portalUrl: "https://www.ogs.ny.gov/procurement/",
    },
    {
      sourceCode: "arizona",
      sourceName: "Arizona Procurement Portal",
      helperText: "Arizona's statewide procurement portal publishes active solicitations. Use The Bid Vault for code preparation, then open the portal to browse live Arizona bids.",
      portalUrl: "https://app.az.gov/aps/index.html",
    },
    {
      sourceCode: "indiana",
      sourceName: "Indiana IDOA Procurement",
      helperText: "Indiana IDOA publishes state procurement opportunities on its portal. Prepare your category codes here, then open the Indiana portal to browse live opportunities.",
      portalUrl: "https://www.in.gov/idoa/procurement/",
    },
    {
      sourceCode: "missouri",
      sourceName: "Missouri State Procurement",
      helperText: "Missouri Office of Administration publishes active solicitations online. Use The Bid Vault to research categories, then open the Missouri portal to find live bids.",
      portalUrl: "https://oa.mo.gov/purchasing/current-contracts-solicitations",
    },
    {
      sourceCode: "wisconsin",
      sourceName: "Wisconsin VendorNet",
      helperText: "Wisconsin VendorNet is the state's official vendor and bid opportunity portal. Use The Bid Vault to align codes, then open VendorNet to browse active Wisconsin solicitations.",
      portalUrl: "https://www.vendornet.state.wi.us/",
    },
    {
      sourceCode: "tennessee",
      sourceName: "Tennessee Central Procurement",
      helperText: "Tennessee Central Procurement posts active solicitations online. Prepare your category codes in The Bid Vault, then open the portal to search live Tennessee bids.",
      portalUrl: "https://www.tn.gov/generalservices/procurement/central-procurement-office.html",
    },
    {
      sourceCode: "maryland",
      sourceName: "Maryland eMarylandMarketplace",
      helperText: "Maryland eMarylandMarketplace (eMMA) is the statewide eProcurement portal. Use The Bid Vault to prepare NAICS codes, then open eMMA to browse live Maryland solicitations.",
      portalUrl: "https://emaryland.buyspeed.com/bso/",
    },
    {
      sourceCode: "massachusetts",
      sourceName: "Massachusetts COMMBUYS",
      helperText: "COMMBUYS is Massachusetts' statewide procurement portal. Use The Bid Vault to research codes and opportunities, then open COMMBUYS to browse live Massachusetts solicitations.",
      portalUrl: "https://www.commbuys.com/bso/",
    },
    {
      sourceCode: "louisiana",
      sourceName: "Louisiana LaPAC",
      helperText: "Louisiana LaPAC is the state's public bid advertising system. Align your category codes here, then open LaPAC to view active Louisiana solicitations.",
      portalUrl: "https://wwwcfprd.doa.louisiana.gov/osp/lapac/pubmain.cfm",
    },
    {
      sourceCode: "oklahoma",
      sourceName: "Oklahoma Central Purchasing",
      helperText: "Oklahoma Central Purchasing posts active solicitations through its official portal. Use The Bid Vault for code research, then browse live Oklahoma bids.",
      portalUrl: "https://oklahoma.gov/cs/purchasing.html",
    },
    {
      sourceCode: "iowa",
      sourceName: "Iowa Bid Opportunities",
      helperText: "Iowa's Department of Administrative Services publishes open bid opportunities. Prepare your codes here, then open the Iowa portal to view live solicitations.",
      portalUrl: "https://bidopportunities.iowa.gov/",
    },
    {
      sourceCode: "kansas",
      sourceName: "Kansas Division of Purchases",
      helperText: "Kansas Division of Purchases publishes solicitations and active contracts. Use The Bid Vault to align NAICS and PSC codes, then open the Kansas portal.",
      portalUrl: "https://da.ks.gov/purch/Contracts/",
    },
    {
      sourceCode: "utah",
      sourceName: "Utah Purchasing",
      helperText: "Utah Division of Purchasing publishes active solicitations. Use The Bid Vault to prepare category codes, then open Utah Purchasing to browse live bids.",
      portalUrl: "https://purchasing.utah.gov/",
    },
    {
      sourceCode: "idaho",
      sourceName: "Idaho Division of Purchasing",
      helperText: "Idaho Division of Purchasing publishes solicitations publicly. Prepare your category codes in The Bid Vault, then open the Idaho portal to view live opportunities.",
      portalUrl: "https://purchasing.idaho.gov/solicitations/",
    },
    {
      sourceCode: "montana",
      sourceName: "Montana Vendor Portal",
      helperText: "Montana's central vendor portal publishes active solicitations. Use The Bid Vault to align codes, then open the Montana portal for live bid opportunities.",
      portalUrl: "https://vendor.mt.gov/",
    },
    {
      sourceCode: "wyoming",
      sourceName: "Wyoming Procurement Services",
      helperText: "Wyoming Procurement Services publishes active solicitations online. Prepare your category codes in The Bid Vault, then open the Wyoming portal for live bids.",
      portalUrl: "https://ai.wyo.gov/divisions/procurement-services",
    },
    {
      sourceCode: "new-mexico",
      sourceName: "New Mexico General Services",
      helperText: "New Mexico General Services posts active solicitations on its procurement page. Use The Bid Vault to prepare codes, then open the New Mexico portal.",
      portalUrl: "https://www.generalservices.state.nm.us/state-purchasing/active-bids-and-rfps/",
    },
    {
      sourceCode: "nebraska",
      sourceName: "Nebraska State Purchasing",
      helperText: "Nebraska State Purchasing publishes open solicitations and contracts online. Align your codes in The Bid Vault, then open the Nebraska portal to browse live bids.",
      portalUrl: "https://das.nebraska.gov/materiel/purchasing.html",
    },
    {
      sourceCode: "arkansas",
      sourceName: "Arkansas State Procurement",
      helperText: "Arkansas Office of State Procurement publishes active solicitations. Use The Bid Vault for category research, then open the Arkansas portal to browse live bids.",
      portalUrl: "https://www.transform.ar.gov/procurement/",
    },
    {
      sourceCode: "mississippi",
      sourceName: "Mississippi Office of Purchasing",
      helperText: "Mississippi Office of Purchasing, Travel and Fleet Management publishes active solicitations. Use The Bid Vault to prepare codes, then open the portal.",
      portalUrl: "https://www.dfa.ms.gov/dfa-offices/mmrs/office-of-purchasing-travel-fleet/",
    },
    {
      sourceCode: "kentucky",
      sourceName: "Kentucky eProcurement",
      helperText: "Kentucky Finance and Administration Cabinet publishes active solicitations via eProcurement. Prepare your codes here, then open the Kentucky portal.",
      portalUrl: "https://finance.ky.gov/services/eprocurement/Pages/default.aspx",
    },
    {
      sourceCode: "south-carolina",
      sourceName: "South Carolina Procurement",
      helperText: "South Carolina's central procurement portal publishes solicitations statewide. Use The Bid Vault to align codes, then open the SC portal for live bids.",
      portalUrl: "https://www.procurement.sc.gov/",
    },
    {
      sourceCode: "alabama",
      sourceName: "Alabama State Purchasing",
      helperText: "Alabama Department of Finance posts active solicitations through its purchasing division. Prepare your codes in The Bid Vault, then open the Alabama portal.",
      portalUrl: "https://purchasing.alabama.gov/",
    },
    {
      sourceCode: "alaska",
      sourceName: "Alaska OPPM",
      helperText: "Alaska Office of Procurement and Property Management publishes solicitations online. Align codes in The Bid Vault, then open the Alaska portal for live bids.",
      portalUrl: "https://doa.alaska.gov/oppm/",
    },
    {
      sourceCode: "hawaii",
      sourceName: "Hawaii State Procurement",
      helperText: "Hawaii State Procurement Office publishes solicitations and active contracts. Prepare your codes in The Bid Vault, then open the Hawaii portal.",
      portalUrl: "https://spo.hawaii.gov/",
    },
    {
      sourceCode: "new-hampshire",
      sourceName: "New Hampshire Purchasing",
      helperText: "New Hampshire Bureau of Purchase and Property posts active solicitations. Use The Bid Vault to prepare codes, then open the NH portal to browse live bids.",
      portalUrl: "https://apps.das.nh.gov/purchasing/",
    },
    {
      sourceCode: "maine",
      sourceName: "Maine State Procurement",
      helperText: "Maine Bureau of General Services publishes open bids and solicitations. Align codes in The Bid Vault, then open the Maine portal to browse live opportunities.",
      portalUrl: "https://www.maine.gov/dafs/bbm/procurementservices/vendors/open-bids",
    },
    {
      sourceCode: "delaware",
      sourceName: "Delaware Bid Conditions",
      helperText: "Delaware Division of Purchasing and Supplies posts bid documents publicly. Use The Bid Vault to prepare codes, then open the Delaware portal for live bids.",
      portalUrl: "https://bidcondocs.delaware.gov/",
    },
    {
      sourceCode: "connecticut",
      sourceName: "Connecticut DAS Procurement",
      helperText: "Connecticut DAS publishes active solicitations through its procurement portal. Prepare your codes in The Bid Vault, then open the CT portal for live bids.",
      portalUrl: "https://portal.ct.gov/DAS/Services/For-Agencies-and-Municipalities/Procurement",
    },
    {
      sourceCode: "rhode-island",
      sourceName: "Rhode Island Division of Purchases",
      helperText: "Rhode Island Division of Purchases posts active solicitations online. Use The Bid Vault to align codes, then open the RI portal to browse live opportunities.",
      portalUrl: "https://www.ridop.ri.gov/",
    },
    {
      sourceCode: "vermont",
      sourceName: "Vermont Purchasing and Contracting",
      helperText: "Vermont Department of Buildings and General Services publishes solicitations. Prepare codes in The Bid Vault, then open the Vermont portal for live bids.",
      portalUrl: "https://bgs.vermont.gov/purchasing/procurement",
    },
    {
      sourceCode: "west-virginia",
      sourceName: "West Virginia Purchasing",
      helperText: "West Virginia Division of Purchasing publishes active solicitations. Use The Bid Vault to align codes, then open the WV portal to browse live procurement opportunities.",
      portalUrl: "https://www.state.wv.us/admin/purchase/",
    },
    {
      sourceCode: "south-dakota",
      sourceName: "South Dakota Open.SD.gov",
      helperText: "South Dakota publishes procurement and bid opportunities through its open data portal. Prepare your codes in The Bid Vault, then open the SD portal for live bids.",
      portalUrl: "https://open.sd.gov/",
    },
    {
      sourceCode: "north-dakota",
      sourceName: "North Dakota State Purchasing",
      helperText: "North Dakota Division of Purchasing publishes solicitations. Use The Bid Vault to prepare codes, then open the ND portal to browse live state opportunities.",
      portalUrl: "https://www.nd.gov/omb/public/state-procurement",
    },
  ];

  const now = formatSyncTime();
  for (const pa of portalAssistedStates) {
    updateConnectedSource(
      sources,
      pa.sourceCode,
      pa.helperText,
      {
        connectionMode: "portal-assisted",
        cadence: "Portal-assisted",
        lastSyncedAt: now,
        portalUrl: pa.portalUrl,
      },
    );
    syncLogs.push({
      id: `sync-${pa.sourceCode}-portal-assisted`,
      sourceName: pa.sourceName,
      sourceCode: pa.sourceCode,
      syncStatus: "Partial",
      lastRunAt: now,
      recordsAdded: 0,
      recordsUpdated: 0,
      notes: `${pa.sourceName} is available in portal-assisted mode. Use The Bid Vault to prepare your search, then open the live portal to review current solicitations.`,
    });
  }

  updateConnectedSource(
    sources,
    "nevada",
    "Nevada active contracts and bids are available in the official NevadaEPro portal. The public portal currently blocks automated result extraction, so this source uses a portal-assisted mode while preserving saved-code and workflow support in the app.",
    {
      connectionMode: "portal-assisted",
      cadence: "Portal-assisted",
      lastSyncedAt: formatSyncTime(),
    },
  );
  syncLogs.push({
    id: "sync-nevada-portal-assisted",
    sourceName: "NEVADAePro",
    sourceCode: "nevada",
    syncStatus: "Partial",
    lastRunAt: formatSyncTime(),
    recordsAdded: 0,
    recordsUpdated: 0,
    notes:
      "NevadaEPro is available in portal-assisted mode. Saved codes and search terms can be applied before opening the live Nevada portal, but the portal blocks background result extraction from The Bid Vault right now.",
  });

  updateConnectedSource(
    sources,
    "north-carolina",
    "North Carolina eVP is available now as a portal-assisted source. You can use saved codes and search planning in The Bid Vault, then open eVP directly to review the live statewide solicitations.",
    {
      connectionMode: "portal-assisted",
      cadence: "Portal-assisted",
      lastSyncedAt: formatSyncTime(),
      portalUrl: "https://evp.nc.gov/solicitations/?status=0",
    },
  );
  syncLogs.push({
    id: "sync-north-carolina-portal-assisted",
    sourceName: "North Carolina eVP",
    sourceCode: "north-carolina",
    syncStatus: "Partial",
    lastRunAt: formatSyncTime(),
    recordsAdded: 0,
    recordsUpdated: 0,
    notes:
      "North Carolina eVP is available in portal-assisted mode. The Bid Vault keeps your statewide and county workflow organized, then hands you into the live eVP portal for the official postings.",
  });

  const snapshot: StateLocalSnapshot = {
    opportunities,
    syncLogs,
    sources: [
      {
        ...websSourceSummary,
        status: "Connected",
        connectionMode: "live",
        cadence: "Live public site",
        lastSyncedAt: opportunities.some((item) => item.sourceCode === "washington")
          ? formatSyncTime()
          : "Unable to load live WEBS records",
        helperText: opportunities.some((item) => item.sourceCode === "washington")
          ? websSourceSummary.helperText
          : "WEBS is connected as a live public source, but the latest fetch did not return records. We are no longer showing placeholder postings here.",
      },
      ...sources.filter((source) => source.sourceCode !== "washington"),
    ],
  };

  cachedStateLocalSnapshot = {
    cachedAt: Date.now(),
    snapshot: cloneSnapshot(snapshot),
  };

  return snapshot;
}
