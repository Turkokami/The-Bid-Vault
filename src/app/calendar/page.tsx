import Image from "next/image";
import { PlanningCalendarClient } from "@/components/planning-calendar-client";
import {
  getPlanningCalendarWithFallback,
  getSavedContractsWithFallback,
} from "@/lib/server/planning";
import { getViewerContext } from "@/lib/server/workspace";

export default async function CalendarPage() {
  const viewer = await getViewerContext();
  const savedContracts = await getSavedContractsWithFallback();
  const planningEvents = await getPlanningCalendarWithFallback();

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
            Bid timing calendar
          </div>
        </div>
        <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">
          Planning calendar
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">
          Identify saved contracts and get reminders before they come back out to bid.
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
          This planning calendar is driven by saved contracts, predicted rebid
          timing, and each contract&apos;s current expiration date. Reminder events are
          calculated backward from the predicted rebid so teams can prepare bids
          before the next cycle opens.
        </p>
      </section>

      <PlanningCalendarClient
        initialSavedContracts={savedContracts}
        initialPlanningEvents={planningEvents}
        mode={viewer.mode}
      />
    </div>
  );
}
