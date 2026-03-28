import { db } from "@/lib/db";
import {
  demoContracts,
  demoTenants,
  getContractById,
  getTenantBySlug,
  type DemoContract,
  type DemoTenant,
  type DemoWinningBid,
} from "@/lib/demo-data";
import { getViewerContext } from "@/lib/server/workspace";

export type DataMode = "database" | "demo";

export type ContractListView = DemoContract;

export type TenantListView = DemoTenant & {
  contracts: ContractListView[];
};

export type DashboardDataView = {
  mode: DataMode;
  groups: TenantListView[];
  stats: {
    tenantCount: number;
    contractCount: number;
    activeTenantCount: number;
  };
};

export type ContractDetailView = ContractListView & {
  tenant: DemoTenant | null;
  winningBid: DemoWinningBid | null;
};

function stageFromDb(stage: string) {
  return stage
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase()) as DemoContract["stage"];
}

function buildKeyTerms(contract: {
  title: string;
  agency: string;
  naicsCode: string;
  state?: string | null;
  summary: string;
}) {
  return [
    contract.title,
    contract.agency,
    contract.naicsCode,
    contract.state ?? "",
    ...contract.summary
      .split(/\W+/)
      .map((item) => item.trim().toLowerCase())
      .filter((item) => item.length > 4)
      .slice(0, 4),
  ]
    .map((item) => item.toLowerCase())
    .filter(Boolean);
}

function mapDbContract(contract: {
  id: string;
  tenantId: string;
  title: string;
  agency: string;
  naicsCode: string;
  state: string | null;
  location: string;
  summary: string;
  awardAmount: { toString(): string } | null;
  awardDate: Date | null;
  expirationDate: Date | null;
  stage: string;
  incumbentCompany: string | null;
  rebidPredictions?: Array<{
    predictedDate: Date;
    confidenceScore: { toString(): string };
  }>;
}) {
  const prediction = contract.rebidPredictions?.[0];

  return {
    id: contract.id,
    tenantId: contract.tenantId,
    title: contract.title,
    agency: contract.agency,
    naicsCode: contract.naicsCode,
    state: contract.state ?? "",
    location: contract.location,
    summary: contract.summary,
    awardAmount: Number(contract.awardAmount?.toString() ?? 0),
    awardDate: contract.awardDate?.toISOString().slice(0, 10) ?? "",
    expirationDate: contract.expirationDate?.toISOString().slice(0, 10) ?? "",
    stage: stageFromDb(contract.stage),
    incumbentCompany: contract.incumbentCompany ?? "Unknown incumbent",
    predictedRebidDate:
      prediction?.predictedDate.toISOString().slice(0, 10) ??
      contract.expirationDate?.toISOString().slice(0, 10) ??
      "",
    confidenceScore: Number(prediction?.confidenceScore.toString() ?? "0.65"),
    keyTerms: buildKeyTerms(contract),
  } satisfies ContractListView;
}

function getDemoDashboardData(activeTenantId?: string | null): DashboardDataView {
  const groups = demoTenants
    .filter((tenant) => (activeTenantId ? tenant.id === activeTenantId : true))
    .map((tenant) => ({
      ...tenant,
      contracts: demoContracts.filter((contract) => contract.tenantId === tenant.id),
    }));

  return {
    mode: "demo",
    groups,
    stats: {
      tenantCount: groups.length,
      contractCount: groups.reduce((total, tenant) => total + tenant.contracts.length, 0),
      activeTenantCount: groups.filter((tenant) => tenant.contracts.length > 0).length,
    },
  };
}

export async function getDashboardData(): Promise<DashboardDataView> {
  const viewer = await getViewerContext();

  try {
    if (viewer.mode === "database" && viewer.workspaces.length > 0) {
      const groups = await db.tenant.findMany({
        where: {
          id: {
            in: viewer.workspaces.map((workspace) => workspace.id),
          },
        },
        include: {
          contracts: {
            where: viewer.activeWorkspace
              ? { tenantId: viewer.activeWorkspace.id }
              : undefined,
            include: {
              rebidPredictions: {
                orderBy: { predictedDate: "desc" },
                take: 1,
              },
            },
            orderBy: {
              awardDate: "desc",
            },
          },
        },
        orderBy: {
          name: "asc",
        },
      });

      const normalizedGroups = groups.map((tenant) => ({
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        description: "Persistent tenant workspace",
        industryFocus: "Workspace ready for beta testing",
        headquarters: "Tenant-managed",
        contracts: tenant.contracts.map(mapDbContract),
      }));

      return {
        mode: "database",
        groups: normalizedGroups,
        stats: {
          tenantCount: normalizedGroups.length,
          contractCount: normalizedGroups.reduce(
            (total, tenant) => total + tenant.contracts.length,
            0,
          ),
          activeTenantCount: normalizedGroups.filter((tenant) => tenant.contracts.length > 0)
            .length,
        },
      };
    }
  } catch {
    // Fall back to demo data while database connectivity is being set up.
  }

  return getDemoDashboardData(viewer.activeWorkspace?.id);
}

export async function getContractsIndex() {
  const viewer = await getViewerContext();

  try {
    if (viewer.mode === "database" && viewer.workspaces.length > 0) {
      const contracts = await db.contract.findMany({
        where: {
          tenantId: viewer.activeWorkspace?.id
            ? viewer.activeWorkspace.id
            : {
                in: viewer.workspaces.map((workspace) => workspace.id),
              },
        },
        include: {
          rebidPredictions: {
            orderBy: { predictedDate: "desc" },
            take: 1,
          },
        },
        orderBy: {
          awardDate: "desc",
        },
      });

      const mappedContracts = contracts.map(mapDbContract);

      const accessibleTenants = demoTenants
        .map((tenant) => {
          const workspace = viewer.workspaces.find((item) => item.id === tenant.id);
          return workspace ? tenant : null;
        })
        .filter((tenant): tenant is DemoTenant => tenant !== null);

      return {
        mode: "database" as const,
        contracts: mappedContracts,
        tenants:
          accessibleTenants.length > 0
            ? accessibleTenants
            : viewer.workspaces.map((workspace) => ({
                id: workspace.id,
                slug: workspace.slug,
                name: workspace.name,
                description: "Persistent tenant workspace",
                industryFocus: workspace.description,
                headquarters: "Tenant-managed",
              })),
      };
    }
  } catch {
    // Use demo data when Postgres is not reachable yet.
  }

  return {
    mode: "demo" as const,
    contracts: demoContracts.filter((contract) =>
      viewer.activeWorkspace ? contract.tenantId === viewer.activeWorkspace.id : true,
    ),
    tenants: demoTenants.filter((tenant) =>
      viewer.activeWorkspace ? tenant.id === viewer.activeWorkspace.id : true,
    ),
  };
}

export async function getContractDetail(contractId: string) {
  const viewer = await getViewerContext();

  try {
    if (viewer.mode === "database") {
      const contract = await db.contract.findFirst({
        where: {
          id: contractId,
          tenantId: {
            in: viewer.workspaces.map((workspace) => workspace.id),
          },
        },
        include: {
          tenant: true,
          winningBids: {
            orderBy: { awardDate: "desc" },
            take: 1,
          },
          rebidPredictions: {
            orderBy: { predictedDate: "desc" },
            take: 1,
          },
        },
      });

      if (contract) {
        const winningBid = contract.winningBids[0];

        return {
          mode: "database" as const,
          contract: {
            ...mapDbContract(contract),
            tenant: {
              id: contract.tenant.id,
              name: contract.tenant.name,
              slug: contract.tenant.slug,
              description: "Persistent tenant workspace",
              industryFocus: "Workspace ready for beta testing",
              headquarters: "Tenant-managed",
            },
            winningBid: winningBid
              ? {
                  id: winningBid.id,
                  contractId: winningBid.contractId,
                  companyName: winningBid.companyName,
                  bidAmount: Number(winningBid.bidAmount?.toString() ?? 0),
                  awardDate: winningBid.awardDate?.toISOString().slice(0, 10) ?? "",
                }
              : null,
          } satisfies ContractDetailView,
        };
      }
    }
  } catch {
    // Continue into demo fallback.
  }

  const contract = getContractById(contractId);
  return {
    mode: "demo" as const,
    contract,
  };
}

export async function getTenantDetail(slug: string) {
  const viewer = await getViewerContext();

  try {
    if (viewer.mode === "database") {
      const tenant = await db.tenant.findFirst({
        where: {
          slug,
          id: {
            in: viewer.workspaces.map((workspace) => workspace.id),
          },
        },
        include: {
          contracts: {
            include: {
              rebidPredictions: {
                orderBy: { predictedDate: "desc" },
                take: 1,
              },
            },
            orderBy: {
              awardDate: "desc",
            },
          },
        },
      });

      if (tenant) {
        return {
          mode: "database" as const,
          tenant: {
            id: tenant.id,
            name: tenant.name,
            slug: tenant.slug,
            description: "Persistent tenant workspace with shared contract visibility.",
            industryFocus: "Workspace ready for beta testing",
            headquarters: "Tenant-managed",
            contracts: tenant.contracts.map(mapDbContract),
          },
        };
      }
    }
  } catch {
    // Continue into demo fallback.
  }

  return {
    mode: "demo" as const,
    tenant: getTenantBySlug(slug),
  };
}

export async function createContractRecord(input: {
  title: string;
  agency: string;
  naicsCode: string;
  state: string;
  location: string;
  summary: string;
  awardAmount: number;
  awardDate: string;
  expirationDate: string;
}) {
  const viewer = await getViewerContext();

  try {
    if (viewer.mode === "database" && viewer.activeWorkspace) {
      const contract = await db.contract.create({
        data: {
          tenantId: viewer.activeWorkspace.id,
          title: input.title,
          agency: input.agency,
          naicsCode: input.naicsCode,
          state: input.state,
          location: input.location,
          summary: input.summary,
          source: "manual-entry",
          sourceExternalId: `manual-${Date.now()}`,
          awardAmount: input.awardAmount.toFixed(2),
          awardDate: new Date(input.awardDate),
          expirationDate: new Date(input.expirationDate),
          stage: "WATCH",
          incumbentCompany: "Pending research",
        },
      });

      await db.rebidPrediction.create({
        data: {
          contractId: contract.id,
          predictedDate: new Date(input.expirationDate),
          confidenceScore: "0.55",
          predictionMethod: "MANUAL",
          notes: "Initial beta prediction generated from the submitted expiration date.",
        },
      });

      return {
        ok: true,
        mode: "database" as const,
        contractId: contract.id,
        message: `Contract added to ${viewer.activeWorkspace.name} and saved to Postgres for beta testing.`,
      };
    }
  } catch {
    // Fall back to local demo persistence.
  }

  return {
    ok: true,
    mode: "demo" as const,
    contractId: null,
    message:
      "Contract validated and added to the demo product flow. Open Contracts or Dashboard to see it.",
  };
}
