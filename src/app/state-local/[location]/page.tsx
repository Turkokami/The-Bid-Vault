import { notFound } from "next/navigation";
import { StateLocalClient } from "@/components/state-local-client";
import { getStateLocalSyncSnapshot } from "@/lib/sources/sync-state-local";
import type { StateLocalFilters } from "@/lib/state-local-search";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type LocationView = {
  slug: string;
  title: string;
  description: string;
  states: string[];
  sourceCodes: string[];
  sourceNames?: string[];
  sourceLabel: string;
  sourceDescription: string;
};

const locationViews: LocationView[] = [
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
      "Use this view to focus on Nevada statewide opportunities plus the county areas your providers serve.",
    states: ["NV"],
    sourceCodes: ["nevada", "white-pine", "nye"],
    sourceLabel: "Nevada sources",
    sourceDescription: "Nevada statewide and county bid sources staged for live monitoring.",
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
];

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

export default async function LocationStateLocalPage({
  params,
  searchParams,
}: {
  params: Promise<{ location: string }>;
  searchParams?: Promise<{
    keywords?: string;
    codes?: string;
  }>;
}) {
  const { location } = await params;
  const query = (await searchParams) ?? {};
  const snapshot = await getStateLocalSyncSnapshot();
  const view = locationViews.find((item) => item.slug === location);

  if (!view) {
    notFound();
  }

  const focusSources = snapshot.sources.filter((source) => view.sourceCodes.includes(source.sourceCode));
  const sourceNames = focusSources.map((source) => source.sourceName);
  const viewWithSources = { ...view, sourceNames };
  const initialFilters = buildFilters(viewWithSources, query.keywords ?? "", query.codes ?? "");

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
    />
  );
}
