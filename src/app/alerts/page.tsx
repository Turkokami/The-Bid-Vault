import { OpportunityAlertsClient } from "@/components/opportunity-alerts-client";
import { stateDirectory } from "@/lib/sources/state-registry";

export default function AlertsPage() {
  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_0_30px_rgba(34,197,94,0.08)] backdrop-blur">
        <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">Alerts</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Get notified before deadlines close.
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
          Set up keyword and NAICS alerts for federal and state opportunities. We'll surface matching contracts so you never miss a bid window.
        </p>
      </section>

      <OpportunityAlertsClient states={stateDirectory} />
    </div>
  );
}
