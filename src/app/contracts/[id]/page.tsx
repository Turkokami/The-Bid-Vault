import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SavePlanningForm } from "@/app/contracts/[id]/save-planning-form";
import { ContractDetailLayout } from "@/components/contract-detail-layout";
import { InfoTip } from "@/components/info-tip";
import { buttonStyles } from "@/components/ui/button";
import { enrichContract } from "@/lib/contracts-search";
import { formatCurrency, formatPercent } from "@/lib/format";
import { describeNoticeType } from "@/lib/plain-language";
import { getContractDetail } from "@/lib/server/contracts";

export default async function ContractDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getContractDetail(id);
  const contract = result.contract;

  if (!contract) {
    notFound();
  }

  const enriched = enrichContract(contract);

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
            Opportunity details
          </div>
        </div>
        <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">
          Contract details
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">
          {enriched.title}
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
          This page shows everything you need to decide if this contract is worth pursuing. {enriched.summary}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-100">
            {enriched.status}
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-200">
            {describeNoticeType(enriched.noticeType)}
          </span>
          <span className="text-xs uppercase tracking-[0.25em] text-slate-500">{enriched.noticeId}</span>
        </div>
      </section>

      <ContractDetailLayout
        links={[
          { id: "overview", label: "Quick facts" },
          { id: "classification", label: "Work type" },
          { id: "description", label: "What the work is" },
          { id: "contacts", label: "Who to contact" },
          { id: "attachments", label: "Files and helpful links" },
        ]}
      >
        <section id="overview" className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6">
          <div className="grid gap-5 lg:grid-cols-4">
            {[
              { label: "Notice ID", value: enriched.noticeId },
              { label: "Posted", value: enriched.postedDate },
              { label: "Updated", value: enriched.updatedDate },
              { label: "Response deadline", value: enriched.responseDueDate },
            ].map((item) => (
              <article key={item.label} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-slate-400">{item.label}</p>
                <p className="mt-3 text-lg font-semibold text-white">{item.value}</p>
              </article>
            ))}
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <article className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
              <h2 className="text-xl font-semibold text-white">Government office details</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                This tells you which government team owns the opportunity.
              </p>
              <dl className="mt-5 grid gap-4 text-sm text-slate-300 md:grid-cols-2">
                <div>
                  <dt className="text-slate-500">Government agency</dt>
                  <dd className="mt-1 text-white">{enriched.department}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Department</dt>
                  <dd className="mt-1 text-white">{enriched.subTier}</dd>
                </div>
                <div className="md:col-span-2">
                  <dt className="text-slate-500">Office</dt>
                  <dd className="mt-1 text-white">{enriched.office}</dd>
                </div>
              </dl>
            </article>

            <article className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
              <h2 className="text-xl font-semibold text-white">Previous award details</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Use this to see who won before, how much the contract was worth, and when it may come back out to bid.
              </p>
              <div className="mt-5 space-y-3 text-sm text-slate-300">
                <p><span className="text-slate-500">Winning bid:</span> <span className="text-white">{contract.winningBid?.companyName}</span></p>
                <p><span className="text-slate-500">Award value:</span> <span className="text-white">{formatCurrency(contract.winningBid?.bidAmount ?? contract.awardAmount)}</span></p>
                <p><span className="text-slate-500">Confidence:</span> <span className="text-emerald-300">{formatPercent(contract.confidenceScore)}</span></p>
                <p><span className="text-slate-500">Predicted rebid:</span> <span className="text-white">{contract.predictedRebidDate}</span></p>
              </div>
            </article>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <Link
              href={`/contracts?anyWords=${encodeURIComponent(contract.keyTerms.join(" "))}&naics=${encodeURIComponent(enriched.naicsCode)}`}
              className={buttonStyles({ variant: "secondary", size: "lg", className: "rounded-[1.5rem] justify-center px-5 py-4" })}
            >
              Compare similar contracts
            </Link>
            <Link
              href={`/bids?keywords=${encodeURIComponent(enriched.naicsCode)}&contractId=${encodeURIComponent(contract.id)}`}
              className={buttonStyles({ variant: "ghost", size: "lg", className: "rounded-[1.5rem] justify-center px-5 py-4" })}
            >
              See previous winning bids
            </Link>
            <Link
              href={`/foia?agency=${encodeURIComponent(enriched.department)}&facility=${encodeURIComponent(enriched.title)}&location=${encodeURIComponent(enriched.location)}&industry=${encodeURIComponent(enriched.naicsCode)}`}
              className={buttonStyles({ variant: "ghost", size: "lg", className: "rounded-[1.5rem] justify-center px-5 py-4" })}
            >
              Start a FOIA request
            </Link>
            <Link
              href={contract.tenant ? `/tenants/${contract.tenant.slug}` : "/dashboard"}
              className={buttonStyles({ variant: "ghost", size: "lg", className: "rounded-[1.5rem] justify-center px-5 py-4" })}
            >
              {contract.tenant ? "View workspace" : "Open dashboard"}
            </Link>
          </div>
        </section>

        <section id="classification" className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold text-white">Work type</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            These labels help you understand what kind of work this opportunity covers.
          </p>
          <dl className="mt-5 grid gap-4 text-sm text-slate-300 md:grid-cols-2 xl:grid-cols-4">
            <div>
              <dt className="flex items-center gap-2 text-slate-500">Industry Type (NAICS Code) <InfoTip>This is the industry classification the government uses to describe the type of work.</InfoTip></dt>
              <dd className="mt-1 text-white">{enriched.naicsCode}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-2 text-slate-500">Service Category (PSC Code) <InfoTip>This describes the specific type of service or product the contract is for.</InfoTip></dt>
              <dd className="mt-1 text-white">{enriched.pscCode}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-2 text-slate-500">Reserved for Small Businesses? <InfoTip>This shows whether the government limited this opportunity to certain business types.</InfoTip></dt>
              <dd className="mt-1 text-white">{enriched.setAsideType}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-2 text-slate-500">Work location <InfoTip>This is where the work will be done.</InfoTip></dt>
              <dd className="mt-1 text-white">{enriched.placeOfPerformance}</dd>
            </div>
          </dl>
        </section>

        <section id="description" className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6">
          <h2 className="text-xl font-semibold text-white">What the work is</h2>
          <div className="mt-5 space-y-4 text-sm leading-7 text-slate-300">
            <p>{enriched.summary}</p>
            <p>
              This opportunity is tied to {enriched.office}. The record suggests work that fits industry type {enriched.naicsCode}, so it is worth checking along with the past award details, work location, and likely rebid timing.
            </p>
          </div>
        </section>

        <section id="contacts" className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold text-white">Who to contact</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            These are the people most likely to answer questions about the opportunity.
          </p>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {[enriched.primaryContact, enriched.secondaryContact].map((contact, index) => (
              <article key={contact.email} className="rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-5">
                <p className="text-xs uppercase tracking-[0.22em] text-emerald-300/80">
                  {index === 0 ? "Main contact" : "Backup contact"}
                </p>
                <p className="mt-3 text-lg font-semibold text-white">{contact.name}</p>
                <p className="mt-2 text-sm text-slate-300">{contact.email}</p>
                <p className="mt-1 text-sm text-slate-400">{contact.phone}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="attachments" className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6">
          <h2 className="text-xl font-semibold text-white">Files and helpful links</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Open the source files, related records, and next-step tools for this opportunity.
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {enriched.attachments.map((attachment) => (
              <Link
                key={attachment.label}
                href={attachment.href}
                className={buttonStyles({ variant: "ghost", size: "lg", className: "justify-start rounded-[1.5rem] px-5 py-4" })}
              >
                {attachment.label}
              </Link>
            ))}
          </div>

          <div className="mt-6 rounded-[1.5rem] border border-emerald-400/20 bg-emerald-400/10 p-5">
            <h3 className="text-lg font-semibold text-white">Add to watchlist and planning</h3>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-emerald-50/90">
              Save this opportunity so you can track dates, plan ahead, and get back to it later.
            </p>
            <div className="mt-5 max-w-2xl">
              <SavePlanningForm contractId={contract.id} />
            </div>
          </div>
        </section>
      </ContractDetailLayout>
    </div>
  );
}
