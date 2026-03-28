export type CategoryCodeRecord = {
  id: string;
  sourceName: "WEBS" | "PSC" | "Bid Vault Map";
  code: string;
  title: string;
  description: string;
  parentCode?: string;
  topLevelCategory: string;
  normalizedKeywords: string[];
};

export type CategorySearchFilters = {
  query: string;
  exactCode: string;
  sources: string[];
  families: string[];
  letter: string;
};

export const categoryCodeRecords: CategoryCodeRecord[] = [
  {
    id: "cat-webs-910",
    sourceName: "WEBS",
    code: "910",
    title: "Building Maintenance and Repair",
    description:
      "Broad building maintenance family used to group facility repair, service, and upkeep work.",
    topLevelCategory: "Facility Services",
    normalizedKeywords: ["building maintenance", "repair", "facilities", "maintenance"],
  },
  {
    id: "cat-webs-910-59",
    sourceName: "WEBS",
    code: "910-59",
    title: "Pest Control and Extermination",
    description:
      "Routine and emergency pest treatment, rodent control, inspection, exclusion, and monitoring work.",
    parentCode: "910",
    topLevelCategory: "Facility Services",
    normalizedKeywords: [
      "pest control",
      "extermination",
      "rodent control",
      "insect control",
      "pest treatment",
      "monitoring",
    ],
  },
  {
    id: "cat-webs-910-27",
    sourceName: "WEBS",
    code: "910-27",
    title: "Bird Deterrent and Exclusion",
    description:
      "Bird proofing, bird deterrent installation, roofline exclusion, cleanup, and humane prevention work.",
    parentCode: "910",
    topLevelCategory: "Facility Services",
    normalizedKeywords: [
      "bird control",
      "bird deterrent",
      "bird exclusion",
      "bird proofing",
      "roofline sealing",
      "cleanup",
    ],
  },
  {
    id: "cat-webs-910-93",
    sourceName: "WEBS",
    code: "910-93",
    title: "Wildlife Exclusion and Removal Support",
    description:
      "Wildlife inspection, trapping support, sealing entry points, exclusion repairs, and follow-up monitoring.",
    parentCode: "910",
    topLevelCategory: "Facility Services",
    normalizedKeywords: [
      "wildlife control",
      "wildlife exclusion",
      "animal removal",
      "entry-point sealing",
      "attic exclusion",
    ],
  },
  {
    id: "cat-webs-988",
    sourceName: "WEBS",
    code: "988",
    title: "Grounds and Vegetation Services",
    description:
      "Grounds care family used for landscaping, weed control, spraying, irrigation, and grounds upkeep.",
    topLevelCategory: "Grounds and Outdoor Services",
    normalizedKeywords: ["grounds", "landscaping", "vegetation", "weed control", "spraying"],
  },
  {
    id: "cat-webs-988-52",
    sourceName: "WEBS",
    code: "988-52",
    title: "Landscaping and Grounds Maintenance",
    description:
      "Landscaping, mowing, trimming, irrigation checks, and general grounds maintenance services.",
    parentCode: "988",
    topLevelCategory: "Grounds and Outdoor Services",
    normalizedKeywords: [
      "landscaping",
      "grounds maintenance",
      "mowing",
      "trimming",
      "irrigation",
      "outdoor maintenance",
    ],
  },
  {
    id: "cat-webs-988-88",
    sourceName: "WEBS",
    code: "988-88",
    title: "Vegetation Control and Grounds Spraying",
    description:
      "Weed control, herbicide spraying, brush reduction, and vegetation management for public sites.",
    parentCode: "988",
    topLevelCategory: "Grounds and Outdoor Services",
    normalizedKeywords: [
      "vegetation control",
      "weed control",
      "grounds spraying",
      "brush reduction",
      "herbicide",
    ],
  },
  {
    id: "cat-psc-s207",
    sourceName: "PSC",
    code: "S207",
    title: "Pest Control Services",
    description:
      "Federal PSC code commonly used for pest control, extermination, and related treatment services.",
    topLevelCategory: "Facility Services",
    normalizedKeywords: [
      "pest control",
      "federal pest control",
      "extermination",
      "treatment services",
    ],
  },
  {
    id: "cat-psc-s299",
    sourceName: "PSC",
    code: "S299",
    title: "Housekeeping and Janitorial Support",
    description:
      "Federal service category used for janitorial, cleaning, porter, and housekeeping support work.",
    topLevelCategory: "Custodial and Interior Services",
    normalizedKeywords: [
      "janitorial",
      "cleaning",
      "housekeeping",
      "custodial",
      "porter",
      "sanitation",
    ],
  },
  {
    id: "cat-psc-s208",
    sourceName: "PSC",
    code: "S208",
    title: "Grounds Maintenance",
    description:
      "Federal service category used for landscaping, mowing, grounds care, and outdoor maintenance.",
    topLevelCategory: "Grounds and Outdoor Services",
    normalizedKeywords: [
      "grounds maintenance",
      "landscaping",
      "mowing",
      "grounds care",
      "outdoor maintenance",
    ],
  },
  {
    id: "cat-map-facility-protection",
    sourceName: "Bid Vault Map",
    code: "BV-FAC-101",
    title: "Facility Protection and Exclusion",
    description:
      "Internal mapped family that groups pest, rodent, wildlife, and bird exclusion services for easier searching.",
    topLevelCategory: "Facility Services",
    normalizedKeywords: [
      "pest control",
      "rodent control",
      "wildlife exclusion",
      "bird exclusion",
      "facility protection",
    ],
  },
  {
    id: "cat-map-rodent",
    sourceName: "Bid Vault Map",
    code: "BV-FAC-102",
    title: "Rodent Control and Entry Sealing",
    description:
      "Mapped category for rodent trapping, entry-point sealing, crawlspace exclusion, and monitoring.",
    parentCode: "BV-FAC-101",
    topLevelCategory: "Facility Services",
    normalizedKeywords: [
      "rodent control",
      "mice",
      "rats",
      "entry sealing",
      "crawlspace exclusion",
      "monitoring",
    ],
  },
  {
    id: "cat-map-bird",
    sourceName: "Bid Vault Map",
    code: "BV-FAC-103",
    title: "Bird Control and Deterrent Systems",
    description:
      "Mapped category for bird netting, spikes, deterrent systems, cleanup, and humane bird prevention.",
    parentCode: "BV-FAC-101",
    topLevelCategory: "Facility Services",
    normalizedKeywords: [
      "bird control",
      "bird spikes",
      "bird netting",
      "bird deterrent",
      "cleanup",
      "prevention",
    ],
  },
  {
    id: "cat-map-janitorial",
    sourceName: "Bid Vault Map",
    code: "BV-CUST-201",
    title: "Cleaning and Janitorial",
    description:
      "Mapped category for janitorial, disinfecting, porter, restroom care, and custodial service lines.",
    topLevelCategory: "Custodial and Interior Services",
    normalizedKeywords: [
      "janitorial",
      "cleaning",
      "custodial",
      "restroom care",
      "porter",
      "disinfecting",
    ],
  },
  {
    id: "cat-map-landscape",
    sourceName: "Bid Vault Map",
    code: "BV-GROUNDS-301",
    title: "Landscaping and Outdoor Care",
    description:
      "Mapped category for landscaping, irrigation support, grounds upkeep, and vegetation management.",
    topLevelCategory: "Grounds and Outdoor Services",
    normalizedKeywords: [
      "landscaping",
      "grounds maintenance",
      "weed control",
      "grounds spraying",
      "irrigation",
      "vegetation control",
    ],
  },
];

export function buildCategoryFilterOptions(records: CategoryCodeRecord[]) {
  const unique = (values: string[]) => Array.from(new Set(values)).sort();
  return {
    sources: unique(records.map((record) => record.sourceName)),
    families: unique(records.map((record) => record.topLevelCategory)),
    letters: unique(records.map((record) => record.title.charAt(0).toUpperCase())),
  };
}

function tokenize(value: string) {
  return value
    .toLowerCase()
    .split(/[\s,/()-]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function findRelatedCategoryCodes(record: CategoryCodeRecord, records: CategoryCodeRecord[]) {
  const keywordSet = new Set(record.normalizedKeywords);

  return records
    .filter((item) => item.id !== record.id)
    .map((item) => {
      let score = 0;
      if (item.topLevelCategory === record.topLevelCategory) score += 3;
      if (item.parentCode && item.parentCode === record.parentCode) score += 2;
      if (item.parentCode === record.code || record.parentCode === item.code) score += 2;
      score += item.normalizedKeywords.filter((keyword) => keywordSet.has(keyword)).length;
      return { item, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score || left.item.title.localeCompare(right.item.title))
    .slice(0, 5)
    .map((entry) => entry.item);
}

export function searchCategoryCodes(records: CategoryCodeRecord[], filters: CategorySearchFilters) {
  const queryTerms = tokenize(filters.query);
  const exactCode = filters.exactCode.trim().toLowerCase();

  const filtered = records.filter((record) => {
    if (filters.sources.length > 0 && !filters.sources.includes(record.sourceName)) {
      return false;
    }

    if (filters.families.length > 0 && !filters.families.includes(record.topLevelCategory)) {
      return false;
    }

    if (filters.letter && record.title.charAt(0).toUpperCase() !== filters.letter) {
      return false;
    }

    if (exactCode && !record.code.toLowerCase().includes(exactCode)) {
      return false;
    }

    if (queryTerms.length === 0) {
      return true;
    }

    const haystack = [
      record.code,
      record.title,
      record.description,
      record.topLevelCategory,
      ...record.normalizedKeywords,
    ]
      .join(" ")
      .toLowerCase();

    return queryTerms.every((term) => haystack.includes(term));
  });

  return filtered.sort((left, right) => {
    if (!filters.query) {
      return left.title.localeCompare(right.title);
    }

    const score = (record: CategoryCodeRecord) => {
      let total = 0;
      const haystack = [record.title, record.description, ...record.normalizedKeywords].join(" ").toLowerCase();
      for (const term of queryTerms) {
        if (record.title.toLowerCase().includes(term)) total += 4;
        if (record.code.toLowerCase().includes(term)) total += 5;
        if (record.normalizedKeywords.some((keyword) => keyword.includes(term))) total += 3;
        if (haystack.includes(term)) total += 1;
      }
      return total;
    };

    return score(right) - score(left) || left.title.localeCompare(right.title);
  });
}

export function mapServicePhraseToSuggestedCategories(query: string, records: CategoryCodeRecord[]) {
  const searchResults = searchCategoryCodes(records, {
    query,
    exactCode: "",
    sources: [],
    families: [],
    letter: "",
  });

  const relatedPool = searchResults.flatMap((record) => findRelatedCategoryCodes(record, records));
  const unique = new Map<string, CategoryCodeRecord>();
  [...searchResults, ...relatedPool].forEach((record) => unique.set(record.id, record));

  return Array.from(unique.values()).slice(0, 8);
}
