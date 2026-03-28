"use client";

const SAVED_CATEGORY_CODES_KEY = "bid-vault-saved-category-codes";

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
