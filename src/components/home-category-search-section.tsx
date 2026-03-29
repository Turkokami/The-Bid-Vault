"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { buttonStyles } from "@/components/ui/button";
import {
  categoryCodeRecords,
  mapServicePhraseToSuggestedCategories,
} from "@/lib/category-codes";
import { readSavedCategoryCodeIds, saveCategoryCodeId } from "@/lib/demo-category-store";

const suggestedSearches = [
  "pest control",
  "rodent control",
  "bird exclusion",
  "grounds maintenance",
  "janitorial",
];

export function HomeCategorySearchSection() {
  const [query, setQuery] = useState("pest control");
  const [savedCount, setSavedCount] = useState(0);

  useEffect(() => {
    const sync = () => setSavedCount(readSavedCategoryCodeIds().length);
    sync();
    window.addEventListener("bid-vault-category-codes-updated", sync);
    return () => window.removeEventListener("bid-vault-category-codes-updated", sync);
  }, []);

  const matches = useMemo(
    () => mapServicePhraseToSuggestedCategories(query, categoryCodeRecords).slice(0, 6),
    [query],
  );

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_0_30px_rgba(34,197,94,0.08)] backdrop-blur">
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-5">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">
              Work category search
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-white">
              Find the category codes that match the work you do.
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Start with plain words like pest control, landscaping, or janitorial. We&apos;ll suggest the work categories that best fit your business.
            </p>
          </div>

          <label className="block space-y-2 text-sm text-slate-200">
            <span>What type of work does your business do?</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Example: pest control"
              className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-emerald-400/40"
            />
          </label>

          <div>
            <p className="text-sm text-slate-400">Try one of these</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {suggestedSearches.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setQuery(suggestion)}
                  className={buttonStyles({ variant: "ghost", size: "sm" })}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-emerald-400/20 bg-emerald-400/10 p-4">
            <p className="text-sm text-emerald-50/90">
              These categories help us find matching contract opportunities for you.
            </p>
            <p className="mt-2 text-sm font-medium text-white">{savedCount} codes saved so far</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-white">Suggested matches</p>
              <p className="mt-1 text-sm text-slate-400">
                Save the codes that best describe your services, then open the full category search when you want more detail.
              </p>
            </div>
            <Link href="/categories" className={buttonStyles({ variant: "secondary", size: "sm" })}>
              Open full category search
            </Link>
          </div>

          <div className="space-y-3">
            {matches.map((record) => (
              <article
                key={record.id}
                className="rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-4"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-100">
                        {record.code}
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                        {record.sourceName}
                      </span>
                    </div>
                    <Link
                      href={`/categories/${record.id}`}
                      className="mt-3 block text-lg font-semibold text-white transition hover:text-emerald-200"
                    >
                      {record.title}
                    </Link>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{record.description}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => saveCategoryCodeId(record.id)}
                    className={buttonStyles({ variant: "primary", size: "sm" })}
                  >
                    Save code
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
