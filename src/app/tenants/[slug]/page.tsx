import Link from "next/link";
import { notFound } from "next/navigation";
import { formatCurrency } from "@/lib/format";
import { getTenantDetail } from "@/lib/server/contracts";

export default async function TenantDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await getTenantDetail(slug);
  const tenant = result.tenant;

  if (!tenant) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_0_30px_rgba(34,197,94,0.08)] backdrop-blur">
        <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">
          Tenant detail
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">
          {tenant.name}
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
          {tenant.description}
        </p>

        <div className="mt-5 flex flex-wrap gap-6 text-sm text-slate-300">
          <span>{tenant.industryFocus}</span>
          <span>{tenant.headquarters}</span>
          <span>{tenant.contracts.length} tracked contracts</span>
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-slate-950/60">
        <div className="grid grid-cols-[1.5fr_1fr_0.7fr_0.8fr_0.8fr] gap-4 px-5 py-4 text-xs uppercase tracking-[0.25em] text-slate-400">
          <span>Contract</span>
          <span>Agency</span>
          <span>NAICS</span>
          <span>Stage</span>
          <span>Award</span>
        </div>
        {tenant.contracts.map((contract) => (
          <div
            key={contract.id}
            className="grid grid-cols-[1.5fr_1fr_0.7fr_0.8fr_0.8fr] gap-4 border-t border-white/10 bg-white/5 px-5 py-5 text-sm text-slate-200"
          >
            <Link
              href={`/contracts/${contract.id}`}
              className="font-medium text-white hover:text-emerald-200"
            >
              {contract.title}
            </Link>
            <span>{contract.agency}</span>
            <span>{contract.naicsCode}</span>
            <span className="text-emerald-300">{contract.stage}</span>
            <span>{formatCurrency(contract.awardAmount)}</span>
          </div>
        ))}
      </section>
    </div>
  );
}
