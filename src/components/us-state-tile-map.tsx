"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { geoAlbersUsa, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import statesTopology from "us-atlas/states-10m.json";
import { type StateDirectoryEntry } from "@/lib/sources/state-registry";

const fipsToStateCode: Record<string, string> = {
  "01": "AL",
  "02": "AK",
  "04": "AZ",
  "05": "AR",
  "06": "CA",
  "08": "CO",
  "09": "CT",
  "10": "DE",
  "11": "DC",
  "12": "FL",
  "13": "GA",
  "15": "HI",
  "16": "ID",
  "17": "IL",
  "18": "IN",
  "19": "IA",
  "20": "KS",
  "21": "KY",
  "22": "LA",
  "23": "ME",
  "24": "MD",
  "25": "MA",
  "26": "MI",
  "27": "MN",
  "28": "MS",
  "29": "MO",
  "30": "MT",
  "31": "NE",
  "32": "NV",
  "33": "NH",
  "34": "NJ",
  "35": "NM",
  "36": "NY",
  "37": "NC",
  "38": "ND",
  "39": "OH",
  "40": "OK",
  "41": "OR",
  "42": "PA",
  "44": "RI",
  "45": "SC",
  "46": "SD",
  "47": "TN",
  "48": "TX",
  "49": "UT",
  "50": "VT",
  "51": "VA",
  "53": "WA",
  "54": "WV",
  "55": "WI",
  "56": "WY",
};

function getStateClasses(state: StateDirectoryEntry, isActive: boolean) {
  if (isActive) {
    return "fill-emerald-300 stroke-white stroke-[1.6] drop-shadow-[0_0_16px_rgba(110,231,183,0.5)]";
  }

  if (state.connectionMode === "live") {
    return "fill-emerald-500/90 stroke-slate-950 stroke-[1.1] hover:fill-emerald-400";
  }

  if (state.connectionMode === "portal-assisted") {
    return "fill-amber-400/90 stroke-slate-950 stroke-[1.1] hover:fill-amber-300";
  }

  return "fill-slate-700 stroke-slate-950 stroke-[1.1] hover:fill-slate-600";
}

export function UsStateTileMap({
  states,
  initialSelectedStateCode = "WA",
}: {
  states: StateDirectoryEntry[];
  initialSelectedStateCode?: string;
}) {
  const router = useRouter();
  const [activeStateCode, setActiveStateCode] = useState(initialSelectedStateCode);

  const statesByCode = useMemo(
    () => new Map(states.map((state) => [state.stateCode, state])),
    [states],
  );

  const projection = useMemo(
    () => geoAlbersUsa().translate([487.5, 305]).scale(1250),
    [],
  );
  const path = useMemo(() => geoPath(projection), [projection]);

  const stateFeatures = useMemo(() => {
    const topo = statesTopology as {
      objects: { states: unknown };
    };

    const collection = feature(topo as never, topo.objects.states as never) as {
      features: Array<{ id?: string | number; properties?: Record<string, unknown> } & Record<string, unknown>>;
    };

    return collection.features
      .map((item) => {
        const id = String(item.id ?? "").padStart(2, "0");
        const stateCode = fipsToStateCode[id];
        if (!stateCode) return null;
        const state = statesByCode.get(stateCode);
        if (!state) return null;

        return {
          feature: item,
          state,
          stateCode,
          slug: state.slug,
          label: state.name,
        };
      })
      .filter(Boolean) as Array<{
      feature: Record<string, unknown>;
      state: StateDirectoryEntry;
      stateCode: string;
      slug: string;
      label: string;
    }>;
  }, [statesByCode]);

  const activeState = states.find((state) => state.stateCode === activeStateCode) ?? states[0];

  return (
    <section className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.28)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-emerald-300/80">
            Choose your state on the map
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-white">
            Click the state outline where you work and jump straight into that contract search page.
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
            The map keeps the page simple. Click your state first, then use that state page for statewide portals, county options, and local opportunity searching.
          </p>
        </div>
        <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
          <div className="flex flex-wrap gap-4">
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-emerald-500" />
              Live now
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-amber-400" />
              Portal-assisted
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-slate-600" />
              Portal ready
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.10),_transparent_32%),linear-gradient(180deg,rgba(4,10,18,0.98)_0%,rgba(7,16,29,0.96)_100%)] p-3">
          <svg viewBox="0 0 975 610" className="h-auto w-full" role="img" aria-label="United States state map">
            <rect x="0" y="0" width="975" height="610" rx="28" className="fill-transparent" />
            {stateFeatures.map(({ feature: geoFeature, state, stateCode, slug, label }) => {
              const d = path(geoFeature as never);
              if (!d) return null;
              const isActive = activeStateCode === stateCode;

              return (
                <path
                  key={slug}
                  d={d}
                  role="button"
                  tabIndex={0}
                  aria-label={`Open ${label} state page`}
                  className={`cursor-pointer transition-[fill,stroke,filter] duration-200 ${getStateClasses(state, isActive)}`}
                  onMouseEnter={() => setActiveStateCode(stateCode)}
                  onFocus={() => setActiveStateCode(stateCode)}
                  onClick={() => router.push(`/state-local/${slug}`)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      router.push(`/state-local/${slug}`);
                    }
                  }}
                />
              );
            })}
          </svg>
        </div>

        <aside className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-5">
          <p className="text-xs uppercase tracking-[0.28em] text-emerald-300/80">
            Selected state
          </p>
          <h3 className="mt-3 text-2xl font-semibold text-white">{activeState.name}</h3>
          <p className="mt-2 text-sm uppercase tracking-[0.2em] text-emerald-300/70">
            {activeState.stateCode} / {activeState.portalName}
          </p>
          <p className="mt-4 text-sm leading-7 text-slate-300">{activeState.helperText}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => router.push(`/state-local/${activeState.slug}`)}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-emerald-300/30 bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_10px_28px_rgba(34,197,94,0.28)] transition hover:-translate-y-0.5 hover:bg-emerald-400"
            >
              Open {activeState.name}
            </button>
            <a
              href={activeState.portalUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-semibold text-slate-100 transition hover:-translate-y-0.5 hover:border-emerald-400/25 hover:bg-emerald-400/[0.08]"
            >
              Open portal
            </a>
          </div>
        </aside>
      </div>
    </section>
  );
}
