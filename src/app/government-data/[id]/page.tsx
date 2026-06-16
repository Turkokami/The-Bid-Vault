import Image from "next/image";
import Link from "next/link";
import { ContractDetailLayout } from "@/components/contract-detail-layout";

export function generateStaticParams() {
  // Demo contract IDs only; live SAM.gov records are fetched client-side via Vercel
  return [{ id: "demo" }];
}
import { buttonStyles } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import {
  getSamOpportunityById,
  getSamSearchSnapshot,
  type SamOpportunityRecord,
} from "@/lib/server/sam-search";
import { getContractsIndex } from "@/lib/server/contracts";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function buildSafeFederalSourceUrl(record: {
  noticeId?: string;
  sourceUrl?: string;
  title: string;
  agency: string;
}) {
  const fallback = `https://sam.gov/search/?index=opp&keywords=${encodeURIComponent(record.noticeId ?? record.title)}`;

  if (!record.sourceUrl) {
    return fallback;
  }

  const oppId = record.sourceUrl.match(/\/opp\/([^/?#]+)\/view/i)?.[1];
  if (oppId) {
    return `https://sam.gov/opp/${encodeURIComponent(oppId)}/view`;
  }

  if (/^https?:\/\//i.test(record.sourceUrl)) {
    return record.sourceUrl;
  }

  return fallback;
}

function buildFederalAttachmentsUrl(record: {
  noticeId?: string;
  sourceUrl?: string;
  title: string;
  agency: string;
}) {
  const sourceHref = buildSafeFederalSourceUrl(record);
  const oppId = sourceHref.match(/\/opp\/([^/?#]+)\//i)?.[1];

  if (oppId) {
    return `https://sam.gov/opp/${encodeURIComponent(oppId)}/view#attachments-links`;
  }

  return `https://sam.gov/search/?index=opp&keywords=${encodeURIComponent(record.noticeId ?? record.title)}`;
}

function pickParam(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function readReturnTo(params: Record<string, string | string[] | undefined>) {
  const raw = pickParam(params, "returnTo");
  if (!raw) {
    return "/sam-search";
  }

  return raw.startsWith("/") ? raw : "/sam-search";
}

function buildFallbackRecord(id: string, params: Record<string, string | string[] | undefined>): SamOpportunityRecord | null {
  const title = pickParam(params, "title");
  const noticeId = pickParam(params, "noticeId") || id;

  if (!title) {
    return null;
  }

  const sourceUrl = pickParam(params, "sourceUrl");
  const agency = pickParam(params, "agency") || "Federal agency";
  const location = pickParam(params, "location") || "United States";

  return {
    id: id.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    sourceDocumentId: "sam-live",
    noticeId,
    title,
    agency,
    naicsCode: pickParam(params, "naics") || "Not listed",
    state: location.split(", ").at(-1) ?? "US",
    location,
    opportunityType: pickParam(params, "type") || "Federal opportunity",
    synopsis: pickParam(params, "summary") || "Live SAM opportunity. Open the original posting for the full source record.",
    responseDeadline: pickParam(params, "due"),
    availabilityStatus:
      pickParam(params, "status") === "Closing Soon"
        ? "Closing Soon"
        : pickParam(params, "status") === "Needs Review"
          ? "Needs Review"
          : "Available",
    keyTerms: title
      .toLowerCase()
      .split(/\W+/)
      .filter((term) => term.length > 4)
      .slice(0, 8),
    sourceUrl,
    attachmentsUrl: sourceUrl
      ? `${sourceUrl.replace(/\/$/, "")}#attachments-links`
      : `https://sam.gov/search/?index=opp&keywords=${encodeURIComponent(noticeId)}`,
    postedDate: pickParam(params, "posted"),
    updatedDate: pickParam(params, "updated"),
    office: pickParam(params, "office") || "See SAM posting",
    pscCode: pickParam(params, "psc") || "Not listed",
    setAside: pickParam(params, "setAside") || "Not listed",
    estimatedValue: null,
    estimatedValueLabel: pickParam(params, "estimatedValueLabel") || "Not listed",
    fullDescription: pickParam(params, "summary") || "Open the original SAM posting to review the complete description.",
    agencyCode: "Not listed",
    contractingAgency: agency,
    contractingDepartment: agency,
    congressionalDistrict: "Not listed",
    cageCode: "Not listed",
    primaryContactName: "Not listed",
    primaryContactEmail: "Not listed",
    primaryContactPhone: "Not listed",
    descriptionOfRequirement:
      pickParam(params, "summary") || "Open the original SAM posting to review the complete description.",
    bondingRequired: false,
    bondingLevel: "Not listed",
  };
}

export default async function GovernmentDataRecordDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const queryParams = (await searchParams) ?? {};
  const lookupId = pickParam(queryParams, "noticeId") || id;
  const returnTo = readReturnTo(queryParams);
  const liveRecord = await getSamOpportunityById(lookupId);
  const fallbackRecord = buildFallbackRecord(id, queryParams);
  const record = liveRecord ?? fallbackRecord;

  if (!record) {
    return (
      <div className="rounded-[2rem] border border-amber-400/20 bg-amber-400/10 p-8 text-amber-50">
        <p className="text-xs uppercase tracking-[0.35em] text-amber-100/80">SAM detail unavailable</p>
        <h1 className="mt-4 text-3xl font-semibold text-white">We could not load this SAM record right now.</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7">
          SAM may be rate-limiting the API or the record may have moved. Go back to Search SAM and try again, or open SAM.gov directly with the notice number.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={returnTo} className={buttonStyles({ variant: "primary", size: "md" })}>
            Back to previous results
          </Link>
          <Link
            href={`https://sam.gov/search/?index=opp&keywords=${encodeURIComponent(lookupId)}`}
            className={buttonStyles({ variant: "ghost", size: "md" })}
          >
            Search this notice on SAM.gov
          </Link>
        </div>
      </div>
    );
  }

  let contracts: Awaited<ReturnType<typeof getContractsIndex>>["contracts"] = [];
  let snapshot: Awaited<ReturnType<typeof getSamSearchSnapshot>> = {
    records: [],
    sources: [],
    activities: [],
    liveConfigured: false,
  };

  try {
    const [contractsIndex, searchSnapshot] = await Promise.all([
      getContractsIndex(),
      getSamSearchSnapshot(),
    ]);
    contracts = contractsIndex.contracts;
    snapshot = searchSnapshot;
  } catch {
    contracts = [];
  }

  const keyTerms = Array.isArray(record.keyTerms) ? record.keyTerms : [];
  const sourceHref = buildSafeFederalSourceUrl(record);
  const attachmentsHref = record.attachmentsUrl || buildFederalAttachmentsUrl(record);
  const attachmentReviewHref = `/attachments/review?title=${encodeURIComponent(record.title)}&source=${encodeURIComponent("SAM.gov")}&agency=${encodeURIComponent(record.agency)}&dueDate=${encodeURIComponent(record.responseDeadline)}&sourceUrl=${encodeURIComponent(sourceHref)}&attachmentsUrl=${encodeURIComponent(attachmentsHref)}&setAside=${encodeURIComponent(record.setAside)}&naics=${encodeURIComponent(record.naicsCode)}&summary=${encodeURIComponent(record.synopsis)}&location=${encodeURIComponent(record.location)}`;
  const bidBuilderHref = `/bid-builder?title=${encodeURIComponent(record.title)}&noticeId=${encodeURIComponent(record.noticeId)}&agency=${encodeURIComponent(record.agency)}&source=${encodeURIComponent("SAM.gov")}&dueDate=${encodeURIComponent(record.responseDeadline)}&naics=${encodeURIComponent(record.naicsCode)}&setAside=${encodeURIComponent(record.setAside)}&summary=${encodeURIComponent(record.synopsis)}&sourceUrl=${encodeURIComponent(sourceHref)}&attachmentsUrl=${encodeURIComponent(attachmentsHref)}`;

  const relatedContracts = contracts.filter((contract) => {
    const sharedNaics = contract.naicsCode === record.naicsCode;
    const sharedAgency = contract.agency === record.agency;
    const sharedState = contract.state === record.state;
    return sharedNaics || sharedAgency || sharedState;
  });

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_0_30px_rgba(34,197,94,0.08)] backdrop-blur">
        <div className="mb-5 flex items-center gap-4">
          <div className="relative h-16 w-16 overflow-hidden rounded-[1.5rem] border border-emerald-400/30 bg-black/40">
            <Image
              src="/bid-vault-logo.png"
              alt="The Bid Vault logo"
              fill
              sizes="64px"
              className="object-contain p-1.5"
            />
          </div>
          <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-emerald-200">
            SAM Search detail
          </div>
        </div>
        <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">
          Federal contract details
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">{record.title}</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
          This page shows the federal opportunity details we matched for this record in a cleaner research view. {record.synopsis}
        </p>
        {!liveRecord ? (
          <div className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm leading-6 text-amber-100">
            SAM did not return the full detail record on this request, so we are showing the result-card details and linking you to the original SAM posting.
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <Link
            href={returnTo}
            className={buttonStyles({ variant: "ghost", size: "lg", className: "rounded-[1.25rem]" })}
          >
            Back to previous results
          </Link>
          <Link
            href={`/foia?agency=${encodeURIComponent(record.agency)}&facility=${encodeURIComponent(record.title)}&location=${encodeURIComponent(record.location)}&industry=${encodeURIComponent(record.opportunityType)}&source=${encodeURIComponent("SAM.gov")}`}
            className={buttonStyles({ variant: "secondary", size: "lg", className: "rounded-[1.25rem]" })}
          >
            Start a FOIA request
          </Link>
          <Link
            href={`/sam-search?keywords=${encodeURIComponent(keyTerms.join(", "))}`}
            className={buttonStyles({ variant: "ghost", size: "lg", className: "rounded-[1.25rem]" })}
          >
            Find similar opportunities
          </Link>
          <Link
            href="/watchlist"
            className={buttonStyles({ variant: "ghost", size: "lg", className: "rounded-[1.25rem]" })}
          >
            Save for later
          </Link>
        </div>
      </section>

      <ContractDetailLayout
        links={[
          { id: "overview", label: "Quick facts" },
          { id: "details", label: "Opportunity summary" },
          { id: "classification", label: "Classification and contacts" },
          { id: "attachments", label: "Attachments and files" },
          { id: "next-steps", label: "Helpful next steps" },
          { id: "related", label: "Related saved contracts" },
        ]}
      >
        <section id="overview" className="grid gap-5 lg:grid-cols-4">
          {[
            { label: "Government agency", value: record.agency },
            { label: "Industry Type (NAICS Code)", value: record.naicsCode },
            { label: "Response deadline", value: formatDate(record.responseDeadline) },
            { label: "Status", value: record.availabilityStatus },
          ].map((item) => (
            <article
              key={item.label}
              className="rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-5"
            >
              <p className="text-sm text-slate-400">{item.label}</p>
              <p className="mt-3 text-lg font-semibold text-emerald-300">{item.value}</p>
            </article>
          ))}
        </section>

        <section id="details" className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold text-white">Opportunity summary</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              These details help you decide if the opportunity fits your business.
            </p>
            <dl className="mt-5 grid gap-4 text-sm text-slate-300 md:grid-cols-2">
              <div>
                <dt className="text-slate-500">Work location</dt>
                <dd className="mt-1 text-white">{record.location}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Type of opportunity</dt>
                <dd className="mt-1 text-white">{record.opportunityType}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Source document</dt>
                <dd className="mt-1 text-white">Live SAM.gov source</dd>
              </div>
              <div>
                <dt className="text-slate-500">Source agency</dt>
                <dd className="mt-1 text-white">{record.agency}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Estimated contract size</dt>
                <dd className="mt-1 text-white">{record.estimatedValueLabel}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Reserved for Small Businesses?</dt>
                <dd className="mt-1 text-white">{record.setAside}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Description of requirement</dt>
                <dd className="mt-1 text-white">{record.descriptionOfRequirement}</dd>
              </div>
            </dl>
            <div className="mt-6">
              <p className="text-sm text-slate-500">Search words found in this record</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {keyTerms.map((term) => (
                  <span
                    key={term}
                    className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-100"
                  >
                    {term}
                  </span>
                ))}
              </div>
            </div>
          </article>

          <article className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6">
            <h2 className="text-xl font-semibold text-white">Helpful next steps</h2>
            <div className="mt-5 space-y-3 text-sm">
              <Link
                href={`/bids?keywords=${encodeURIComponent(record.naicsCode)}&recordId=${encodeURIComponent(record.id)}`}
                className={buttonStyles({ variant: "secondary", size: "lg", className: "flex w-full rounded-[1.5rem] justify-start px-5 py-4" })}
              >
                See previous winning bids in this market
              </Link>
              <Link
                href={`/contracts?keywords=${encodeURIComponent(keyTerms.join(", "))}&naics=${encodeURIComponent(record.naicsCode)}`}
                className={buttonStyles({ variant: "ghost", size: "lg", className: "flex w-full rounded-[1.5rem] justify-start px-5 py-4" })}
              >
                Compare with saved contracts
              </Link>
              <Link
                href={`/sam-search?agency=${encodeURIComponent(record.agency)}&state=${encodeURIComponent(record.state)}`}
                className={buttonStyles({ variant: "ghost", size: "lg", className: "flex w-full rounded-[1.5rem] justify-start px-5 py-4" })}
              >
                Find nearby opportunities from the same agency
              </Link>
              <Link
                href={attachmentReviewHref}
                className={buttonStyles({ variant: "ghost", size: "lg", className: "flex w-full rounded-[1.5rem] justify-start px-5 py-4" })}
              >
                Review attachments in Bid Vault
              </Link>
              <Link
                href={bidBuilderHref}
                className={buttonStyles({ variant: "primary", size: "lg", className: "flex w-full rounded-[1.5rem] justify-start px-5 py-4" })}
              >
                Start bid workspace
              </Link>
              <a
                href={sourceHref}
                target="_blank"
                rel="noreferrer"
                className={buttonStyles({ variant: "ghost", size: "lg", className: "flex w-full rounded-[1.5rem] justify-start px-5 py-4" })}
              >
                Open original SAM posting
              </a>
            </div>
            {!snapshot.liveConfigured ? (
              <p className="mt-4 text-sm leading-6 text-amber-100">
                Search SAM is not fully live until a SAM.gov API key is configured in the app environment.
              </p>
            ) : null}
          </article>
        </section>

        <section id="classification" className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <article className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold text-white">Classification and contract signals</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              These fields come from the SAM source record and help you judge fit, compliance risk, and routing.
            </p>
            <dl className="mt-5 grid gap-4 text-sm text-slate-300 md:grid-cols-2">
              <div>
                <dt className="text-slate-500">Government agency code</dt>
                <dd className="mt-1 text-white">{record.agencyCode}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Contracting department</dt>
                <dd className="mt-1 text-white">{record.contractingDepartment}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Contracting agency</dt>
                <dd className="mt-1 text-white">{record.contractingAgency}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Service Category (PSC Code)</dt>
                <dd className="mt-1 text-white">{record.pscCode}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Congressional district</dt>
                <dd className="mt-1 text-white">{record.congressionalDistrict}</dd>
              </div>
              <div>
                <dt className="text-slate-500">CAGE code</dt>
                <dd className="mt-1 text-white">{record.cageCode}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Bonding required?</dt>
                <dd className="mt-1 text-white">{record.bondingRequired ? "Yes" : "Not listed"}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Bonding level</dt>
                <dd className="mt-1 text-white">{record.bondingLevel}</dd>
              </div>
            </dl>
          </article>

          <article className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6">
            <h2 className="text-xl font-semibold text-white">Contact information</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Use these details to confirm submission instructions and route questions before you invest too much time in the bid.
            </p>
            <dl className="mt-5 space-y-4 text-sm text-slate-300">
              <div>
                <dt className="text-slate-500">Primary contact</dt>
                <dd className="mt-1 text-white">{record.primaryContactName}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Email</dt>
                <dd className="mt-1 text-white">{record.primaryContactEmail}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Phone</dt>
                <dd className="mt-1 text-white">{record.primaryContactPhone}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Office / sub-tier</dt>
                <dd className="mt-1 text-white">{record.office}</dd>
              </div>
            </dl>
          </article>
        </section>

        <section id="attachments" className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6">
          <h2 className="text-xl font-semibold text-white">Attachments and source files</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Use these links to open the original source record, jump to the source document area, or download files directly from the government portal when they are available there.
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <a
              href={sourceHref}
              target="_blank"
              rel="noreferrer"
              className={buttonStyles({ variant: "secondary", size: "lg", className: "justify-start rounded-[1.5rem] px-5 py-4" })}
            >
              Open original SAM posting
            </a>
            <a
              href={attachmentsHref}
              target="_blank"
              rel="noreferrer"
              className={buttonStyles({ variant: "ghost", size: "lg", className: "justify-start rounded-[1.5rem] px-5 py-4" })}
            >
              Open attachment and document section
            </a>
            <Link
              href={attachmentReviewHref}
              className={buttonStyles({ variant: "ghost", size: "lg", className: "justify-start rounded-[1.5rem] px-5 py-4" })}
            >
              Review the files inside Bid Vault
            </Link>
            <Link
              href={bidBuilderHref}
              className={buttonStyles({ variant: "primary", size: "lg", className: "justify-start rounded-[1.5rem] px-5 py-4" })}
            >
              Build this bid in Bid Vault
            </Link>
            <a
              href={`https://sam.gov/search/?index=opp&keywords=${encodeURIComponent(record.noticeId)}`}
              target="_blank"
              rel="noreferrer"
              className={buttonStyles({ variant: "ghost", size: "lg", className: "justify-start rounded-[1.5rem] px-5 py-4" })}
            >
              Search this notice on SAM.gov
            </a>
            <Link
              href={`/foia?agency=${encodeURIComponent(record.agency)}&facility=${encodeURIComponent(record.title)}&location=${encodeURIComponent(record.location)}&industry=${encodeURIComponent(record.opportunityType)}&source=${encodeURIComponent("SAM.gov")}`}
              className={buttonStyles({ variant: "ghost", size: "lg", className: "justify-start rounded-[1.5rem] px-5 py-4" })}
            >
              Request related supporting records
            </Link>
          </div>
        </section>

        <section id="related" className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6">
          <h2 className="text-xl font-semibold text-white">Related saved contracts</h2>
          {relatedContracts.length > 0 ? (
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              {relatedContracts.map((contract) => (
                <Link
                  key={contract.id}
                  href={`/contracts/${contract.id}`}
                  className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 transition hover:border-emerald-400/30 hover:bg-emerald-400/5"
                >
                  <h3 className="text-base font-semibold text-white">{contract.title}</h3>
                  <p className="mt-2 text-sm text-slate-400">
                    {contract.agency} / {contract.location}
                  </p>
                  <p className="mt-3 text-sm text-emerald-200">Open tracked contract detail</p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-400">
              No saved contracts match this uploaded opportunity yet, but you can still use FOIA, similar search, and save-it-for-later tools from this page.
            </p>
          )}
        </section>
      </ContractDetailLayout>
    </div>
  );
}
