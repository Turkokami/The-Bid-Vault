import { db } from "@/lib/db";
import {
  demoContracts,
  getPlanningCalendarEvents,
  getSavedContractsWithPlans,
  keywordTrackingGroups,
} from "@/lib/demo-data";
import { getViewerContext } from "@/lib/server/workspace";

export type SavedContractPlanView = ReturnType<typeof getSavedContractsWithPlans>[number];
export type PlanningCalendarEventView = ReturnType<typeof getPlanningCalendarEvents>[number];

const DEMO_FALLBACK_MESSAGE = "__demo_fallback__";

function stageFromDb(stage: string) {
  return stage
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase()) as
    | "Active"
    | "Watch"
    | "Rebid Soon";
}

export async function getSavedContractsWithFallback(): Promise<SavedContractPlanView[]> {
  const viewer = await getViewerContext();

  try {
    const savedContracts = await db.savedContract.findMany({
      where: {
        user: { email: viewer.user.email },
        ...(viewer.activeWorkspace
          ? { contract: { tenantId: viewer.activeWorkspace.id } }
          : {}),
      },
      include: {
        contract: {
          include: {
            rebidPredictions: {
              orderBy: { predictedDate: "desc" },
              take: 1,
            },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    if (savedContracts.length === 0) {
      return getSavedContractsWithPlans();
    }

    return savedContracts.map((saved) => {
      const prediction = saved.contract.rebidPredictions[0];

      return {
        id: saved.id,
        contractId: saved.contractId,
        reminderDaysBefore: saved.reminderDaysBefore,
        ownerLabel: saved.ownerLabel ?? "Capture team",
        notes: saved.notes ?? "Review scope and pricing before the next rebid window.",
        contract: {
          id: saved.contract.id,
          tenantId: saved.contract.tenantId,
          title: saved.contract.title,
          agency: saved.contract.agency,
          naicsCode: saved.contract.naicsCode,
          state: saved.contract.state ?? "",
          location: saved.contract.location,
          summary: saved.contract.summary,
          awardAmount: Number(saved.contract.awardAmount ?? 0),
          awardDate: saved.contract.awardDate?.toISOString().slice(0, 10) ?? "",
          expirationDate:
            saved.contract.expirationDate?.toISOString().slice(0, 10) ?? "",
          stage: stageFromDb(saved.contract.stage),
          incumbentCompany: saved.contract.incumbentCompany ?? "Unknown incumbent",
          predictedRebidDate:
            prediction?.predictedDate.toISOString().slice(0, 10) ??
            saved.contract.expirationDate?.toISOString().slice(0, 10) ??
            "",
          confidenceScore: Number(prediction?.confidenceScore ?? 0.65),
          keyTerms: [],
        },
      };
    });
  } catch {
    return getSavedContractsWithPlans();
  }
}

export async function getPlanningCalendarWithFallback(): Promise<
  PlanningCalendarEventView[]
> {
  const savedContracts = await getSavedContractsWithFallback();

  if (savedContracts.some((item) => item.id.startsWith("saved-"))) {
    return getPlanningCalendarEvents();
  }

  return savedContracts
    .flatMap((saved) => {
      const predictedDate = new Date(saved.contract.predictedRebidDate);
      const reminderDate = new Date(predictedDate);
      reminderDate.setDate(predictedDate.getDate() - saved.reminderDaysBefore);

      return [
        {
          id: `${saved.id}-reminder`,
          contractId: saved.contract.id,
          title: saved.contract.title,
          agency: saved.contract.agency,
          location: saved.contract.location,
          eventDate: reminderDate.toISOString().slice(0, 10),
          eventType: "Reminder" as const,
          reminderDaysBefore: saved.reminderDaysBefore,
          source: "Saved Contract" as const,
        },
        {
          id: `${saved.id}-rebid`,
          contractId: saved.contract.id,
          title: saved.contract.title,
          agency: saved.contract.agency,
          location: saved.contract.location,
          eventDate: saved.contract.predictedRebidDate,
          eventType: "Predicted Rebid" as const,
          source: "Saved Contract" as const,
        },
        {
          id: `${saved.id}-expiration`,
          contractId: saved.contract.id,
          title: saved.contract.title,
          agency: saved.contract.agency,
          location: saved.contract.location,
          eventDate: saved.contract.expirationDate,
          eventType: "Expiration" as const,
          source: "Saved Contract" as const,
        },
      ];
    })
    .sort((left, right) => left.eventDate.localeCompare(right.eventDate));
}

export { keywordTrackingGroups, DEMO_FALLBACK_MESSAGE };

export async function saveContractToPlanning(input: {
  contractId: string;
  reminderDaysBefore: number;
  ownerLabel: string;
  notes: string;
}) {
  const viewer = await getViewerContext();

  try {
    const contract = await db.contract.findFirst({
      where: {
        id: input.contractId,
        tenantId: {
          in: viewer.workspaces.map((workspace) => workspace.id),
        },
      },
    });

    if (!contract) {
      return {
        ok: false,
        message:
          "This save action is ready, but the selected contract is not in the connected database yet.",
      };
    }

    const user = await db.user.upsert({
      where: { email: viewer.user.email },
      update: { name: viewer.user.name },
      create: { email: viewer.user.email, name: viewer.user.name },
    });

    await db.savedContract.upsert({
      where: {
        userId_contractId: {
          userId: user.id,
          contractId: input.contractId,
        },
      },
      update: {
        reminderDaysBefore: input.reminderDaysBefore,
        ownerLabel: input.ownerLabel,
        notes: input.notes,
      },
      create: {
        userId: user.id,
        contractId: input.contractId,
        reminderDaysBefore: input.reminderDaysBefore,
        ownerLabel: input.ownerLabel,
        notes: input.notes,
      },
    });

    return {
      ok: true,
      message:
        "Contract saved to the planning calendar. Reminder timing will be driven by the predicted rebid date and current expiration.",
    };
  } catch {
    const contract = demoContracts.find((item) => item.id === input.contractId);

    return {
      ok: true,
      message: contract
        ? `Demo mode: "${contract.title}" is treated as saved with a ${input.reminderDaysBefore}-day reminder until Postgres is connected.`
        : "Demo mode: planning save captured locally until Postgres is connected.",
    };
  }
}
