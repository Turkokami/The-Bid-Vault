import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SavePlanningForm } from "@/app/contracts/[id]/save-planning-form";
import { formatCurrency, formatPercent } from "@/lib/format";
import { getContractDetail } from "@/lib/server/contracts";

export default async function ContractDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getContractDetail(id);
  const contract = result.contract;

  if (!contract) {
    notFound();
  }

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
            Opportunity intelligence
          </div>
        </div>
        <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">
          Contract detail
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">
          {contract.title}
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
          {contract.summary}
        </p>

        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <Link
            href={contract.tenant ? `/tenants/${contract.tenant.slug}` : "/dashboard"}
            className="rounded-full border border-emerald-400/30 px-4 py-2 text-emerald-200 hover:bg-emerald-400/10"
          >
            {contract.tenant ? "View tenant" : "Open dashboard"}
          </Link>
          <Link
            href="/contracts"
            className="rounded-full border border-white/10 px-4 py-2 text-slate-300 hover:bg-white/5"
          >
            Back to contracts
          </Link>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-4">
        {[
          { label: "Award amount", value: formatCurrency(contract.awardAmount) },
          { label: "Award date", value: contract.awardDate },
          { label: "Predicted rebid", value: contract.predictedRebidDate },
          { label: "Confidence", value: formatPercent(contract.confidenceScore) },
        ].map((item) => (
          <article
            key={item.label}
            className="rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-5"
          >
            <p className="text-sm text-slate-400">{item.label}</p>
            <p className="mt-3 text-2xl font-semibold text-emerald-300">
              {item.value}
            </p>
          </article>
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold text-white">Profile</h2>
          <dl className="mt-5 grid gap-4 text-sm text-slate-300 md:grid-cols-2">
            <div>
              <dt className="text-slate-500">Agency</dt>
              <dd className="mt-1 text-white">{contract.agency}</dd>
            </div>
            <div>
              <dt className="text-slate-500">NAICS</dt>
              <dd className="mt-1 text-white">{contract.naicsCode}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Location</dt>
              <dd className="mt-1 text-white">{contract.location}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Expiration date</dt>
              <dd className="mt-1 text-white">{contract.expirationDate}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Stage</dt>
              <dd className="mt-1 text-emerald-300">{contract.stage}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Incumbent</dt>
              <dd className="mt-1 text-white">{contract.incumbentCompany}</dd>
            </div>
          </dl>
        </article>

        <article className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6">
          <h2 className="text-xl font-semibold text-white">Winning bid</h2>
          <div className="mt-5 space-y-3 text-sm text-slate-300">
            <p>
              <span className="text-slate-500">Winner:</span>{" "}
              <span className="text-white">{contract.winningBid?.companyName}</span>
            </p>
            <p>
              <span className="text-slate-500">Awarded:</span>{" "}
              <span className="text-white">
                {formatCurrency(contract.winningBid?.bidAmount ?? 0)}
              </span>
            </p>
            <p>
              <span className="text-slate-500">Award date:</span>{" "}
              <span className="text-white">{contract.winningBid?.awardDate}</span>
            </p>
          </div>
        </article>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6">
        <h2 className="text-xl font-semibold text-white">
          Save this contract for planning
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
          Add this contract to the planning calendar so the platform can create
          reminder timing ahead of the predicted rebid and current contract expiration.
        </p>
        <div className="mt-5 max-w-2xl">
          <SavePlanningForm contractId={contract.id} />
        </div>
      </section>
    </div>
  );
}
