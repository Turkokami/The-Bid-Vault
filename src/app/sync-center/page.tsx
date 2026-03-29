import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";
import { dataSourceCoverage, syncActivities, uploadedSourceDocuments } from "@/lib/demo-data";

export default function SyncCenterPage() {
  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_0_30px_rgba(34,197,94,0.08)] backdrop-blur">
        <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">Sync center</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">
          Monitor automatic source refreshes and trigger client-side data updates.
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
          This beta sync center shows how The Bid Vault can keep contract intelligence fresh with
          scheduled source pulls from official government sites, plus a manual force refresh option
          for clients who want the newest data immediately.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/sam-search"
            className={buttonStyles({ variant: "primary", size: "lg" })}
          >
            Open government data
          </Link>
          <Link
            href="/contracts"
            className={buttonStyles({ variant: "secondary", size: "lg" })}
          >
            Browse contracts
          </Link>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        {dataSourceCoverage.map((source) => (
          <article
            key={source.id}
            className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6"
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-white">{source.name}</h2>
              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-100">
                {source.status}
              </span>
            </div>
            <p className="mt-3 text-sm leading-7 text-slate-300">{source.description}</p>
            <dl className="mt-4 grid gap-3 text-sm text-slate-300 md:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-[0.2em] text-slate-500">Cadence</dt>
                <dd className="mt-1">{source.cadence}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.2em] text-slate-500">Coverage</dt>
                <dd className="mt-1">{source.coverage}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.2em] text-slate-500">Type</dt>
                <dd className="mt-1">{source.sourceType}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.2em] text-slate-500">Last synced</dt>
                <dd className="mt-1">{source.lastSyncedAt}</dd>
              </div>
            </dl>
            <div className="mt-4">
              <Link
                href={source.officialUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-emerald-200 transition hover:text-emerald-100"
              >
                Visit official source
              </Link>
            </div>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">Recent sync runs</p>
          <div className="mt-5 space-y-4">
            {syncActivities.map((activity) => (
              <article
                key={activity.id}
                className="rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-white">{activity.sourceName}</h3>
                    <p className="mt-1 text-sm text-slate-400">{activity.runLabel}</p>
                  </div>
                  <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-100">
                    {activity.result}
                  </span>
                </div>
                <p className="mt-3 text-sm text-slate-300">
                  {activity.ranAt} / {activity.recordsAdded} records added
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-400">{activity.notes}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">Imported source files</p>
            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-100">
              {uploadedSourceDocuments.length} files
            </span>
          </div>
          <div className="mt-5 space-y-4">
            {uploadedSourceDocuments.map((document) => (
              <article
                key={document.id}
                className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4"
              >
                <h3 className="text-base font-semibold text-white">{document.fileName}</h3>
                <p className="mt-1 text-sm text-slate-400">{document.sourceAgency}</p>
                <p className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-500">
                  Source library record
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
