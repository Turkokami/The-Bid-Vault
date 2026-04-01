import { websSourceSummary } from "@/lib/sources/webs";
import { fetchLiveWebsRawOpportunities } from "@/lib/sources/webs-live";
import type {
  NormalizedStateLocalOpportunity,
  StateLocalSourceSummary,
  StateLocalSourceSyncLog,
} from "@/lib/sources/types";

const plannedSources: StateLocalSourceSummary[] = [
  {
    id: "source-oregon",
    sourceCode: "oregon",
    sourceName: "OregonBuys",
    stateCode: "OR",
    status: "Planned",
    cadence: "Planned",
    description: "Planned Oregon state and local opportunity coverage.",
    helperText: "Future Oregon connector placeholder for state and local solicitations.",
    portalUrl: "https://oregonbuys.gov/",
    lastSyncedAt: "Not connected yet",
  },
  {
    id: "source-idaho",
    sourceCode: "idaho",
    sourceName: "Idaho eProcurement",
    stateCode: "ID",
    status: "Planned",
    cadence: "Planned",
    description: "Planned Idaho state and local procurement coverage.",
    helperText: "Future Idaho connector placeholder for state and local opportunities.",
    portalUrl: "https://purchasing.idaho.gov/",
    lastSyncedAt: "Not connected yet",
  },
  {
    id: "source-california",
    sourceCode: "california",
    sourceName: "Cal eProcure",
    stateCode: "CA",
    status: "Planned",
    cadence: "Planned",
    description: "Planned California state and local procurement coverage.",
    helperText: "Future California connector placeholder for broader west coast coverage.",
    portalUrl: "https://caleprocure.ca.gov/",
    lastSyncedAt: "Not connected yet",
  },
];

export async function getStateLocalSyncSnapshot(): Promise<{
  opportunities: NormalizedStateLocalOpportunity[];
  syncLogs: StateLocalSourceSyncLog[];
  sources: StateLocalSourceSummary[];
}> {
  try {
    const raws = await fetchLiveWebsRawOpportunities();
    const opportunities = raws.map((record) => ({
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
    const syncLogs = [
      {
        id: `sync-webs-live-${raws.length}`,
        sourceName: "WEBS",
        sourceCode: "washington" as const,
        syncStatus: "Success" as const,
        lastRunAt: new Date().toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          timeZoneName: "short",
        }),
        recordsAdded: raws.length,
        recordsUpdated: 0,
        notes: "Live WEBS postings were loaded directly from Washington's public bid portal.",
      },
    ];

    return {
      opportunities,
      syncLogs,
      sources: [
        {
          ...websSourceSummary,
          status: "Connected",
          cadence: "Live public site",
          lastSyncedAt: new Date().toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
            timeZoneName: "short",
          }),
        },
        ...plannedSources,
      ],
    };
  } catch {
    return {
      opportunities: [],
      syncLogs: [],
      sources: [
        {
          ...websSourceSummary,
          status: "Connected",
          cadence: "Live public site",
          lastSyncedAt: "Unable to load live WEBS records",
          helperText:
            "WEBS is connected as a live public source, but the latest fetch did not return records. We are no longer showing placeholder postings here.",
        },
        ...plannedSources,
      ],
    };
  }
}
