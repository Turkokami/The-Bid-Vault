"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { readBidDraft, readCompanyProfile } from "@/lib/bid-builder-store";

function PrintContent() {
  const searchParams = useSearchParams();
  const draftId = searchParams.get("id") ?? "";
  const [ready, setReady] = useState(false);
  const [draft, setDraft] = useState<ReturnType<typeof readBidDraft>>(null);
  const [company, setCompany] = useState(readCompanyProfile());

  useEffect(() => {
    setDraft(readBidDraft(draftId));
    setCompany(readCompanyProfile());
    setReady(true);
  }, [draftId]);

  useEffect(() => {
    if (ready) {
      setTimeout(() => window.print(), 400);
    }
  }, [ready]);

  if (!ready || !draft) {
    return (
      <div style={{ padding: "2rem", fontFamily: "serif" }}>
        Loading bid draft…
      </div>
    );
  }

  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const section = (title: string, content: string | undefined) =>
    content ? (
      <div style={{ marginBottom: "2rem", pageBreakInside: "avoid" }}>
        <h2
          style={{
            fontSize: "13pt",
            fontWeight: "bold",
            borderBottom: "1.5px solid #1a3a1a",
            paddingBottom: "4px",
            marginBottom: "10px",
            color: "#1a3a1a",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {title}
        </h2>
        <p style={{ whiteSpace: "pre-wrap", lineHeight: "1.7", fontSize: "10.5pt" }}>
          {content}
        </p>
      </div>
    ) : null;

  return (
    <>
      <style>{`
        @media print {
          body { margin: 0; }
          .no-print { display: none !important; }
          @page { margin: 1in 1in 1in 1in; size: letter; }
        }
        body { font-family: "Times New Roman", Georgia, serif; font-size: 11pt; color: #111; background: white; }
      `}</style>

      {/* Print button — hidden on actual print */}
      <div className="no-print" style={{ background: "#0f172a", padding: "12px 20px", display: "flex", gap: "12px", alignItems: "center" }}>
        <button
          onClick={() => window.print()}
          style={{ background: "#10b981", color: "white", border: "none", borderRadius: "8px", padding: "8px 20px", fontWeight: "bold", cursor: "pointer", fontSize: "14px" }}
        >
          Save / Print as PDF
        </button>
        <button
          onClick={() => window.close()}
          style={{ background: "#374151", color: "white", border: "none", borderRadius: "8px", padding: "8px 16px", cursor: "pointer" }}
        >
          Close
        </button>
        <span style={{ color: "#94a3b8", fontSize: "13px" }}>
          Use your browser's "Save as PDF" option in the print dialog.
        </span>
      </div>

      <div style={{ maxWidth: "7.5in", margin: "0 auto", padding: "0.5in 0" }}>
        {/* Header / Letterhead */}
        <div style={{ borderBottom: "3px solid #1a3a1a", marginBottom: "28px", paddingBottom: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: "18pt", fontWeight: "bold", color: "#1a3a1a" }}>
                {company.companyName || draft.title}
              </div>
              {company.address && (
                <div style={{ fontSize: "9.5pt", color: "#555", marginTop: "4px" }}>
                  {company.address}{company.city ? `, ${company.city}` : ""}{company.state ? `, ${company.state}` : ""} {company.zip}
                </div>
              )}
              {company.phone && <div style={{ fontSize: "9.5pt", color: "#555" }}>{company.phone} · {company.email}</div>}
              {company.ueiNumber && <div style={{ fontSize: "9pt", color: "#555" }}>UEI: {company.ueiNumber}{company.cageCode ? ` · CAGE: ${company.cageCode}` : ""}</div>}
            </div>
            <div style={{ textAlign: "right", fontSize: "9.5pt", color: "#555" }}>
              <div>{today}</div>
              {draft.dueDate && <div style={{ marginTop: "4px" }}>Response Due: <strong>{draft.dueDate}</strong></div>}
            </div>
          </div>
        </div>

        {/* Bid title block */}
        <div style={{ marginBottom: "28px", padding: "16px", background: "#f8faf8", border: "1px solid #d1e7d1", borderRadius: "4px" }}>
          <div style={{ fontSize: "8.5pt", textTransform: "uppercase", letterSpacing: "0.1em", color: "#2d6a2d", fontWeight: "bold" }}>Proposal Submitted In Response To</div>
          <div style={{ fontSize: "14pt", fontWeight: "bold", color: "#111", marginTop: "6px" }}>{draft.title}</div>
          <div style={{ fontSize: "10pt", color: "#444", marginTop: "4px" }}>
            {draft.agency && <span>Agency: {draft.agency}</span>}
            {draft.naicsCode && <span style={{ marginLeft: "20px" }}>NAICS: {draft.naicsCode}</span>}
            {draft.setAside && draft.setAside !== "Not listed" && <span style={{ marginLeft: "20px" }}>Set-Aside: {draft.setAside}</span>}
            {draft.noticeId && <span style={{ marginLeft: "20px" }}>Notice ID: {draft.noticeId}</span>}
          </div>
        </div>

        {section("Cover Letter", draft.coverLetter)}
        {section("Executive Summary", draft.executiveSummary)}
        {section("Technical Approach", draft.technicalApproach)}
        {section("Past Performance", draft.pastPerformance)}
        {section("Management Plan", draft.managementPlan)}
        {section("Pricing Approach", draft.pricingApproach)}
        {section("Compliance & Scope Notes", draft.complianceNotes)}
        {section("Questions for the Agency", draft.questionsForAgency)}
        {section("Submission Checklist", draft.submissionChecklist)}
        {section("Win Themes & Differentiators", draft.winThemes)}
        {section("Team Assignments", draft.teammateAssignments)}

        {/* Footer */}
        <div style={{ borderTop: "1px solid #ccc", marginTop: "40px", paddingTop: "10px", fontSize: "8.5pt", color: "#888", display: "flex", justifyContent: "space-between" }}>
          <span>{company.companyName || "The Bid Vault"} · Prepared {today}</span>
          <span>Generated via The Bid Vault · thebidvault.app</span>
        </div>
      </div>
    </>
  );
}

export default function BidPrintPage() {
  return (
    <Suspense>
      <PrintContent />
    </Suspense>
  );
}
