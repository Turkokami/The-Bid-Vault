import { DashboardClient } from "@/components/dashboard-client";
import { getDashboardData } from "@/lib/server/contracts";

export default async function DashboardPage() {
  const dashboard = await getDashboardData();

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_0_30px_rgba(34,197,94,0.08)] backdrop-blur">
        <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">
          Dashboard preview
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">
          Test product dashboard
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
          Newly created demo contracts now appear here immediately, which makes
          the prototype much easier to test end to end.
        </p>
      </section>

      <DashboardClient
        initialGroups={dashboard.groups}
        initialStats={dashboard.stats}
        mode={dashboard.mode}
      />
    </div>
  );
}
