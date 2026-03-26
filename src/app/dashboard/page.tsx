import Image from "next/image";
import { DashboardClient } from "@/components/dashboard-client";
import { getDashboardData } from "@/lib/server/contracts";

export default async function DashboardPage() {
  const dashboard = await getDashboardData();

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_0_30px_rgba(34,197,94,0.08)] backdrop-blur">
        <div className="mb-5 flex items-center gap-4">
          <div className="relative h-16 w-16 overflow-hidden rounded-[1.5rem] border border-emerald-400/30 bg-black/40">
            <Image
              src="/BVlogo.png"
              alt="The Bid Vault logo"
              fill
              sizes="64px"
              className="object-contain p-1.5"
            />
          </div>
          <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-emerald-200">
            Workspace intelligence
          </div>
        </div>
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
