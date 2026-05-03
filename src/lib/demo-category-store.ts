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
  recordIds?: string[];
};

let savedCategoryCodeIdsCache: string[] | null = null;
let savedNaicsCodeListsCache: SavedNaicsCodeList[] | null = null;
let persistenceMode: "unknown" | "local" | "account" = "unknown";

function dispatchSavedCodeEvents() {
  window.dispatchEvent(new CustomEvent("bid-vault-category-codes-updated"));
  window.dispatchEvent(new CustomEvent("bid-vault-naics-code-lists-updated"));
}

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
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

function normalizeSavedList(list: SavedNaicsCodeList): SavedNaicsCodeList {
  return {
    ...list,
    codes: Array.from(new Set(list.codes.map((code) => code.trim()).filter(Boolean))),
    samCodes: Array.from(new Set((list.samCodes ?? list.codes.filter(isLikelyNaicsCode)).map(cleanCode))),
    websCodes: Array.from(
      new Set((list.websCodes ?? list.codes.filter((code) => !isLikelyNaicsCode(code))).map(cleanCode)),
    ),
    pscCodes: Array.from(new Set((list.pscCodes ?? []).map(cleanCode))),
    searchTerms: Array.from(new Set((list.searchTerms ?? []).map((term) => term.trim()).filter(Boolean))),
  };
}

function readLocalSavedCategoryCodeIds() {
  if (!canUseStorage()) {
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

function writeLocalSavedCategoryCodeIds(ids: string[]) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(SAVED_CATEGORY_CODES_KEY, JSON.stringify(ids));
}

function readLocalSavedNaicsCodeLists() {
  if (!canUseStorage()) {
    return [] as SavedNaicsCodeList[];
  }

  const raw = window.localStorage.getItem(SAVED_NAICS_CODE_LISTS_KEY);
  if (!raw) {
    return [] as SavedNaicsCodeList[];
  }

  try {
    return (JSON.parse(raw) as SavedNaicsCodeList[]).map(normalizeSavedList);
  } catch {
    return [] as SavedNaicsCodeList[];
  }
}

function writeLocalSavedNaicsCodeLists(lists: SavedNaicsCodeList[]) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(SAVED_NAICS_CODE_LISTS_KEY, JSON.stringify(lists));
}

async function fetchAccountMyCodes() {
  const response = await fetch("/api/account/my-codes", {
    cache: "no-store",
    credentials: "same-origin",
  });

  if (response.status === 401) {
    persistenceMode = "local";
    return null;
  }

  if (!response.ok) {
    throw new Error("Unable to load saved codes for this account.");
  }

  const data = (await response.json()) as {
    authenticated: boolean;
    savedCategoryCodeIds: string[];
    savedCodeLists: SavedNaicsCodeList[];
  };

  if (!data.authenticated) {
    persistenceMode = "local";
    return null;
  }

  persistenceMode = "account";
  return {
    savedCategoryCodeIds: data.savedCategoryCodeIds,
    savedCodeLists: data.savedCodeLists.map(normalizeSavedList),
  };
}

export async function hydrateSavedCategoryPreferences() {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const accountData = await fetchAccountMyCodes();
    if (accountData) {
      savedCategoryCodeIdsCache = accountData.savedCategoryCodeIds;
      savedNaicsCodeListsCache = accountData.savedCodeLists;
      dispatchSavedCodeEvents();
      return;
    }
  } catch {
    persistenceMode = "local";
  }

  savedCategoryCodeIdsCache = readLocalSavedCategoryCodeIds();
  savedNaicsCodeListsCache = readLocalSavedNaicsCodeLists();
  dispatchSavedCodeEvents();
}

export function readSavedCategoryCodeIds() {
  if (savedCategoryCodeIdsCache) {
    return savedCategoryCodeIdsCache;
  }

  const localIds = readLocalSavedCategoryCodeIds();
  if (persistenceMode !== "account") {
    savedCategoryCodeIdsCache = localIds;
  }
  return localIds;
}

export async function saveCategoryCodeId(id: string) {
  const current = new Set(readSavedCategoryCodeIds());
  current.add(id);
  savedCategoryCodeIdsCache = Array.from(current);

  if (persistenceMode === "local") {
    writeLocalSavedCategoryCodeIds(savedCategoryCodeIdsCache);
  }

  dispatchSavedCodeEvents();

  if (persistenceMode !== "local") {
    const response = await fetch("/api/account/my-codes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        action: "save-category-code",
        recordId: id,
      }),
    });

    if (response.status === 401) {
      persistenceMode = "local";
      writeLocalSavedCategoryCodeIds(savedCategoryCodeIdsCache);
      dispatchSavedCodeEvents();
    }
  }
}

export async function removeCategoryCodeId(id: string) {
  const current = new Set(readSavedCategoryCodeIds());
  current.delete(id);
  savedCategoryCodeIdsCache = Array.from(current);

  if (persistenceMode === "local") {
    writeLocalSavedCategoryCodeIds(savedCategoryCodeIdsCache);
  }

  dispatchSavedCodeEvents();

  if (persistenceMode !== "local") {
    const response = await fetch("/api/account/my-codes", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        action: "remove-category-code",
        recordId: id,
      }),
    });

    if (response.status === 401) {
      persistenceMode = "local";
      writeLocalSavedCategoryCodeIds(savedCategoryCodeIdsCache);
      dispatchSavedCodeEvents();
    }
  }
}

export function readSavedNaicsCodeLists() {
  if (savedNaicsCodeListsCache) {
    return savedNaicsCodeListsCache;
  }

  const localLists = readLocalSavedNaicsCodeLists();
  if (persistenceMode !== "account") {
    savedNaicsCodeListsCache = localLists;
  }
  return localLists;
}

function updateSavedNaicsCodeListsCache(lists: SavedNaicsCodeList[]) {
  savedNaicsCodeListsCache = lists.map(normalizeSavedList);
  if (persistenceMode === "local") {
    writeLocalSavedNaicsCodeLists(savedNaicsCodeListsCache);
  }
  dispatchSavedCodeEvents();
}

export async function saveCustomCodeList(input: CustomCodeListInput) {
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
  const next: SavedNaicsCodeList = normalizeSavedList({
    id: existing?.id ?? buildNaicsListId(trimmedName),
    name: trimmedName,
    codes: normalizedCodes,
    samCodes,
    websCodes,
    pscCodes,
    searchTerms,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  updateSavedNaicsCodeListsCache([
    next,
    ...current.filter((list) => list.name.toLowerCase() !== trimmedName.toLowerCase()),
  ]);

  if (persistenceMode !== "local" && input.recordIds?.length) {
    const response = await fetch("/api/account/my-codes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        action: "save-code-list",
        name: trimmedName,
        recordIds: input.recordIds,
        searchTerms,
      }),
    });

    if (response.status === 401) {
      persistenceMode = "local";
      writeLocalSavedNaicsCodeLists(savedNaicsCodeListsCache ?? []);
      dispatchSavedCodeEvents();
    } else if (response.ok) {
      const payload = (await response.json()) as {
        list?: SavedNaicsCodeList;
      };
      if (payload.list) {
        updateSavedNaicsCodeListsCache([
          normalizeSavedList(payload.list),
          ...readSavedNaicsCodeLists().filter((list) => list.id !== payload.list?.id),
        ]);
      }
    }
  }
}

export async function saveNaicsCodeList(name: string, codes: string[]) {
  await saveCustomCodeList({
    name,
    codes,
    samCodes: codes,
    searchTerms: [],
  });
}

export async function removeNaicsCodeList(id: string) {
  if (typeof window === "undefined") {
    return;
  }

  updateSavedNaicsCodeListsCache(readSavedNaicsCodeLists().filter((list) => list.id !== id));

  if (persistenceMode !== "local") {
    const response = await fetch("/api/account/my-codes", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        action: "remove-code-list",
        listId: id,
      }),
    });

    if (response.status === 401) {
      persistenceMode = "local";
      writeLocalSavedNaicsCodeLists(savedNaicsCodeListsCache ?? []);
      dispatchSavedCodeEvents();
    }
  }
}
