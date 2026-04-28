"use client";

import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";
import type { StateDirectoryEntry } from "@/lib/sources/state-registry";

type StateTile = {
  slug: string;
  code: string;
  col: number;
  row: number;
};

const tiles: StateTile[] = [
  { slug: "alaska", code: "AK", col: 1, row: 7 },
  { slug: "hawaii", code: "HI", col: 2, row: 7 },
  { slug: "washington", code: "WA", col: 1, row: 1 },
  { slug: "oregon", code: "OR", col: 1, row: 2 },
  { slug: "california", code: "CA", col: 1, row: 3 },
  { slug: "idaho", code: "ID", col: 2, row: 1 },
  { slug: "nevada", code: "NV", col: 2, row: 2 },
  { slug: "arizona", code: "AZ", col: 2, row: 3 },
  { slug: "utah", code: "UT", col: 3, row: 2 },
  { slug: "montana", code: "MT", col: 3, row: 1 },
  { slug: "wyoming", code: "WY", col: 4, row: 1 },
  { slug: "colorado", code: "CO", col: 4, row: 2 },
  { slug: "new-mexico", code: "NM", col: 4, row: 3 },
  { slug: "north-dakota", code: "ND", col: 5, row: 1 },
  { slug: "south-dakota", code: "SD", col: 5, row: 2 },
  { slug: "nebraska", code: "NE", col: 5, row: 3 },
  { slug: "kansas", code: "KS", col: 5, row: 4 },
  { slug: "oklahoma", code: "OK", col: 5, row: 5 },
  { slug: "texas", code: "TX", col: 5, row: 6 },
  { slug: "minnesota", code: "MN", col: 6, row: 1 },
  { slug: "iowa", code: "IA", col: 6, row: 2 },
  { slug: "missouri", code: "MO", col: 6, row: 3 },
  { slug: "arkansas", code: "AR", col: 6, row: 4 },
  { slug: "louisiana", code: "LA", col: 6, row: 5 },
  { slug: "wisconsin", code: "WI", col: 7, row: 1 },
  { slug: "illinois", code: "IL", col: 7, row: 2 },
  { slug: "kentucky", code: "KY", col: 7, row: 3 },
  { slug: "tennessee", code: "TN", col: 7, row: 4 },
  { slug: "mississippi", code: "MS", col: 7, row: 5 },
  { slug: "michigan", code: "MI", col: 8, row: 1 },
  { slug: "indiana", code: "IN", col: 8, row: 2 },
  { slug: "ohio", code: "OH", col: 9, row: 2 },
  { slug: "west-virginia", code: "WV", col: 9, row: 3 },
  { slug: "virginia", code: "VA", col: 10, row: 3 },
  { slug: "north-carolina", code: "NC", col: 10, row: 4 },
  { slug: "south-carolina", code: "SC", col: 10, row: 5 },
  { slug: "georgia", code: "GA", col: 10, row: 6 },
  { slug: "florida", code: "FL", col: 11, row: 7 },
  { slug: "alabama", code: "AL", col: 9, row: 6 },
  { slug: "pennsylvania", code: "PA", col: 10, row: 2 },
  { slug: "new-york", code: "NY", col: 11, row: 1 },
  { slug: "maryland", code: "MD", col: 10, row: 3 },
  { slug: "district-of-columbia", code: "DC", col: 11, row: 3 },
  { slug: "delaware", code: "DE", col: 11, row: 4 },
  { slug: "new-jersey", code: "NJ", col: 11, row: 2 },
  { slug: "connecticut", code: "CT", col: 12, row: 2 },
  { slug: "rhode-island", code: "RI", col: 12, row: 3 },
  { slug: "massachusetts", code: "MA", col: 12, row: 1 },
  { slug: "vermont", code: "VT", col: 12, row: 0 },
  { slug: "new-hampshire", code: "NH", col: 13, row: 0 },
  { slug: "maine", code: "ME", col: 13, row: 1 },
];

function getModeClass(state: StateDirectoryEntry) {
  if (state.connectionMode === "live") {
    return "border-emerald-400/30 bg-emerald-400/15 text-emerald-50";
  }

  if (state.connectionMode === "portal-assisted") {
    return "border-amber-400/30 bg-amber-400/15 text-amber-50";
  }

  return "border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20 hover:bg-white/[0.06]";
}

export function UsStateTileMap({
  states,
}: {
  states: StateDirectoryEntry[];
}) {
  const stateMap = new Map(states.map((state) => [state.slug, state]));
  const renderedTiles = tiles.filter((tile) => stateMap.has(tile.slug));

  return (
    <section className="rounded-[1.75rem] border border-white/10 bg-slate-950/70 p-5 shadow-[0_16px_40px_rgba(0,0,0,0.18)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-300/80">
            Interactive map
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-white">
            Click a state on the map to open its contract search page.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
            This keeps the nationwide view visual and simple. Live states stand out first, and every state tile opens its own dedicated state page with statewide and local search options.
          </p>
        </div>
        <Link href="/state-local/washington" className={buttonStyles({ variant: "ghost", size: "sm" })}>
          Open strongest live example
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto">
        <div
          className="grid min-w-[900px] gap-2"
          style={{ gridTemplateColumns: "repeat(13, minmax(0, 1fr))" }}
        >
          {renderedTiles.map((tile) => {
            const state = stateMap.get(tile.slug);
            if (!state) return null;

            return (
              <Link
                key={tile.slug}
                href={`/state-local/${tile.slug}`}
                className={`flex h-14 items-center justify-center rounded-2xl border text-xs font-semibold uppercase tracking-[0.18em] transition ${getModeClass(state)}`}
                style={{
                  gridColumn: tile.col,
                  gridRow: tile.row + 1,
                }}
                title={`${state.name} - ${state.connectionMode === "planned" ? "planned portal page" : "available now"}`}
              >
                {tile.code}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3 text-xs">
        <span className="rounded-full border border-emerald-400/30 bg-emerald-400/15 px-3 py-1 text-emerald-100">
          Live now
        </span>
        <span className="rounded-full border border-amber-400/30 bg-amber-400/15 px-3 py-1 text-amber-100">
          Portal-assisted
        </span>
        <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-slate-300">
          Portal page ready
        </span>
      </div>
    </section>
  );
}
