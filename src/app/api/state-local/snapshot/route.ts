import { NextResponse } from "next/server";
import { getStateLocalSyncSnapshot } from "@/lib/sources/sync-state-local";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const refresh = new URL(request.url).searchParams.get("refresh") === "1";
    const snapshot = await getStateLocalSyncSnapshot({ forceRefresh: refresh });
    return NextResponse.json(snapshot);
  } catch {
    return NextResponse.json(
      {
        opportunities: [],
        syncLogs: [
          {
            id: "state-local-api-fallback",
            sourceName: "State & Local Sources",
            sourceCode: "washington",
            syncStatus: "Failed",
            lastRunAt: new Date().toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
              timeZoneName: "short",
            }),
            recordsAdded: 0,
            recordsUpdated: 0,
            errorMessage: "State and local sources could not load live records right now.",
            notes:
              "The page is still available, and direct portal links should still work while the live refresh is unavailable.",
          },
        ],
        sources: [
          {
            id: "source-state-local-fallback",
            sourceCode: "washington",
            sourceName: "WEBS",
            stateCode: "WA",
            status: "Connected",
            connectionMode: "portal-assisted",
            cadence: "Temporary fallback",
            description: "Washington's Electronic Business Solution for state and local opportunities.",
            helperText:
              "Live state and local source refresh is temporarily unavailable. You can still use direct portal links while the app retries later.",
            portalUrl: "https://pr-webs-vendor.des.wa.gov/BidCalendar.aspx",
            lastSyncedAt: "Temporary fallback active",
          },
        ],
        errorMessage: "State and local sources could not load live records right now. Please try again.",
      },
      { status: 200 },
    );
  }
}
