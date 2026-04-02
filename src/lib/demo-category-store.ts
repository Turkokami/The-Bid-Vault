"use client";

const SAVED_CATEGORY_CODES_KEY = "bid-vault-saved-category-codes";
const SAVED_NAICS_CODE_LISTS_KEY = "bid-vault-saved-naics-code-lists";

export type SavedNaicsCodeList = {
  id: string;
  name: string;
  codes: string[];
  createdAt: string;
  updatedAt: string;
};

export function readSavedCategoryCodeIds() {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(SAVED_CATEGORY_CODES_KEY);
  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

export function saveCategoryCodeId(id: string) {
  const current = new Set(readSavedCategoryCodeIds());
  current.add(id);
  window.localStorage.setItem(SAVED_CATEGORY_CODES_KEY, JSON.stringify(Array.from(current)));
  window.dispatchEvent(new CustomEvent("bid-vault-category-codes-updated"));
}

export function removeCategoryCodeId(id: string) {
  const current = new Set(readSavedCategoryCodeIds());
  current.delete(id);
  window.localStorage.setItem(SAVED_CATEGORY_CODES_KEY, JSON.stringify(Array.from(current)));
  window.dispatchEvent(new CustomEvent("bid-vault-category-codes-updated"));
}

export function readSavedNaicsCodeLists() {
  if (typeof window === "undefined") {
    return [] as SavedNaicsCodeList[];
  }

  const raw = window.localStorage.getItem(SAVED_NAICS_CODE_LISTS_KEY);
  if (!raw) {
    return [] as SavedNaicsCodeList[];
  }

  try {
    const parsed = JSON.parse(raw) as SavedNaicsCodeList[];
    return parsed.map((list) => ({
      ...list,
      codes: Array.from(new Set(list.codes.map((code) => code.trim()).filter(Boolean))),
    }));
  } catch {
    return [] as SavedNaicsCodeList[];
  }
}

function writeSavedNaicsCodeLists(lists: SavedNaicsCodeList[]) {
  window.localStorage.setItem(SAVED_NAICS_CODE_LISTS_KEY, JSON.stringify(lists));
  window.dispatchEvent(new CustomEvent("bid-vault-naics-code-lists-updated"));
}

function buildNaicsListId(name: string) {
  return `naics-list-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

export function saveNaicsCodeList(name: string, codes: string[]) {
  if (typeof window === "undefined") {
    return;
  }

  const trimmedName = name.trim();
  const normalizedCodes = Array.from(new Set(codes.map((code) => code.trim()).filter(Boolean)));

  if (!trimmedName || normalizedCodes.length === 0) {
    return;
  }

  const current = readSavedNaicsCodeLists();
  const existing = current.find((list) => list.name.toLowerCase() === trimmedName.toLowerCase());

  const next: SavedNaicsCodeList = {
    id: existing?.id ?? buildNaicsListId(trimmedName),
    name: trimmedName,
    codes: normalizedCodes,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  writeSavedNaicsCodeLists([
    next,
    ...current.filter((list) => list.name.toLowerCase() !== trimmedName.toLowerCase()),
  ]);
}

export function removeNaicsCodeList(id: string) {
  if (typeof window === "undefined") {
    return;
  }

  writeSavedNaicsCodeLists(readSavedNaicsCodeLists().filter((list) => list.id !== id));
}
