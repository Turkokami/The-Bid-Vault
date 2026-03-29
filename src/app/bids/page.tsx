import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";
import { demoContracts, demoWinningBids, getContractById } from "@/lib/demo-data";
import { formatCurrency, formatDate } from "@/lib/format";

type BidsPageProps = {
  searchParams?: Promise<{
    keywords?: string;
    contractId?: string;
    recordId?: string;
  }>;
};

function matchesKeywords(contractId: string, keywords?: string) {
  if (!keywords) {
    return true;
  }

  const contract = getContractById(contractId);
  if (!contract) {
    return false;
  }

  const blob = [
    contract.title,
    contract.summary,
    contract.agency,
    contract.naicsCode,
    contract.location,
    ...contract.keyTerms,
  ]
    .join(" ")
    .toLowerCase();

  return keywords
    .split(",")
    .flatMap((item) => item.split(/\s+/))
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
    .every((term) => blob.includes(term));
}

export default async function BidsPage({ searchParams }: BidsPageProps) {
  const params = (await searchParams) ?? {};
  const bids = demoWinningBids
    .filter((bid) => (params.contractId ? bid.contractId === params.contractId : true))
    .filter((bid) => matchesKeywords(bid.contractId, params.keywords))
    .map((bid) => ({
      bid,
      contract: demoContracts.find((contract) => contract.id === bid.contractId) ?? null,
    }))
    .filter((entry) => entry.contract);

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_0_30px_rgba(34,197,94,0.08)] backdrop-blur">
        <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">Previous winning bids</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">
          Review past winners and download the award summary.
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
          This page helps you review who won before, how much the contract was worth, and download a simple award summary for your files.
        </p>
      </section>

      <section className="space-y-4">
        {bids.length > 0 ? (
          bids.map(({ bid, contract }) => (
            <article
              key={bid.id}
              className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6"
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-emerald-300/80">
                    Award record
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold text-white">{contract?.title}</h2>
                  <p className="mt-2 text-sm text-slate-400">
                    {contract?.agency} / {contract?.location}
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-emerald-400/20 bg-emerald-400/10 px-5 py-4 text-right">
                  <p className="text-xs uppercase tracking-[0.2em] text-emerald-200">Winning value</p>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    {formatCurrency(bid.bidAmount)}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 text-sm text-slate-300 md:grid-cols-3">
                <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                  <p className="text-slate-500">Winning company</p>
                  <p className="mt-2 font-semibold text-white">{bid.companyName}</p>
                </div>
                <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                  <p className="text-slate-500">Award date</p>
                  <p className="mt-2 font-semibold text-white">{formatDate(bid.awardDate)}</p>
                </div>
                <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                  <p className="text-slate-500">Industry Type (NAICS Code)</p>
                  <p className="mt-2 font-semibold text-white">{contract?.naicsCode}</p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={`/contracts/${contract?.id}`}
                  className={buttonStyles({ variant: "secondary", size: "md" })}
                >
                  Open contract detail
                </Link>
                <Link
                  href={`/bids/${bid.id}/download`}
                  className={buttonStyles({ variant: "primary", size: "md" })}
                >
                  Download winner summary
                </Link>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-[2rem] border border-dashed border-white/10 bg-slate-950/60 p-10 text-center text-sm text-slate-400">
            No winning-bid matches yet. Try opening this page from a contract detail or SAM Search detail page.
          </div>
        )}
      </section>
    </div>
  );
}
