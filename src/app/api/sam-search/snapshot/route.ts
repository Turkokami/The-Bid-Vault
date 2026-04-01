import { NextResponse } from "next/server";
import { getSamSearchSnapshot } from "@/lib/server/sam-search";

export async function GET() {
  const snapshot = await getSamSearchSnapshot();
  return NextResponse.json(snapshot);
}

