"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { buttonStyles } from "@/components/ui/button";
import { type DemoContract, type DemoTenant } from "@/lib/demo-data";
import { getMergedDemoContracts } from "@/lib/demo-contract-store";
import { formatCurrency } from "@/lib/format";
import type { DashboardDataView } from "@/lib/server/contracts";

type DashboardGroup = DashboardDataView["groups"][number];

function stagePriority(stage: DemoContract["stage"]) {
  if (stage === "Rebid Soon") {
    return 3;
  }

  if (stage === "Active") {
    return 2;
  }

  return 1;
}

export function DashboardClient({
  initialGroups,
  initialStats,
  mode,
}: {
  initialGroups: DashboardGroup[];
  initialStats: DashboardDataView["stats"];
  mode: DashboardDataView["mode"];
}) {
  const [groups, setGroups] = useState<DashboardGroup[]>(initialGroups);
  const [stats, setStats] = useState(initialStats);

  const priorityContracts = useMemo(() => {
    return groups
      .flatMap((group) =>
        group.contracts.map((contract) => ({
          ...contract,
          tenantName: group.name,
          tenantSlug: group.slug,
        })),
      )
      .sort((left, right) => {
        const priorityDifference = stagePriority(right.stage) - stagePriority(left.stage);

        if (priorityDifference !== 0) {
          return priorityDifference;
        }

        return left.predictedRebidDate.localeCompare(right.predictedRebidDate);
      })
      .slice(0, 5);
  }, [groups]);

  useEffect(() => {
    if (mode !== "demo") {
      return;
    }

    const sync = () => setContracts(getMergedDemoContracts());

    const setContracts = (contracts: DemoContract[]) => {
      const byTenant = new Map<string, DemoTenant>(
        initialGroups.map((group) => [
          group.id,
          {
            id: group.id,
            name: group.name,
            slug: group.slug,
            description: group.description,
            industryFocus: group.industryFocus,
            headquarters: group.headquarters,
          },
        ]),
      );

      const nextGroups = Array.from(byTenant.values()).map((tenant) => ({
        ...tenant,
        contracts: contracts.filter((contract) => contract.tenantId === tenant.id),
      }));

      setGroups(nextGroups);
      setStats({
        tenantCount: nextGroups.length,
        contractCount: contracts.length,
        activeTenantCount: nextGroups.filter((tenant) => tenant.contracts.length > 0)
          .length,
      });
    };

    setContracts(getMergedDemoContracts());
    window.addEventListener("bid-vault-contracts-updated", sync);
    return () => window.removeEventListener("bid-vault-contracts-updated", sync);
  }, [initialGroups, mode]);

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-3">
        {[
          {
            label: "Workspaces",
            value: stats.tenantCount.toString(),
            detail: "The business workspaces you can access here",
          },
          {
            label: "Saved opportunities",
            value: stats.contractCount.toString(),
            detail: "Opportunities ready to review, save, or plan around",
          },
          {
            label: "Busy workspaces",
            value: stats.activeTenantCount.toString(),
            detail: "Workspaces that have live opportunity activity",
          },
        ].map((stat) => (
          <article
            key={stat.label}
            className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-6 shadow-[0_14px_34px_rgba(0,0,0,0.22)]"
          >
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">{stat.label}</p>
            <p className="mt-3 text-3xl font-semibold text-emerald-300">
              {stat.value}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-400">{stat.detail}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_16px_36px_rgba(0,0,0,0.18)] backdrop-blur">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">
                Most important opportunities
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-white">
                Start with the opportunities most likely to need action next.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                These are the opportunities most worth checking first based on timing and activity.
              </p>
            </div>
            <Link
              href="/contracts"
              className={buttonStyles({ variant: "secondary", size: "sm" })}
            >
              View all opportunities
            </Link>
          </div>

          <div className="mt-6 space-y-4">
            {priorityContracts.map((contract) => (
              <Link
                key={contract.id}
                href={`/contracts/${contract.id}`}
                className="block rounded-[1.5rem] border border-white/10 bg-slate-950/65 p-5 transition hover:border-emerald-400/25 hover:bg-emerald-400/[0.05]"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-100">
                        {contract.stage}
                      </span>
                      <span className="text-xs uppercase tracking-[0.22em] text-slate-500">
                        {contract.tenantName}
                      </span>
                    </div>
                    <h3 className="mt-3 text-lg font-semibold text-white">{contract.title}</h3>
                    <p className="mt-2 text-sm text-slate-400">
                      {contract.agency} / {contract.location}
                    </p>
                  </div>
                  <div className="text-sm text-slate-300 md:text-right">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Predicted rebid</p>
                    <p className="mt-2 font-medium text-white">{contract.predictedRebidDate}</p>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 text-sm text-slate-300 md:grid-cols-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Current contract value</p>
                    <p className="mt-1 text-white">{formatCurrency(contract.awardAmount)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Industry type</p>
                    <p className="mt-1 text-white">{contract.naicsCode}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Business workspace</p>
                    <p className="mt-1 text-white">{contract.tenantName}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </article>

        <div className="space-y-6">
          <article className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6 shadow-[0_14px_34px_rgba(0,0,0,0.22)]">
            <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">
              Quick actions
            </p>
            <div className="mt-5 grid gap-3">
              <div>
                <Link
                  href="/contracts"
                  className={buttonStyles({ variant: "primary", size: "lg", className: "w-full" })}
                >
                  Search contracts
                </Link>
              </div>
              <Link
                href="/contracts/new"
                className={buttonStyles({ variant: "secondary", size: "lg", className: "w-full" })}
              >
                Save a new opportunity
              </Link>
              <Link
                href="/planning"
                className={buttonStyles({ variant: "ghost", size: "lg", className: "w-full" })}
              >
                Open saved opportunities
              </Link>
              <Link
                href="/research"
                className={buttonStyles({ variant: "ghost", size: "lg", className: "w-full" })}
              >
                Open research tools
              </Link>
            </div>
          </article>

          <article className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_14px_34px_rgba(0,0,0,0.18)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">
                  Business workspace pages
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Open a workspace page when you want more detail without crowding the dashboard.
                </p>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {groups.map((group) => (
                <Link
                  key={group.id}
                  href={`/tenants/${group.slug}`}
                  className="flex items-center justify-between rounded-[1.5rem] border border-white/10 bg-slate-950/60 px-4 py-4 transition hover:border-emerald-400/20 hover:bg-emerald-400/[0.05]"
                >
                  <div>
                    <p className="font-medium text-white">{group.name}</p>
                    <p className="mt-1 text-sm text-slate-400">
                      {group.contracts.length} contracts / {group.industryFocus}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-emerald-200">Open</span>
                </Link>
              ))}
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
