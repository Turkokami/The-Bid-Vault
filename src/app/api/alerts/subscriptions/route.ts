import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/server/auth";
import { db } from "@/lib/db";

// GET — list current user's alert subscriptions
export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ subscriptions: [] });

  const subscriptions = await db.opportunityAlertSubscription.findMany({
    where: { userId: user.id, active: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ subscriptions });
}

// POST — create or update a subscription
export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });

  const body = await req.json() as {
    email: string;
    industry: string;
    stateCode: string;
    countiesOrCities?: string;
    keywords?: string;
    categoryCodes?: string[];
    scopes?: string[];
    frequency?: string;
  };

  if (!body.email || !body.industry || !body.stateCode) {
    return NextResponse.json({ ok: false, error: "email, industry, and stateCode are required" }, { status: 400 });
  }

  const sub = await db.opportunityAlertSubscription.create({
    data: {
      userId: user.id,
      email: body.email,
      industry: body.industry,
      stateCode: body.stateCode,
      countiesOrCities: body.countiesOrCities ?? "",
      keywords: body.keywords ?? "",
      categoryCodes: (body.categoryCodes ?? []).join(","),
      scopes: (body.scopes ?? ["sam", "state-local"]).join(","),
      frequency: body.frequency ?? "daily",
    },
  });

  return NextResponse.json({ ok: true, id: sub.id });
}

// DELETE — deactivate a subscription
export async function DELETE(req: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ ok: false, error: "Missing id" }, { status: 400 });

  await db.opportunityAlertSubscription.updateMany({
    where: { id, userId: user.id },
    data: { active: false },
  });

  return NextResponse.json({ ok: true });
}
