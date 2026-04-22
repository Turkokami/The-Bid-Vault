import { StateLocalClient } from "@/components/state-local-client";
import { getStateLocalSyncSnapshot } from "@/lib/sources/sync-state-local";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function WashingtonStateLocalPage({
  searchParams,
}: {
  searchParams?: Promise<{
    keywords?: string;
    codes?: string;
  }>;
}) {
  const params = (await searchParams) ?? {};
  const snapshot = await getStateLocalSyncSnapshot();
  const availableCategoryCodes = new Set(snapshot.opportunities.map((opportunity) => opportunity.categoryCode));
  const requestedCategoryCodes = (params.codes ?? "")
    .split(",")
    .map((code) => code.trim())
    .filter((code) => code && availableCategoryCodes.has(code));

  return (
    <StateLocalClient
      initialOpportunities={snapshot.opportunities}
      initialSources={snapshot.sources}
      initialSyncLogs={snapshot.syncLogs}
      initialFilters={{
        keywords: params.keywords ?? "",
        states: ["WA"],
        sources: ["WEBS"],
        opportunityTypes: [],
        entities: [],
        statuses: [],
        categoryCodes: requestedCategoryCodes,
        registration: [],
        dueFrom: "",
        dueTo: "",
        sortBy: "dueDate",
        page: 1,
      }}
    />
  );
}
