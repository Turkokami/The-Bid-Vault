import Link from "next/link";
import { ContractsClient } from "@/components/contracts-client";
import { DemoResetButton } from "@/components/demo-reset-button";
import { getContractsIndex } from "@/lib/server/contracts";

type ContractsPageProps = {
  searchParams?: Promise<{
    keywords?: string;
    naics?: string;
    agency?: string;
    state?: string;
    industry?: string;
  }>;
};

export default async function ContractsPage({ searchParams }: ContractsPageProps) {
  const params = (await searchParams) ?? {};
  const keywords = (params.keywords ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const contractsIndex = await getContractsIndex({
    keywords,
    naics: params.naics,
    agency: params.agency,
    state: params.state,
  });

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-5 rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_0_30px_rgba(34,197,94,0.08)] backdrop-blur md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">
            Contracts
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">
            Centralized contract visibility by tenant.
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
            Search supports multiple tracked keywords at once, alongside NAICS,
            agency, and state filters, so teams can monitor contract language
            instead of relying on one exact phrase.
          </p>
        </div>

        <Link
          href="/contracts/new"
          className="rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
        >
          Add contract
        </Link>
      </section>

      <DemoResetButton />

      <ContractsClient
        initialContracts={contractsIndex.contracts}
        tenants={contractsIndex.tenants}
        initialKeywords={keywords}
        initialNaics={params.naics}
        initialAgency={params.agency}
        initialState={params.state}
        initialIndustry={params.industry}
        mode={contractsIndex.mode}
      />
    </div>
  );
}
