import { BidBuilderClient } from "@/components/bid-builder-client";

type BidBuilderPageProps = {
  searchParams?: Promise<{
    title?: string;
    noticeId?: string;
    agency?: string;
    source?: string;
    dueDate?: string;
    naics?: string;
    setAside?: string;
    summary?: string;
    sourceUrl?: string;
    attachmentsUrl?: string;
  }>;
};

function makeDraftId(
  title: string,
  noticeId?: string,
  agency?: string,
) {
  const seed = `${noticeId ?? ""}|${title}|${agency ?? ""}`;
  return seed.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "bid-draft";
}

export default async function BidBuilderPage({ searchParams }: BidBuilderPageProps) {
  const params = (await searchParams) ?? {};
  const title = params.title ?? "New bid workspace";

  return (
    <BidBuilderClient
      draftId={makeDraftId(title, params.noticeId, params.agency)}
      title={title}
      noticeId={params.noticeId}
      agency={params.agency}
      sourceName={params.source}
      dueDate={params.dueDate}
      naicsCode={params.naics}
      setAside={params.setAside}
      summary={params.summary}
      sourceUrl={params.sourceUrl}
      attachmentsUrl={params.attachmentsUrl}
    />
  );
}
