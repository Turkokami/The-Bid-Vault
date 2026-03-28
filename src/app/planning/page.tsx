import Link from "next/link";

const planningTools = [
  {
    href: "/watchlist",
    label: "Watchlist",
    description: "Save contracts, set reminder timing, and keep future opportunities in one place.",
  },
  {
    href: "/calendar",
    label: "Calendar",
    description: "See reminder dates, predicted rebids, and expiration timing on one planning timeline.",
  },
];

export default function PlanningPage() {
  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_0_30px_rgba(34,197,94,0.08)] backdrop-blur">
        <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">Planning</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">
          Plan future bids without bouncing between crowded screens.
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
          This planning hub keeps the future-facing tools together so non-technical users can move
          directly into watchlists and calendar views without searching the whole app.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        {planningTools.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6 transition hover:border-emerald-400/30 hover:bg-emerald-400/5"
          >
            <p className="text-xl font-semibold text-white">{tool.label}</p>
            <p className="mt-3 text-sm leading-7 text-slate-300">{tool.description}</p>
            <p className="mt-5 text-sm font-semibold text-emerald-200">Open {tool.label}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
