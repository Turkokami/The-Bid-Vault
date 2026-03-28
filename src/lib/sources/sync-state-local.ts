import { websConnector, websSourceSummary } from "@/lib/sources/webs";
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
  const raws = await websConnector.fetchOpportunities();
  const opportunities = raws.map(websConnector.normalize);
  const syncLogs = [websConnector.createSyncLog(raws)];

  return {
    opportunities,
    syncLogs,
    sources: [websSourceSummary, ...plannedSources],
  };
}
