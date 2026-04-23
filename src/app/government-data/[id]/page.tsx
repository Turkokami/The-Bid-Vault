import Image from "next/image";
import Link from "next/link";
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

function pickParam(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
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
    postedDate: pickParam(params, "posted"),
    updatedDate: pickParam(params, "updated"),
    office: pickParam(params, "office") || "See SAM posting",
    pscCode: pickParam(params, "psc") || "Not listed",
    setAside: pickParam(params, "setAside") || "Not listed",
    fullDescription: pickParam(params, "summary") || "Open the original SAM posting to review the complete description.",
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
          <Link href="/sam-search" className={buttonStyles({ variant: "primary", size: "md" })}>
            Back to Search SAM
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

      <section className="grid gap-5 lg:grid-cols-4">
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

      <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
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

      <section className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6">
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
    </div>
  );
}
