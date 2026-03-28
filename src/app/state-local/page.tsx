import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";
import { getStateLocalSyncSnapshot } from "@/lib/sources/sync-state-local";

export default async function StateLocalPage() {
  const snapshot = await getStateLocalSyncSnapshot();
  const connectedSources = snapshot.sources.filter((source) => source.status === "Connected");
  const plannedSources = snapshot.sources.filter((source) => source.status === "Planned");

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_0_30px_rgba(34,197,94,0.08)] backdrop-blur">
        <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">
          State & local opportunities
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">
          Find state and local opportunities without digging through crowded portals.
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
          This page helps you find contract opportunities from Washington and other state or local
          government sources. We start with Washington WEBS, then expand the same cleaner search
          experience to more state systems over time.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/state-local/washington" className={buttonStyles({ variant: "primary", size: "md" })}>
            Search Washington opportunities
          </Link>
          <Link href="/sync-center" className={buttonStyles({ variant: "secondary", size: "md" })}>
            Open sync center
          </Link>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <article className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6">
          <p className="text-xs uppercase tracking-[0.25em] text-emerald-300/80">
            Connected now
          </p>
          <div className="mt-5 space-y-4">
            {connectedSources.map((source) => (
              <div
                key={source.id}
                className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold text-white">{source.sourceName}</h2>
                    <p className="mt-1 text-sm text-slate-400">
                      {source.stateCode} / {source.cadence} refresh cadence
                    </p>
                  </div>
                  <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-100">
                    {source.status}
                  </span>
                </div>
                <p className="mt-4 text-sm leading-7 text-slate-300">{source.description}</p>
                <p className="mt-3 text-sm leading-6 text-slate-400">{source.helperText}</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href="/state-local/washington"
                    className={buttonStyles({ variant: "primary", size: "sm" })}
                  >
                    Open Washington view
                  </Link>
                  <Link
                    href={source.portalUrl}
                    className={buttonStyles({ variant: "ghost", size: "sm" })}
                  >
                    View original portal
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </article>

        <div className="space-y-6">
          <article className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Why this matters</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">
              Use one simple search for more than just federal work.
            </h2>
            <ul className="mt-5 space-y-3 text-sm leading-7 text-slate-300">
              <li>Search current state and local opportunities in a cleaner view.</li>
              <li>See when outside registration may be required before bidding.</li>
              <li>Save opportunities and plan reminders before due dates sneak up.</li>
            </ul>
          </article>

          <article className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Coming next</p>
            <div className="mt-5 space-y-4">
              {plannedSources.map((source) => (
                <div
                  key={source.id}
                  className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-base font-semibold text-white">{source.sourceName}</p>
                    <span className="rounded-full border border-white/10 bg-slate-950/70 px-3 py-1 text-xs text-slate-300">
                      {source.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{source.description}</p>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
