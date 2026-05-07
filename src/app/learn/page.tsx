import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";

const guideSteps = [
  {
    title: "1. Find a contract that fits your work",
    description:
      "Start with what your business does. Search by service type, state, or saved codes instead of trying to memorize government jargon first.",
  },
  {
    title: "2. Read the opportunity carefully",
    description:
      "Check the due date, required forms, set-aside type, work location, insurance, bonding, and any site visit instructions.",
  },
  {
    title: "3. Match your business to the right codes",
    description:
      "Use NAICS and service category codes to improve your search results and make sure you are chasing contracts that actually fit your services.",
  },
  {
    title: "4. Review attachments before you write",
    description:
      "The important details are often inside the attachments, not just the listing summary. That is where scope, pricing sheets, and instructions usually live.",
  },
  {
    title: "5. Build your response around requirements",
    description:
      "Your bid should answer the requirements directly. If the contract asks for certifications, staffing, timeline, pricing, or references, make sure each one is covered.",
  },
  {
    title: "6. Submit before the deadline",
    description:
      "Government deadlines are strict. Build in time for uploads, signatures, forms, and any last-minute portal issues.",
  },
];

const beginnerTopics = [
  {
    title: "What is a government bid?",
    description:
      "A government bid is your response to a public request for services, products, or construction work from a federal, state, county, or city buyer.",
  },
  {
    title: "Can small businesses really win?",
    description:
      "Yes. Many contracts are reserved for small businesses or special groups such as veteran-owned, women-owned, HUBZone, and 8(a) businesses.",
  },
  {
    title: "What should I learn first?",
    description:
      "Focus on four things first: where to search, which codes fit your business, what the contract requires, and how to submit on time.",
  },
];

const setAsidePrograms = [
  "Small business set-asides",
  "Veteran-owned and service-disabled veteran-owned",
  "Women-owned small business",
  "8(a) Business Development",
  "HUBZone",
];

export default function LearnPage() {
  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_0_30px_rgba(34,197,94,0.08)] backdrop-blur">
        <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">
          Learn Government Bidding
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">
          A simple training page for people who are brand new to government bids.
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
          This guide turns the basics of government bidding into plain English. The goal is to
          help someone understand the process in a few minutes, then move directly into search,
          code matching, document review, and bid building.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/sam-search" className={buttonStyles({ variant: "primary", size: "sm" })}>
            Start searching contracts
          </Link>
          <Link href="/categories" className={buttonStyles({ variant: "secondary", size: "sm" })}>
            Find my codes
          </Link>
          <Link href="/bid-builder" className={buttonStyles({ variant: "ghost", size: "sm" })}>
            Open bid builder
          </Link>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_360px]">
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6">
          <p className="text-xs uppercase tracking-[0.25em] text-emerald-300/80">Bidding 101</p>
          <div className="mt-5 space-y-4">
            {beginnerTopics.map((topic) => (
              <div key={topic.title} className="rounded-[1.25rem] border border-white/10 bg-white/5 p-5">
                <p className="text-lg font-semibold text-white">{topic.title}</p>
                <p className="mt-2 text-sm leading-7 text-slate-300">{topic.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-emerald-400/20 bg-emerald-400/10 p-6">
          <p className="text-xs uppercase tracking-[0.25em] text-emerald-200">Common programs</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Set-asides you may qualify for</h2>
          <p className="mt-3 text-sm leading-6 text-emerald-50/90">
            These are common contracting groups that can narrow the field and create better-fit opportunities.
          </p>
          <ul className="mt-5 space-y-3 text-sm text-white">
            {setAsidePrograms.map((program) => (
              <li key={program} className="rounded-[1rem] border border-emerald-400/15 bg-black/20 px-4 py-3">
                {program}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6">
        <p className="text-xs uppercase tracking-[0.25em] text-emerald-300/80">How the process works</p>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {guideSteps.map((step) => (
            <div key={step.title} className="rounded-[1.25rem] border border-white/10 bg-white/5 p-5">
              <p className="text-lg font-semibold text-white">{step.title}</p>
              <p className="mt-2 text-sm leading-7 text-slate-300">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <Link
          href="/state-local"
          className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6 transition hover:border-emerald-400/30 hover:bg-emerald-400/5"
        >
          <p className="text-xl font-semibold text-white">Search by state</p>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            Look for state, county, and city opportunities near your service area.
          </p>
        </Link>
        <Link
          href="/attachments/review"
          className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6 transition hover:border-emerald-400/30 hover:bg-emerald-400/5"
        >
          <p className="text-xl font-semibold text-white">Review attachments</p>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            Pull out deadlines, forms, scope details, pricing sheets, and requirements before you bid.
          </p>
        </Link>
        <Link
          href="/research"
          className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6 transition hover:border-emerald-400/30 hover:bg-emerald-400/5"
        >
          <p className="text-xl font-semibold text-white">Open research tools</p>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            Move into award history, FOIA planning, code search, and bid building from one place.
          </p>
        </Link>
      </section>
    </div>
  );
}
