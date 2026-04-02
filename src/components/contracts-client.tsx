"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ContractCard } from "@/components/contract-card";
import { FilterSidebar } from "@/components/filter-sidebar";
import { InfoTip } from "@/components/info-tip";
import { buttonStyles } from "@/components/ui/button";
import {
  readSavedNaicsCodeLists,
  removeNaicsCodeList,
  type SavedNaicsCodeList,
} from "@/lib/demo-category-store";
import type { DemoContract, DemoTenant } from "@/lib/demo-data";
import {
  buildFilterOptions,
  enrichContract,
  filterContracts,
  type ContractFilters,
} from "@/lib/contracts-search";
import { getMergedDemoContracts } from "@/lib/demo-contract-store";

function toggleValue(values: string[], value: string) {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

export function ContractsClient({
  initialContracts,
  tenants,
  initialFilters,
  mode,
}: {
  initialContracts: DemoContract[];
  tenants: DemoTenant[];
  initialFilters: ContractFilters;
  mode: "database" | "demo";
}) {
  const [contracts, setContracts] = useState(initialContracts);
  const [filters, setFilters] = useState(initialFilters);
  const [savedCodeLists, setSavedCodeLists] = useState<SavedNaicsCodeList[]>([]);

  useEffect(() => {
    if (mode !== "demo") {
      return;
    }

    const sync = () => setContracts(getMergedDemoContracts());
    sync();
    window.addEventListener("bid-vault-contracts-updated", sync);
    return () => window.removeEventListener("bid-vault-contracts-updated", sync);
  }, [mode]);

  useEffect(() => {
    const sync = () => setSavedCodeLists(readSavedNaicsCodeLists());
    sync();
    window.addEventListener("bid-vault-naics-code-lists-updated", sync);
    return () => window.removeEventListener("bid-vault-naics-code-lists-updated", sync);
  }, []);

  const searchRecords = useMemo(() => contracts.map(enrichContract), [contracts]);
  const filterOptions = useMemo(() => buildFilterOptions(searchRecords), [searchRecords]);
  const filteredResults = useMemo(() => filterContracts(searchRecords, filters), [filters, searchRecords]);
  const currentPage = Math.max(filters.page, 1);
  const pageSize = 6;
  const totalPages = Math.max(1, Math.ceil(filteredResults.length / pageSize));
  const visibleResults = filteredResults.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
      <FilterSidebar
        {...filters}
        options={filterOptions}
        onAnyWordsChange={(value) => setFilters((current) => ({ ...current, anyWords: value, page: 1 }))}
        onAllWordsChange={(value) => setFilters((current) => ({ ...current, allWords: value, page: 1 }))}
        onExactPhraseChange={(value) =>
          setFilters((current) => ({ ...current, exactPhrase: value, page: 1 }))
        }
        onToggleStatus={(value) =>
          setFilters((current) => ({ ...current, statuses: toggleValue(current.statuses, value), page: 1 }))
        }
        onToggleNoticeType={(value) =>
          setFilters((current) => ({
            ...current,
            noticeTypes: toggleValue(current.noticeTypes, value),
            page: 1,
          }))
        }
        onToggleDepartment={(value) =>
          setFilters((current) => ({
            ...current,
            departments: toggleValue(current.departments, value),
            page: 1,
          }))
        }
        onToggleSubTier={(value) =>
          setFilters((current) => ({ ...current, subTiers: toggleValue(current.subTiers, value), page: 1 }))
        }
        onToggleOffice={(value) =>
          setFilters((current) => ({ ...current, offices: toggleValue(current.offices, value), page: 1 }))
        }
        onToggleState={(value) =>
          setFilters((current) => ({ ...current, states: toggleValue(current.states, value), page: 1 }))
        }
        onTogglePlace={(value) =>
          setFilters((current) => ({ ...current, places: toggleValue(current.places, value), page: 1 }))
        }
        onToggleNaics={(value) =>
          setFilters((current) => ({ ...current, naicsCodes: toggleValue(current.naicsCodes, value), page: 1 }))
        }
        onTogglePsc={(value) =>
          setFilters((current) => ({ ...current, pscCodes: toggleValue(current.pscCodes, value), page: 1 }))
        }
        onToggleSetAside={(value) =>
          setFilters((current) => ({ ...current, setAsides: toggleValue(current.setAsides, value), page: 1 }))
        }
        onPostedFromChange={(value) => setFilters((current) => ({ ...current, postedFrom: value, page: 1 }))}
        onPostedToChange={(value) => setFilters((current) => ({ ...current, postedTo: value, page: 1 }))}
        onResponseFromChange={(value) =>
          setFilters((current) => ({ ...current, responseFrom: value, page: 1 }))
        }
        onResponseToChange={(value) => setFilters((current) => ({ ...current, responseTo: value, page: 1 }))}
        onUpdatedFromChange={(value) => setFilters((current) => ({ ...current, updatedFrom: value, page: 1 }))}
        onUpdatedToChange={(value) => setFilters((current) => ({ ...current, updatedTo: value, page: 1 }))}
      >
        <div className="rounded-[1.5rem] border border-emerald-400/20 bg-emerald-400/10 p-4">
          <p className="text-xs uppercase tracking-[0.25em] text-emerald-200">Quick actions</p>
          <div className="mt-4 flex flex-col gap-3">
            <Link href="/contracts/new" className={buttonStyles({ variant: "primary", size: "md", className: "w-full" })}>
              Save a new opportunity
            </Link>
            <button
              type="button"
              onClick={() =>
                setFilters({
                  anyWords: "",
                  allWords: "",
                  exactPhrase: "",
                  statuses: [],
                  noticeTypes: [],
                  departments: [],
                  subTiers: [],
                  offices: [],
                  states: [],
                  places: [],
                  naicsCodes: [],
                  pscCodes: [],
                  setAsides: [],
                  postedFrom: "",
                  postedTo: "",
                  responseFrom: "",
                  responseTo: "",
                  updatedFrom: "",
                  updatedTo: "",
                  sortBy: "date",
                  page: 1,
                })
              }
              className={buttonStyles({ variant: "ghost", size: "md", fullWidth: true })}
            >
              Clear filters
            </button>
          </div>
        </div>

        {savedCodeLists.length > 0 ? (
          <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-emerald-300/80">Saved code lists</p>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Apply the NAICS code lists you saved from recommendations to narrow contract results faster.
            </p>
            <div className="mt-4 space-y-3">
              {savedCodeLists.map((list) => (
                <div
                  key={list.id}
                  className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4"
                >
                  <p className="font-medium text-white">{list.name}</p>
                  <p className="mt-1 text-xs text-slate-400">{list.codes.join(", ")}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setFilters((current) => ({
                          ...current,
                          naicsCodes: list.codes,
                          page: 1,
                        }))
                      }
                      className={buttonStyles({ variant: "secondary", size: "sm" })}
                    >
                      Apply to contracts
                    </button>
                    <button
                      type="button"
                      onClick={() => removeNaicsCodeList(list.id)}
                      className={buttonStyles({ variant: "ghost", size: "sm" })}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </FilterSidebar>

      <div className="space-y-6">
        <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_16px_40px_rgba(0,0,0,0.18)] backdrop-blur">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">Contract search</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
                Start by typing what your business does.
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
                We&apos;ll help you find government contracts that match your work, then make it easy to review the details.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-full border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-200">
                {filteredResults.length} opportunities found
              </div>
              <label className="flex items-center gap-3 rounded-full border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-200">
                <span className="flex items-center gap-2">
                  Sort by
                  <InfoTip>
                    Choose how to order the results. Newest first shows fresh opportunities. Best match tries to match your search words more closely.
                  </InfoTip>
                </span>
                <select
                  value={filters.sortBy}
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      sortBy: event.target.value === "relevance" ? "relevance" : "date",
                    }))
                  }
                  className="bg-transparent text-sm text-white outline-none"
                >
                  <option value="date">Newest first</option>
                  <option value="relevance">Best match</option>
                </select>
              </label>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          {visibleResults.map((contract) => (
            <ContractCard key={contract.id} contract={contract} />
          ))}
          {visibleResults.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-white/10 bg-slate-950/60 p-10 text-center text-sm text-slate-400">
              No results yet. Try broader words like &quot;cleaning&quot;, &quot;construction&quot;, or &quot;pest control&quot;.
            </div>
          ) : null}
        </section>

        <section className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-slate-950/60 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-300">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setFilters((current) => ({ ...current, page: Math.max(1, current.page - 1) }))}
              className={buttonStyles({ variant: "ghost", size: "sm" })}
            >
              Previous page
            </button>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() =>
                setFilters((current) => ({
                  ...current,
                  page: Math.min(totalPages, current.page + 1),
                }))
              }
              className={buttonStyles({ variant: "secondary", size: "sm" })}
            >
              Next page
            </button>
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">Your business workspaces</p>
          <div className="mt-4 flex flex-wrap gap-3">
            {tenants.map((tenant) => (
              <span
                key={tenant.id}
                className="rounded-full border border-white/10 bg-slate-950/60 px-4 py-2 text-sm text-slate-300"
              >
                {tenant.name}
              </span>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
