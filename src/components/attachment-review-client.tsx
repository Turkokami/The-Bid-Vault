"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { buttonStyles } from "@/components/ui/button";
import { buildAttachmentInsights } from "@/lib/attachment-insights";
import {
  readAttachmentReviewDraft,
  saveAttachmentReviewDraft,
} from "@/lib/attachment-review-store";
import {
  mergeBidRequirements,
  readBidDraft,
  saveBidDraft,
} from "@/lib/bid-builder-store";

type AttachmentReviewClientProps = {
  reviewId: string;
  draftId: string;
  title: string;
  source?: string;
  agency?: string;
  dueDate?: string;
  sourceUrl?: string;
  attachmentsUrl?: string;
  setAside?: string;
  naics?: string;
  summary?: string;
  location?: string;
  bidBuilderHref: string;
};

function buildKickoffMemo(params: {
  title: string;
  agency?: string;
  dueDate?: string;
  source?: string;
  notes: string;
  attachmentNames: string;
}) {
  return [
    `Opportunity: ${params.title}`,
    `Agency: ${params.agency || "Not listed"}`,
    `Due date: ${params.dueDate || "Not listed"}`,
    `Source: ${params.source || "Official portal"}`,
    params.attachmentNames ? `Attachment names: ${params.attachmentNames}` : "",
    params.notes ? `Review notes: ${params.notes}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function slugifyRequirement(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function AttachmentReviewClient(props: AttachmentReviewClientProps) {
  const existingDraft = useMemo(
    () => readAttachmentReviewDraft(props.reviewId),
    [props.reviewId],
  );
  const [attachmentNames, setAttachmentNames] = useState(
    () => existingDraft?.attachmentNames ?? "",
  );
  const [attachmentText, setAttachmentText] = useState(
    () => existingDraft?.attachmentText ?? "",
  );
  const [internalNotes, setInternalNotes] = useState(
    () => existingDraft?.internalNotes ?? "",
  );
  const [statusMessage, setStatusMessage] = useState("");

  const insights = useMemo(
    () =>
      buildAttachmentInsights({
        title: props.title,
        summary: props.summary,
        attachmentNames,
        attachmentText,
        dueDate: props.dueDate,
        setAside: props.setAside,
        source: props.source,
      }),
    [
      attachmentNames,
      attachmentText,
      props.dueDate,
      props.setAside,
      props.source,
      props.summary,
      props.title,
    ],
  );

  const kickoffMemo = useMemo(
    () =>
      buildKickoffMemo({
        title: props.title,
        agency: props.agency,
        dueDate: props.dueDate,
        source: props.source,
        notes: internalNotes,
        attachmentNames,
      }),
    [
      attachmentNames,
      internalNotes,
      props.agency,
      props.dueDate,
      props.source,
      props.title,
    ],
  );

  const copyText = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setStatusMessage(`${label} copied to your clipboard.`);
    } catch {
      setStatusMessage(`We could not copy ${label.toLowerCase()} automatically, but it is still visible on screen.`);
    }
  };

  const aiReviewMemo = useMemo(() => {
    const sections = [
      `AI review for: ${props.title}`,
      "",
      "Critical items:",
      ...insights.criticalAlerts.map((item) => `- ${item.label}: ${item.detail}`),
      "",
      "Submission requirements:",
      ...insights.submissionItems.map((item) => `- ${item.label}: ${item.detail}`),
      "",
      "Compliance checks:",
      ...insights.complianceItems.map((item) => `- ${item.label}: ${item.detail}`),
      "",
      "Pricing signals:",
      ...insights.pricingItems.map((item) => `- ${item.label}: ${item.detail}`),
      "",
      "Questions to resolve:",
      ...insights.followUpQuestions.map((item) => `- ${item}`),
      "",
      internalNotes ? `Internal notes:\n${internalNotes}` : "",
    ];

    return sections.filter(Boolean).join("\n");
  }, [insights, internalNotes, props.title]);

  const aiRequirements = useMemo(
    () => [
      ...insights.criticalAlerts.map((item) => ({
        id: `critical-${slugifyRequirement(item.label)}`,
        title: item.label,
        detail: item.detail,
        category: "critical" as const,
        status: "needs-response" as const,
      })),
      ...insights.submissionItems.map((item) => ({
        id: `submission-${slugifyRequirement(item.label)}`,
        title: item.label,
        detail: item.detail,
        category: "submission" as const,
        status: "needs-response" as const,
      })),
      ...insights.complianceItems.map((item) => ({
        id: `compliance-${slugifyRequirement(item.label)}`,
        title: item.label,
        detail: item.detail,
        category: "compliance" as const,
        status: "needs-response" as const,
      })),
      ...insights.pricingItems.map((item) => ({
        id: `pricing-${slugifyRequirement(item.label)}`,
        title: item.label,
        detail: item.detail,
        category: "pricing" as const,
        status: "needs-response" as const,
      })),
      ...insights.evaluationItems.map((item) => ({
        id: `evaluation-${slugifyRequirement(item.label)}`,
        title: item.label,
        detail: item.detail,
        category: "evaluation" as const,
        status: "needs-response" as const,
      })),
    ],
    [insights],
  );

  const renderList = (
    title: string,
    items: Array<{ label: string; detail: string }>,
    tone: "critical" | "normal" = "normal",
  ) => (
    <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        <span
          className={`rounded-full border px-3 py-1 text-xs font-medium ${
            tone === "critical"
              ? "border-amber-400/20 bg-amber-400/10 text-amber-100"
              : "border-white/10 bg-slate-950/60 text-slate-300"
          }`}
        >
          {items.length} items
        </span>
      </div>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <article
            key={`${title}-${item.label}`}
            className="rounded-[1.25rem] border border-white/10 bg-slate-950/60 p-4"
          >
            <p className="font-medium text-white">{item.label}</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">{item.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_0_30px_rgba(34,197,94,0.08)] backdrop-blur">
        <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">
          Attachment review
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">
          Review the files and pull out the critical bid information.
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
          Paste in file names, copied scope text, or excerpts from the official attachments. We will flag likely deadlines, forms, compliance items, pricing risks, and next questions for your team.
        </p>
      </section>

      {statusMessage ? (
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
          {statusMessage}
        </div>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="space-y-6">
          <section className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6">
            <h2 className="text-xl font-semibold text-white">{props.title}</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {[
                { label: "Source", value: props.source || "Official portal" },
                { label: "Agency", value: props.agency || "Not listed" },
                { label: "Due date", value: props.dueDate || "Not listed" },
                { label: "Set-aside", value: props.setAside || "Not listed" },
                { label: "Industry Type (NAICS Code)", value: props.naics || "Not listed" },
                { label: "Work location", value: props.location || "Not listed" },
              ].map((item) => (
                <article
                  key={item.label}
                  className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4"
                >
                  <p className="text-sm text-slate-400">{item.label}</p>
                  <p className="mt-2 text-sm font-semibold text-white">{item.value}</p>
                </article>
              ))}
            </div>

            {props.summary ? (
              <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                <p className="text-sm font-semibold text-white">Opportunity summary</p>
                <p className="mt-3 text-sm leading-7 text-slate-300">{props.summary}</p>
              </div>
            ) : null}

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
              {props.attachmentsUrl ? (
                <a
                  href={props.attachmentsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={buttonStyles({ variant: "ghost", size: "md" })}
                >
                  Open attachment source
                </a>
              ) : null}
              <Link href={props.bidBuilderHref} className={buttonStyles({ variant: "primary", size: "md" })}>
                Start building the bid
              </Link>
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6">
            <h2 className="text-xl font-semibold text-white">Analyze the attachment package</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Paste the attachment names or any text you copied from the bid package. We will keep it here in this browser while your team works.
            </p>

            <label className="mt-5 block space-y-2 text-sm text-slate-200">
              <span>Attachment names</span>
              <textarea
                value={attachmentNames}
                onChange={(event) => setAttachmentNames(event.target.value)}
                rows={4}
                className="w-full rounded-[1.5rem] border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400/50"
                placeholder="Example: Bid Form.pdf, Scope of Work.docx, Insurance Requirements.pdf, Wage Determination.pdf"
              />
            </label>

            <label className="mt-5 block space-y-2 text-sm text-slate-200">
              <span>Copied attachment text or notes</span>
              <textarea
                value={attachmentText}
                onChange={(event) => setAttachmentText(event.target.value)}
                rows={12}
                className="w-full rounded-[1.5rem] border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400/50"
                placeholder="Paste scope text, instructions to bidders, insurance language, addendum notes, evaluation criteria, or submission instructions here."
              />
            </label>

            <label className="mt-5 block space-y-2 text-sm text-slate-200">
              <span>Internal review notes</span>
              <textarea
                value={internalNotes}
                onChange={(event) => setInternalNotes(event.target.value)}
                rows={6}
                className="w-full rounded-[1.5rem] border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400/50"
                placeholder="Capture anything your team notices while reviewing the files."
              />
            </label>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  saveAttachmentReviewDraft({
                    reviewId: props.reviewId,
                    title: props.title,
                    attachmentNames,
                    attachmentText,
                    internalNotes,
                    updatedAt: new Date().toISOString(),
                  });
                  setStatusMessage("Attachment review notes saved in this browser.");
                }}
                className={buttonStyles({ variant: "primary", size: "md" })}
              >
                Save review notes
              </button>
              <button
                type="button"
                onClick={() => {
                  const existingBidDraft = readBidDraft(props.draftId);
                  saveBidDraft({
                    id: props.draftId,
                    title: props.title,
                    noticeId: existingBidDraft?.noticeId,
                    agency: props.agency ?? existingBidDraft?.agency,
                    sourceName: props.source ?? existingBidDraft?.sourceName,
                    dueDate: props.dueDate ?? existingBidDraft?.dueDate,
                    naicsCode: props.naics ?? existingBidDraft?.naicsCode,
                    setAside: props.setAside ?? existingBidDraft?.setAside,
                    summary: props.summary ?? existingBidDraft?.summary,
                    sourceUrl: props.sourceUrl ?? existingBidDraft?.sourceUrl,
                    attachmentsUrl: props.attachmentsUrl ?? existingBidDraft?.attachmentsUrl,
                    workspaceName:
                      existingBidDraft?.workspaceName ?? `${props.title} Bid Workspace`,
                    winThemes: existingBidDraft?.winThemes ?? "",
                    complianceNotes: existingBidDraft?.complianceNotes ?? "",
                    pricingApproach: existingBidDraft?.pricingApproach ?? "",
                    questionsForAgency:
                      existingBidDraft?.questionsForAgency
                        ? `${existingBidDraft.questionsForAgency}\n\n${insights.followUpQuestions
                            .map((item) => `- ${item}`)
                            .join("\n")}`
                        : insights.followUpQuestions.map((item) => `- ${item}`).join("\n"),
                    submissionChecklist: existingBidDraft?.submissionChecklist ?? "",
                    teammateAssignments: existingBidDraft?.teammateAssignments ?? "",
                    aiReviewPoints: aiReviewMemo,
                    reviewRequirements: mergeBidRequirements(
                      existingBidDraft?.reviewRequirements,
                      aiRequirements,
                    ),
                    updatedAt: new Date().toISOString(),
                  });
                  setStatusMessage("AI review points were saved to your bid workspace.");
                }}
                className={buttonStyles({ variant: "secondary", size: "md" })}
              >
                Save AI points to bid workspace
              </button>
              <button
                type="button"
                onClick={() => void copyText(kickoffMemo, "Kickoff memo")}
                className={buttonStyles({ variant: "ghost", size: "md" })}
              >
                Copy kickoff memo
              </button>
              <button
                type="button"
                onClick={() =>
                  void copyText(
                    insights.followUpQuestions.map((item, index) => `${index + 1}. ${item}`).join("\n"),
                    "Questions list",
                  )
                }
                className={buttonStyles({ variant: "ghost", size: "md" })}
              >
                Copy questions
              </button>
            </div>
          </section>
        </section>

        <section className="space-y-6">
          <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-white">Automated assessment</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">{insights.executiveSummary}</p>
              </div>
              <span
                className={`rounded-full border px-3 py-1 text-xs font-medium ${
                  insights.riskLevel === "High"
                    ? "border-amber-400/20 bg-amber-400/10 text-amber-100"
                    : insights.riskLevel === "Moderate"
                      ? "border-sky-400/20 bg-sky-400/10 text-sky-100"
                      : "border-emerald-400/20 bg-emerald-400/10 text-emerald-100"
                }`}
              >
                {insights.riskLevel} review priority
              </span>
            </div>
          </section>

          {renderList("Critical items to review first", insights.criticalAlerts, "critical")}
          {renderList("Submission requirements", insights.submissionItems)}
          {renderList("Compliance and eligibility checks", insights.complianceItems)}
          {renderList("Pricing and cost signals", insights.pricingItems)}
          {renderList("Evaluation clues", insights.evaluationItems)}

          <section className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6">
            <h2 className="text-xl font-semibold text-white">Questions to resolve before bidding</h2>
            <div className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
              {insights.followUpQuestions.map((item) => (
                <div key={item} className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                  {item}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6">
            <h2 className="text-xl font-semibold text-white">Kickoff checklist</h2>
            <div className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
              {insights.kickoffChecklist.map((item) => (
                <div key={item} className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                  {item}
                </div>
              ))}
            </div>
          </section>
        </section>
      </section>
    </div>
  );
}
