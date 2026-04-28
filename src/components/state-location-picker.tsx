"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { buttonStyles } from "@/components/ui/button";
import {
  getCityContractsSearchUrl,
  getCountyContractsSearchUrl,
  getLocalGovernmentContractsSearchUrl,
  type StateDirectoryEntry,
} from "@/lib/sources/state-registry";

const regionMap: Record<string, string> = {
  WA: "West",
  OR: "West",
  CA: "West",
  AK: "West",
  HI: "West",
  ID: "West",
  MT: "West",
  WY: "West",
  NV: "Southwest",
  AZ: "Southwest",
  UT: "Southwest",
  CO: "Southwest",
  NM: "Southwest",
  TX: "Southwest",
  ND: "Midwest",
  SD: "Midwest",
  NE: "Midwest",
  KS: "Midwest",
  MN: "Midwest",
  IA: "Midwest",
  MO: "Midwest",
  WI: "Midwest",
  IL: "Midwest",
  MI: "Midwest",
  IN: "Midwest",
  OH: "Midwest",
  OK: "South",
  AR: "South",
  LA: "South",
  KY: "South",
  TN: "South",
  MS: "South",
  AL: "South",
  GA: "South",
  FL: "South",
  SC: "South",
  NC: "South",
  VA: "South",
  WV: "South",
  MD: "South",
  DE: "South",
  DC: "South",
  PA: "Northeast",
  NJ: "Northeast",
  NY: "Northeast",
  CT: "Northeast",
  RI: "Northeast",
  MA: "Northeast",
  VT: "Northeast",
  NH: "Northeast",
  ME: "Northeast",
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function getModeLabel(state: StateDirectoryEntry) {
  if (state.connectionMode === "live") {
    return "Live now";
  }

  if (state.connectionMode === "portal-assisted") {
    return "Portal-assisted";
  }

  return "Portal ready";
}

function getModeClass(state: StateDirectoryEntry) {
  if (state.connectionMode === "live") {
    return "border-emerald-400/20 bg-emerald-400/10 text-emerald-100";
  }

  if (state.connectionMode === "portal-assisted") {
    return "border-amber-400/20 bg-amber-400/10 text-amber-100";
  }

  return "border-white/10 bg-slate-950/70 text-slate-300";
}

export function StateLocationPicker({
  states,
  initialValue = "washington",
}: {
  states: StateDirectoryEntry[];
  initialValue?: string;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState(initialValue);
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("All");

  const selectedState =
    states.find((state) => state.slug === selected) ?? states[0];

  const filteredStates = useMemo(() => {
    const search = normalize(query);

    return states.filter((state) => {
      const matchesQuery =
        !search ||
        normalize(state.name).includes(search) ||
        normalize(state.stateCode).includes(search) ||
        normalize(state.portalName).includes(search);
      const matchesRegion =
        region === "All" || regionMap[state.stateCode] === region;

      return matchesQuery && matchesRegion;
    });
  }, [query, region, states]);

  const visibleStates = filteredStates.slice(0, 10);
  const liveStates = filteredStates.filter(
    (state) => state.connectionMode === "live" || state.connectionMode === "portal-assisted",
  );
  const countySearchLinks = selectedState
    ? [
        {
          href: getCountyContractsSearchUrl(selectedState.name),
          label: `Search county bids in ${selectedState.name}`,
        },
        {
          href: getCityContractsSearchUrl(selectedState.name),
          label: `Search city bids in ${selectedState.name}`,
        },
        {
          href: getLocalGovernmentContractsSearchUrl(selectedState.name),
          label: `Search local government bids in ${selectedState.name}`,
        },
      ]
    : [];

  return (
    <div className="space-y-4 rounded-[1.75rem] border border-white/10 bg-slate-950/70 p-5 shadow-[0_16px_40px_rgba(0,0,0,0.18)]">
      <div className="space-y-2">
        <label className="text-sm font-medium text-white" htmlFor="state-search">
          What state are you in?
        </label>
        <input
          id="state-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Type Nevada, Texas, Washington..."
          className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white outline-none transition focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20"
        />
        <p className="text-xs leading-5 text-slate-400">
          Start with your state, then open that state page to see statewide portals and county options.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {["All", "West", "Southwest", "Midwest", "South", "Northeast"].map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setRegion(option)}
            className={buttonStyles({
              variant: region === option ? "primary" : "ghost",
              size: "sm",
            })}
          >
            {option}
          </button>
        ))}
      </div>

      <div className="rounded-[1.5rem] border border-emerald-400/20 bg-emerald-400/10 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-emerald-200">Selected state</p>
            <p className="mt-2 text-lg font-semibold text-white">
              {selectedState?.name ?? "Choose a state"}
            </p>
            <p className="mt-1 text-sm text-slate-300">
              {selectedState?.helperText}
            </p>
          </div>
          {selectedState ? (
            <span className={`rounded-full border px-3 py-1 text-xs font-medium ${getModeClass(selectedState)}`}>
              {getModeLabel(selectedState)}
            </span>
          ) : null}
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => selectedState && router.push(`/state-local/${selectedState.slug}`)}
            className={buttonStyles({ variant: "primary", size: "md" })}
          >
            Open state page
          </button>
          {selectedState ? (
            <a
              href={selectedState.portalUrl}
              target="_blank"
              rel="noreferrer"
              className={buttonStyles({ variant: "secondary", size: "md" })}
            >
              Open original source
            </a>
          ) : null}
        </div>
        {selectedState ? (
          <div className="mt-4 rounded-[1.25rem] border border-white/10 bg-slate-950/40 p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
              Quick local search links
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              If this state does not have a fully connected county network yet, these links still get you into local contract hunting fast.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {countySearchLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className={buttonStyles({ variant: "ghost", size: "sm" })}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {liveStates.length > 0 ? (
        <div className="rounded-[1.5rem] border border-emerald-400/20 bg-emerald-400/10 p-4">
          <p className="text-xs uppercase tracking-[0.25em] text-emerald-200">Working now</p>
          <p className="mt-2 text-sm leading-6 text-slate-200">
            These states already have the strongest usable experience today.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {liveStates.slice(0, 4).map((state) => (
              <button
                key={state.slug}
                type="button"
                onClick={() => setSelected(state.slug)}
                className={buttonStyles({
                  variant: selected === state.slug ? "primary" : "secondary",
                  size: "sm",
                })}
              >
                {state.name}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-white">Matching states</p>
          <p className="text-xs text-slate-400">
            {filteredStates.length} {filteredStates.length === 1 ? "match" : "matches"}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {visibleStates.map((state) => (
            <button
              key={state.slug}
              type="button"
              onClick={() => setSelected(state.slug)}
              className={`rounded-[1.25rem] border p-4 text-left transition ${
                selected === state.slug
                  ? "border-emerald-400/30 bg-emerald-400/10"
                  : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-white">{state.name}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-emerald-300/70">
                    {state.stateCode} / {regionMap[state.stateCode] ?? "National"}
                  </p>
                </div>
                <span className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${getModeClass(state)}`}>
                  {getModeLabel(state)}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-400">{state.description}</p>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                {state.connectionMode === "planned"
                  ? "The page is ready as a clean statewide launch point, with county and city search links underneath."
                  : state.helperText}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setSelected(state.slug);
                    router.push(`/state-local/${state.slug}`);
                  }}
                  className={buttonStyles({ variant: "secondary", size: "sm" })}
                >
                  Open state page
                </button>
                <a
                  href={state.portalUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(event) => event.stopPropagation()}
                  className={buttonStyles({ variant: "ghost", size: "sm" })}
                >
                  Open portal
                </a>
              </div>
            </button>
          ))}
        </div>

        {filteredStates.length > visibleStates.length ? (
          <p className="text-xs text-slate-500">
            Narrow the state name a little more to see a shorter list.
          </p>
        ) : null}
      </div>
    </div>
  );
}
