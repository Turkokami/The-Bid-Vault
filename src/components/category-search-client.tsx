"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CategoryCodeCard } from "@/components/category-code-card";
import { InfoTip } from "@/components/info-tip";
import { buttonStyles } from "@/components/ui/button";
import {
  buildCategoryFilterOptions,
  mapServicePhraseToSuggestedCategories,
  searchCategoryCodes,
  type CategoryCodeRecord,
  type CategorySearchFilters,
} from "@/lib/category-codes";
import { readSavedCategoryCodeIds } from "@/lib/demo-category-store";

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function toggleValue(values: string[], value: string) {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

export function CategorySearchClient({
  records,
  initialFilters,
}: {
  records: CategoryCodeRecord[];
  initialFilters: CategorySearchFilters;
}) {
  const [filters, setFilters] = useState(initialFilters);
  const [savedIds, setSavedIds] = useState<string[]>([]);

  useEffect(() => {
    const sync = () => setSavedIds(readSavedCategoryCodeIds());
    sync();
    window.addEventListener("bid-vault-category-codes-updated", sync);
    return () => window.removeEventListener("bid-vault-category-codes-updated", sync);
  }, []);

  const options = useMemo(() => buildCategoryFilterOptions(records), [records]);
  const results = useMemo(() => searchCategoryCodes(records, filters), [filters, records]);
  const suggestions = useMemo(
    () => mapServicePhraseToSuggestedCategories(filters.query, records),
    [filters.query, records],
  );
  const savedRecords = useMemo(
    () => records.filter((record) => savedIds.includes(record.id)),
    [records, savedIds],
  );

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_0_30px_rgba(34,197,94,0.08)] backdrop-blur">
        <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">
          Work Category / Commodity Code Search
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">
          Find the category codes that match the work your business does.
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
          Use this tool to find the category codes that match the services or products your business provides.
        </p>
      </section>

      <section className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)_300px]">
        <aside className="space-y-5 xl:sticky xl:top-[calc(var(--app-shell-offset)-2rem)] xl:self-start">
          <section className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-emerald-300/80">Start here</p>
            <label className="mt-4 block space-y-2 text-sm text-slate-200">
              <span className="flex items-center gap-2">
                What type of work does your business do?
                <InfoTip>Try words like pest control, landscaping, janitorial, rodent control, or roofing.</InfoTip>
              </span>
              <input
                value={filters.query}
                onChange={(event) =>
                  setFilters((current) => ({ ...current, query: event.target.value }))
                }
                placeholder="Example: pest control"
                className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400/40"
              />
            </label>

            <label className="mt-4 block space-y-2 text-sm text-slate-200">
              <span>Search by exact code</span>
              <input
                value={filters.exactCode}
                onChange={(event) =>
                  setFilters((current) => ({ ...current, exactCode: event.target.value }))
                }
                placeholder="Example: 910-59 or S207"
                className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400/40"
              />
            </label>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() =>
                  setFilters({
                    query: "",
                    exactCode: "",
                    sources: [],
                    families: [],
                    letter: "",
                  })
                }
                className={buttonStyles({ variant: "ghost", size: "sm" })}
              >
                Clear search
              </button>
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-emerald-300/80">Narrow results</p>

            <div className="mt-4 space-y-4">
              <div>
                <p className="text-sm font-medium text-white">Source</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {options.sources.map((source) => {
                    const active = filters.sources.includes(source);
                    return (
                      <button
                        key={source}
                        type="button"
                        onClick={() =>
                          setFilters((current) => ({
                            ...current,
                            sources: toggleValue(current.sources, source),
                          }))
                        }
                        className={buttonStyles({
                          variant: active ? "primary" : "ghost",
                          size: "sm",
                        })}
                      >
                        {source}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-white">Category family</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {options.families.map((family) => {
                    const active = filters.families.includes(family);
                    return (
                      <button
                        key={family}
                        type="button"
                        onClick={() =>
                          setFilters((current) => ({
                            ...current,
                            families: toggleValue(current.families, family),
                          }))
                        }
                        className={buttonStyles({
                          variant: active ? "secondary" : "ghost",
                          size: "sm",
                        })}
                      >
                        {family}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-emerald-300/80">Browse A–Z</p>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Browse categories alphabetically if you want to explore without searching first.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {alphabet.map((letter) => {
                const active = filters.letter === letter;
                const available = options.letters.includes(letter);
                return (
                  <button
                    key={letter}
                    type="button"
                    disabled={!available}
                    onClick={() =>
                      setFilters((current) => ({
                        ...current,
                        letter: current.letter === letter ? "" : letter,
                      }))
                    }
                    className={buttonStyles({
                      variant: active ? "primary" : "ghost",
                      size: "sm",
                      className: "min-w-10 px-0",
                    })}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>
          </section>
        </aside>

        <div className="space-y-6">
          <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-sm text-slate-300">
                  Select the categories that best describe your services. These categories help us find matching contract opportunities for you.
                </p>
                <p className="mt-3 text-sm font-medium text-emerald-200">
                  {results.length} category codes found
                </p>
              </div>
              <Link href="/contracts" className={buttonStyles({ variant: "secondary", size: "sm" })}>
                Use categories in contract search
              </Link>
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-emerald-300/80">
                  Suggested matches
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Closest matching codes and nearby work types based on what you typed.
                </p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              {suggestions.slice(0, 6).map((record) => (
                <Link
                  key={record.id}
                  href={`/categories/${record.id}`}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:border-emerald-400/25 hover:bg-emerald-400/10 hover:text-emerald-100"
                >
                  {record.code} / {record.title}
                </Link>
              ))}
              {suggestions.length === 0 ? (
                <p className="text-sm text-slate-400">
                  Try broad phrases like cleaning, construction, landscaping, or pest control.
                </p>
              ) : null}
            </div>
          </section>

          <section className="space-y-4">
            {results.map((record) => (
              <CategoryCodeCard key={record.id} record={record} />
            ))}
            {results.length === 0 ? (
              <div className="rounded-[2rem] border border-dashed border-white/10 bg-slate-950/60 p-10 text-center text-sm text-slate-400">
                No results yet. Try broad words like &quot;pest control&quot;, &quot;landscaping&quot;, or &quot;janitorial&quot;.
              </div>
            ) : null}
          </section>
        </div>

        <aside className="space-y-5 xl:sticky xl:top-[calc(var(--app-shell-offset)-2rem)] xl:self-start">
          <section className="rounded-[2rem] border border-emerald-400/20 bg-emerald-400/10 p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-emerald-200">Selected codes</p>
            <h2 className="mt-3 text-xl font-semibold text-white">Saved for your business</h2>
            <p className="mt-2 text-sm leading-6 text-emerald-50/90">
              Save the codes that fit your services. Later these can power alerts, saved searches, and matching.
            </p>
            <div className="mt-5 space-y-3">
              {savedRecords.length > 0 ? (
                savedRecords.map((record) => (
                  <Link
                    key={record.id}
                    href={`/categories/${record.id}`}
                    className="block rounded-[1.25rem] border border-emerald-400/15 bg-black/20 p-4 transition hover:border-emerald-300/30 hover:bg-black/30"
                  >
                    <p className="font-semibold text-white">{record.code}</p>
                    <p className="mt-1 text-sm text-emerald-50/90">{record.title}</p>
                  </Link>
                ))
              ) : (
                <p className="text-sm leading-6 text-emerald-50/80">
                  Save a few category codes here so you can reuse them in contract and state/local matching later.
                </p>
              )}
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Helpful examples</p>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
              <li>pest control</li>
              <li>rodent control</li>
              <li>bird exclusion</li>
              <li>grounds maintenance</li>
              <li>janitorial</li>
            </ul>
          </section>
        </aside>
      </section>
    </div>
  );
}
