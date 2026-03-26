"use server";

import { z } from "zod";
import { createContractRecord } from "@/lib/server/contracts";

const contractSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  agency: z.string().min(2, "Agency is required."),
  naicsCode: z
    .string()
    .regex(/^\d{6}$/, "NAICS code must be exactly 6 digits."),
  state: z.string().min(2, "State is required.").max(2, "Use a 2-letter state."),
  location: z.string().min(2, "Location is required."),
  summary: z.string().min(20, "Summary must be at least 20 characters."),
  awardAmount: z.coerce.number().positive("Award amount must be greater than 0."),
  awardDate: z.string().min(1, "Award date is required."),
  expirationDate: z.string().min(1, "Expiration date is required."),
});

export type CreateContractState = {
  status: "idle" | "success" | "error";
  message: string;
  mode?: "database" | "demo";
  contractId?: string | null;
  fieldErrors?: Record<string, string[] | undefined>;
};

export const initialCreateContractState: CreateContractState = {
  status: "idle",
  message: "",
};

export async function createContract(
  _prevState: CreateContractState,
  formData: FormData,
): Promise<CreateContractState> {
  const values = {
    title: formData.get("title"),
    agency: formData.get("agency"),
    naicsCode: formData.get("naicsCode"),
    state: formData.get("state"),
    location: formData.get("location"),
    summary: formData.get("summary"),
    awardAmount: formData.get("awardAmount"),
    awardDate: formData.get("awardDate"),
    expirationDate: formData.get("expirationDate"),
  };

  const parsed = contractSchema.safeParse(values);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please fix the highlighted fields and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const result = await createContractRecord(parsed.data);

  return {
    status: result.ok ? "success" : "error",
    message: result.message,
    mode: result.mode,
    contractId: result.contractId,
  };
}
