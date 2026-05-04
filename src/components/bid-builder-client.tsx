"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";
import type { BidRequirementItem, BidRequirementStatus } from "@/lib/bid-builder-store";
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

function buildAutoFilledSections(props: BidBuilderClientProps) {
  return {
    winThemes: [
      `Relevant work type: ${props.title}`,
      props.setAside && props.setAside !== "Not listed"
        ? `Eligibility angle: confirm and emphasize fit for ${props.setAside}.`
        : "",
      props.naicsCode ? `Industry alignment: reference experience tied to NAICS ${props.naicsCode}.` : "",
      props.agency ? `Agency familiarity: show relevant work for ${props.agency}.` : "",
    ]
      .filter(Boolean)
      .join("\n"),
    complianceNotes: [
      props.dueDate ? `Due date to protect: ${props.dueDate}` : "",
      props.setAside ? `Set-aside noted: ${props.setAside}` : "",
      props.sourceName ? `Source system: ${props.sourceName}` : "",
      props.sourceUrl ? `Original posting: ${props.sourceUrl}` : "",
      props.attachmentsUrl ? `Attachment source: ${props.attachmentsUrl}` : "",
    ]
      .filter(Boolean)
      .join("\n"),
    pricingApproach: [
      "Confirm exact pricing format from the official attachment package.",
      "Identify labor, materials, equipment, and subcontractor inputs.",
      "Check whether alternates, unit pricing, or optional services are required.",
    ].join("\n"),
    questionsForAgency: [
      "Is there a questions deadline or pre-bid event?",
      "Are there amendments, addenda, or revised forms that must be acknowledged?",
      "Are there file format, upload, or delivery rules that could block submission?",
    ].join("\n"),
  };
}

function buildPreviewDocument(params: {
  title: string;
  agency?: string;
  dueDate?: string;
  sourceName?: string;
  winThemes: string;
  complianceNotes: string;
  pricingApproach: string;
  questionsForAgency: string;
  submissionChecklist: string;
  teammateAssignments: string;
  aiReviewPoints: string;
  reviewRequirements: BidRequirementItem[];
}) {
  const addressed = params.reviewRequirements.filter((item) => item.status === "addressed");
  const blocked = params.reviewRequirements.filter((item) => item.status === "blocked");
  const pending = params.reviewRequirements.filter((item) => item.status === "needs-response");

  return [
    `Bid Preview: ${params.title}`,
    `Agency: ${params.agency || "Not listed"}`,
    `Due date: ${params.dueDate || "Not listed"}`,
    `Source: ${params.sourceName || "Not listed"}`,
    "",
    "Executive positioning",
    params.winThemes || "No win themes added yet.",
    "",
    "AI review points to address",
    params.aiReviewPoints || "No AI review points saved yet.",
    "",
    "Compliance and scope notes",
    params.complianceNotes || "No compliance notes added yet.",
    "",
    "Pricing approach",
    params.pricingApproach || "No pricing approach added yet.",
    "",
    "Questions for the agency",
    params.questionsForAgency || "No agency questions added yet.",
    "",
    "Submission checklist",
    params.submissionChecklist || "No checklist added yet.",
    "",
    "Team assignments",
    params.teammateAssignments || "No assignments added yet.",
    "",
    "Requirement tracker",
    `Addressed: ${addressed.length}`,
    `Needs response: ${pending.length}`,
    `Blocked: ${blocked.length}`,
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
  const [reviewRequirements, setReviewRequirements] = useState<BidRequirementItem[]>(
    () => existingDraft?.reviewRequirements ?? [],
  );
  const [showPreview, setShowPreview] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const previewDocument = useMemo(
    () =>
      buildPreviewDocument({
        title: props.title,
        agency: props.agency,
        dueDate: props.dueDate,
        sourceName: props.sourceName,
        winThemes,
        complianceNotes,
        pricingApproach,
        questionsForAgency,
        submissionChecklist,
        teammateAssignments,
        aiReviewPoints,
        reviewRequirements,
      }),
    [
      aiReviewPoints,
      complianceNotes,
      pricingApproach,
      props.agency,
      props.dueDate,
      props.sourceName,
      props.title,
      questionsForAgency,
      reviewRequirements,
      submissionChecklist,
      teammateAssignments,
      winThemes,
    ],
  );

  const applyAutoFill = () => {
    const autoFilled = buildAutoFilledSections(props);
    setWinThemes((current) => current || autoFilled.winThemes);
    setComplianceNotes((current) => current || autoFilled.complianceNotes);
    setPricingApproach((current) => current || autoFilled.pricingApproach);
    setQuestionsForAgency((current) => current || autoFilled.questionsForAgency);
    setStatusMessage("Contract details were used to auto-fill the bid workspace.");
  };

  const updateRequirementStatus = (id: string, status: BidRequirementStatus) => {
    setReviewRequirements((current) =>
      current.map((item) => (item.id === id ? { ...item, status } : item)),
    );
  };

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
          <button
            type="button"
            onClick={applyAutoFill}
            className={buttonStyles({ variant: "secondary", size: "md" })}
          >
            Auto-fill from contract details
          </button>
          <button
            type="button"
            onClick={() => setShowPreview((current) => !current)}
            className={buttonStyles({ variant: "ghost", size: "md" })}
          >
            {showPreview ? "Hide bid preview" : "Preview completed bid"}
          </button>
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

      {showPreview ? (
        <section className="rounded-[2rem] border border-emerald-400/20 bg-emerald-400/[0.06] p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-300/80">Bid preview</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">Preview the current bid package narrative.</h2>
            </div>
            <button
              type="button"
              onClick={() => {
                void navigator.clipboard.writeText(previewDocument);
                setStatusMessage("The current bid preview was copied to your clipboard.");
              }}
              className={buttonStyles({ variant: "secondary", size: "sm" })}
            >
              Copy preview
            </button>
          </div>
          <pre className="mt-5 overflow-x-auto whitespace-pre-wrap rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-5 text-sm leading-7 text-slate-200">
            {previewDocument}
          </pre>
        </section>
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

            {reviewRequirements.length > 0 ? (
              <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-semibold text-white">Requirement tracker</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Mark each AI-identified item so your team knows what still needs a response in the final bid.
                </p>
                <div className="mt-4 space-y-3">
                  {reviewRequirements.map((item) => (
                    <article
                      key={item.id}
                      className="rounded-[1.25rem] border border-white/10 bg-slate-950/70 p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-medium text-white">{item.title}</p>
                          <p className="mt-2 text-sm leading-6 text-slate-300">{item.detail}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {[
                            ["needs-response", "Needs response"],
                            ["addressed", "Addressed"],
                            ["blocked", "Blocked"],
                          ].map(([value, label]) => (
                            <button
                              key={value}
                              type="button"
                              onClick={() =>
                                updateRequirementStatus(
                                  item.id,
                                  value as BidRequirementStatus,
                                )
                              }
                              className={buttonStyles({
                                variant:
                                  item.status === value ? "primary" : "ghost",
                                size: "sm",
                              })}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ) : null}
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
                    reviewRequirements,
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
