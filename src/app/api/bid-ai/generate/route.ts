import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/server/auth";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Max characters for any single context field — prevents prompt inflation
const MAX_FIELD_LENGTH = 1000;

function truncate(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.slice(0, MAX_FIELD_LENGTH);
}

const SECTION_PROMPTS: Record<string, (ctx: BidContext) => string> = {
  coverLetter: (ctx) => `Write a professional government contract bid cover letter for the following opportunity. Be concise (3-4 short paragraphs), formal, and compelling.

Contract: ${ctx.title}
Agency: ${ctx.agency}
Due Date: ${ctx.dueDate}
NAICS: ${ctx.naicsCode}
Set-Aside: ${ctx.setAside}
Summary: ${ctx.summary}

Company: ${ctx.companyName}
UEI: ${ctx.ueiNumber}
Certifications: ${ctx.certifications}
Years in Business: ${ctx.yearsInBusiness}
Point of Contact: ${ctx.pointOfContact}, ${ctx.pocTitle}
Company Description: ${ctx.companyDescription}

Write the letter in first person from the company. Include: intent to bid, brief company intro, why qualified, contact info. Do not include placeholders like [DATE] — write it as a final draft.`,

  executiveSummary: (ctx) => `Write a compelling executive summary for a government bid response. 2-3 paragraphs. Professional, results-focused tone.

Contract: ${ctx.title}
Agency: ${ctx.agency}
NAICS: ${ctx.naicsCode}
Set-Aside: ${ctx.setAside}
Summary: ${ctx.summary}

Company: ${ctx.companyName}
Certifications: ${ctx.certifications}
Years in Business: ${ctx.yearsInBusiness}
Company Description: ${ctx.companyDescription}

Focus on: understanding of the requirement, company's unique qualifications, key differentiators, and commitment to the agency's mission.`,

  technicalApproach: (ctx) => `Write a technical approach section for a government bid response. Use clear structure with short paragraphs. 400-600 words.

Contract: ${ctx.title}
Agency: ${ctx.agency}
NAICS: ${ctx.naicsCode}
Summary: ${ctx.summary}

Company: ${ctx.companyName}
Years in Business: ${ctx.yearsInBusiness}
Company Description: ${ctx.companyDescription}

Cover: understanding of scope, methodology, key tasks, quality controls, and how the company will ensure successful delivery. Be specific to the contract type.`,

  pastPerformance: (ctx) => `Write a past performance narrative for a government bid. Professional tone. Structure as 2-3 project references with description of relevance.

Contract we are bidding: ${ctx.title}
Agency: ${ctx.agency}
NAICS: ${ctx.naicsCode}

Company: ${ctx.companyName}
Years in Business: ${ctx.yearsInBusiness}
Company Description: ${ctx.companyDescription}
Past Performance the company provided: ${ctx.pastPerformance || "Similar government and commercial contracts in this field."}

Write professional project descriptions that demonstrate relevant experience. If specific project details are not provided, write plausible general descriptions consistent with the company type and NAICS code. Note that the user will need to verify and update specific dollar amounts and dates.`,

  managementPlan: (ctx) => `Write a management plan / key personnel section for a government bid. 300-400 words. Clear structure.

Contract: ${ctx.title}
Agency: ${ctx.agency}
NAICS: ${ctx.naicsCode}

Company: ${ctx.companyName}
Point of Contact: ${ctx.pointOfContact}, ${ctx.pocTitle}
Company Description: ${ctx.companyDescription}
Years in Business: ${ctx.yearsInBusiness}

Cover: project management approach, organizational structure, key personnel roles, communication plan, and how the team ensures on-time delivery.`,

  winThemes: (ctx) => `Generate 5-7 strong win themes and differentiators for a government bid proposal. Each as a short punchy bullet (1-2 sentences). These are internal strategy notes.

Contract: ${ctx.title}
Agency: ${ctx.agency}
NAICS: ${ctx.naicsCode}
Set-Aside: ${ctx.setAside}
Summary: ${ctx.summary}

Company: ${ctx.companyName}
Certifications: ${ctx.certifications}
Years in Business: ${ctx.yearsInBusiness}
Company Description: ${ctx.companyDescription}

Focus on: competitive advantages, certification benefits, relevant experience, price competitiveness, and agency-specific angles.`,

  submissionChecklist: (ctx) => `Generate a detailed submission checklist for this government bid. Numbered list, specific to this contract type.

Contract: ${ctx.title}
Agency: ${ctx.agency}
Due Date: ${ctx.dueDate}
NAICS: ${ctx.naicsCode}
Set-Aside: ${ctx.setAside}
Source: ${ctx.sourceName}

Include: document gathering, registration checks (SAM.gov active status, UEI), forms, certifications, pricing format, submission method, deadline tracking, and final review steps. Be practical and actionable.`,

  pricingApproach: (ctx) => `Write a pricing approach and strategy memo for a government bid. Internal document, 250-350 words.

Contract: ${ctx.title}
Agency: ${ctx.agency}
NAICS: ${ctx.naicsCode}
Summary: ${ctx.summary}

Company: ${ctx.companyName}
Years in Business: ${ctx.yearsInBusiness}

Cover: pricing strategy (competitive vs cost-plus), key cost drivers, labor categories likely needed, materials/equipment considerations, subcontractor strategy if needed, and how to ensure the price is both competitive and profitable.`,
};

type BidContext = {
  title: string;
  agency: string;
  dueDate: string;
  naicsCode: string;
  setAside: string;
  summary: string;
  sourceName: string;
  companyName: string;
  ueiNumber: string;
  certifications: string;
  yearsInBusiness: string;
  pointOfContact: string;
  pocTitle: string;
  companyDescription: string;
  pastPerformance: string;
};

export async function POST(request: Request) {
  // Require authentication — this route calls a paid external API
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json(
      { error: "Sign in to use the AI bid builder." },
      { status: 401 },
    );
  }

  try {
    const body = (await request.json()) as { section: string; context: Record<string, unknown> };
    const { section, context } = body;

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "AI generation is not available right now. Please try again later." },
        { status: 503 },
      );
    }

    const promptBuilder = SECTION_PROMPTS[section];
    if (!promptBuilder) {
      return NextResponse.json({ error: `Unknown section: ${section}` }, { status: 400 });
    }

    // Sanitize and cap every field so no single request can inflate token cost
    const safeContext: BidContext = {
      title: truncate(context.title),
      agency: truncate(context.agency),
      dueDate: truncate(context.dueDate),
      naicsCode: truncate(context.naicsCode),
      setAside: truncate(context.setAside),
      summary: truncate(context.summary),
      sourceName: truncate(context.sourceName),
      companyName: truncate(context.companyName),
      ueiNumber: truncate(context.ueiNumber),
      certifications: truncate(context.certifications),
      yearsInBusiness: truncate(context.yearsInBusiness),
      pointOfContact: truncate(context.pointOfContact),
      pocTitle: truncate(context.pocTitle),
      companyDescription: truncate(context.companyDescription),
      pastPerformance: truncate(context.pastPerformance),
    };

    const prompt = promptBuilder(safeContext);

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1200,
      messages: [{ role: "user", content: prompt }],
    });

    const generated = message.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n");

    return NextResponse.json({ generated });
  } catch (error) {
    console.error("[bid-ai] generation error:", error);
    return NextResponse.json({ error: "AI generation failed. Please try again." }, { status: 500 });
  }
}
