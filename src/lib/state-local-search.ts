import type { NormalizedStateLocalOpportunity } from "@/lib/sources/types";

export type StateLocalFilters = {
  keywords: string;
  states: string[];
  sources: string[];
  opportunityTypes: string[];
  entities: string[];
  statuses: string[];
  categoryCodes: string[];
  registration: string[];
  dueFrom: string;
  dueTo: string;
  sortBy: "dueDate" | "postedDate" | "relevance";
  page: number;
};

export function buildStateLocalFilterOptions(records: NormalizedStateLocalOpportunity[]) {
  const unique = (values: string[]) => Array.from(new Set(values)).sort();

  return {
    states: unique(records.map((record) => record.stateCode)),
    sources: unique(records.map((record) => record.sourceName)),
    opportunityTypes: unique(records.map((record) => record.opportunityType)),
    entities: unique(records.map((record) => record.issuingEntity)),
    statuses: unique(records.map((record) => record.status)),
    categoryCodes: unique(records.map((record) => record.categoryCode)),
  };
}

function matchesKeywords(record: NormalizedStateLocalOpportunity, keywords: string) {
  const terms = keywords
    .split(",")
    .flatMap((item) => item.split(/\s+/))
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  if (terms.length === 0) {
    return true;
  }

  const blob = [
    record.title,
    record.issuingEntity,
    record.opportunityType,
    record.summary,
    record.description,
    record.categoryCode,
    record.location,
  ]
    .join(" ")
    .toLowerCase();

  return terms.every((term) => blob.includes(term));
}

function matchesList(value: string, filters: string[]) {
  return filters.length === 0 || filters.includes(value);
}

function matchesRegistration(record: NormalizedStateLocalOpportunity, filters: string[]) {
  if (filters.length === 0) {
    return true;
  }

  const value = record.registrationRequired ? "yes" : "no";
  return filters.includes(value);
}

function withinDateRange(value: string, from: string, to: string) {
  if (!value) {
    return true;
  }

  if (from && value < from) {
    return false;
  }

  if (to && value > to) {
    return false;
  }

  return true;
}

export function filterStateLocalOpportunities(
  records: NormalizedStateLocalOpportunity[],
  filters: StateLocalFilters,
) {
  const filtered = records.filter((record) => {
    return (
      matchesKeywords(record, filters.keywords) &&
      matchesList(record.stateCode, filters.states) &&
      matchesList(record.sourceName, filters.sources) &&
      matchesList(record.opportunityType, filters.opportunityTypes) &&
      matchesList(record.issuingEntity, filters.entities) &&
      matchesList(record.status, filters.statuses) &&
      matchesList(record.categoryCode, filters.categoryCodes) &&
      matchesRegistration(record, filters.registration) &&
      withinDateRange(record.dueDate, filters.dueFrom, filters.dueTo)
    );
  });

  return filtered.sort((left, right) => {
    if (filters.sortBy === "postedDate") {
      return right.postedDate.localeCompare(left.postedDate);
    }

    if (filters.sortBy === "relevance") {
      const score = (record: NormalizedStateLocalOpportunity) =>
        [record.title, record.summary, record.description].join(" ").toLowerCase();
      return score(right).length - score(left).length;
    }

    return left.dueDate.localeCompare(right.dueDate);
  });
}
