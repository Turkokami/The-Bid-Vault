import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getExtractedContractById,
  getRelatedDemoContractsForExtractedRecord,
  getSourceDocumentById,
} from "@/lib/demo-data";
import { formatDate } from "@/lib/format";

export default async function GovernmentDataRecordDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const record = getExtractedContractById(id);

  if (!record) {
    notFound();
  }

  const sourceDocument = getSourceDocumentById(record.sourceDocumentId);
  const relatedContracts = getRelatedDemoContractsForExtractedRecord(record.id);

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
            Uploaded opportunity research
          </div>
        </div>
        <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">
          Government data detail
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">{record.title}</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">{record.synopsis}</p>

        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <Link
            href={`/foia?agency=${encodeURIComponent(record.agency)}&facility=${encodeURIComponent(record.title)}&location=${encodeURIComponent(record.location)}&industry=${encodeURIComponent(record.opportunityType)}`}
            className="rounded-full border border-emerald-400/30 px-4 py-2 text-emerald-200 hover:bg-emerald-400/10"
          >
            File FOIA request
          </Link>
          <Link
            href={`/government-data?keywords=${encodeURIComponent(record.keyTerms.join(", "))}`}
            className="rounded-full border border-white/10 px-4 py-2 text-slate-300 hover:bg-white/5"
          >
            Search similar records
          </Link>
          <Link
            href="/watchlist"
            className="rounded-full border border-white/10 px-4 py-2 text-slate-300 hover:bg-white/5"
          >
            Add to future watchlist planning
          </Link>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-4">
        {[
          { label: "Agency", value: record.agency },
          { label: "NAICS", value: record.naicsCode },
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
          <h2 className="text-xl font-semibold text-white">Opportunity profile</h2>
          <dl className="mt-5 grid gap-4 text-sm text-slate-300 md:grid-cols-2">
            <div>
              <dt className="text-slate-500">Location</dt>
              <dd className="mt-1 text-white">{record.location}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Opportunity type</dt>
              <dd className="mt-1 text-white">{record.opportunityType}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Source document</dt>
              <dd className="mt-1 text-white">{sourceDocument?.fileName ?? "Uploaded source file"}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Source agency</dt>
              <dd className="mt-1 text-white">{sourceDocument?.sourceAgency ?? record.agency}</dd>
            </div>
          </dl>
          <div className="mt-6">
            <p className="text-sm text-slate-500">Tracked key terms</p>
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
          <h2 className="text-xl font-semibold text-white">Research actions</h2>
          <div className="mt-5 space-y-3 text-sm">
            <Link
              href={`/bids?keywords=${encodeURIComponent(record.naicsCode)}`}
              className="block rounded-[1.25rem] border border-white/10 bg-white/5 px-4 py-3 text-slate-200 transition hover:border-emerald-400/30 hover:bg-emerald-400/5"
            >
              Review previous winning bids in this market
            </Link>
            <Link
              href={`/contracts?keywords=${encodeURIComponent(record.keyTerms.join(", "))}&naics=${encodeURIComponent(record.naicsCode)}`}
              className="block rounded-[1.25rem] border border-white/10 bg-white/5 px-4 py-3 text-slate-200 transition hover:border-emerald-400/30 hover:bg-emerald-400/5"
            >
              Compare with tracked contracts
            </Link>
            <Link
              href={`/government-data?agency=${encodeURIComponent(record.agency)}&state=${encodeURIComponent(record.state)}`}
              className="block rounded-[1.25rem] border border-white/10 bg-white/5 px-4 py-3 text-slate-200 transition hover:border-emerald-400/30 hover:bg-emerald-400/5"
            >
              Find nearby opportunities from the same agency
            </Link>
          </div>
        </article>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6">
        <h2 className="text-xl font-semibold text-white">Related tracked contracts</h2>
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
            No seeded tracked contracts match this uploaded opportunity yet, but you can still use
            FOIA, similar search, and future watchlist planning from this record.
          </p>
        )}
      </section>
    </div>
  );
}
