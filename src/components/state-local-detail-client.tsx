"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { InfoTip } from "@/components/info-tip";
import { StateLocalDetailLayout } from "@/components/state-local-detail-layout";
import { StateLocalSavePanel } from "@/components/state-local-save-panel";
import { buttonStyles } from "@/components/ui/button";
import { getMergedStateLocalSnapshot } from "@/lib/demo-state-local-store";
import { formatDate } from "@/lib/format";
import type {
  NormalizedStateLocalOpportunity,
  StateLocalSourceSummary,
} from "@/lib/sources/types";

function getDirectSourceUrl(opportunity: NormalizedStateLocalOpportunity) {
  if (!opportunity.sourceUrl) {
    return "";
  }

  if (opportunity.sourceName === "WEBS") {
    return /Search_BidDetails\.aspx\?ID=\d+/i.test(opportunity.sourceUrl)
      ? opportunity.sourceUrl
      : "";
  }

  return opportunity.sourceUrl;
}

export function StateLocalDetailClient({
  sourceCode,
  opportunityId,
  initialOpportunities,
  initialSources,
}: {
  sourceCode: string;
  opportunityId: string;
  initialOpportunities: NormalizedStateLocalOpportunity[];
  initialSources: StateLocalSourceSummary[];
}) {
  const [opportunities, setOpportunities] = useState(initialOpportunities);
  const [sources, setSources] = useState(initialSources);

  useEffect(() => {
    const sync = async () => {
      const snapshot = await getMergedStateLocalSnapshot();
      setOpportunities(snapshot.opportunities);
      setSources(snapshot.sources);
    };

    void sync();
    window.addEventListener("bid-vault-state-local-updated", sync);
    return () => window.removeEventListener("bid-vault-state-local-updated", sync);
  }, []);

  const opportunity = useMemo(
    () =>
      opportunities.find(
        (item) => item.id === opportunityId && item.sourceCode === sourceCode,
      ) ?? null,
    [opportunities, opportunityId, sourceCode],
  );

  const source = useMemo(
    () => sources.find((item) => item.sourceCode === sourceCode) ?? null,
    [sourceCode, sources],
  );

  const similar = useMemo(() => {
    if (!opportunity) {
      return [];
    }

    return opportunities
      .filter(
        (item) =>
          item.id !== opportunity.id &&
          (item.categoryCode === opportunity.categoryCode ||
            item.issuingEntity === opportunity.issuingEntity ||
            item.stateCode === opportunity.stateCode),
      )
      .slice(0, 3);
  }, [opportunities, opportunity]);

  const directSourceUrl = opportunity ? getDirectSourceUrl(opportunity) : "";

  if (!opportunity) {
    return (
      <div className="rounded-[2rem] border border-dashed border-white/10 bg-slate-950/60 p-10 text-center text-sm text-slate-400">
        We couldn&apos;t find that state or local opportunity. Go back to the list and try again.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_0_30px_rgba(34,197,94,0.08)] backdrop-blur">
        <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">State & local opportunity</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">{opportunity.title}</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
          This page shows everything you need to decide if this state or local opportunity is worth pursuing.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-100">
            {opportunity.status}
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-200">
            {opportunity.sourceName}
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-200">
            {opportunity.opportunityType}
          </span>
        </div>
      </section>

      <StateLocalDetailLayout
        links={[
          { id: "overview", label: "Quick facts" },
          { id: "classification", label: "Work type" },
          { id: "description", label: "What the work is" },
          { id: "contacts", label: "Who to contact" },
          { id: "source", label: "Original source details" },
        ]}
      >
        <section id="overview" className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6">
          <div className="grid gap-5 lg:grid-cols-4">
            {[
              { label: "Where this came from", value: opportunity.sourceName },
              { label: "Who posted this", value: opportunity.issuingEntity },
              { label: "Posted date", value: formatDate(opportunity.postedDate) },
              { label: "Due date", value: formatDate(opportunity.dueDate) },
            ].map((item) => (
              <article key={item.label} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-slate-400">{item.label}</p>
                <p className="mt-3 text-lg font-semibold text-white">{item.value}</p>
              </article>
            ))}
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
            <article className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
              <h2 className="text-xl font-semibold text-white">Need to register before bidding?</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Some state and local systems require you to register in the original portal before you can submit.
              </p>
              <div className="mt-4 rounded-[1.25rem] border border-emerald-400/20 bg-emerald-400/10 p-4">
                <p className="text-sm font-medium text-white">
                  {opportunity.registrationRequired
                    ? "This opportunity may require registration in the original source system before you can submit a bid."
                    : "This posting does not currently show a registration requirement, but you should still confirm the source instructions."}
                </p>
                <p className="mt-2 text-sm leading-6 text-emerald-50/90">{opportunity.registrationNotes}</p>
              </div>
            </article>

            <StateLocalSavePanel opportunityId={opportunity.id} />
          </div>
        </section>

        <section id="classification" className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold text-white">Work type</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            These details help you understand the category of work and where it will happen.
          </p>
          <dl className="mt-5 grid gap-4 text-sm text-slate-300 md:grid-cols-2 xl:grid-cols-4">
            <div>
              <dt className="flex items-center gap-2 text-slate-500">
                Work Category Code
                <InfoTip>This is the category code the source system uses to group the type of work.</InfoTip>
              </dt>
              <dd className="mt-1 text-white">{opportunity.categoryCode}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Type of opportunity</dt>
              <dd className="mt-1 text-white">{opportunity.opportunityType}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Work location</dt>
              <dd className="mt-1 text-white">{opportunity.location}</dd>
            </div>
            <div>
              <dt className="text-slate-500">State</dt>
              <dd className="mt-1 text-white">{opportunity.stateCode}</dd>
            </div>
          </dl>
        </section>

        <section id="description" className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6">
          <h2 className="text-xl font-semibold text-white">What the work is</h2>
          <div className="mt-5 space-y-4 text-sm leading-7 text-slate-300">
            <p>{opportunity.summary}</p>
            <p>{opportunity.description}</p>
          </div>

          <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
            <h3 className="text-lg font-semibold text-white">Why this may matter to you</h3>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              If your business already works in {opportunity.categoryCode}, {opportunity.issuingEntity}, or {opportunity.location}, this may be a strong fit to review now.
            </p>
          </div>
        </section>

        <section id="contacts" className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold text-white">Who to contact</h2>
          <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-emerald-300/80">Main contact</p>
            <p className="mt-3 text-lg font-semibold text-white">{opportunity.contactName}</p>
            <p className="mt-2 text-sm text-slate-300">{opportunity.contactEmail}</p>
            <p className="mt-1 text-sm text-slate-400">{opportunity.contactPhone}</p>
          </div>
        </section>

        <section id="source" className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6">
          <h2 className="text-xl font-semibold text-white">Original source details</h2>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
            <article className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
              <p className="text-sm text-slate-400">Where this came from</p>
              <p className="mt-3 text-lg font-semibold text-white">{source?.sourceName ?? opportunity.sourceName}</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">{source?.helperText}</p>
              {!directSourceUrl ? (
                <div className="mt-4 rounded-[1.25rem] border border-amber-400/20 bg-amber-400/10 p-4 text-sm leading-6 text-amber-100">
                  We could not confirm a direct WEBS detail-page link for this record yet. We only show true source-detail links here, not the general bid list.
                </div>
              ) : null}
              <div className="mt-5 flex flex-wrap gap-3">
                {directSourceUrl ? (
                  <Link href={directSourceUrl} className={buttonStyles({ variant: "primary", size: "md" })}>
                    Open original posting
                  </Link>
                ) : null}
                <Link href="/state-local/washington" className={buttonStyles({ variant: "ghost", size: "md" })}>
                  Back to Washington list
                </Link>
              </div>
            </article>

            <article className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
              <h3 className="text-lg font-semibold text-white">Similar opportunities</h3>
              <div className="mt-4 space-y-3">
                {similar.length > 0 ? (
                  similar.map((item) => (
                    <Link
                      key={item.id}
                      href={`/state-local/${item.sourceCode}/${item.id}`}
                      className="block rounded-[1.25rem] border border-white/10 bg-slate-950/60 p-4 transition hover:border-emerald-400/30 hover:bg-emerald-400/5"
                    >
                      <p className="font-medium text-white">{item.title}</p>
                      <p className="mt-1 text-sm text-slate-400">{item.issuingEntity} / {item.location}</p>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm leading-6 text-slate-400">
                    Similar opportunities will appear here as more state and local sources are connected.
                  </p>
                )}
              </div>
            </article>
          </div>
        </section>
      </StateLocalDetailLayout>
    </div>
  );
}
