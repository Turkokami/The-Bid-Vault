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
  {
    id: "cat-webs-909",
    sourceName: "WEBS",
    code: "909",
    title: "Building Construction Trades",
    description:
      "Broad construction family used to group skilled building trades, specialty installation, and repair work.",
    topLevelCategory: "Construction and Trades",
    normalizedKeywords: ["construction", "trades", "building repair", "specialty contractor"],
  },
  {
    id: "cat-webs-909-60",
    sourceName: "WEBS",
    code: "909-60",
    title: "Plumbing and Pipefitting",
    description:
      "Plumbing installation, pipe repair, fixtures, drain work, sewer work, backflow devices, and service calls.",
    parentCode: "909",
    topLevelCategory: "Construction and Trades",
    normalizedKeywords: [
      "plumbing",
      "plumber",
      "pipefitting",
      "fixtures",
      "drains",
      "sewer",
      "water heater",
      "backflow",
      "restroom repair",
    ],
  },
  {
    id: "cat-webs-909-61",
    sourceName: "WEBS",
    code: "909-61",
    title: "Electrical Services",
    description:
      "Electrical installation, rewiring, service upgrades, lighting, panels, controls, and troubleshooting.",
    parentCode: "909",
    topLevelCategory: "Construction and Trades",
    normalizedKeywords: [
      "electrical",
      "electrician",
      "rewiring",
      "lighting",
      "panel",
      "service upgrade",
      "troubleshooting",
      "breaker",
      "conduit",
    ],
  },
  {
    id: "cat-webs-909-62",
    sourceName: "WEBS",
    code: "909-62",
    title: "HVAC and Mechanical",
    description:
      "Heating, ventilation, air conditioning, mechanical repair, controls, testing, and system replacement.",
    parentCode: "909",
    topLevelCategory: "Construction and Trades",
    normalizedKeywords: [
      "hvac",
      "mechanical",
      "air conditioning",
      "heating",
      "ventilation",
      "boiler",
      "chiller",
      "ductwork",
      "thermostat",
    ],
  },
  {
    id: "cat-webs-909-63",
    sourceName: "WEBS",
    code: "909-63",
    title: "Roofing and Waterproofing",
    description:
      "Roof replacement, roof repair, waterproofing, leak response, coatings, flashing, and gutter work.",
    parentCode: "909",
    topLevelCategory: "Construction and Trades",
    normalizedKeywords: [
      "roofing",
      "roofer",
      "roof repair",
      "waterproofing",
      "coatings",
      "leak repair",
      "flashing",
      "gutter",
      "membrane roof",
    ],
  },
  {
    id: "cat-webs-909-64",
    sourceName: "WEBS",
    code: "909-64",
    title: "Doors, Frames, and Hardware",
    description:
      "Commercial door installation, frames, panic hardware, closers, locks, rolling doors, and repairs.",
    parentCode: "909",
    topLevelCategory: "Construction and Trades",
    normalizedKeywords: [
      "door contractor",
      "doors",
      "frames",
      "hardware",
      "panic bar",
      "closer",
      "rolling door",
      "entry door",
      "overhead door",
    ],
  },
  {
    id: "cat-webs-909-65",
    sourceName: "WEBS",
    code: "909-65",
    title: "Windows, Glass, and Glazing",
    description:
      "Window replacement, storefront glazing, insulated glass units, mirrors, and related repair work.",
    parentCode: "909",
    topLevelCategory: "Construction and Trades",
    normalizedKeywords: [
      "glazing",
      "glass",
      "window replacement",
      "storefront",
      "mirror",
      "glazier",
      "insulated glass",
      "window repair",
    ],
  },
  {
    id: "cat-webs-909-66",
    sourceName: "WEBS",
    code: "909-66",
    title: "Painting and Protective Coatings",
    description:
      "Interior painting, exterior painting, coatings, striping, wall preparation, and specialty finishes.",
    parentCode: "909",
    topLevelCategory: "Construction and Trades",
    normalizedKeywords: [
      "painting",
      "painter",
      "protective coatings",
      "wall coating",
      "striping",
      "surface prep",
      "exterior painting",
      "interior painting",
    ],
  },
  {
    id: "cat-webs-909-67",
    sourceName: "WEBS",
    code: "909-67",
    title: "Flooring and Tile",
    description:
      "Flooring installation, floor repair, tile work, resilient flooring, carpet, and polishing services.",
    parentCode: "909",
    topLevelCategory: "Construction and Trades",
    normalizedKeywords: [
      "flooring",
      "tile",
      "carpet",
      "vinyl plank",
      "resilient flooring",
      "floor repair",
      "floor polishing",
      "epoxy floor",
    ],
  },
  {
    id: "cat-webs-909-68",
    sourceName: "WEBS",
    code: "909-68",
    title: "Drywall, Framing, and Acoustical",
    description:
      "Drywall installation, metal framing, taping, acoustical ceilings, patching, and interior buildout work.",
    parentCode: "909",
    topLevelCategory: "Construction and Trades",
    normalizedKeywords: [
      "drywall",
      "framing",
      "metal studs",
      "taping",
      "texture",
      "acoustical ceiling",
      "interior buildout",
      "patching",
    ],
  },
  {
    id: "cat-webs-909-69",
    sourceName: "WEBS",
    code: "909-69",
    title: "Concrete and Masonry",
    description:
      "Concrete placement, flatwork, sidewalks, curbs, masonry repair, block work, and structural patching.",
    parentCode: "909",
    topLevelCategory: "Construction and Trades",
    normalizedKeywords: [
      "concrete",
      "masonry",
      "sidewalk",
      "curb",
      "flatwork",
      "block work",
      "structural patching",
      "cement",
    ],
  },
  {
    id: "cat-webs-909-70",
    sourceName: "WEBS",
    code: "909-70",
    title: "Fence, Gate, and Barrier Systems",
    description:
      "Perimeter fencing, gate operators, barriers, bollards, and access control related site protection work.",
    parentCode: "909",
    topLevelCategory: "Construction and Trades",
    normalizedKeywords: [
      "fencing",
      "gate",
      "barrier",
      "bollard",
      "gate operator",
      "perimeter security",
      "chain link",
      "ornamental fence",
    ],
  },
  {
    id: "cat-webs-909-71",
    sourceName: "WEBS",
    code: "909-71",
    title: "Fire Protection and Life Safety",
    description:
      "Fire alarm, sprinkler, extinguisher, suppression, and life-safety inspection or repair services.",
    parentCode: "909",
    topLevelCategory: "Construction and Trades",
    normalizedKeywords: [
      "fire protection",
      "sprinkler",
      "fire alarm",
      "suppression",
      "extinguisher",
      "life safety",
      "alarm monitoring",
      "fire inspection",
    ],
  },
  {
    id: "cat-webs-909-72",
    sourceName: "WEBS",
    code: "909-72",
    title: "Low Voltage, Security, and Communications",
    description:
      "Cameras, access control, cabling, intercom, data wiring, and low-voltage system installation or repair.",
    parentCode: "909",
    topLevelCategory: "Construction and Trades",
    normalizedKeywords: [
      "low voltage",
      "security systems",
      "camera",
      "access control",
      "data cabling",
      "intercom",
      "structured cabling",
      "communications wiring",
    ],
  },
  {
    id: "cat-webs-909-73",
    sourceName: "WEBS",
    code: "909-73",
    title: "Excavation, Sitework, and Utilities",
    description:
      "Excavation, trenching, grading, underground utilities, drainage, and site preparation work.",
    parentCode: "909",
    topLevelCategory: "Construction and Trades",
    normalizedKeywords: [
      "excavation",
      "sitework",
      "grading",
      "trenching",
      "utilities",
      "drainage",
      "site prep",
      "earthwork",
    ],
  },
  {
    id: "cat-webs-909-74",
    sourceName: "WEBS",
    code: "909-74",
    title: "Asphalt and Paving",
    description:
      "Paving, striping, sealcoat, patching, parking lots, and roadway surface maintenance.",
    parentCode: "909",
    topLevelCategory: "Construction and Trades",
    normalizedKeywords: [
      "asphalt",
      "paving",
      "striping",
      "sealcoat",
      "parking lot",
      "roadway repair",
      "patching",
      "pavement",
    ],
  },
  {
    id: "cat-psc-z1fa",
    sourceName: "PSC",
    code: "Z1FA",
    title: "Maintenance of Family Housing Facilities",
    description:
      "Federal maintenance category often used for residential-style facility repair including plumbing, electrical, and interior work.",
    topLevelCategory: "Construction and Trades",
    normalizedKeywords: [
      "facility repair",
      "housing maintenance",
      "plumbing repair",
      "electrical repair",
      "interior maintenance",
    ],
  },
  {
    id: "cat-psc-z2jz",
    sourceName: "PSC",
    code: "Z2JZ",
    title: "Repair or Alteration of Miscellaneous Buildings",
    description:
      "Federal construction repair category used for building alterations and specialty trade scopes.",
    topLevelCategory: "Construction and Trades",
    normalizedKeywords: [
      "building alteration",
      "repair",
      "tenant improvement",
      "specialty trade",
      "renovation",
    ],
  },
  {
    id: "cat-psc-j045",
    sourceName: "PSC",
    code: "J045",
    title: "Maintenance and Repair of Plumbing Fixtures and Pipe Fittings",
    description:
      "Federal maintenance category for plumbing fixture repair, pipefitting, and related service work.",
    topLevelCategory: "Construction and Trades",
    normalizedKeywords: [
      "plumbing",
      "pipe repair",
      "fixtures",
      "drain repair",
      "pipe fitting",
      "service plumbing",
    ],
  },
  {
    id: "cat-psc-j059",
    sourceName: "PSC",
    code: "J059",
    title: "Maintenance and Repair of Electrical and Electronic Equipment",
    description:
      "Federal maintenance category for electrical troubleshooting, repair, controls, and equipment service.",
    topLevelCategory: "Construction and Trades",
    normalizedKeywords: [
      "electrical",
      "electrician",
      "controls",
      "wiring repair",
      "power distribution",
      "troubleshooting",
    ],
  },
  {
    id: "cat-map-plumbing",
    sourceName: "Bid Vault Map",
    code: "BV-TRADE-401",
    title: "Plumbing, Water, and Sewer Services",
    description:
      "Internal mapped family for plumbing contractors handling fixtures, piping, drains, sewer, and water system work.",
    topLevelCategory: "Construction and Trades",
    normalizedKeywords: [
      "plumbing",
      "plumber",
      "sewer",
      "drains",
      "water line",
      "backflow",
      "pipe repair",
      "fixtures",
    ],
  },
  {
    id: "cat-map-electrical",
    sourceName: "Bid Vault Map",
    code: "BV-TRADE-402",
    title: "Electrical and Lighting Services",
    description:
      "Mapped family for electrical contractors handling service, lighting, controls, and power distribution work.",
    topLevelCategory: "Construction and Trades",
    normalizedKeywords: [
      "electrical",
      "electrician",
      "lighting",
      "panel upgrade",
      "controls",
      "power distribution",
      "generator connection",
      "conduit",
    ],
  },
  {
    id: "cat-map-doors",
    sourceName: "Bid Vault Map",
    code: "BV-TRADE-403",
    title: "Doors, Access, and Entry Systems",
    description:
      "Mapped family for door contractors, access hardware, storefront entries, and overhead door systems.",
    topLevelCategory: "Construction and Trades",
    normalizedKeywords: [
      "door contractor",
      "entry systems",
      "hardware",
      "rolling door",
      "overhead door",
      "storefront door",
      "access door",
      "door repair",
    ],
  },
  {
    id: "cat-map-hvac",
    sourceName: "Bid Vault Map",
    code: "BV-TRADE-404",
    title: "HVAC, Mechanical, and Air Systems",
    description:
      "Mapped family for HVAC contractors handling heating, cooling, ventilation, controls, and major mechanical systems.",
    topLevelCategory: "Construction and Trades",
    normalizedKeywords: [
      "hvac",
      "mechanical",
      "heating",
      "cooling",
      "ventilation",
      "chiller",
      "boiler",
      "ductwork",
    ],
  },
  {
    id: "cat-map-roofing",
    sourceName: "Bid Vault Map",
    code: "BV-TRADE-405",
    title: "Roofing, Building Envelope, and Waterproofing",
    description:
      "Mapped family for roofers and envelope contractors handling leaks, coatings, flashing, and waterproofing.",
    topLevelCategory: "Construction and Trades",
    normalizedKeywords: [
      "roofing",
      "waterproofing",
      "building envelope",
      "leak repair",
      "roof coating",
      "flashing",
      "gutter",
      "sealant",
    ],
  },
  {
    id: "cat-map-finishes",
    sourceName: "Bid Vault Map",
    code: "BV-TRADE-406",
    title: "Interior Finishes and Buildout",
    description:
      "Mapped family for drywall, framing, painting, flooring, ceilings, and related tenant improvement work.",
    topLevelCategory: "Construction and Trades",
    normalizedKeywords: [
      "drywall",
      "framing",
      "painting",
      "flooring",
      "acoustical ceiling",
      "tenant improvement",
      "buildout",
      "interior finishes",
    ],
  },
  {
    id: "cat-map-sitework",
    sourceName: "Bid Vault Map",
    code: "BV-TRADE-407",
    title: "Sitework, Concrete, and Exterior Improvements",
    description:
      "Mapped family for excavation, paving, concrete, fencing, drainage, and outdoor improvement work.",
    topLevelCategory: "Construction and Trades",
    normalizedKeywords: [
      "sitework",
      "concrete",
      "excavation",
      "paving",
      "fencing",
      "drainage",
      "flatwork",
      "parking lot",
    ],
  },
  {
    id: "cat-map-fire-security",
    sourceName: "Bid Vault Map",
    code: "BV-TRADE-408",
    title: "Fire Protection, Security, and Low Voltage",
    description:
      "Mapped family for contractors working on fire systems, alarms, access control, cameras, and communications wiring.",
    topLevelCategory: "Construction and Trades",
    normalizedKeywords: [
      "fire alarm",
      "sprinkler",
      "security",
      "camera",
      "access control",
      "low voltage",
      "structured cabling",
      "life safety",
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

function keywordTokenSet(record: CategoryCodeRecord) {
  return new Set(
    [
      ...tokenize(record.title),
      ...tokenize(record.description),
      ...record.normalizedKeywords.flatMap((keyword) => tokenize(keyword)),
    ],
  );
}

export function findRelatedCategoryCodes(record: CategoryCodeRecord, records: CategoryCodeRecord[]) {
  const keywordSet = new Set(record.normalizedKeywords);
  const tokenSet = keywordTokenSet(record);

  return records
    .filter((item) => item.id !== record.id)
    .map((item) => {
      let score = 0;
      const itemTokens = keywordTokenSet(item);
      if (item.topLevelCategory === record.topLevelCategory) score += 3;
      if (item.parentCode && item.parentCode === record.parentCode) score += 2;
      if (item.parentCode === record.code || record.parentCode === item.code) score += 2;
      score += item.normalizedKeywords.filter((keyword) => keywordSet.has(keyword)).length;
      score += Array.from(itemTokens).filter((token) => tokenSet.has(token)).length;
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
