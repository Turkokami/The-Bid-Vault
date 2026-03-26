"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { type DemoContract, type DemoTenant } from "@/lib/demo-data";
import { getMergedDemoContracts } from "@/lib/demo-contract-store";
import { formatCurrency } from "@/lib/format";
import type { DashboardDataView } from "@/lib/server/contracts";

type DashboardGroup = DashboardDataView["groups"][number];

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
    <>
      <section className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Tenant count", value: stats.tenantCount.toString() },
          { label: "Contract count", value: stats.contractCount.toString() },
          { label: "Active tenant count", value: stats.activeTenantCount.toString() },
        ].map((stat) => (
          <article
            key={stat.label}
            className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-5"
          >
            <p className="text-sm text-slate-400">{stat.label}</p>
            <p className="mt-3 text-3xl font-semibold text-emerald-300">
              {stat.value}
            </p>
          </article>
        ))}
      </section>

      <section className="grid gap-5">
        {groups.map((group) => (
          <article
            key={group.id}
            className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">{group.name}</h2>
                <p className="mt-2 text-sm text-slate-400">
                  {group.industryFocus} / {group.headquarters}
                </p>
              </div>
              <Link
                href={`/tenants/${group.slug}`}
                className="text-sm font-medium text-emerald-300 hover:text-emerald-200"
              >
                View tenant
              </Link>
            </div>

            <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-white/10">
              <div className="grid grid-cols-[1.6fr_1fr_0.8fr_0.8fr] gap-4 bg-slate-950/80 px-4 py-3 text-xs uppercase tracking-[0.2em] text-slate-400">
                <span>Contract</span>
                <span>Agency</span>
                <span>Award</span>
                <span>Stage</span>
              </div>
              {group.contracts.map((contract) => (
                <div
                  key={contract.id}
                  className="grid grid-cols-[1.6fr_1fr_0.8fr_0.8fr] gap-4 border-t border-white/10 bg-white/5 px-4 py-4 text-sm text-slate-200"
                >
                  <span className="font-medium text-white">{contract.title}</span>
                  <span>{contract.agency}</span>
                  <span>{formatCurrency(contract.awardAmount)}</span>
                  <span className="text-emerald-300">{contract.stage}</span>
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
