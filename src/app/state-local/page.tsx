import Link from "next/link";
import { StateLocationPicker } from "@/components/state-location-picker";
import { UsStateTileMap } from "@/components/us-state-tile-map";
import { buttonStyles } from "@/components/ui/button";
import { getStatePortalHref, stateDirectory } from "@/lib/sources/state-registry";
import { getStateLocalSourceCatalog } from "@/lib/sources/sync-state-local";

function sourceViewHref(sourceCode: string) {
  return getStatePortalHref(sourceCode);
}

export default async function StateLocalPage() {
  const sourceCatalog = getStateLocalSourceCatalog();
  const connectedSources = sourceCatalog.filter((source) => source.status === "Connected");
  const localSources = sourceCatalog.filter((source) => source.sourceType === "County / City");
  const northernArizonaSources = localSources.filter((source) => source.regionLabel === "Northern Arizona");
  const serviceAreaSources = localSources.filter((source) =>
    ["Northwest Arizona", "Eastern Nevada", "Southern Nevada"].includes(source.regionLabel ?? ""),
  );
  const northCarolinaCountySources = localSources.filter((source) => source.stateCode === "NC");
  const featuredLocalSources = [...northernArizonaSources, ...serviceAreaSources, ...northCarolinaCountySources];

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_0_30px_rgba(34,197,94,0.08)] backdrop-blur">
        <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">
          State & local opportunities
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">
          Search by state first, then drill into county and city opportunities.
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
          We are turning The Bid Vault into a cleaner local search layer for every state. Start
          with the state where your team works, open that state page, then review statewide portals
          and county-level options in one place.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/state-local/washington" className={buttonStyles({ variant: "primary", size: "md" })}>
            Open Washington view
          </Link>
          <Link href="/state-local/north-carolina" className={buttonStyles({ variant: "secondary", size: "md" })}>
            Open North Carolina view
          </Link>
          <Link href="/state-local/nevada" className={buttonStyles({ variant: "secondary", size: "md" })}>
            Open Nevada view
          </Link>
          <Link href="/state-local/texas" className={buttonStyles({ variant: "secondary", size: "md" })}>
            Open Texas view
          </Link>
        </div>
      </section>

      <UsStateTileMap states={stateDirectory} />

      <section className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-300/80">
              State search below the map
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-white">
              Search for your state if you prefer typing over clicking the map.
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
              The map stays as the fastest way in. The state picker below helps if you want to type
              your state name, narrow by region, then open the same dedicated statewide page.
            </p>
          </div>
          <div className="w-full">
            <StateLocationPicker states={stateDirectory} />
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-emerald-400/15 bg-emerald-400/[0.04] p-6 shadow-[0_0_30px_rgba(34,197,94,0.08)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-300/80">
              Contract alerts
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-white">
              Save your industry and state so we can prepare contract alerts by email or text.
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Set up one simple alert rule for the work you do, the state you care about, and how
              you want to be contacted. This keeps the workflow focused on finding contracts now,
              while we prepare delivery for SAM and state or local matches.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/alerts" className={buttonStyles({ variant: "primary", size: "md" })}>
              Set up alerts
            </Link>
            <Link href="/my-codes" className={buttonStyles({ variant: "secondary", size: "md" })}>
              Review saved codes
            </Link>
          </div>
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
                    href={sourceViewHref(source.sourceCode)}
                    className={buttonStyles({ variant: "primary", size: "sm" })}
                  >
                    Open location view
                  </Link>
                  <a
                    href={source.portalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={buttonStyles({ variant: "ghost", size: "sm" })}
                  >
                    View original portal
                  </a>
                </div>
              </div>
            ))}
          </div>
        </article>

        <div className="space-y-6">
          <article className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Why this matters</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">
              Make local searching feel obvious instead of overwhelming.
            </h2>
            <ul className="mt-5 space-y-3 text-sm leading-7 text-slate-300">
              <li>Choose one state first so the screen stays focused.</li>
              <li>Use the state page as the home for statewide and county sources.</li>
              <li>Keep growing local coverage without stuffing the main navigation.</li>
            </ul>
          </article>

          <article className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Live states to start with</p>
            <div className="mt-5 space-y-4">
              {connectedSources.slice(0, 3).map((source) => (
                <div
                  key={source.id}
                  className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold text-white">{source.sourceName}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.2em] text-emerald-300/70">
                        {source.stateCode} / {source.cadence}
                      </p>
                    </div>
                    <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-100">
                      {source.connectionMode === "portal-assisted" ? "Portal-assisted" : "Live"}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-400">{source.helperText}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                      href={sourceViewHref(source.sourceCode)}
                      className={buttonStyles({ variant: "secondary", size: "sm" })}
                    >
                      Open state page
                    </Link>
                    <a
                      href={source.portalUrl}
                      className={buttonStyles({ variant: "ghost", size: "sm" })}
                    >
                      Open original source
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="rounded-[2rem] border border-emerald-400/15 bg-emerald-400/[0.04] p-6 shadow-[0_0_30px_rgba(34,197,94,0.08)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-300/80">
              County & city coverage
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-white">
              Your Arizona, Nevada, and North Carolina local service areas are now in the rollout.
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
              County and city contracts are spread across local portals, so we track them as
              source cards first, then connect the best ones as live feeds. This keeps the app
              organized while still giving us a path to deep local coverage for the counties
              where your providers actually work.
            </p>
          </div>
          <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100">
            County rollout layer
          </span>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {featuredLocalSources.map((source) => (
            <article
              key={source.id}
              className="rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-white">{source.sourceName}</p>
                  <p className="mt-1 text-sm text-slate-400">{source.regionLabel}</p>
                </div>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                  {source.status}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-300">{source.description}</p>
              <p className="mt-3 text-sm leading-6 text-slate-500">{source.helperText}</p>
              <a
                href={source.portalUrl}
                className={`${buttonStyles({ variant: "ghost", size: "sm" })} mt-2`}
              >
                Open local source
              </a>
              <Link
                href={sourceViewHref(source.sourceCode)}
                className={`${buttonStyles({ variant: "secondary", size: "sm" })} mt-4`}
              >
                Open location view
              </Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
