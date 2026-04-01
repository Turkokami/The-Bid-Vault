import { NextResponse } from "next/server";
import { getStateLocalSyncSnapshot } from "@/lib/sources/sync-state-local";

export async function GET() {
  const snapshot = await getStateLocalSyncSnapshot();
  return NextResponse.json(snapshot);
}

