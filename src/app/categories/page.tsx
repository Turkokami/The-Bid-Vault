import Link from "next/link";
import { CategorySearchClient } from "@/components/category-search-client";
import { buttonStyles } from "@/components/ui/button";
import { categoryCodeRecords } from "@/lib/category-codes";

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

      <CategorySearchClient
        records={categoryCodeRecords}
        initialFilters={{
          query: "",
          exactCode: "",
          sources: [],
          families: [],
          letter: "",
        }}
      />
    </div>
  );
}
