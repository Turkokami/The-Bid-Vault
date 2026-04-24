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
  const snapshot = await getStateLocalSyncSnapshot().catch(() => ({
    opportunities: [],
    syncLogs: [
      {
        id: "washington-load-fallback",
        sourceName: "WEBS",
        sourceCode: "washington" as const,
        syncStatus: "Failed" as const,
        lastRunAt: new Date().toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          timeZoneName: "short",
        }),
        recordsAdded: 0,
        recordsUpdated: 0,
        errorMessage: "Washington WEBS could not load live records right now.",
        notes:
          "The Washington source hit a temporary loading problem. The page is still available and you can try refreshing again.",
      },
    ],
    sources: [
      {
        id: "source-washington-fallback",
        sourceCode: "washington" as const,
        sourceName: "WEBS",
        stateCode: "WA",
        status: "Connected" as const,
        connectionMode: "portal-assisted" as const,
        cadence: "Temporary fallback",
        description: "Washington's Electronic Business Solution for state and local opportunities.",
        helperText:
          "WEBS is temporarily unavailable inside the app right now. Use refresh to try again, or open the original WEBS portal directly from the Washington page.",
        portalUrl: "https://pr-webs-vendor.des.wa.gov/BidCalendar.aspx",
        lastSyncedAt: "Temporary fallback active",
      },
    ],
  }));
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
      pageEyebrow="Washington opportunities"
      pageTitle="Washington opportunities in a simpler view than WEBS."
      pageDescription="Search live Washington WEBS postings, narrow them by work type or agency, and open the original source when you are ready to review bid details."
      sourceLabel="WEBS"
      sourceDescription="Washington's Electronic Business Solution for many state and local opportunities."
      focusSourceCodes={["washington"]}
      enableLiveRefresh
      refreshButtonLabel="Refresh live WEBS records"
      refreshSuccessMessage="Washington opportunities refreshed from the live WEBS source."
      refreshErrorMessage="WEBS could not refresh live records right now. Please try again."
      savedCodeDescription="Apply your saved work categories to WEBS in one click."
      savedCodeApplyLabel="Apply to WEBS"
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
      resetFilters={{
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
