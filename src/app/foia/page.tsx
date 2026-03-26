import { FoiaRequestBuilder } from "@/components/foia-request-builder";

export default function FoiaPage() {
  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_0_30px_rgba(34,197,94,0.08)] backdrop-blur">
        <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">
          FOIA planning
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">
          Research prior facility budgets before the next bid cycle.
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
          This page helps teams prepare Freedom of Information Act requests to
          uncover historical budgets, scope changes, and facility planning
          records that can sharpen pricing and rebid strategy.
        </p>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {[
          {
            label: "Why it matters",
            body: "Budget history can reveal likely contract size, growth trends, and whether a facility is expanding scope before recompete.",
          },
          {
            label: "Best records",
            body: "Operating budgets, line-item maintenance spend, modifications, work orders, and capital planning documents usually provide the strongest signal.",
          },
          {
            label: "How to use it",
            body: "Compare requested records with current expiration dates and your planning calendar to prioritize likely upcoming bids.",
          },
        ].map((card) => (
          <article
            key={card.label}
            className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-5"
          >
            <p className="text-sm font-semibold text-emerald-300">{card.label}</p>
            <p className="mt-3 text-sm leading-7 text-slate-300">{card.body}</p>
          </article>
        ))}
      </section>

      <FoiaRequestBuilder />
    </div>
  );
}
