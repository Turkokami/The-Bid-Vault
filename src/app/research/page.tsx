import Link from "next/link";

const researchTools = [
  {
    href: "/categories",
    label: "Category Search",
    description: "Find work category and commodity codes by plain English, then save the ones that fit your business.",
  },
  {
    href: "/sam-search",
    label: "SAM Search",
    description: "Search federal opportunities in a cleaner SAM-style view and open a record for deeper research.",
  },
  {
    href: "/bids",
    label: "Award History",
    description: "Review prior winners, pricing patterns, and market history before you chase an opportunity.",
  },
  {
    href: "/foia",
    label: "FOIA Requests",
    description: "Draft information requests for budgets, facility planning, and incumbent contract history.",
  },
  {
    href: "/sync-center",
    label: "Source Sync",
    description: "Monitor refresh cadence, source coverage, and manual refresh activity in one place.",
  },
];

export default function ResearchPage() {
  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_0_30px_rgba(34,197,94,0.08)] backdrop-blur">
        <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">Research</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">
          Research tools, organized by next step.
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
          Instead of stacking every research feature on one page, this hub separates uploaded
          records, award history, FOIA planning, and source refresh into clearer destinations.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        {researchTools.map((tool) => (
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
