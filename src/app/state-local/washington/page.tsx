import { StateLocalClient } from "@/components/state-local-client";
import { getStateLocalSyncSnapshot } from "@/lib/sources/sync-state-local";
import { getLocalDirectoryEntries } from "@/lib/sources/state-registry";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function pickSearchValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

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
  const focusSources = snapshot.sources.filter((source) => source.sourceCode === "washington");
  const availableCategoryCodes = new Set(snapshot.opportunities.map((opportunity) => opportunity.categoryCode));
  const requestedCategoryCodes = pickSearchValue(params.codes)
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
      stateNavigator={{
        stateName: "Washington",
        stateCode: "WA",
        statewideSources: focusSources,
        localSources: [],
        localDirectoryEntries: getLocalDirectoryEntries("WA"),
      }}
      enableLiveRefresh
      refreshButtonLabel="Refresh live WEBS records"
      refreshSuccessMessage="Washington opportunities refreshed from the live WEBS source."
      refreshErrorMessage="WEBS could not refresh live records right now. Please try again."
      portalAssist={{
        eyebrow: "Portal backup ready",
        title: "Use the official WEBS bid calendar any time the live in-app feed has a hiccup.",
        description:
          "Washington remains one of the strongest state integrations in The Bid Vault, but WEBS can still be inconsistent about background requests. When that happens, this page keeps your filters and workflow in place while pointing you straight to the official calendar.",
        links: [
          {
            href: "https://pr-webs-vendor.des.wa.gov/BidCalendar.aspx",
            label: "Open WEBS bid calendar",
            external: true,
          },
        ],
      }}
      livePortalView={{
        eyebrow: "WEBS live portal",
        title: "Open the official Washington WEBS bid calendar directly from this state page.",
        description:
          "If the in-app live source has a temporary hiccup, you can still review the official WEBS posting list and keep working without losing your place.",
        href: "https://pr-webs-vendor.des.wa.gov/BidCalendar.aspx",
        openLabel: "Open WEBS bid calendar",
        note:
          "WEBS can be inconsistent about background requests and browser embedding. This keeps the Washington page stable while still giving you the live official source in one click.",
        allowEmbed: false,
        blockedMessage:
          "WEBS works better here as a direct live portal handoff. Open the official bid calendar in a new tab when you want the raw Washington source view.",
      }}
      savedCodeDescription="Apply your saved work categories to WEBS in one click."
      savedCodeApplyLabel="Apply to WEBS"
      initialFilters={{
        keywords: pickSearchValue(params.keywords),
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
