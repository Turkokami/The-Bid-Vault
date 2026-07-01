import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// One-click unsubscribe from email footer link
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return new NextResponse("Invalid unsubscribe link.", { status: 400, headers: { "Content-Type": "text/plain" } });
  }

  await db.opportunityAlertSubscription.updateMany({
    where: { id },
    data: { active: false },
  });

  return new NextResponse(
    `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Unsubscribed</title></head>
    <body style="font-family:sans-serif;background:#0b1324;color:#f1f5f9;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;">
      <div style="text-align:center;padding:32px;">
        <p style="font-size:24px;font-weight:700;">You've been unsubscribed.</p>
        <p style="color:#94a3b8;margin-top:8px;">You won't receive any more alerts for this rule.</p>
        <a href="/" style="display:inline-block;margin-top:24px;background:#059669;color:#fff;text-decoration:none;padding:12px 24px;border-radius:999px;font-size:14px;">Back to The Bid Vault</a>
      </div>
    </body></html>`,
    { status: 200, headers: { "Content-Type": "text/html" } },
  );
}
