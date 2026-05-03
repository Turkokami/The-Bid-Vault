"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";
import { readBidDraft, saveBidDraft } from "@/lib/bid-builder-store";

type BidBuilderClientProps = {
  draftId: string;
  title: string;
  noticeId?: string;
  agency?: string;
  sourceName?: string;
  dueDate?: string;
  naicsCode?: string;
  setAside?: string;
  summary?: string;
  sourceUrl?: string;
  attachmentsUrl?: string;
};

function defaultChecklist(title: string, dueDate?: string) {
  return [
    `Confirm exact submission deadline${dueDate ? `: ${dueDate}` : ""}`,
    "Review all amendments and addenda",
    "Check mandatory forms and certifications",
    "Confirm set-aside eligibility and required registrations",
    `Pull key technical requirements from ${title}`,
    "Verify pricing sheet format and attachments list",
  ].join("\n");
}

export function BidBuilderClient(props: BidBuilderClientProps) {
  const existingDraft = useMemo(() => readBidDraft(props.draftId), [props.draftId]);
  const [workspaceName, setWorkspaceName] = useState(
    () => existingDraft?.workspaceName ?? `${props.title} Bid Workspace`,
  );
  const [winThemes, setWinThemes] = useState(() => existingDraft?.winThemes ?? "");
  const [complianceNotes, setComplianceNotes] = useState(
    () => existingDraft?.complianceNotes ?? "",
  );
  const [pricingApproach, setPricingApproach] = useState(
    () => existingDraft?.pricingApproach ?? "",
  );
  const [questionsForAgency, setQuestionsForAgency] = useState(
    () => existingDraft?.questionsForAgency ?? "",
  );
  const [submissionChecklist, setSubmissionChecklist] = useState(
    () => existingDraft?.submissionChecklist ?? defaultChecklist(props.title, props.dueDate),
  );
  const [teammateAssignments, setTeammateAssignments] = useState(
    () => existingDraft?.teammateAssignments ?? "",
  );
  const [aiReviewPoints, setAiReviewPoints] = useState(
    () => existingDraft?.aiReviewPoints ?? "",
  );
  const [statusMessage, setStatusMessage] = useState("");

  const attachmentReviewHref = useMemo(() => {
    const search = new URLSearchParams({
      title: props.title,
      source: props.sourceName ?? "",
      agency: props.agency ?? "",
      dueDate: props.dueDate ?? "",
      sourceUrl: props.sourceUrl ?? "",
      attachmentsUrl: props.attachmentsUrl ?? "",
      setAside: props.setAside ?? "",
      naics: props.naicsCode ?? "",
      summary: props.summary ?? "",
    });

    return `/attachments/review?${search.toString()}`;
  }, [props]);

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_0_30px_rgba(34,197,94,0.08)] backdrop-blur">
        <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">Bid builder</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">
          Build this bid inside The Bid Vault.
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
          Use this workspace to turn a contract into a real draft plan. Capture your win themes, pricing ideas, compliance notes, and submission checklist in one place.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {[
            { label: "Opportunity", value: props.title },
            { label: "Agency", value: props.agency || "Not listed" },
            { label: "Due date", value: props.dueDate || "Not listed" },
            { label: "Set-aside", value: props.setAside || "Not listed" },
          ].map((item) => (
            <article key={item.label} className="rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-4">
              <p className="text-sm text-slate-400">{item.label}</p>
              <p className="mt-2 text-sm font-semibold text-white">{item.value}</p>
            </article>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {props.sourceUrl ? (
            <a
              href={props.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className={buttonStyles({ variant: "secondary", size: "md" })}
            >
              Open original posting
            </a>
          ) : null}
          <Link href={attachmentReviewHref} className={buttonStyles({ variant: "ghost", size: "md" })}>
            Review attachments first
          </Link>
        </div>
      </section>

      {statusMessage ? (
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
          {statusMessage}
        </div>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <section className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6">
            <label className="space-y-2 text-sm text-slate-200">
              <span>Bid workspace name</span>
              <input
                value={workspaceName}
                onChange={(event) => setWorkspaceName(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400/50"
              />
            </label>

            <label className="mt-5 block space-y-2 text-sm text-slate-200">
              <span>Win themes and differentiators</span>
              <textarea
                value={winThemes}
                onChange={(event) => setWinThemes(event.target.value)}
                rows={6}
                className="w-full rounded-[1.5rem] border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400/50"
                placeholder="Why should your team win this work? Add differentiators, past performance, or special certifications."
              />
            </label>

            <label className="mt-5 block space-y-2 text-sm text-slate-200">
              <span>Compliance and scope notes</span>
              <textarea
                value={complianceNotes}
                onChange={(event) => setComplianceNotes(event.target.value)}
                rows={7}
                className="w-full rounded-[1.5rem] border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400/50"
                placeholder="Capture mandatory requirements, certifications, site visit requirements, forms, and must-have scope items."
              />
            </label>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6">
            <label className="space-y-2 text-sm text-slate-200">
              <span>Pricing approach</span>
              <textarea
                value={pricingApproach}
                onChange={(event) => setPricingApproach(event.target.value)}
                rows={6}
                className="w-full rounded-[1.5rem] border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400/50"
                placeholder="Outline your pricing strategy, assumptions, labor mix, materials, and any subcontractor inputs you need."
              />
            </label>

            <label className="mt-5 block space-y-2 text-sm text-slate-200">
              <span>Questions for the agency</span>
              <textarea
                value={questionsForAgency}
                onChange={(event) => setQuestionsForAgency(event.target.value)}
                rows={5}
                className="w-full rounded-[1.5rem] border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400/50"
                placeholder="Track clarification questions, missing attachment issues, or details you need before submitting."
              />
            </label>

            <label className="mt-5 block space-y-2 text-sm text-slate-200">
              <span>AI document review points to address</span>
              <textarea
                value={aiReviewPoints}
                onChange={(event) => setAiReviewPoints(event.target.value)}
                rows={8}
                className="w-full rounded-[1.5rem] border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400/50"
                placeholder="Critical items from attachment review will appear here so your team can make sure the final bid addresses them."
              />
            </label>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <label className="space-y-2 text-sm text-slate-200">
              <span>Submission checklist</span>
              <textarea
                value={submissionChecklist}
                onChange={(event) => setSubmissionChecklist(event.target.value)}
                rows={9}
                className="w-full rounded-[1.5rem] border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400/50"
              />
            </label>

            <label className="mt-5 block space-y-2 text-sm text-slate-200">
              <span>Team assignments</span>
              <textarea
                value={teammateAssignments}
                onChange={(event) => setTeammateAssignments(event.target.value)}
                rows={7}
                className="w-full rounded-[1.5rem] border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400/50"
                placeholder="Assign technical writing, pricing, attachment review, and final submission steps."
              />
            </label>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  saveBidDraft({
                    id: props.draftId,
                    title: props.title,
                    noticeId: props.noticeId,
                    agency: props.agency,
                    sourceName: props.sourceName,
                    dueDate: props.dueDate,
                    naicsCode: props.naicsCode,
                    setAside: props.setAside,
                    summary: props.summary,
                    sourceUrl: props.sourceUrl,
                    attachmentsUrl: props.attachmentsUrl,
                    workspaceName,
                    winThemes,
                    complianceNotes,
                    pricingApproach,
                    questionsForAgency,
                    submissionChecklist,
                    teammateAssignments,
                    aiReviewPoints,
                    updatedAt: new Date().toISOString(),
                  });
                  setStatusMessage("Bid draft saved in this browser. Your team can keep building from here.");
                }}
                className={buttonStyles({ variant: "primary", size: "md" })}
              >
                Save bid draft
              </button>
              <Link href="/my-codes" className={buttonStyles({ variant: "ghost", size: "md" })}>
                Open My Codes
              </Link>
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6">
            <h2 className="text-xl font-semibold text-white">Suggested next steps</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
              <li>Review every attachment and pull out mandatory forms, pricing sheets, and compliance deadlines.</li>
              <li>Confirm whether the set-aside rules fit your business before investing too much time.</li>
              <li>Check previous winning bids and comparable contracts before finalizing pricing.</li>
              <li>Save the AI document review points into this workspace so nothing critical gets missed in the final response.</li>
              <li>Make sure your saved codes are applied across SAM and state/local searches for similar work.</li>
            </ul>
          </section>
        </div>
      </section>
    </div>
  );
}
