import Link from "next/link";
import { StateLocalSaveButton } from "@/components/state-local-save-button";
import { formatDate } from "@/lib/format";
import type { NormalizedStateLocalOpportunity } from "@/lib/sources/types";

export function StateLocalOpportunityCard({
  opportunity,
}: {
  opportunity: NormalizedStateLocalOpportunity;
}) {
  const statusClass =
    opportunity.status === "Open"
      ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-100"
      : opportunity.status === "Closing Soon"
        ? "border-amber-400/20 bg-amber-400/10 text-amber-100"
        : "border-white/10 bg-white/5 text-slate-300";

  return (
    <article className="rounded-[1.75rem] border border-white/10 bg-slate-950/75 p-5 shadow-[0_12px_30px_rgba(0,0,0,0.24)] transition hover:border-emerald-400/25 hover:bg-slate-950/90">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusClass}`}>
              {opportunity.status}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-200">
              {opportunity.sourceName}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-200">
              {opportunity.opportunityType}
            </span>
            {opportunity.registrationRequired ? (
              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-100">
                Registration needed
              </span>
            ) : null}
          </div>

          <Link
            href={`/state-local/${opportunity.sourceCode}/${opportunity.id}`}
            className="mt-4 block text-2xl font-semibold tracking-tight text-white transition hover:text-emerald-200"
          >
            {opportunity.title}
          </Link>

          <p className="mt-3 text-sm leading-7 text-slate-300">{opportunity.summary}</p>
        </div>

        <StateLocalSaveButton opportunityId={opportunity.id} />
      </div>

      <div className="mt-5 grid gap-4 text-sm text-slate-300 md:grid-cols-2 xl:grid-cols-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Who posted this</p>
          <p className="mt-2 text-white">{opportunity.issuingEntity}</p>
          <p className="mt-1 text-slate-400">{opportunity.sourceName}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Work category</p>
          <p className="mt-2 text-white">{opportunity.categoryCode}</p>
          <p className="mt-1 text-slate-400">{opportunity.location}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Important dates</p>
          <p className="mt-2 text-white">Due {formatDate(opportunity.dueDate)}</p>
          <p className="mt-1 text-slate-400">Posted {formatDate(opportunity.postedDate)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Need to register before bidding?</p>
          <p className="mt-2 text-white">{opportunity.registrationRequired ? "Yes" : "No"}</p>
          <p className="mt-1 text-slate-400">{opportunity.stateCode}</p>
        </div>
      </div>
    </article>
  );
}
