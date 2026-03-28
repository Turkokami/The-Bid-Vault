import { StateLocalClient } from "@/components/state-local-client";
import { getStateLocalSyncSnapshot } from "@/lib/sources/sync-state-local";

export default async function WashingtonStateLocalPage() {
  const snapshot = await getStateLocalSyncSnapshot();

  return (
    <StateLocalClient
      initialOpportunities={snapshot.opportunities}
      initialSources={snapshot.sources}
      initialSyncLogs={snapshot.syncLogs}
      initialFilters={{
        keywords: "",
        states: ["WA"],
        sources: ["WEBS"],
        opportunityTypes: [],
        entities: [],
        statuses: [],
        categoryCodes: [],
        registration: [],
        dueFrom: "",
        dueTo: "",
        sortBy: "dueDate",
        page: 1,
      }}
    />
  );
}
