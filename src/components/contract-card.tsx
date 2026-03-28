import Link from "next/link";
import { InfoTip } from "@/components/info-tip";
import { buttonStyles } from "@/components/ui/button";
import { describeNoticeType } from "@/lib/plain-language";
import type { ContractSearchRecord } from "@/lib/contracts-search";

export function ContractCard({ contract }: { contract: ContractSearchRecord }) {
  const statusClasses =
    contract.status === "Active"
      ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-100"
      : "border-white/10 bg-white/5 text-slate-300";

  const noticeClasses =
    contract.noticeType === "Solicitation" || contract.noticeType === "Sources Sought"
      ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-100"
      : "border-white/10 bg-white/5 text-slate-200";

  return (
    <article className="rounded-[1.75rem] border border-white/10 bg-slate-950/75 p-5 shadow-[0_12px_30px_rgba(0,0,0,0.24)] transition hover:border-emerald-400/25 hover:bg-slate-950/90">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusClasses}`}>
              {contract.status}
            </span>
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${noticeClasses}`}>
              {describeNoticeType(contract.noticeType)}
            </span>
            <span className="text-xs uppercase tracking-[0.22em] text-slate-500">
              {contract.noticeId}
            </span>
          </div>

          <Link
            href={`/contracts/${contract.id}`}
            className="mt-4 block text-2xl font-semibold tracking-tight text-white transition hover:text-emerald-200"
          >
            {contract.title}
          </Link>

          <p className="mt-3 text-sm leading-7 text-slate-300">{contract.summary}</p>
        </div>

        <Link
          href={`/contracts/${contract.id}`}
          className={buttonStyles({ variant: "secondary", size: "sm" })}
        >
          See details
        </Link>
      </div>

      <div className="mt-5 grid gap-4 text-sm text-slate-300 md:grid-cols-2 xl:grid-cols-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Government agency</p>
          <p className="mt-2 text-white">{contract.department}</p>
          <p className="mt-1 text-slate-400">{contract.subTier}</p>
          <p className="mt-1 text-slate-500">{contract.office}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Work type</p>
          <p className="mt-2 flex items-center gap-2 text-white">
            Industry Type (NAICS Code) {contract.naicsCode}
            <InfoTip>This is the industry classification the government uses to describe the type of work.</InfoTip>
          </p>
          <p className="mt-1 flex items-center gap-2 text-slate-400">
            Service Category (PSC Code) {contract.pscCode}
            <InfoTip>This describes the specific type of service or product the contract is for.</InfoTip>
          </p>
          <p className="mt-1 text-slate-500">Reserved for Small Businesses? {contract.setAsideType}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Work location</p>
          <p className="mt-2 text-white">{contract.state}</p>
          <p className="mt-1 text-slate-400">{contract.placeOfPerformance}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Important dates</p>
          <p className="mt-2 flex items-center gap-2 text-white">
            Response deadline {contract.responseDueDate}
            <InfoTip>This is the deadline to submit your bid or response.</InfoTip>
          </p>
          <p className="mt-1 text-slate-400">Posted {contract.postedDate}</p>
          <p className="mt-1 text-slate-500">Updated {contract.updatedDate}</p>
        </div>
      </div>
    </article>
  );
}
