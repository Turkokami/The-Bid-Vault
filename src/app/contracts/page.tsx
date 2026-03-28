import Link from "next/link";
import { ContractsClient } from "@/components/contracts-client";
import { DemoResetButton } from "@/components/demo-reset-button";
import { buttonStyles } from "@/components/ui/button";
import { getContractsIndex } from "@/lib/server/contracts";

function readParam(value?: string | string[]) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function readArray(value?: string | string[]) {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  return value ? [value] : [];
}

type ContractsPageProps = {
  searchParams?: Promise<{
    anyWords?: string | string[];
    allWords?: string | string[];
    exactPhrase?: string | string[];
    status?: string | string[];
    noticeType?: string | string[];
    department?: string | string[];
    subTier?: string | string[];
    office?: string | string[];
    state?: string | string[];
    place?: string | string[];
    naics?: string | string[];
    psc?: string | string[];
    setAside?: string | string[];
    postedFrom?: string | string[];
    postedTo?: string | string[];
    responseFrom?: string | string[];
    responseTo?: string | string[];
    updatedFrom?: string | string[];
    updatedTo?: string | string[];
    sort?: string | string[];
    page?: string | string[];
  }>;
};

export default async function ContractsPage({ searchParams }: ContractsPageProps) {
  const params = (await searchParams) ?? {};
  const contractsIndex = await getContractsIndex();

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-5 rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_0_30px_rgba(34,197,94,0.08)] backdrop-blur md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">
            Contracts
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">
            Find government contracts that match your business.
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
            Start by typing what your business does. We&apos;ll help you find matching government contracts and narrow the list with simple filters.
          </p>
        </div>

        <Link
          href="/contracts/new"
          className={buttonStyles({ variant: "primary", size: "lg" })}
        >
          Save a new opportunity
        </Link>
      </section>

      <DemoResetButton />

      <ContractsClient
        initialContracts={contractsIndex.contracts}
        tenants={contractsIndex.tenants}
        initialFilters={{
          anyWords: readParam(params.anyWords),
          allWords: readParam(params.allWords),
          exactPhrase: readParam(params.exactPhrase),
          statuses: readArray(params.status),
          noticeTypes: readArray(params.noticeType),
          departments: readArray(params.department),
          subTiers: readArray(params.subTier),
          offices: readArray(params.office),
          states: readArray(params.state),
          places: readArray(params.place),
          naicsCodes: readArray(params.naics),
          pscCodes: readArray(params.psc),
          setAsides: readArray(params.setAside),
          postedFrom: readParam(params.postedFrom),
          postedTo: readParam(params.postedTo),
          responseFrom: readParam(params.responseFrom),
          responseTo: readParam(params.responseTo),
          updatedFrom: readParam(params.updatedFrom),
          updatedTo: readParam(params.updatedTo),
          sortBy: readParam(params.sort) === "relevance" ? "relevance" : "date",
          page: Number(readParam(params.page) || "1"),
        }}
        mode={contractsIndex.mode}
      />
    </div>
  );
}
