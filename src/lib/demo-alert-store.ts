export type AlertChannel = "email" | "sms";
export type AlertScope = "sam" | "state-local";
export type AlertFrequency = "as-soon-as-found" | "daily" | "weekly";

export type SavedAlertRule = {
  id: string;
  industry: string;
  stateCode: string;
  countiesOrCities: string;
  keywords: string;
  categoryCodes: string[];
  channels: AlertChannel[];
  scopes: AlertScope[];
  frequency: AlertFrequency;
  email: string;
  phone: string;
  createdAt: string;
};

const STORAGE_KEY = "bid-vault-alert-rules";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function readSavedAlertRules(): SavedAlertRule[] {
  if (!canUseStorage()) return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedAlertRule[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeSavedAlertRules(rules: SavedAlertRule[]) {
  if (!canUseStorage()) return;

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rules));
  window.dispatchEvent(new Event("bid-vault-alert-rules-updated"));
}

export function saveAlertRule(
  input: Omit<SavedAlertRule, "id" | "createdAt">,
) {
  const rules = readSavedAlertRules();
  const nextRule: SavedAlertRule = {
    ...input,
    id: `alert-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  writeSavedAlertRules([nextRule, ...rules]);
  return nextRule;
}

export function removeAlertRule(id: string) {
  writeSavedAlertRules(readSavedAlertRules().filter((rule) => rule.id !== id));
}
