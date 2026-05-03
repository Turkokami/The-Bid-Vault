"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { buttonStyles } from "@/components/ui/button";
import {
  categoryCodeRecords,
  findRelatedCategoryCodes,
  type CategoryCodeRecord,
} from "@/lib/category-codes";
import {
  hydrateSavedCategoryPreferences,
  readSavedCategoryCodeIds,
  readSavedNaicsCodeLists,
  removeCategoryCodeId,
  removeNaicsCodeList,
  saveCategoryCodeId,
  type SavedNaicsCodeList,
} from "@/lib/demo-category-store";

function buildKeywordString(list: SavedNaicsCodeList) {
  return (list.searchTerms ?? []).slice(0, 6).join(", ");
}

function uniqueValues(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

export function MyCodesClient() {
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [savedLists, setSavedLists] = useState<SavedNaicsCodeList[]>([]);
  const [copyMessage, setCopyMessage] = useState("");

  useEffect(() => {
    const sync = () => {
      setSavedIds(readSavedCategoryCodeIds());
      setSavedLists(readSavedNaicsCodeLists());
    };

    sync();
    void hydrateSavedCategoryPreferences();
    window.addEventListener("bid-vault-category-codes-updated", sync);
    window.addEventListener("bid-vault-naics-code-lists-updated", sync);

    return () => {
      window.removeEventListener("bid-vault-category-codes-updated", sync);
      window.removeEventListener("bid-vault-naics-code-lists-updated", sync);
    };
  }, []);

  const savedRecords = useMemo(
    () => categoryCodeRecords.filter((record) => savedIds.includes(record.id)),
    [savedIds],
  );

  const combinedCodes = useMemo(() => {
    const samCodes = uniqueValues([
      ...savedRecords
        .filter((record) => /^\d{6}$/.test(record.code))
        .map((record) => record.code),
      ...savedLists.flatMap((list) => list.samCodes ?? []),
    ]);
    const websCodes = uniqueValues([
      ...savedRecords
        .filter((record) => record.sourceName === "WEBS")
        .map((record) => record.code),
      ...savedLists.flatMap((list) => list.websCodes ?? []),
    ]);
    const pscCodes = uniqueValues([
      ...savedRecords
        .filter((record) => record.sourceName === "PSC")
        .map((record) => record.code),
      ...savedLists.flatMap((list) => list.pscCodes ?? []),
    ]);
    const allCodes = uniqueValues([
      ...savedRecords.map((record) => record.code),
      ...savedLists.flatMap((list) => list.codes),
    ]);
    const searchTerms = uniqueValues([
      ...savedRecords.flatMap((record) => record.normalizedKeywords.slice(0, 4)),
      ...savedLists.flatMap((list) => list.searchTerms ?? []),
    ]);

    return { allCodes, samCodes, websCodes, pscCodes, searchTerms };
  }, [savedLists, savedRecords]);

  const recommendedRecords = useMemo(() => {
    const pool = new Map<string, { record: CategoryCodeRecord; score: number }>();

    for (const record of savedRecords) {
      for (const related of findRelatedCategoryCodes(record, categoryCodeRecords)) {
        if (savedIds.includes(related.id)) {
          continue;
        }

        const current = pool.get(related.id);
        pool.set(related.id, {
          record: related,
          score: (current?.score ?? 0) + 1 + (related.topLevelCategory === record.topLevelCategory ? 2 : 0),
        });
      }
    }

    return Array.from(pool.values())
      .sort((left, right) => right.score - left.score || left.record.title.localeCompare(right.record.title))
      .slice(0, 8)
      .map((entry) => entry.record);
  }, [savedIds, savedRecords]);

  const copyText = async (label: string, value: string) => {
    if (!value.trim()) {
      setCopyMessage(`No ${label.toLowerCase()} to copy yet.`);
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      setCopyMessage(`${label} copied.`);
    } catch {
      setCopyMessage(`Could not copy ${label.toLowerCase()} on this device.`);
    }
  };

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_0_30px_rgba(34,197,94,0.08)] backdrop-blur">
        <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">My Codes</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">
          Keep all of your saved service codes in one place.
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
          Use this page to review saved code lists, copy groups of codes into search boxes, and discover nearby codes you may want to add next.
        </p>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <section className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-emerald-300/80">Saved code lists</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  These are the reusable code groups you can apply to SAM Search and state or local searches.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/categories" className={buttonStyles({ variant: "secondary", size: "sm" })}>
                  Add more codes
                </Link>
                <Link href="/sam-search" className={buttonStyles({ variant: "ghost", size: "sm" })}>
                  Open Search SAM
                </Link>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              {savedLists.length > 0 ? (
                savedLists.map((list) => {
                  const keywords = buildKeywordString(list);
                  const samCodes = (list.samCodes?.length ? list.samCodes : list.codes).join(", ");
                  const websCodes = (list.websCodes ?? []).join(", ");

                  return (
                    <article
                      key={list.id}
                      className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <p className="text-lg font-semibold text-white">{list.name}</p>
                          <p className="mt-2 text-sm leading-6 text-slate-400">
                            {list.codes.length} saved codes
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => void removeNaicsCodeList(list.id)}
                          className={buttonStyles({ variant: "ghost", size: "sm" })}
                        >
                          Remove list
                        </button>
                      </div>

                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        <div className="rounded-[1.25rem] border border-white/10 bg-slate-950/70 p-4">
                          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">All codes</p>
                          <p className="mt-2 text-sm leading-6 text-white">{list.codes.join(", ")}</p>
                        </div>
                        <div className="rounded-[1.25rem] border border-white/10 bg-slate-950/70 p-4">
                          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Suggested search words</p>
                          <p className="mt-2 text-sm leading-6 text-white">{keywords || "No search words saved yet"}</p>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => void copyText(`${list.name} codes`, list.codes.join(", "))}
                          className={buttonStyles({ variant: "primary", size: "sm" })}
                        >
                          Copy all codes
                        </button>
                        <button
                          type="button"
                          onClick={() => void copyText(`${list.name} SAM codes`, samCodes)}
                          className={buttonStyles({ variant: "secondary", size: "sm" })}
                        >
                          Copy SAM codes
                        </button>
                        <button
                          type="button"
                          onClick={() => void copyText(`${list.name} state-local codes`, websCodes)}
                          className={buttonStyles({ variant: "ghost", size: "sm" })}
                        >
                          Copy state/local codes
                        </button>
                        <Link
                          href={`/sam-search?naics=${encodeURIComponent(samCodes)}&keywords=${encodeURIComponent(keywords)}`}
                          className={buttonStyles({ variant: "ghost", size: "sm" })}
                        >
                          Search SAM with this list
                        </Link>
                      </div>
                    </article>
                  );
                })
              ) : (
                <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-slate-950/60 p-8 text-sm leading-6 text-slate-400">
                  No saved code lists yet. Open category search, save the codes that fit your work, and they will appear here.
                </div>
              )}
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6">
            <p className="text-xs uppercase tracking-[0.25em] text-emerald-300/80">Saved individual codes</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              These are the single codes you have saved while exploring categories.
            </p>

            <div className="mt-5 space-y-3">
              {savedRecords.length > 0 ? (
                savedRecords.map((record) => (
                  <article
                    key={record.id}
                    className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-100">
                            {record.code}
                          </span>
                          <span className="rounded-full border border-white/10 bg-slate-950/70 px-3 py-1 text-xs text-slate-300">
                            {record.sourceName}
                          </span>
                        </div>
                        <Link
                          href={`/categories/${record.id}`}
                          className="mt-3 block text-lg font-semibold text-white transition hover:text-emerald-200"
                        >
                          {record.title}
                        </Link>
                        <p className="mt-2 text-sm leading-6 text-slate-400">{record.description}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => void copyText(record.code, record.code)}
                          className={buttonStyles({ variant: "secondary", size: "sm" })}
                        >
                          Copy code
                        </button>
                        <button
                          type="button"
                          onClick={() => void removeCategoryCodeId(record.id)}
                          className={buttonStyles({ variant: "ghost", size: "sm" })}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-slate-950/60 p-8 text-sm leading-6 text-slate-400">
                  No individual codes saved yet.
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-[2rem] border border-emerald-400/20 bg-emerald-400/10 p-6">
            <p className="text-xs uppercase tracking-[0.25em] text-emerald-200">Quick copy and search</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">Use your saved codes faster</h2>
            <p className="mt-2 text-sm leading-6 text-emerald-50/90">
              Copy these groups directly into search boxes, or jump into a search with them already applied.
            </p>

            <div className="mt-5 space-y-3">
              <div className="rounded-[1.25rem] border border-white/10 bg-black/25 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-200">All saved codes</p>
                <p className="mt-2 text-sm leading-6 text-white">
                  {combinedCodes.allCodes.join(", ") || "No saved codes yet"}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void copyText("All saved codes", combinedCodes.allCodes.join(", "))}
                    className={buttonStyles({ variant: "primary", size: "sm" })}
                  >
                    Copy all saved codes
                  </button>
                </div>
              </div>

              <div className="rounded-[1.25rem] border border-white/10 bg-black/25 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-200">SAM codes</p>
                <p className="mt-2 text-sm leading-6 text-white">
                  {combinedCodes.samCodes.join(", ") || "No SAM-ready codes yet"}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void copyText("SAM codes", combinedCodes.samCodes.join(", "))}
                    className={buttonStyles({ variant: "secondary", size: "sm" })}
                  >
                    Copy SAM codes
                  </button>
                  <Link
                    href={`/sam-search?naics=${encodeURIComponent(combinedCodes.samCodes.join(", "))}&keywords=${encodeURIComponent(combinedCodes.searchTerms.slice(0, 6).join(", "))}`}
                    className={buttonStyles({ variant: "ghost", size: "sm" })}
                  >
                    Search SAM with saved codes
                  </Link>
                </div>
              </div>

              <div className="rounded-[1.25rem] border border-white/10 bg-black/25 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-200">State and local codes</p>
                <p className="mt-2 text-sm leading-6 text-white">
                  {combinedCodes.websCodes.join(", ") || "No state/local codes yet"}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void copyText("State and local codes", combinedCodes.websCodes.join(", "))}
                    className={buttonStyles({ variant: "secondary", size: "sm" })}
                  >
                    Copy state/local codes
                  </button>
                  <Link
                    href={`/state-local/washington?codes=${encodeURIComponent(combinedCodes.websCodes.join(", "))}&keywords=${encodeURIComponent(combinedCodes.searchTerms.slice(0, 6).join(", "))}`}
                    className={buttonStyles({ variant: "ghost", size: "sm" })}
                  >
                    Search WEBS with saved codes
                  </Link>
                </div>
              </div>
            </div>

            {copyMessage ? (
              <div className="mt-4 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-emerald-50">
                {copyMessage}
              </div>
            ) : null}
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6">
            <p className="text-xs uppercase tracking-[0.25em] text-emerald-300/80">Recommended codes based on your current list</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              These suggestions are nearby work categories that often fit with the codes you already saved.
            </p>

            <div className="mt-5 space-y-3">
              {recommendedRecords.length > 0 ? (
                recommendedRecords.map((record) => (
                  <article
                    key={record.id}
                    className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-100">
                            {record.code}
                          </span>
                          <span className="rounded-full border border-white/10 bg-slate-950/70 px-3 py-1 text-xs text-slate-300">
                            {record.topLevelCategory}
                          </span>
                        </div>
                        <Link
                          href={`/categories/${record.id}`}
                          className="mt-3 block text-lg font-semibold text-white transition hover:text-emerald-200"
                        >
                          {record.title}
                        </Link>
                        <p className="mt-2 text-sm leading-6 text-slate-400">{record.description}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => void saveCategoryCodeId(record.id)}
                          className={buttonStyles({ variant: "primary", size: "sm" })}
                        >
                          Save code
                        </button>
                        <button
                          type="button"
                          onClick={() => void copyText(record.code, record.code)}
                          className={buttonStyles({ variant: "ghost", size: "sm" })}
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-slate-950/60 p-8 text-sm leading-6 text-slate-400">
                  Save a few codes first and we will start recommending nearby categories here.
                </div>
              )}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
