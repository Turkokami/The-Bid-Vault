import { NextResponse } from "next/server";
import { getStateLocalSyncSnapshot } from "@/lib/sources/sync-state-local";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const snapshot = await getStateLocalSyncSnapshot();
    return NextResponse.json(snapshot);
  } catch {
    return NextResponse.json(
      {
        opportunities: [],
        syncLogs: [],
        sources: [],
        errorMessage: "WEBS could not load live records right now. Please try again.",
      },
      { status: 200 },
    );
  }
}
