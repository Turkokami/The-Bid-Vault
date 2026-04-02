import { NextResponse } from "next/server";
import { getSamSearchSnapshot } from "@/lib/server/sam-search";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const snapshot = await getSamSearchSnapshot({
    keywords: (searchParams.get("keywords") ?? "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    keywordMode:
      (searchParams.get("keywordMode") as "all" | "any" | "exact" | null) ?? "all",
    naics: searchParams.get("naics") ?? undefined,
    agency: searchParams.get("agency") ?? undefined,
    state: searchParams.get("state") ?? undefined,
    industry: searchParams.get("industry") ?? undefined,
    status:
      (searchParams.get("status") as
        | "all"
        | "available"
        | "closing-soon"
        | "needs-review"
        | null) ?? "all",
    sort:
      (searchParams.get("sort") as
        | "due-soon"
        | "newest"
        | "agency"
        | "title"
        | null) ?? "due-soon",
  });
  return NextResponse.json(snapshot);
}
