import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendAlertDigestEmail, type AlertEmailOpportunity } from "@/lib/server/alert-email";

// This endpoint is called by a cron job (e.g. Vercel cron or external scheduler).
// It is protected by a shared secret in the Authorization header.
export async function POST(req: NextRequest) {
  const secret = req.headers.get("authorization");
  if (!process.env.CRON_SECRET || secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // Determine which frequency buckets should fire
  // "as-soon-as-found" always fires, "daily" fires every run, "weekly" fires on Mondays
  const isMonday = now.getDay() === 1;

  const subs = await db.opportunityAlertSubscription.findMany({
    where: {
      active: true,
      OR: [
        { frequency: "as-soon-as-found" },
        { frequency: "daily" },
        ...(isMonday ? [{ frequency: "weekly" }] : []),
      ],
    },
    include: { user: true },
  });

  const results: { id: string; status: "sent" | "skipped" | "error"; count?: number; error?: string }[] = [];

  for (const sub of subs) {
    try {
      // Build search terms from the subscription
      const terms = [sub.industry, sub.keywords].filter(Boolean).join(" ").toLowerCase().split(/\s+/).filter(Boolean);
      const scopes = sub.scopes.split(",");
      const stateCode = sub.stateCode;

      const opportunities: AlertEmailOpportunity[] = [];

      // Search SAM opportunities (from our demo/live contracts)
      if (scopes.includes("sam")) {
        const samOpps = await db.contract.findMany({
          where: {
            OR: terms.map((t) => ({
              OR: [
                { title: { contains: t, mode: "insensitive" } },
                { summary: { contains: t, mode: "insensitive" } },
                { agency: { contains: t, mode: "insensitive" } },
              ],
            })),
            ...(stateCode !== "ALL" ? { state: stateCode } : {}),
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        });

        for (const c of samOpps) {
          opportunities.push({
            title: c.title,
            agency: c.agency,
            dueDate: c.expirationDate?.toLocaleDateString() ?? "",
            location: c.location,
            source: "federal",
          });
        }
      }

      // Search State & Local opportunities
      if (scopes.includes("state-local")) {
        const stateOpps = await db.stateLocalOpportunity.findMany({
          where: {
            stateCode,
            status: { in: ["Open", "Closing Soon"] },
            OR: terms.length > 0
              ? terms.map((t) => ({
                  OR: [
                    { title: { contains: t, mode: "insensitive" } },
                    { summary: { contains: t, mode: "insensitive" } },
                    { issuingEntity: { contains: t, mode: "insensitive" } },
                  ],
                }))
              : [{ stateCode }],
          },
          orderBy: { dueDate: "asc" },
          take: 5,
        });

        for (const o of stateOpps) {
          opportunities.push({
            title: o.title,
            agency: o.issuingEntity,
            dueDate: o.dueDate?.toLocaleDateString() ?? "",
            location: o.location ?? stateCode,
            sourceUrl: o.sourceUrl ?? undefined,
            source: "state-local",
          });
        }
      }

      if (opportunities.length === 0) {
        results.push({ id: sub.id, status: "skipped" });
        continue;
      }

      await sendAlertDigestEmail({
        toEmail: sub.email,
        industry: sub.industry,
        stateCode,
        opportunities,
        unsubscribeId: sub.id,
      });

      await db.opportunityAlertSubscription.update({
        where: { id: sub.id },
        data: { lastSentAt: now },
      });

      results.push({ id: sub.id, status: "sent", count: opportunities.length });
    } catch (err) {
      results.push({ id: sub.id, status: "error", error: String(err) });
    }
  }

  return NextResponse.json({ processed: subs.length, results });
}
