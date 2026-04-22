"use client";

const SAVED_CATEGORY_CODES_KEY = "bid-vault-saved-category-codes";
const SAVED_NAICS_CODE_LISTS_KEY = "bid-vault-saved-naics-code-lists";

export type SavedNaicsCodeList = {
  id: string;
  name: string;
  codes: string[];
  samCodes?: string[];
  websCodes?: string[];
  pscCodes?: string[];
  searchTerms?: string[];
  createdAt: string;
  updatedAt: string;
};

export type CustomCodeListInput = {
  name: string;
  codes: string[];
  samCodes?: string[];
  websCodes?: string[];
  pscCodes?: string[];
  searchTerms?: string[];
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
      samCodes: Array.from(new Set((list.samCodes ?? list.codes.filter(isLikelyNaicsCode)).map(cleanCode))),
      websCodes: Array.from(
        new Set((list.websCodes ?? list.codes.filter((code) => !isLikelyNaicsCode(code))).map(cleanCode)),
      ),
      pscCodes: Array.from(new Set((list.pscCodes ?? []).map(cleanCode))),
      searchTerms: Array.from(new Set((list.searchTerms ?? []).map((term) => term.trim()).filter(Boolean))),
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

function cleanCode(code: string) {
  return code.trim();
}

function isLikelyNaicsCode(code: string) {
  return /^\d{6}$/.test(code.trim());
}

export function saveCustomCodeList(input: CustomCodeListInput) {
  if (typeof window === "undefined") {
    return;
  }

  const trimmedName = input.name.trim();
  const normalizedCodes = Array.from(new Set(input.codes.map(cleanCode).filter(Boolean)));
  const samCodes = Array.from(
    new Set((input.samCodes ?? normalizedCodes.filter(isLikelyNaicsCode)).map(cleanCode).filter(Boolean)),
  );
  const websCodes = Array.from(
    new Set(
      (input.websCodes ?? normalizedCodes.filter((code) => !isLikelyNaicsCode(code)))
        .map(cleanCode)
        .filter(Boolean),
    ),
  );
  const pscCodes = Array.from(new Set((input.pscCodes ?? []).map(cleanCode).filter(Boolean)));
  const searchTerms = Array.from(
    new Set((input.searchTerms ?? []).map((term) => term.trim()).filter(Boolean)),
  );

  if (!trimmedName || normalizedCodes.length === 0) {
    return;
  }

  const current = readSavedNaicsCodeLists();
  const existing = current.find((list) => list.name.toLowerCase() === trimmedName.toLowerCase());

  const next: SavedNaicsCodeList = {
    id: existing?.id ?? buildNaicsListId(trimmedName),
    name: trimmedName,
    codes: normalizedCodes,
    samCodes,
    websCodes,
    pscCodes,
    searchTerms,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  writeSavedNaicsCodeLists([
    next,
    ...current.filter((list) => list.name.toLowerCase() !== trimmedName.toLowerCase()),
  ]);
}

export function saveNaicsCodeList(name: string, codes: string[]) {
  saveCustomCodeList({
    name,
    codes,
    samCodes: codes,
    searchTerms: [],
  });
}

export function removeNaicsCodeList(id: string) {
  if (typeof window === "undefined") {
    return;
  }

  writeSavedNaicsCodeLists(readSavedNaicsCodeLists().filter((list) => list.id !== id));
}
