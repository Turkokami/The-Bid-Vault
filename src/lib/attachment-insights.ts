export type AttachmentDetection = {
  label: string;
  detail: string;
};

export type AttachmentInsightBundle = {
  riskLevel: "Low" | "Moderate" | "High";
  executiveSummary: string;
  criticalAlerts: AttachmentDetection[];
  submissionItems: AttachmentDetection[];
  complianceItems: AttachmentDetection[];
  pricingItems: AttachmentDetection[];
  evaluationItems: AttachmentDetection[];
  followUpQuestions: string[];
  kickoffChecklist: string[];
};

type InsightInput = {
  title?: string;
  summary?: string;
  attachmentText?: string;
  attachmentNames?: string;
  dueDate?: string;
  setAside?: string;
  source?: string;
};

type Rule = {
  key: string;
  pattern: RegExp;
  label: string;
  detail: string;
  group: "critical" | "submission" | "compliance" | "pricing" | "evaluation";
};

const rules: Rule[] = [
  {
    key: "site-visit",
    pattern: /\b(site visit|pre-?bid|walkthrough|preproposal conference)\b/i,
    label: "Site visit or pre-bid event mentioned",
    detail: "Confirm whether attendance is mandatory and capture the meeting date, time, and sign-in requirements.",
    group: "critical",
  },
  {
    key: "questions-deadline",
    pattern: /\b(question deadline|questions due|rfi deadline|requests? for information)\b/i,
    label: "Questions deadline detected",
    detail: "Pull the exact last day to ask questions so your team does not miss clarification opportunities.",
    group: "critical",
  },
  {
    key: "addendum",
    pattern: /\b(addendum|amendment|acknowledg(e|ment) of amendment)\b/i,
    label: "Addendum or amendment requirement",
    detail: "Check whether every amendment must be acknowledged in the response package.",
    group: "submission",
  },
  {
    key: "pricing-sheet",
    pattern: /\b(pricing sheet|price proposal|cost proposal|bid schedule|schedule of values|fee sheet)\b/i,
    label: "Pricing form detected",
    detail: "Use the exact owner-provided pricing form and verify whether line items or alternates are mandatory.",
    group: "pricing",
  },
  {
    key: "signature",
    pattern: /\b(signature page|signed proposal|authorized signature|wet signature)\b/i,
    label: "Signature requirement detected",
    detail: "Confirm who is authorized to sign and whether digital signatures are accepted.",
    group: "submission",
  },
  {
    key: "bond",
    pattern: /\b(bid bond|performance bond|payment bond|bonding)\b/i,
    label: "Bonding requirement detected",
    detail: "Check required bond percentages and make sure your surety can provide them on time.",
    group: "compliance",
  },
  {
    key: "insurance",
    pattern: /\b(general liability|workers compensation|professional liability|insurance requirements?|certificate of insurance)\b/i,
    label: "Insurance requirements detected",
    detail: "Compare the listed insurance limits against your current coverage and any subcontractor needs.",
    group: "compliance",
  },
  {
    key: "license",
    pattern: /\b(contractor.?s license|licensed contractor|business license|state license|certification required)\b/i,
    label: "License or certification requirement",
    detail: "Verify your active license and any discipline-specific certifications before bidding.",
    group: "compliance",
  },
  {
    key: "wage",
    pattern: /\b(prevailing wage|davis-?bacon|certified payroll)\b/i,
    label: "Wage compliance requirement",
    detail: "Review wage determinations and payroll reporting duties before finalizing labor pricing.",
    group: "pricing",
  },
  {
    key: "subcontractor",
    pattern: /\b(subcontractor|supplier|manufacturer letter|lead time|material approval)\b/i,
    label: "Subcontractor or supplier dependency",
    detail: "Identify outside partners and gather quotes, letters, or lead-time confirmations early.",
    group: "pricing",
  },
  {
    key: "portal-upload",
    pattern: /\b(portal upload|online submission|electronic submission|upload proposal)\b/i,
    label: "Portal submission method",
    detail: "Check file size limits, naming rules, and whether the portal requires registration before upload.",
    group: "submission",
  },
  {
    key: "email-submission",
    pattern: /\b(email submission|submit by email|emailed proposal)\b/i,
    label: "Email submission method",
    detail: "Confirm subject-line format, attachment size limits, and whether zip files are allowed.",
    group: "submission",
  },
  {
    key: "sealed-bid",
    pattern: /\b(sealed bid|hard copy|physical delivery|hand deliver)\b/i,
    label: "Physical delivery requirement",
    detail: "Confirm package labeling, delivery address, and cut-off time so the bid is not rejected at the desk.",
    group: "submission",
  },
  {
    key: "best-value",
    pattern: /\b(best value|technical proposal|evaluation criteria|past performance|oral presentation)\b/i,
    label: "Best-value or evaluated selection",
    detail: "Plan for narrative writing, past performance examples, and any weighted evaluation sections.",
    group: "evaluation",
  },
  {
    key: "schedule",
    pattern: /\b(notice to proceed|project schedule|mobilization|completion date|phased work)\b/i,
    label: "Schedule or mobilization requirement",
    detail: "Pull out start dates, completion windows, and any phased-access constraints for operations planning.",
    group: "critical",
  },
];

function uniqByLabel(items: AttachmentDetection[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = `${item.label}|${item.detail}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function pushQuestion(list: string[], question: string) {
  if (!list.includes(question)) {
    list.push(question);
  }
}

export function buildAttachmentInsights(input: InsightInput): AttachmentInsightBundle {
  const combinedText = [
    input.title ?? "",
    input.summary ?? "",
    input.attachmentNames ?? "",
    input.attachmentText ?? "",
    input.setAside ?? "",
  ]
    .join(" ")
    .trim();

  const criticalAlerts: AttachmentDetection[] = [];
  const submissionItems: AttachmentDetection[] = [];
  const complianceItems: AttachmentDetection[] = [];
  const pricingItems: AttachmentDetection[] = [];
  const evaluationItems: AttachmentDetection[] = [];
  const followUpQuestions: string[] = [];

  for (const rule of rules) {
    if (!rule.pattern.test(combinedText)) {
      continue;
    }

    const item = { label: rule.label, detail: rule.detail };
    if (rule.group === "critical") criticalAlerts.push(item);
    if (rule.group === "submission") submissionItems.push(item);
    if (rule.group === "compliance") complianceItems.push(item);
    if (rule.group === "pricing") pricingItems.push(item);
    if (rule.group === "evaluation") evaluationItems.push(item);
  }

  if (input.setAside && input.setAside !== "Not listed") {
    complianceItems.push({
      label: `Set-aside rules: ${input.setAside}`,
      detail: "Confirm the business qualifies under the stated set-aside and whether documentation must be included in the proposal.",
    });
    pushQuestion(
      followUpQuestions,
      `Do we need to attach proof that we qualify for the ${input.setAside} set-aside?`,
    );
  }

  if (input.dueDate) {
    criticalAlerts.push({
      label: "Submission deadline present",
      detail: `Work backward from ${input.dueDate} and create an internal draft deadline at least two business days earlier.`,
    });
  }

  if (!criticalAlerts.length) {
    criticalAlerts.push({
      label: "Review the full package manually",
      detail: "No obvious high-priority keywords were detected yet, so confirm dates, forms, and delivery instructions by hand.",
    });
  }

  if (!submissionItems.length) {
    submissionItems.push({
      label: "Submission method still needs confirmation",
      detail: "Look for whether the owner wants a portal upload, emailed response, or sealed hard-copy bid.",
    });
  }

  if (!pricingItems.length) {
    pricingItems.push({
      label: "Look for owner-provided pricing sheets",
      detail: "Check whether pricing must follow a fixed form, alternates table, or unit-rate schedule.",
    });
  }

  if (!complianceItems.length) {
    complianceItems.push({
      label: "Check insurance, licensing, and registration requirements",
      detail: "Even if they were not auto-detected, these items commonly control whether the bid can be submitted.",
    });
  }

  if (!evaluationItems.length) {
    evaluationItems.push({
      label: "Confirm how the winner will be selected",
      detail: "Find out whether this is low-bid, best-value, qualifications-based, or scored on past performance and technical approach.",
    });
  }

  pushQuestion(followUpQuestions, "Are there mandatory forms or certifications that must be signed and uploaded?");
  pushQuestion(followUpQuestions, "Is there a questions deadline or addendum acknowledgment requirement?");
  pushQuestion(followUpQuestions, "Do we need subcontractor quotes or supplier confirmations before pricing?");

  const kickoffChecklist = [
    "Open every attachment and confirm the scope, due date, and submission method.",
    "Pull the required forms into one working folder.",
    "Flag bonding, insurance, wage, and license requirements for the operations team.",
    "Start pricing assumptions and request supplier or subcontractor input if needed.",
    "Move the opportunity into the Bid Builder once the attachments have been reviewed.",
  ];

  const riskScore =
    criticalAlerts.length * 2 +
    submissionItems.length +
    complianceItems.length +
    pricingItems.length;

  const riskLevel =
    riskScore >= 12 ? "High" : riskScore >= 7 ? "Moderate" : "Low";

  const executiveSummary =
    riskLevel === "High"
      ? "This package shows several items that can block or delay submission. Review the files carefully before pricing."
      : riskLevel === "Moderate"
        ? "This package looks workable, but there are enough requirements that your team should review attachments before drafting."
        : "This package looks relatively straightforward so far, but you should still confirm forms, dates, and delivery rules.";

  return {
    riskLevel,
    executiveSummary,
    criticalAlerts: uniqByLabel(criticalAlerts),
    submissionItems: uniqByLabel(submissionItems),
    complianceItems: uniqByLabel(complianceItems),
    pricingItems: uniqByLabel(pricingItems),
    evaluationItems: uniqByLabel(evaluationItems),
    followUpQuestions,
    kickoffChecklist,
  };
}
