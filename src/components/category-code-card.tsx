"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { InfoTip } from "@/components/info-tip";
import { buttonStyles } from "@/components/ui/button";
import type { CategoryCodeRecord } from "@/lib/category-codes";
import {
  readSavedCategoryCodeIds,
  removeCategoryCodeId,
  saveCategoryCodeId,
} from "@/lib/demo-category-store";

export function CategoryCodeCard({ record }: { record: CategoryCodeRecord }) {
  const [savedIds, setSavedIds] = useState<string[]>([]);

  useEffect(() => {
    const sync = () => setSavedIds(readSavedCategoryCodeIds());
    sync();
    window.addEventListener("bid-vault-category-codes-updated", sync);
    return () => window.removeEventListener("bid-vault-category-codes-updated", sync);
  }, []);

  const isSaved = useMemo(() => savedIds.includes(record.id), [record.id, savedIds]);

  return (
    <article className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-5 transition hover:border-emerald-400/25 hover:bg-emerald-400/5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-100">
              {record.code}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
              {record.sourceName}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
              {record.topLevelCategory}
            </span>
          </div>

          <Link
            href={`/categories/${record.id}`}
            className="mt-4 block text-xl font-semibold text-white transition hover:text-emerald-200"
          >
            {record.title}
          </Link>

          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">{record.description}</p>
        </div>

        <button
          type="button"
          onClick={() => (isSaved ? removeCategoryCodeId(record.id) : saveCategoryCodeId(record.id))}
          className={buttonStyles({
            variant: isSaved ? "ghost" : "secondary",
            size: "sm",
          })}
        >
          {isSaved ? "Saved to your list" : "Save this code"}
        </button>
      </div>

      <div className="mt-5 grid gap-4 text-sm text-slate-300 md:grid-cols-3">
        <div>
          <p className="flex items-center gap-2 text-slate-500">
            Category Code
            <InfoTip>
              A code used by some contract systems to group similar services or products.
            </InfoTip>
          </p>
          <p className="mt-1 text-white">{record.code}</p>
        </div>
        <div>
          <p className="text-slate-500">Parent category</p>
          <p className="mt-1 text-white">{record.parentCode ?? "Top-level family"}</p>
        </div>
        <div>
          <p className="text-slate-500">Common service words</p>
          <p className="mt-1 text-white">{record.normalizedKeywords.slice(0, 4).join(", ")}</p>
        </div>
      </div>
    </article>
  );
}
