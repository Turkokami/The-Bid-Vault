import Image from "next/image";
import { GovernmentDataClient } from "@/components/government-data-client";
import {
  dataSourceCoverage,
  extractedContractRecords,
  syncActivities,
  uploadedSourceDocuments,
} from "@/lib/demo-data";

type GovernmentDataPageProps = {
  searchParams?: Promise<{
    keywords?: string;
    naics?: string;
    agency?: string;
    state?: string;
  }>;
};

export default async function GovernmentDataPage({
  searchParams,
}: GovernmentDataPageProps) {
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
            Government file intake
          </div>
        </div>
        <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">
          Uploaded government data
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">
          Search contract opportunities from uploaded source files.
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
          Upload, parse, and review government contract records so teams can identify available
          opportunities before they get lost across spreadsheets and PDFs.
        </p>
      </section>

      <GovernmentDataClient
        initialDocuments={uploadedSourceDocuments}
        initialRecords={extractedContractRecords}
        initialSources={dataSourceCoverage}
        initialActivities={syncActivities}
        initialKeywords={keywords}
        initialNaics={params.naics}
        initialAgency={params.agency}
        initialState={params.state}
      />
    </div>
  );
}
