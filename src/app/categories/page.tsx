import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";

export default function CategoriesPage() {
  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-5 rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_0_30px_rgba(34,197,94,0.08)] backdrop-blur md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">
            Work Category Search
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">
            Find category codes by plain English, not just by code numbers.
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
            Search what your business does, explore nearby service categories, and save the codes that best fit your work.
          </p>
          <p className="mt-3 text-sm text-emerald-200/90">
            Includes the broader WEBS / NIGP commodity code library plus Bid Vault trade mappings to make searches easier for real contractors.
          </p>
        </div>

        <Link href="/categories/search" className={buttonStyles({ variant: "primary", size: "lg" })}>
          Open category search
        </Link>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <article className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-6">
          <p className="text-xs uppercase tracking-[0.25em] text-emerald-300/80">How to use this</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">
            Start with what your business does, then narrow the code list only when you need to.
          </h2>
          <ul className="mt-5 space-y-3 text-sm leading-7 text-slate-300">
            <li>Search by plain words like plumbing, electrical, pest control, or janitorial.</li>
            <li>Save the codes that fit your work so you can reuse them in SAM and state searches.</li>
            <li>Use the full category search page when you want deeper filtering by source and family.</li>
          </ul>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/categories/search?query=plumbing" className={buttonStyles({ variant: "secondary", size: "md" })}>
              Try plumbing
            </Link>
            <Link href="/categories/search?query=pest%20control" className={buttonStyles({ variant: "ghost", size: "md" })}>
              Try pest control
            </Link>
          </div>
        </article>

        <article className="rounded-[1.75rem] border border-emerald-400/20 bg-emerald-400/10 p-6">
          <p className="text-xs uppercase tracking-[0.25em] text-emerald-200">Keep it simple</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Use saved codes across the rest of the app.</h2>
          <p className="mt-3 text-sm leading-7 text-emerald-50/90">
            Once you save the right categories, they can power contract search, state and local matching, alerts, and your saved business profile.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/my-codes" className={buttonStyles({ variant: "secondary", size: "md" })}>
              Open My Codes
            </Link>
            <Link href="/learn" className={buttonStyles({ variant: "ghost", size: "md" })}>
              Learn how codes work
            </Link>
          </div>
        </article>
      </section>
    </div>
  );
}
