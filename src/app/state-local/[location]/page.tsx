import { notFound } from "next/navigation";
import { StateLocalClient } from "@/components/state-local-client";
import {
  getCityContractsSearchUrl,
  getCountyContractsSearchUrl,
  getStateDirectoryEntry,
  getLocalGovernmentContractsSearchUrl,
} from "@/lib/sources/state-registry";
import { getStateLocalSyncSnapshot } from "@/lib/sources/sync-state-local";
import type { StateLocalFilters } from "@/lib/state-local-search";
import type { StateLocalSourceSummary } from "@/lib/sources/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function pickSearchValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

type LocationView = {
  slug: string;
  title: string;
  description: string;
  states: string[];
  sourceCodes: string[];
  sourceNames?: string[];
  sourceLabel: string;
  sourceDescription: string;
  emptyStateMessage?: string;
  portalAssist?: {
    eyebrow: string;
    title: string;
    description: string;
    note?: string;
    links: Array<{
      href: string;
      label: string;
      external?: boolean;
    }>;
  };
};

const locationViews: LocationView[] = [
  {
    slug: "washington",
    title: "Washington state and local opportunities.",
    description:
      "Search Washington statewide and local opportunities in a cleaner view powered by live WEBS coverage.",
    states: ["WA"],
    sourceCodes: ["washington"],
    sourceLabel: "Washington sources",
    sourceDescription: "Washington statewide coverage with live WEBS results.",
  },
  {
    slug: "arizona",
    title: "Arizona state and local opportunities.",
    description:
      "Use this view to focus on Arizona state, county, and city sources as they are connected into The Bid Vault.",
    states: ["AZ"],
    sourceCodes: ["arizona", "flagstaff", "coconino", "mohave", "yavapai"],
    sourceLabel: "Arizona sources",
    sourceDescription: "Arizona statewide, city, and county portals staged for live monitoring.",
  },
  {
    slug: "northern-arizona",
    title: "Northern Arizona local opportunities.",
    description:
      "Focus on Flagstaff, Coconino County, Yavapai County, and Mohave County service areas.",
    states: ["AZ"],
    sourceCodes: ["flagstaff", "coconino", "mohave", "yavapai"],
    sourceLabel: "Northern Arizona sources",
    sourceDescription: "Local portals for Northern and Northwest Arizona service providers.",
  },
  {
    slug: "nevada",
    title: "Nevada state and county opportunities.",
    description:
      "Use this view to focus on Nevada statewide opportunities plus the county areas your providers serve. Nevada currently works in a portal-assisted mode so your saved terms and code lists stay useful even while the official portal handles the live result table.",
    states: ["NV"],
    sourceCodes: ["nevada", "white-pine", "nye"],
    sourceLabel: "Nevada sources",
    sourceDescription: "Nevada statewide and county bid sources, with portal-assisted access for the official NEVADAePro search pages.",
    emptyStateMessage:
      "Nevada results are opened through the live NevadaEPro portal right now. Use the quick links above to jump into Nevada's active contracts or open bids pages with your saved search terms in mind.",
    portalAssist: {
      eyebrow: "Portal-assisted now",
      title: "Use NevadaEPro directly, with your Bid Vault workflow still guiding the search.",
      description:
        "Nevada's official portal blocks background result extraction, so this page acts like a launch pad. Use your saved codes, saved terms, and location filters here, then open the exact Nevada search page to review the live contracts in the official system.",
      note:
        "This keeps the Nevada page useful immediately instead of showing a blank screen. We are also scaffolding a browser-driven connector so Nevada can become a true in-app live source later.",
      links: [
        {
          href: "https://nevadaepro.com/bso/view/search/external/advancedSearchContractBlanket.xhtml?view=activeContracts",
          label: "Open Nevada active contracts",
          external: true,
        },
        {
          href: "https://nevadaepro.com/bso/view/search/external/advancedSearchBid.xhtml?openBids=true",
          label: "Open Nevada open bids",
          external: true,
        },
        {
          href: "https://www.purchasing.nv.gov/Vendors/",
          label: "View Nevada vendor guidance",
          external: true,
        },
      ],
    },
  },
  {
    slug: "mohave",
    title: "Mohave County opportunities.",
    description:
      "Focus on Mohave County opportunities for Kingman, Lake Havasu, Bullhead City, and nearby county service areas.",
    states: ["AZ"],
    sourceCodes: ["mohave"],
    sourceLabel: "Mohave County",
    sourceDescription: "Mohave County procurement coverage through its OpenGov portal.",
  },
  {
    slug: "coconino",
    title: "Coconino County opportunities.",
    description:
      "Focus on Coconino County and Flagstaff-area opportunities for facilities, public works, parks, and services.",
    states: ["AZ"],
    sourceCodes: ["coconino", "flagstaff"],
    sourceLabel: "Coconino and Flagstaff",
    sourceDescription: "Coconino County and City of Flagstaff source coverage.",
  },
  {
    slug: "yavapai",
    title: "Yavapai County opportunities.",
    description:
      "Focus on Prescott-area and Yavapai County opportunities for county work and local service contracts.",
    states: ["AZ"],
    sourceCodes: ["yavapai"],
    sourceLabel: "Yavapai County",
    sourceDescription: "Yavapai County bid coverage through its public procurement portal.",
  },
  {
    slug: "white-pine",
    title: "White Pine County opportunities.",
    description:
      "Focus on Ely-area and White Pine County opportunities for public works, facilities, and local services.",
    states: ["NV"],
    sourceCodes: ["white-pine"],
    sourceLabel: "White Pine County",
    sourceDescription: "White Pine County public bid postings staged for monitoring.",
  },
  {
    slug: "nye",
    title: "Nye County opportunities.",
    description:
      "Focus on Nye County opportunities around Pahrump, Tonopah, roads, county facilities, and local services.",
    states: ["NV"],
    sourceCodes: ["nye"],
    sourceLabel: "Nye County",
    sourceDescription: "Nye County public bid postings staged for monitoring.",
  },
  {
    slug: "texas",
    title: "Texas state opportunities.",
    description:
      "Focus on Texas ESBD and TxSmartBuy opportunities as this connector is added.",
    states: ["TX"],
    sourceCodes: ["texas"],
    sourceLabel: "Texas ESBD / TxSmartBuy",
    sourceDescription: "Texas state procurement sources staged for live monitoring.",
  },
  {
    slug: "north-carolina",
    title: "North Carolina state and county opportunities.",
    description:
      "Use this view to focus on North Carolina statewide opportunities through eVP, then branch into Mecklenburg County and Guilford County local source options.",
    states: ["NC"],
    sourceCodes: ["north-carolina", "mecklenburg", "guilford"],
    sourceLabel: "North Carolina sources",
    sourceDescription:
      "North Carolina eVP statewide coverage plus county purchasing options for major local service areas.",
    emptyStateMessage:
      "North Carolina uses a portal-assisted workflow right now. Use the official eVP actions above to review the live statewide solicitations, then open Mecklenburg or Guilford if you need county-level procurement pages.",
    portalAssist: {
      eyebrow: "Portal-assisted now",
      title: "Use North Carolina eVP directly, with The Bid Vault organizing the workflow first.",
      description:
        "North Carolina's official eVP site is the statewide system for public solicitations, vendor search, and bidding guidance. This page keeps your saved terms, code lists, and county options together, then hands you into eVP for the live postings.",
      note:
        "This gives you a stronger North Carolina page immediately, without pretending the statewide portal can always be extracted cleanly in the background.",
      links: [
        {
          href: "https://evp.nc.gov/",
          label: "Open North Carolina eVP",
          external: true,
        },
        {
          href: "https://evp.nc.gov/solicitations/",
          label: "Open eVP solicitations",
          external: true,
        },
        {
          href: "https://ncadmin.nc.gov/government-agencies/procurement",
          label: "View NC procurement guidance",
          external: true,
        },
      ],
    },
  },
  {
    slug: "mecklenburg",
    title: "Mecklenburg County opportunities.",
    description:
      "Focus on Mecklenburg County procurement opportunities around Charlotte, county departments, and major local public service work.",
    states: ["NC"],
    sourceCodes: ["mecklenburg"],
    sourceLabel: "Mecklenburg County",
    sourceDescription: "Mecklenburg County procurement guidance and portal-assisted county source coverage.",
    emptyStateMessage:
      "Use the official Mecklenburg County procurement page to review the county's live opportunities and vendor workflow.",
    portalAssist: {
      eyebrow: "County portal-assisted",
      title: "Use Mecklenburg County's official procurement portal and vendor guidance.",
      description:
        "Mecklenburg County runs procurement through its Financial Services procurement team and MeckProcure vendor workflow. This page helps you keep the county in your search plan while sending you to the live county portal for the current postings.",
      links: [
        {
          href: "https://fin.mecknc.gov/procurement",
          label: "Open Mecklenburg procurement",
          external: true,
        },
      ],
    },
  },
  {
    slug: "guilford",
    title: "Guilford County opportunities.",
    description:
      "Focus on Guilford County purchasing opportunities around Greensboro, High Point, county facilities, and local service contracts.",
    states: ["NC"],
    sourceCodes: ["guilford"],
    sourceLabel: "Guilford County",
    sourceDescription: "Guilford County purchasing guidance and portal-assisted county source coverage.",
    emptyStateMessage:
      "Use Guilford County's official purchasing page to review its bid and RFP notices and vendor resources.",
    portalAssist: {
      eyebrow: "County portal-assisted",
      title: "Use Guilford County's official purchasing page for the live county notices.",
      description:
        "Guilford County publishes bid and request-for-proposal notices through its purchasing division and vendor self-service resources. This page keeps Guilford in your local workflow while handing you into the county's live system.",
      links: [
        {
          href: "https://www.guilfordcountync.gov/government/departments-and-agencies/finance/purchasing",
          label: "Open Guilford purchasing",
          external: true,
        },
      ],
    },
  },
];

function buildStateLocationView(location: string, allSourceCodes: string[]): LocationView | null {
  const state = getStateDirectoryEntry(location);
  if (!state) {
    return null;
  }

  const stateLocalSourceCodes = allSourceCodes.filter((code) => code !== state.slug);
  const localCodesForState = stateLocalSourceCodes.filter((code) => {
    const localState = getStateDirectoryEntry(code);
    return localState?.stateCode === state.stateCode;
  });

  const sourceCodes = [state.slug, ...localCodesForState];
  const portalAssist =
    state.connectionMode === "portal-assisted"
      ? {
          eyebrow: "Portal-assisted now",
          title: `Use ${state.portalName} directly, with The Bid Vault guiding the workflow.`,
          description:
            `${state.name}'s official source works best as a live portal handoff today. Use your saved terms, saved code lists, and local coverage plan here, then open the official state portal to review the live postings directly.`,
          note:
            "This keeps the page useful right now instead of pretending the portal can always be scraped in the background.",
          links: [
            {
              href: state.portalUrl,
              label: `Open ${state.name} portal`,
              external: true,
            },
            {
              href: "/categories",
              label: "Review saved work categories",
            },
          ],
        }
      : undefined;

  return {
    slug: state.slug,
    title: `${state.name} state and local opportunities.`,
    description: `Use this page to focus on ${state.name} statewide opportunities, then branch into county and city sources as those local connectors are added.`,
    states: [state.stateCode],
    sourceCodes,
    sourceLabel: `${state.name} sources`,
    sourceDescription: `${state.portalName} plus county and city coverage for ${state.name}.`,
    emptyStateMessage:
      state.connectionMode === "live"
        ? `No ${state.name} results are showing right now. Try refreshing the page or opening the official ${state.name} portal directly.`
        : `This ${state.name} page is ready as a statewide launch point. Open the official ${state.name} portal while county and city connectors are built out.`,
    portalAssist,
  };
}

function buildFilters(view: LocationView, keywords = "", codes = ""): StateLocalFilters {
  const requestedCategoryCodes = codes
    .split(",")
    .map((code) => code.trim())
    .filter(Boolean);

  return {
    keywords,
    states: view.states,
    sources: view.sourceNames ?? [],
    opportunityTypes: [],
    entities: [],
    statuses: [],
    categoryCodes: requestedCategoryCodes,
    registration: [],
    dueFrom: "",
    dueTo: "",
    sortBy: "dueDate",
    page: 1,
  };
}

function getStateNavigatorData(
  stateName: string,
  stateCode: string,
  focusSources: StateLocalSourceSummary[],
) {
  const statewideSources = focusSources.filter((source) => source.sourceType !== "County / City");
  const localSources = focusSources.filter((source) => source.sourceType === "County / City");

  return {
    stateName,
    stateCode,
    statewideSources,
    localSources,
    countySearchLinks: [
      {
        href: getCountyContractsSearchUrl(stateName),
        label: `Search county bids in ${stateName}`,
      },
      {
        href: getCityContractsSearchUrl(stateName),
        label: `Search city bids in ${stateName}`,
      },
      {
        href: getLocalGovernmentContractsSearchUrl(stateName),
        label: `Search local government bids in ${stateName}`,
      },
    ],
  };
}

export default async function LocationStateLocalPage({
  params,
  searchParams,
}: {
  params: Promise<{ location: string }>;
  searchParams?: Promise<{
    keywords?: string | string[];
    codes?: string | string[];
  }>;
}) {
  const { location } = await params;
  const query = (await searchParams) ?? {};
  const snapshot = await getStateLocalSyncSnapshot().catch(() => ({
    opportunities: [],
    syncLogs: [
      {
        id: `state-local-${location}-fallback`,
        sourceName: "State & Local Sources",
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
        errorMessage: "This location view could not load live source data right now.",
        notes:
          "The live source had a temporary loading problem. The page is still available and direct portal links should still work.",
      },
    ],
    sources: [],
  }));
  const allSourceCodes = snapshot.sources.map((source) => source.sourceCode);
  const view =
    locationViews.find((item) => item.slug === location) ??
    buildStateLocationView(location, allSourceCodes);

  if (!view) {
    notFound();
  }

  const focusSources = snapshot.sources.filter((source) => view.sourceCodes.includes(source.sourceCode));
  const sourceNames = focusSources.map((source) => source.sourceName);
  const viewWithSources = { ...view, sourceNames };
  const stateEntry = getStateDirectoryEntry(location);
  const stateNavigator = stateEntry
    ? getStateNavigatorData(stateEntry.name, stateEntry.stateCode, focusSources)
    : undefined;
  const initialFilters = buildFilters(
    viewWithSources,
    pickSearchValue(query.keywords),
    pickSearchValue(query.codes),
  );

  return (
    <StateLocalClient
      initialOpportunities={snapshot.opportunities}
      initialSources={snapshot.sources}
      initialSyncLogs={snapshot.syncLogs}
      initialFilters={initialFilters}
      resetFilters={buildFilters(viewWithSources)}
      pageEyebrow="Location view"
      pageTitle={view.title}
      pageDescription={view.description}
      sourceLabel={view.sourceLabel}
      sourceDescription={view.sourceDescription}
      focusSourceCodes={view.sourceCodes}
      portalAssist={view.portalAssist}
      emptyStateMessage={view.emptyStateMessage}
      stateNavigator={stateNavigator}
      showSourceHubSection={false}
    />
  );
}
