import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buttonStyles } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { getSamOpportunityById, getSamSearchSnapshot } from "@/lib/server/sam-search";
import { getContractsIndex } from "@/lib/server/contracts";

function buildFederalSourceUrl(record: {
  noticeId?: string;
  sourceUrl?: string;
  title: string;
  agency: string;
}) {
  if (record.sourceUrl) {
    return record.sourceUrl;
  }

  const samStyleAgencies = ["department", "u.s.", "general services", "veterans affairs", "defense"];
  const agencyLower = record.agency.toLowerCase();

  if (samStyleAgencies.some((term) => agencyLower.includes(term))) {
    return `https://sam.gov/opp/${encodeURIComponent(record.noticeId ?? record.title)}/view`;
  }

  return `https://sam.gov/search/?keywords=${encodeURIComponent(record.title)}`;
}

export default async function GovernmentDataRecordDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const record = await getSamOpportunityById(id);

  if (!record) {
    notFound();
  }

  const [{ contracts }, snapshot] = await Promise.all([
    getContractsIndex(),
    getSamSearchSnapshot(),
  ]);

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

        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <Link
            href={`/foia?agency=${encodeURIComponent(record.agency)}&facility=${encodeURIComponent(record.title)}&location=${encodeURIComponent(record.location)}&industry=${encodeURIComponent(record.opportunityType)}`}
            className={buttonStyles({ variant: "secondary", size: "lg", className: "rounded-[1.25rem]" })}
          >
            Start a FOIA request
          </Link>
          <Link
            href={`/sam-search?keywords=${encodeURIComponent(record.keyTerms.join(", "))}`}
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
              {record.keyTerms.map((term) => (
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
              href={`/contracts?keywords=${encodeURIComponent(record.keyTerms.join(", "))}&naics=${encodeURIComponent(record.naicsCode)}`}
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
              href={buildFederalSourceUrl(record)}
              className={buttonStyles({ variant: "ghost", size: "lg", className: "flex w-full rounded-[1.5rem] justify-start px-5 py-4" })}
            >
              Open original SAM posting
            </Link>
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
