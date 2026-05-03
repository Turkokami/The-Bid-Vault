import { AttachmentReviewClient } from "@/components/attachment-review-client";

type AttachmentReviewPageProps = {
  searchParams?: Promise<{
    title?: string;
    noticeId?: string;
    source?: string;
    agency?: string;
    dueDate?: string;
    sourceUrl?: string;
    attachmentsUrl?: string;
    setAside?: string;
    naics?: string;
    summary?: string;
    location?: string;
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

export default async function AttachmentReviewPage({
  searchParams,
}: AttachmentReviewPageProps) {
  const params = (await searchParams) ?? {};
  const title = params.title ?? "Contract attachment review";
  const sourceUrl = params.sourceUrl ?? "";
  const attachmentsUrl = params.attachmentsUrl || sourceUrl;
  const draftId = makeDraftId(title, params.noticeId, params.agency);
  const reviewId = `review-${draftId}`;
  const bidBuilderHref = `/bid-builder?title=${encodeURIComponent(title)}&noticeId=${encodeURIComponent(params.noticeId ?? "")}&agency=${encodeURIComponent(params.agency ?? "")}&source=${encodeURIComponent(params.source ?? "")}&dueDate=${encodeURIComponent(params.dueDate ?? "")}&naics=${encodeURIComponent(params.naics ?? "")}&setAside=${encodeURIComponent(params.setAside ?? "")}&summary=${encodeURIComponent(params.summary ?? "")}&sourceUrl=${encodeURIComponent(sourceUrl)}&attachmentsUrl=${encodeURIComponent(attachmentsUrl)}`;

  return (
    <AttachmentReviewClient
      reviewId={reviewId}
      draftId={draftId}
      title={title}
      source={params.source}
      agency={params.agency}
      dueDate={params.dueDate}
      sourceUrl={sourceUrl}
      attachmentsUrl={attachmentsUrl}
      setAside={params.setAside}
      naics={params.naics}
      summary={params.summary}
      location={params.location}
      bidBuilderHref={bidBuilderHref}
    />
  );
}
