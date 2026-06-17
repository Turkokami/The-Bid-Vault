"use client";

import { useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";
import type { BidRequirementItem, BidRequirementStatus, CompanyProfile } from "@/lib/bid-builder-store";
import { readBidDraft, saveBidDraft, readCompanyProfile, saveCompanyProfile } from "@/lib/bid-builder-store";

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

type AiLoadingKey =
  | "coverLetter" | "executiveSummary" | "technicalApproach"
  | "pastPerformance" | "managementPlan" | "winThemes"
  | "submissionChecklist" | "pricingApproach";

function AiButton({
  loading,
  onClick,
  label = "Generate with AI",
}: {
  loading: boolean;
  onClick: () => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="flex items-center gap-1.5 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-xs font-medium text-emerald-200 transition hover:bg-emerald-400/20 disabled:opacity-50"
    >
      {loading ? (
        <>
          <svg className="animate-spin" width="12" height="12" viewBox="0 0 12 12" fill="none">
            <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="2" strokeDasharray="8 8" />
          </svg>
          Generating…
        </>
      ) : (
        <>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M6 1l1.3 3.7H11l-3 2.2 1.1 3.7L6 8.5l-3.1 2.1L4 6.9 1 4.7h3.7z" />
          </svg>
          {label}
        </>
      )}
    </button>
  );
}

function SectionHeader({
  label,
  children,
}: {
  label: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm font-medium text-slate-200">{label}</span>
      {children}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  rows = 5,
  placeholder,
  aiKey,
  aiLoading,
  onAiGenerate,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
  aiKey?: AiLoadingKey;
  aiLoading?: AiLoadingKey | null;
  onAiGenerate?: (key: AiLoadingKey) => void;
}) {
  return (
    <label className="block space-y-2">
      <SectionHeader label={label}>
        {aiKey && onAiGenerate && (
          <AiButton
            loading={aiLoading === aiKey}
            onClick={() => onAiGenerate(aiKey)}
          />
        )}
      </SectionHeader>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full rounded-[1.5rem] border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400/50 placeholder:text-slate-600"
      />
    </label>
  );
}

export function BidBuilderClient(props: BidBuilderClientProps) {
  const existingDraft = useMemo(() => readBidDraft(props.draftId), [props.draftId]);

  // Company profile
  const [company, setCompany] = useState<CompanyProfile>(() => readCompanyProfile());
  const [showCompanyProfile, setShowCompanyProfile] = useState(() => {
    const p = readCompanyProfile();
    return !p.companyName;
  });

  // Bid sections
  const [workspaceName, setWorkspaceName] = useState(() => existingDraft?.workspaceName ?? `${props.title} Bid Workspace`);
  const [coverLetter, setCoverLetter] = useState(() => existingDraft?.coverLetter ?? "");
  const [executiveSummary, setExecutiveSummary] = useState(() => existingDraft?.executiveSummary ?? "");
  const [technicalApproach, setTechnicalApproach] = useState(() => existingDraft?.technicalApproach ?? "");
  const [pastPerformance, setPastPerformance] = useState(() => existingDraft?.pastPerformance ?? company.pastPerformance ?? "");
  const [managementPlan, setManagementPlan] = useState(() => existingDraft?.managementPlan ?? "");
  const [winThemes, setWinThemes] = useState(() => existingDraft?.winThemes ?? "");
  const [complianceNotes, setComplianceNotes] = useState(() => existingDraft?.complianceNotes ?? "");
  const [pricingApproach, setPricingApproach] = useState(() => existingDraft?.pricingApproach ?? "");
  const [questionsForAgency, setQuestionsForAgency] = useState(() => existingDraft?.questionsForAgency ?? "");
  const [submissionChecklist, setSubmissionChecklist] = useState(() => existingDraft?.submissionChecklist ?? defaultChecklist(props.title, props.dueDate));
  const [teammateAssignments, setTeammateAssignments] = useState(() => existingDraft?.teammateAssignments ?? "");
  const [aiReviewPoints, setAiReviewPoints] = useState(() => existingDraft?.aiReviewPoints ?? "");
  const [reviewRequirements, setReviewRequirements] = useState<BidRequirementItem[]>(() => existingDraft?.reviewRequirements ?? []);

  const [aiLoading, setAiLoading] = useState<AiLoadingKey | null>(null);
  const [aiError, setAiError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");

  const saveCompanyAndProfile = useCallback(() => {
    saveCompanyProfile(company);
    setStatusMessage("Company profile saved.");
    setShowCompanyProfile(false);
  }, [company]);

  const buildContext = useCallback(() => ({
    title: props.title,
    agency: props.agency ?? "",
    dueDate: props.dueDate ?? "",
    naicsCode: props.naicsCode ?? "",
    setAside: props.setAside ?? "",
    summary: props.summary ?? "",
    sourceName: props.sourceName ?? "",
    companyName: company.companyName,
    ueiNumber: company.ueiNumber,
    certifications: company.certifications,
    yearsInBusiness: company.yearsInBusiness,
    pointOfContact: company.pointOfContact,
    pocTitle: company.pocTitle,
    companyDescription: company.companyDescription,
    pastPerformance: company.pastPerformance,
  }), [props, company]);

  const generateSection = useCallback(async (section: AiLoadingKey) => {
    setAiLoading(section);
    setAiError("");
    try {
      const res = await fetch("/api/bid-ai/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ section, context: buildContext() }),
      });
      const data = await res.json() as { generated?: string; error?: string };
      if (!res.ok || data.error) throw new Error(data.error ?? "AI generation failed.");
      const setters: Record<AiLoadingKey, (v: string) => void> = {
        coverLetter: setCoverLetter,
        executiveSummary: setExecutiveSummary,
        technicalApproach: setTechnicalApproach,
        pastPerformance: setPastPerformance,
        managementPlan: setManagementPlan,
        winThemes: setWinThemes,
        submissionChecklist: setSubmissionChecklist,
        pricingApproach: setPricingApproach,
      };
      setters[section](data.generated ?? "");
      setStatusMessage("AI generated content. Review and edit as needed before saving.");
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "AI generation failed.");
    } finally {
      setAiLoading(null);
    }
  }, [buildContext]);

  const generateAll = useCallback(async () => {
    const sections: AiLoadingKey[] = [
      "coverLetter", "executiveSummary", "technicalApproach",
      "managementPlan", "winThemes", "submissionChecklist", "pricingApproach",
    ];
    for (const section of sections) {
      await generateSection(section);
    }
    setStatusMessage("All sections generated. Review everything carefully before downloading.");
  }, [generateSection]);

  const saveDraft = useCallback(() => {
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
      coverLetter,
      executiveSummary,
      technicalApproach,
      pastPerformance,
      managementPlan,
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
    setStatusMessage("Bid draft saved.");
  }, [
    props, workspaceName, coverLetter, executiveSummary, technicalApproach,
    pastPerformance, managementPlan, winThemes, complianceNotes, pricingApproach,
    questionsForAgency, submissionChecklist, teammateAssignments, aiReviewPoints, reviewRequirements,
  ]);

  const openPdf = useCallback(() => {
    saveDraft();
    const url = `/bid-builder/print?id=${encodeURIComponent(props.draftId)}`;
    window.open(url, "_blank");
  }, [saveDraft, props.draftId]);

  const updateRequirementStatus = (id: string, status: BidRequirementStatus) => {
    setReviewRequirements((current) =>
      current.map((item) => (item.id === id ? { ...item, status } : item)),
    );
  };

  const previewText = [
    `BID PROPOSAL: ${props.title}`,
    `Agency: ${props.agency || "Not listed"} | Due: ${props.dueDate || "TBD"} | NAICS: ${props.naicsCode || "—"}`,
    "",
    coverLetter && `COVER LETTER\n${coverLetter}`,
    executiveSummary && `EXECUTIVE SUMMARY\n${executiveSummary}`,
    technicalApproach && `TECHNICAL APPROACH\n${technicalApproach}`,
    pastPerformance && `PAST PERFORMANCE\n${pastPerformance}`,
    managementPlan && `MANAGEMENT PLAN\n${managementPlan}`,
    pricingApproach && `PRICING APPROACH\n${pricingApproach}`,
    complianceNotes && `COMPLIANCE NOTES\n${complianceNotes}`,
    submissionChecklist && `SUBMISSION CHECKLIST\n${submissionChecklist}`,
  ].filter(Boolean).join("\n\n");

  const tabs = [
    { key: "write", label: "Write" },
    { key: "preview", label: "Preview" },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_0_30px_rgba(34,197,94,0.08)] backdrop-blur">
        <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">Bid Builder</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white lg:text-3xl">{props.title}</h1>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Agency", value: props.agency },
            { label: "Due", value: props.dueDate },
            { label: "NAICS", value: props.naicsCode },
            { label: "Set-Aside", value: props.setAside },
          ].map((item) => item.value && item.value !== "Not listed" ? (
            <div key={item.label} className="rounded-[1.25rem] border border-white/8 bg-slate-950/60 p-3">
              <p className="text-[10px] uppercase tracking-wider text-slate-500">{item.label}</p>
              <p className="mt-1 text-sm font-medium text-white leading-snug">{item.value}</p>
            </div>
          ) : null)}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <button type="button" onClick={generateAll} disabled={aiLoading !== null}
            className="flex items-center gap-2 rounded-xl border border-emerald-400/40 bg-emerald-500/15 px-4 py-2 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/25 disabled:opacity-50">
            <svg width="14" height="14" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 1l1.3 3.7H11l-3 2.2 1.1 3.7L6 8.5l-3.1 2.1L4 6.9 1 4.7h3.7z" />
            </svg>
            {aiLoading ? `Generating ${aiLoading}…` : "Generate All Sections with AI"}
          </button>
          <button type="button" onClick={saveDraft}
            className={buttonStyles({ variant: "primary", size: "sm" })}>
            Save Draft
          </button>
          <button type="button" onClick={openPdf}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white transition hover:border-emerald-400/30 hover:text-emerald-200">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M4 2h6l3 3v9H4V2z" />
              <path d="M10 2v3h3" />
              <line x1="6" y1="8" x2="10" y2="8" />
              <line x1="6" y1="11" x2="10" y2="11" />
            </svg>
            Download PDF
          </button>
          {props.sourceUrl && (
            <a href={props.sourceUrl} target="_blank" rel="noreferrer"
              className={buttonStyles({ variant: "ghost", size: "sm" })}>
              Original Posting ↗
            </a>
          )}
          <button type="button" onClick={() => setShowCompanyProfile((v) => !v)}
            className={buttonStyles({ variant: "ghost", size: "sm" })}>
            {showCompanyProfile ? "Hide" : "Edit"} Company Profile
          </button>
        </div>
      </section>

      {/* Alerts */}
      {statusMessage && (
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
          {statusMessage}
        </div>
      )}
      {aiError && (
        <div className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
          {aiError} — Make sure ANTHROPIC_API_KEY is set in your Vercel environment variables.
        </div>
      )}

      {/* Company Profile */}
      {showCompanyProfile && (
        <section className="rounded-[2rem] border border-emerald-400/20 bg-emerald-400/[0.04] p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-400/80">Company Profile</p>
          <p className="mt-1 text-sm text-slate-400">Fill this once — it auto-fills every bid you build.</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {[
              { label: "Company Name", key: "companyName" as const, placeholder: "Acme Construction LLC" },
              { label: "Point of Contact", key: "pointOfContact" as const, placeholder: "Jane Smith" },
              { label: "POC Title", key: "pocTitle" as const, placeholder: "President / Project Manager" },
              { label: "Email", key: "email" as const, placeholder: "jane@acme.com" },
              { label: "Phone", key: "phone" as const, placeholder: "(555) 555-5555" },
              { label: "Website", key: "website" as const, placeholder: "www.acme.com" },
              { label: "Street Address", key: "address" as const, placeholder: "123 Main St" },
              { label: "City", key: "city" as const, placeholder: "Phoenix" },
              { label: "State", key: "state" as const, placeholder: "AZ" },
              { label: "ZIP", key: "zip" as const, placeholder: "85001" },
              { label: "UEI Number", key: "ueiNumber" as const, placeholder: "SAM.gov UEI (12 chars)" },
              { label: "CAGE Code", key: "cageCode" as const, placeholder: "CAGE code" },
              { label: "NAICS Codes", key: "naicsCodes" as const, placeholder: "236220, 238110" },
              { label: "Years in Business", key: "yearsInBusiness" as const, placeholder: "12" },
            ].map(({ label, key, placeholder }) => (
              <label key={key} className="block space-y-1.5">
                <span className="text-xs text-slate-400">{label}</span>
                <input
                  value={company[key]}
                  onChange={(e) => setCompany((c) => ({ ...c, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400/50 placeholder:text-slate-700"
                />
              </label>
            ))}
          </div>
          <div className="mt-4 space-y-4">
            <label className="block space-y-1.5">
              <span className="text-xs text-slate-400">Certifications (SDVOSB, 8(a), WOSB, HUBZone, etc.)</span>
              <input
                value={company.certifications}
                onChange={(e) => setCompany((c) => ({ ...c, certifications: e.target.value }))}
                placeholder="SDVOSB, Small Business"
                className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400/50 placeholder:text-slate-700"
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-xs text-slate-400">Company Description (2-3 sentences for AI to use)</span>
              <textarea
                value={company.companyDescription}
                onChange={(e) => setCompany((c) => ({ ...c, companyDescription: e.target.value }))}
                rows={3}
                placeholder="We are a veteran-owned general contractor specializing in government facility maintenance and construction with 12 years of federal and state contract experience."
                className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400/50 placeholder:text-slate-700"
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-xs text-slate-400">Past Performance Summary (AI uses this for the past performance section)</span>
              <textarea
                value={company.pastPerformance}
                onChange={(e) => setCompany((c) => ({ ...c, pastPerformance: e.target.value }))}
                rows={4}
                placeholder="List 2-3 relevant past contracts with agency name, dollar value, and brief description of work performed."
                className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400/50 placeholder:text-slate-700"
              />
            </label>
          </div>
          <button type="button" onClick={saveCompanyAndProfile}
            className="mt-5 rounded-xl border border-emerald-400/30 bg-emerald-500/15 px-5 py-2.5 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/25">
            Save Company Profile
          </button>
        </section>
      )}

      {/* Tabs */}
      <div className="flex gap-1 rounded-2xl border border-white/10 bg-slate-950/60 p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
              activeTab === tab.key
                ? "bg-emerald-500/20 text-emerald-300"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "preview" ? (
        <section className="rounded-[2rem] border border-emerald-400/20 bg-emerald-400/[0.04] p-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="text-lg font-semibold text-white">Bid Preview</h2>
            <div className="flex gap-2">
              <button type="button" onClick={() => { void navigator.clipboard.writeText(previewText); setStatusMessage("Copied to clipboard."); }}
                className={buttonStyles({ variant: "secondary", size: "sm" })}>Copy Text</button>
              <button type="button" onClick={openPdf}
                className={buttonStyles({ variant: "primary", size: "sm" })}>Download PDF</button>
            </div>
          </div>
          <pre className="overflow-x-auto whitespace-pre-wrap rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-5 text-sm leading-7 text-slate-200">
            {previewText || "Fill in sections on the Write tab to see your bid preview here."}
          </pre>
        </section>
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          {/* Left column */}
          <div className="space-y-6">
            <BidSection title="Cover Letter">
              <Field label="Cover Letter" value={coverLetter} onChange={setCoverLetter} rows={10}
                placeholder="A formal letter to the contracting officer expressing intent to bid and introducing your company."
                aiKey="coverLetter" aiLoading={aiLoading} onAiGenerate={generateSection} />
            </BidSection>

            <BidSection title="Executive Summary">
              <Field label="Executive Summary" value={executiveSummary} onChange={setExecutiveSummary} rows={8}
                placeholder="A 2-3 paragraph overview of your offer, qualifications, and commitment."
                aiKey="executiveSummary" aiLoading={aiLoading} onAiGenerate={generateSection} />
            </BidSection>

            <BidSection title="Technical Approach">
              <Field label="Technical Approach / Scope Response" value={technicalApproach} onChange={setTechnicalApproach} rows={12}
                placeholder="Describe how you will perform the work — methodology, key tasks, quality controls, and delivery plan."
                aiKey="technicalApproach" aiLoading={aiLoading} onAiGenerate={generateSection} />
            </BidSection>

            <BidSection title="Past Performance">
              <Field label="Past Performance" value={pastPerformance} onChange={setPastPerformance} rows={8}
                placeholder="List 2-3 relevant contracts you have completed. Include agency, dollar value, description, and outcome."
                aiKey="pastPerformance" aiLoading={aiLoading} onAiGenerate={generateSection} />
            </BidSection>

            <BidSection title="Management Plan">
              <Field label="Management Plan / Key Personnel" value={managementPlan} onChange={setManagementPlan} rows={8}
                placeholder="Describe your team structure, key roles, project manager qualifications, and communication plan."
                aiKey="managementPlan" aiLoading={aiLoading} onAiGenerate={generateSection} />
            </BidSection>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            <BidSection title="Win Strategy">
              <Field label="Win Themes & Differentiators" value={winThemes} onChange={setWinThemes} rows={6}
                placeholder="Why should your company win? List your strongest competitive advantages."
                aiKey="winThemes" aiLoading={aiLoading} onAiGenerate={generateSection} />
            </BidSection>

            <BidSection title="Pricing">
              <Field label="Pricing Approach & Strategy" value={pricingApproach} onChange={setPricingApproach} rows={7}
                placeholder="Labor rates, materials, subcontractors, markup strategy, and final price notes."
                aiKey="pricingApproach" aiLoading={aiLoading} onAiGenerate={generateSection} />
            </BidSection>

            <BidSection title="Compliance">
              <Field label="Compliance & Scope Notes" value={complianceNotes} onChange={setComplianceNotes} rows={6}
                placeholder="Mandatory certifications, forms, site visits, registrations, and hard requirements." />
            </BidSection>

            <BidSection title="Submission Checklist">
              <Field label="Submission Checklist" value={submissionChecklist} onChange={setSubmissionChecklist} rows={8}
                placeholder="Step-by-step checklist before submitting the final bid."
                aiKey="submissionChecklist" aiLoading={aiLoading} onAiGenerate={generateSection} />
            </BidSection>

            <BidSection title="Questions & Team">
              <div className="space-y-4">
                <Field label="Questions for the Agency" value={questionsForAgency} onChange={setQuestionsForAgency} rows={4}
                  placeholder="Clarification questions to submit before the questions deadline." />
                <Field label="Team Assignments" value={teammateAssignments} onChange={setTeammateAssignments} rows={4}
                  placeholder="Who is responsible for writing, pricing, forms, and submission." />
                <Field label="AI Review Points" value={aiReviewPoints} onChange={setAiReviewPoints} rows={4}
                  placeholder="Key points from the solicitation attachment review that must be addressed." />
              </div>
            </BidSection>

            {reviewRequirements.length > 0 && (
              <BidSection title="Requirement Tracker">
                <div className="space-y-3">
                  {reviewRequirements.map((item) => (
                    <article key={item.id} className="rounded-[1.25rem] border border-white/10 bg-slate-950/70 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-white">{item.title}</p>
                          <p className="mt-1 text-xs leading-5 text-slate-400">{item.detail}</p>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {(["needs-response", "addressed", "blocked"] as BidRequirementStatus[]).map((s) => (
                            <button key={s} type="button"
                              onClick={() => updateRequirementStatus(item.id, s)}
                              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                                item.status === s
                                  ? s === "addressed" ? "bg-emerald-500/30 text-emerald-200" : s === "blocked" ? "bg-red-500/30 text-red-200" : "bg-amber-500/30 text-amber-200"
                                  : "bg-white/5 text-slate-400 hover:text-white"
                              }`}>
                              {s === "needs-response" ? "Pending" : s === "addressed" ? "Done" : "Blocked"}
                            </button>
                          ))}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </BidSection>
            )}

            {/* Save & actions */}
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5">
              <p className="text-sm font-semibold text-white mb-3">Save & Export</p>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={saveDraft}
                  className={buttonStyles({ variant: "primary", size: "md" })}>
                  Save Bid Draft
                </button>
                <button type="button" onClick={openPdf}
                  className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:border-emerald-400/30 hover:text-emerald-200">
                  Download PDF
                </button>
                <Link href="/my-codes" className={buttonStyles({ variant: "ghost", size: "md" })}>
                  My Codes
                </Link>
                <Link href="/dashboard" className={buttonStyles({ variant: "ghost", size: "md" })}>
                  Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BidSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-5">
      <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.3em] text-emerald-400/60">{title}</p>
      {children}
    </section>
  );
}

function defaultChecklist(title: string, dueDate?: string) {
  return [
    `☐ Confirm exact submission deadline${dueDate ? `: ${dueDate}` : ""}`,
    "☐ Verify SAM.gov registration is active and UEI is current",
    "☐ Download all amendments and addenda",
    "☐ Complete all mandatory forms and certifications",
    "☐ Confirm set-aside eligibility",
    `☐ Pull full technical requirements from "${title}"`,
    "☐ Finalize pricing sheet in required format",
    "☐ Prepare past performance references",
    "☐ Submit agency questions before questions deadline",
    "☐ Final review: all sections complete, no blanks",
    "☐ Submit via required method before deadline",
  ].join("\n");
}
