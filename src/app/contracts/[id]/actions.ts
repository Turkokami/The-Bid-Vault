"use server";

import { saveContractToPlanning } from "@/lib/server/planning";

export type SavePlanningState = {
  status: "idle" | "success" | "error";
  message: string;
};

export const initialSavePlanningState: SavePlanningState = {
  status: "idle",
  message: "",
};

export async function saveContractForPlanning(
  _prevState: SavePlanningState,
  formData: FormData,
): Promise<SavePlanningState> {
  const contractId = String(formData.get("contractId") ?? "");
  const reminderDaysBefore = Number(formData.get("reminderDaysBefore") ?? 30);
  const ownerLabel = String(formData.get("ownerLabel") ?? "Capture team");
  const notes = String(formData.get("notes") ?? "");

  if (!contractId) {
    return {
      status: "error",
      message: "Missing contract id for planning save.",
    };
  }

  const result = await saveContractToPlanning({
    contractId,
    reminderDaysBefore,
    ownerLabel,
    notes,
  });

  return {
    status: result.ok ? "success" : "error",
    message: result.message,
  };
}
