import { fetchLiveTexasOpportunities } from "@/lib/sources/texas-live";
import { stateDirectory } from "@/lib/sources/state-registry";
import { websSourceSummary } from "@/lib/sources/webs";
import { fetchLiveWebsRawOpportunities } from "@/lib/sources/webs-live";
import type {
  NormalizedStateLocalOpportunity,
  StateLocalSourceSummary,
  StateLocalSourceSyncLog,
} from "@/lib/sources/types";

let cachedWebsOpportunities: NormalizedStateLocalOpportunity[] = [];
let cachedTexasOpportunities: NormalizedStateLocalOpportunity[] = [];

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

export async function getStateLocalSyncSnapshot(): Promise<{
  opportunities: NormalizedStateLocalOpportunity[];
  syncLogs: StateLocalSourceSyncLog[];
  sources: StateLocalSourceSummary[];
}> {
  const opportunities: NormalizedStateLocalOpportunity[] = [];
  const syncLogs: StateLocalSourceSyncLog[] = [];
  const sources = [...statewideSources, ...localAndRegionalSources];

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

  return {
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
}
