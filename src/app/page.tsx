import Image from "next/image";
import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";

const quickStats = [
  { label: "Tracked contracts", value: "8,420", href: "/sam-search" },
  { label: "Award records", value: "$196M", href: "/contracts" },
  { label: "Predicted rebids", value: "312", href: "/dashboard" },
];

const featureList = [
  { icon: "🔍", text: "Search live federal contracts on SAM.gov by keyword, NAICS code, or agency" },
  { icon: "🏛️", text: "Browse state & local bids from 40+ portals across the US" },
  { icon: "📄", text: "Build a professional bid response with AI-generated sections and PDF export" },
  { icon: "🔔", text: "Save contracts to your watchlist and get alerts before deadlines" },
  { icon: "📈", text: "See historical award winners, pricing patterns, and rebid windows" },
];

export default function Home() {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="rounded-[2rem] border border-white/10 bg-white/6 p-8 shadow-[0_0_40px_rgba(34,197,94,0.10)] backdrop-blur md:p-10">
        <div className="mb-6 flex items-center gap-4">
          <div className="relative h-16 w-16 overflow-hidden rounded-[1.75rem] border border-emerald-400/30 bg-black/50 shadow-[0_0_30px_rgba(74,222,128,0.18)]">
            <Image
              src="/bid-vault-logo.png"
              alt="The Bid Vault logo"
              fill
              sizes="64px"
              className="object-contain p-2"
              priority
            />
          </div>
          <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs uppercase tracking-[0.35em] text-emerald-200">
            Contract acquisition intelligence
          </div>
        </div>

        <h1 className="mt-2 max-w-4xl text-3xl font-semibold tracking-[-0.04em] text-white sm:text-5xl md:text-6xl">
          Win more contracts without paying finder fees.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
          The Bid Vault brings federal, state, and local contract discovery into one workspace — with AI bid building, award history, and deadline tracking.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/sam-search" className={buttonStyles({ variant: "primary", size: "lg" })}>
            Start searching
          </Link>
          <Link href="/dashboard" className={buttonStyles({ variant: "secondary", size: "lg" })}>
            My dashboard
          </Link>
        </div>

        {/* Clickable stats */}
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {quickStats.map((stat) => (
            <Link
              key={stat.label}
              href={stat.href}
              className="group rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-4 transition hover:border-emerald-400/30 hover:bg-emerald-400/[0.04]"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                {stat.label}
              </p>
              <p className="mt-2 text-2xl font-semibold text-emerald-300 group-hover:text-emerald-200">
                {stat.value}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* What you can do */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">What&apos;s inside</p>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white">
            Everything a contractor needs in one place
          </h2>
          <ul className="mt-6 space-y-3">
            {featureList.map((item) => (
              <li key={item.text} className="flex items-start gap-3 text-sm leading-7 text-slate-200">
                <span className="mt-0.5 shrink-0 text-base">{item.icon}</span>
                {item.text}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-4">
          <Link
            href="/sam-search"
            className="group flex flex-1 flex-col justify-between rounded-[2rem] border border-emerald-400/20 bg-emerald-400/[0.06] p-8 transition hover:border-emerald-400/40 hover:bg-emerald-400/[0.10]"
          >
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">Federal</p>
              <h3 className="mt-3 text-xl font-semibold text-white">Search SAM.gov live</h3>
              <p className="mt-2 text-sm leading-7 text-slate-300">
                Pull real contracts directly from SAM.gov using keyword, NAICS, agency, or location filters.
              </p>
            </div>
            <span className="mt-4 text-sm font-medium text-emerald-300 group-hover:text-emerald-200">Open SAM Search →</span>
          </Link>

          <Link
            href="/state-local"
            className="group flex flex-1 flex-col justify-between rounded-[2rem] border border-white/10 bg-white/5 p-8 transition hover:border-emerald-400/20 hover:bg-emerald-400/[0.04]"
          >
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">State & Local</p>
              <h3 className="mt-3 text-xl font-semibold text-white">Browse 40+ state portals</h3>
              <p className="mt-2 text-sm leading-7 text-slate-300">
                WA, TX, GA, FL, OR, PA and dozens more — all in one search view.
              </p>
            </div>
            <span className="mt-4 text-sm font-medium text-emerald-300 group-hover:text-emerald-200">Open State & Local →</span>
          </Link>

          <Link
            href="/bid-builder"
            className="group flex flex-1 flex-col justify-between rounded-[2rem] border border-white/10 bg-white/5 p-8 transition hover:border-emerald-400/20 hover:bg-emerald-400/[0.04]"
          >
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">Bid Builder</p>
              <h3 className="mt-3 text-xl font-semibold text-white">AI-powered bid writing</h3>
              <p className="mt-2 text-sm leading-7 text-slate-300">
                Generate cover letters, technical approaches, and full proposals. Download as PDF.
              </p>
            </div>
            <span className="mt-4 text-sm font-medium text-emerald-300 group-hover:text-emerald-200">Open Bid Builder →</span>
          </Link>
        </div>
      </section>

      {/* Training CTA */}
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">New to government contracting?</p>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white">
              Learn how to find and win bids
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Step-by-step training on reading solicitations, matching NAICS codes, and building a winning response — no jargon.
            </p>
          </div>
          <Link href="/learn" className={buttonStyles({ variant: "primary", size: "lg" })}>
            Open training guide
          </Link>
        </div>
      </section>
    </div>
  );
}
