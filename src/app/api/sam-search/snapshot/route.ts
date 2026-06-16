import { NextResponse } from "next/server";
import { getSamSearchSnapshot } from "@/lib/server/sam-search";

export const dynamic = "force-static";

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
    setAside:
      (searchParams.get("setAside") as
        | "all"
        | "small-business"
        | "veteran"
        | "women-owned"
        | "8a"
        | "hubzone"
        | "minority"
        | "unrestricted"
        | null) ?? "all",
    valueBand:
      (searchParams.get("valueBand") as
        | "all"
        | "under-250k"
        | "under-1m"
        | "1m-10m"
        | "over-10m"
        | null) ?? "all",
    browseAll: searchParams.get("browse") === "1",
  });
  return NextResponse.json(snapshot);
}
