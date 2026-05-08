import Image from "next/image";
import Link from "next/link";
import { HomeCategorySearchSection } from "@/components/home-category-search-section";
import { buttonStyles } from "@/components/ui/button";

const highlights = [
  "Track contracts across agencies, locations, and NAICS codes",
  "See historical award winners and pricing patterns",
  "Predict rebid windows before competitors move",
  "Search through uploaded government contract files to identify available opportunities",
  "Draft FOIA requests for prior facility budgets and planning records before new bids are released",
];

const quickStats = [
  { label: "Tracked contracts", value: "8,420" },
  { label: "Award records", value: "$196M" },
  { label: "Predicted rebids", value: "312" },
];

export default function Home() {
  return (
    <div className="space-y-10">
      <section className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/6 p-8 shadow-[0_0_40px_rgba(34,197,94,0.10)] backdrop-blur md:p-10">
          <div className="mb-6 flex items-center gap-4">
            <div className="relative h-20 w-20 overflow-hidden rounded-[1.75rem] border border-emerald-400/30 bg-black/50 shadow-[0_0_30px_rgba(74,222,128,0.18)]">
              <Image
                src="/bid-vault-logo.png"
                alt="The Bid Vault logo"
                fill
                sizes="80px"
                className="object-contain p-2"
                priority
              />
            </div>
            <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs uppercase tracking-[0.35em] text-emerald-200">
              Secure the lead. Own the margin.
            </div>
          </div>

          <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">
            Contract acquisition intelligence
          </p>
          <h1 className="mt-5 max-w-4xl text-5xl font-semibold tracking-[-0.04em] text-white md:text-7xl">
            Win more contracts without paying finder fees.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300">
            The Bid Vault brings contract discovery, award history, rebid
            prediction, and early alerts into one workspace built for
            contractors.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className={buttonStyles({ variant: "primary", size: "lg" })}
            >
              Enter dashboard
            </Link>
            <Link
              href="/contracts"
              className={buttonStyles({ variant: "secondary", size: "lg" })}
            >
              Browse contracts
            </Link>
            <Link
              href="/sam-search"
              className={buttonStyles({ variant: "ghost", size: "lg" })}
            >
              Open SAM Search
            </Link>
            <Link
              href="/foia"
              className={buttonStyles({ variant: "ghost", size: "lg" })}
            >
              Build FOIA request
            </Link>
          </div>

          <div className="mt-8 grid gap-3 md:grid-cols-3">
            {quickStats.map((stat) => (
              <article
                key={stat.label}
                className="rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-4"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  {stat.label}
                </p>
                <p className="mt-3 text-2xl font-semibold text-emerald-300">
                  {stat.value}
                </p>
              </article>
            ))}
          </div>
        </div>

        <aside className="rounded-[2rem] border border-emerald-400/20 bg-slate-950/80 p-8 shadow-[0_0_60px_rgba(34,197,94,0.12)]">
          <div className="mb-6 flex items-center gap-3 rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-4">
            <div className="relative h-14 w-14 overflow-hidden rounded-2xl border border-emerald-400/20 bg-black/40">
              <Image
                src="/bid-vault-logo.png"
                alt="The Bid Vault logo mark"
                fill
                sizes="56px"
                className="object-contain p-1.5"
              />
            </div>
            <p className="text-sm leading-7 text-slate-300">
              The platform is built to feel like a secure planning vault, not just another contract table.
            </p>
          </div>

          <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">
            What Phase 1 unlocks
          </p>
          <div className="mt-6 space-y-4">
            {highlights.map((item) => (
              <div
                key={item}
                className="rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-4 text-sm leading-7 text-slate-200"
              >
                {item}
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-[1.5rem] border border-emerald-400/20 bg-emerald-400/8 p-4 text-sm leading-7 text-slate-200">
            Tailwind, Prisma, seeding, and a reusable shell are now the base
            layer for the rest of the roadmap.
          </div>
        </aside>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_0_30px_rgba(34,197,94,0.08)] backdrop-blur">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">
              Learn how to win bids
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white md:text-4xl">
              Need help understanding how government contracts work?
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Open the training page for a simple walkthrough on how to find bids, read the requirements,
              match your business to the right codes, and build a response without getting buried in jargon.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/learn"
              className={buttonStyles({ variant: "primary", size: "lg" })}
            >
              Open training guide
            </Link>
            <Link
              href="/sam-search"
              className={buttonStyles({ variant: "secondary", size: "lg" })}
            >
              Search live contracts
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_0_30px_rgba(34,197,94,0.08)] backdrop-blur">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">
              Service plans
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white md:text-4xl">
              Need more support? Compare plans on the pricing page.
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              The homepage keeps things simple. When you are ready, open pricing
              to compare service plans, see what each option includes, and start
              a subscription.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/pricing"
              className={buttonStyles({ variant: "primary", size: "lg" })}
            >
              View service plans
            </Link>
            <Link
              href="/dashboard"
              className={buttonStyles({ variant: "secondary", size: "lg" })}
            >
              Keep exploring first
            </Link>
          </div>
        </div>
      </section>
      <HomeCategorySearchSection />
    </div>
  );
}
