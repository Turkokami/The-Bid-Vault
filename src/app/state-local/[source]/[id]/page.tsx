import { notFound } from "next/navigation";
import { StateLocalDetailClient } from "@/components/state-local-detail-client";

export function generateStaticParams() {
  return [{ source: "washington", id: "demo" }];
}
import { getStateLocalSyncSnapshot } from "@/lib/sources/sync-state-local";
import type { StateLocalSourceCode } from "@/lib/sources/types";

const knownSources: StateLocalSourceCode[] = [
  "washington",
  "arizona",
  "flagstaff",
  "coconino",
  "mohave",
  "yavapai",
  "white-pine",
  "nye",
  "oregon",
  "idaho",
  "california",
  "nevada",
  "texas",
  "new-york",
  "colorado",
  "georgia",
  "florida",
  "pennsylvania",
  "virginia",
  "north-carolina",
  "tennessee",
  "maryland",
  "massachusetts",
  "louisiana",
  "oklahoma",
  "iowa",
  "kansas",
  "utah",
  "montana",
  "wyoming",
  "new-mexico",
  "nebraska",
  "arkansas",
  "mississippi",
  "kentucky",
  "south-carolina",
  "alabama",
  "alaska",
  "hawaii",
  "new-hampshire",
  "maine",
  "delaware",
  "connecticut",
  "rhode-island",
  "vermont",
  "west-virginia",
  "south-dakota",
  "north-dakota",
  "michigan",
  "ohio",
  "indiana",
  "illinois",
  "wisconsin",
  "minnesota",
  "missouri",
  "new-jersey",
];

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function StateLocalOpportunityDetailPage({
  params,
}: {
  params: Promise<{ source: string; id: string }>;
}) {
  const { source, id } = await params;

  if (!knownSources.includes(source as StateLocalSourceCode)) {
    notFound();
  }

  const snapshot = await getStateLocalSyncSnapshot().catch(() => ({
    opportunities: [],
    syncLogs: [],
    sources: [],
  }));

  return (
    <StateLocalDetailClient
      sourceCode={source}
      opportunityId={id}
      initialOpportunities={snapshot.opportunities}
      initialSources={snapshot.sources}
    />
  );
}
