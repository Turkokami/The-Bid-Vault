import Image from "next/image";
import { GovernmentDataClient } from "@/components/government-data-client";
import { getSamSearchSnapshot } from "@/lib/server/sam-search";

type GovernmentDataPageProps = {
  searchParams?: Promise<{
    keywords?: string;
    naics?: string;
    agency?: string;
    state?: string;
    industry?: string;
    status?: "all" | "available" | "closing-soon" | "needs-review";
    sort?: "due-soon" | "newest" | "agency" | "title";
  }>;
};

export default async function GovernmentDataPage({
  searchParams,
}: GovernmentDataPageProps) {
  const snapshot = await getSamSearchSnapshot();
  const params = (await searchParams) ?? {};
  const keywords = (params.keywords ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_0_30px_rgba(34,197,94,0.08)] backdrop-blur">
        <div className="mb-5 flex items-center gap-4">
          <div className="relative h-16 w-16 overflow-hidden rounded-[1.5rem] border border-emerald-400/30 bg-black/40">
            <Image
              src="/bid-vault-logo.png"
              alt="The Bid Vault logo"
              fill
              sizes="64px"
              className="object-contain p-1.5"
            />
          </div>
          <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-emerald-200">
            Federal source search
          </div>
        </div>
        <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">
          SAM Search
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">
          Search federal opportunities in a cleaner SAM-style view.
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
          Search federal opportunity records, use plain-English filters, and jump into a specific posting without wading through the full SAM.gov interface.
        </p>
      </section>

      <GovernmentDataClient
        initialRecords={snapshot.records}
        initialSources={snapshot.sources}
        initialActivities={snapshot.activities}
        initialKeywords={keywords}
        initialNaics={params.naics}
        initialAgency={params.agency}
        initialState={params.state}
        initialIndustry={params.industry}
        initialStatus={params.status}
        initialSort={params.sort}
        initialErrorMessage={snapshot.errorMessage}
        liveConfigured={snapshot.liveConfigured}
      />
    </div>
  );
}
