import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/server/auth";
import { db } from "@/lib/db";

// GET /api/state-local/saves — list saved opportunity IDs for the current user
export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ ids: [] });
  }

  const saves = await db.savedStateLocalOpportunity.findMany({
    where: { userId: user.id },
    select: { opportunityId: true, notes: true, reminderDaysBefore: true, createdAt: true },
  });

  return NextResponse.json({ ids: saves.map((s) => s.opportunityId), saves });
}

// POST /api/state-local/saves — save an opportunity (upserts the opportunity record first)
export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json() as {
    opportunity: {
      id: string;
      sourceName: string;
      stateCode: string;
      title: string;
      issuingEntity: string;
      opportunityType: string;
      status: string;
      categoryCode?: string;
      postedDate?: string;
      dueDate?: string;
      summary?: string;
      location?: string;
      sourceUrl?: string;
      registrationRequired?: boolean;
      registrationNotes?: string;
      contactName?: string;
      contactEmail?: string;
    };
    notes?: string;
    reminderDaysBefore?: number;
  };

  const opp = body.opportunity;

  // Ensure the opportunity row exists in the DB (needed for FK)
  await db.stateLocalOpportunity.upsert({
    where: { id: opp.id },
    create: {
      id: opp.id,
      sourceName: opp.sourceName,
      stateCode: opp.stateCode,
      title: opp.title,
      issuingEntity: opp.issuingEntity,
      opportunityType: opp.opportunityType,
      status: opp.status,
      categoryCode: opp.categoryCode ?? null,
      postedDate: opp.postedDate ? new Date(opp.postedDate) : null,
      dueDate: opp.dueDate ? new Date(opp.dueDate) : null,
      summary: opp.summary ?? null,
      location: opp.location ?? null,
      sourceUrl: opp.sourceUrl ?? null,
      registrationRequired: opp.registrationRequired ?? false,
      registrationNotes: opp.registrationNotes ?? null,
      contactName: opp.contactName ?? null,
      contactEmail: opp.contactEmail ?? null,
    },
    update: {
      status: opp.status,
      dueDate: opp.dueDate ? new Date(opp.dueDate) : null,
      sourceUrl: opp.sourceUrl ?? null,
    },
  });

  await db.savedStateLocalOpportunity.upsert({
    where: { userId_opportunityId: { userId: user.id, opportunityId: opp.id } },
    create: {
      userId: user.id,
      opportunityId: opp.id,
      notes: body.notes ?? "",
      reminderDaysBefore: body.reminderDaysBefore ?? 14,
    },
    update: {
      notes: body.notes ?? "",
      reminderDaysBefore: body.reminderDaysBefore ?? 14,
    },
  });

  return NextResponse.json({ ok: true });
}

// DELETE /api/state-local/saves?id=<opportunityId>
export async function DELETE(req: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
  }

  const opportunityId = req.nextUrl.searchParams.get("id");
  if (!opportunityId) {
    return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });
  }

  await db.savedStateLocalOpportunity.deleteMany({
    where: { userId: user.id, opportunityId },
  });

  return NextResponse.json({ ok: true });
}
