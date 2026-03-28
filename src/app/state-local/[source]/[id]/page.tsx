import { notFound } from "next/navigation";
import { StateLocalDetailClient } from "@/components/state-local-detail-client";
import { getStateLocalSyncSnapshot } from "@/lib/sources/sync-state-local";
import type { StateLocalSourceCode } from "@/lib/sources/types";

const knownSources: StateLocalSourceCode[] = ["washington", "oregon", "idaho", "california"];

export default async function StateLocalOpportunityDetailPage({
  params,
}: {
  params: Promise<{ source: string; id: string }>;
}) {
  const { source, id } = await params;

  if (!knownSources.includes(source as StateLocalSourceCode)) {
    notFound();
  }

  const snapshot = await getStateLocalSyncSnapshot();

  return (
    <StateLocalDetailClient
      sourceCode={source}
      opportunityId={id}
      initialOpportunities={snapshot.opportunities}
      initialSources={snapshot.sources}
    />
  );
}
