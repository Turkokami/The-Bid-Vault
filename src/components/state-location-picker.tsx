"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { buttonStyles } from "@/components/ui/button";
import type { StateDirectoryEntry } from "@/lib/sources/state-registry";

export function StateLocationPicker({
  states,
  initialValue = "washington",
}: {
  states: StateDirectoryEntry[];
  initialValue?: string;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState(initialValue);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <label className="flex-1">
        <span className="sr-only">Select your state</span>
        <select
          value={selected}
          onChange={(event) => setSelected(event.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20"
        >
          {states.map((state) => (
            <option key={state.slug} value={state.slug}>
              {state.name}
            </option>
          ))}
        </select>
      </label>
      <button
        type="button"
        onClick={() => router.push(`/state-local/${selected}`)}
        className={buttonStyles({ variant: "primary", size: "md" })}
      >
        Open state page
      </button>
    </div>
  );
}
