import type { DemoContract } from "@/lib/demo-data";

export type ContractStatus = "Active" | "Inactive";
export type NoticeType = "Sources Sought" | "Solicitation" | "Award" | "Presolicitation";

export type ContractSearchRecord = DemoContract & {
  noticeId: string;
  status: ContractStatus;
  noticeType: NoticeType;
  department: string;
  subTier: string;
  office: string;
  placeOfPerformance: string;
  pscCode: string;
  setAsideType: string;
  updatedDate: string;
  responseDueDate: string;
  postedDate: string;
  primaryContact: {
    name: string;
    email: string;
    phone: string;
  };
  secondaryContact: {
    name: string;
    email: string;
    phone: string;
  };
  attachments: Array<{
    label: string;
    href: string;
  }>;
};

export type ContractFilters = {
  anyWords: string;
  allWords: string;
  exactPhrase: string;
  statuses: string[];
  noticeTypes: string[];
  departments: string[];
  subTiers: string[];
  offices: string[];
  states: string[];
  places: string[];
  naicsCodes: string[];
  pscCodes: string[];
  setAsides: string[];
  postedFrom: string;
  postedTo: string;
  responseFrom: string;
  responseTo: string;
  updatedFrom: string;
  updatedTo: string;
  sortBy: "date" | "relevance";
  page: number;
};

const contractMetadata: Record<
  string,
  Pick<
    ContractSearchRecord,
    | "noticeType"
    | "department"
    | "subTier"
    | "office"
    | "pscCode"
    | "setAsideType"
    | "primaryContact"
    | "secondaryContact"
  >
> = {
  "contract-hvac-maintenance": {
    noticeType: "Solicitation",
    department: "Department of Defense",
    subTier: "Department of the Army",
    office: "Sacramento District Facilities Office",
    pscCode: "J041",
    setAsideType: "Small Business Set-Aside",
    primaryContact: {
      name: "Angela Pierce",
      email: "angela.pierce@usace.army.mil",
      phone: "(916) 555-0141",
    },
    secondaryContact: {
      name: "Mason Reed",
      email: "mason.reed@usace.army.mil",
      phone: "(916) 555-0177",
    },
  },
  "contract-federal-janitorial": {
    noticeType: "Presolicitation",
    department: "General Services Administration",
    subTier: "Public Buildings Service",
    office: "Region 9 Oakland Leasing Office",
    pscCode: "S201",
    setAsideType: "8(a) Competitive Set-Aside",
    primaryContact: {
      name: "Leah Morgan",
      email: "leah.morgan@gsa.gov",
      phone: "(510) 555-0122",
    },
    secondaryContact: {
      name: "Andre Wells",
      email: "andre.wells@gsa.gov",
      phone: "(510) 555-0151",
    },
  },
  "contract-emergency-response": {
    noticeType: "Sources Sought",
    department: "Department of Energy",
    subTier: "National Nuclear Security Administration",
    office: "Nevada Site Office",
    pscCode: "Z1AZ",
    setAsideType: "Market Research",
    primaryContact: {
      name: "Robin Patel",
      email: "robin.patel@nnsa.doe.gov",
      phone: "(702) 555-0135",
    },
    secondaryContact: {
      name: "Tina Alvarez",
      email: "tina.alvarez@nnsa.doe.gov",
      phone: "(702) 555-0199",
    },
  },
  "contract-fleet-parts": {
    noticeType: "Award",
    department: "City of Los Angeles",
    subTier: "General Services Department",
    office: "Fleet Services Division",
    pscCode: "2510",
    setAsideType: "Open Competition",
    primaryContact: {
      name: "Hector Ruiz",
      email: "hector.ruiz@lacity.org",
      phone: "(213) 555-0104",
    },
    secondaryContact: {
      name: "Janice Cole",
      email: "janice.cole@lacity.org",
      phone: "(213) 555-0186",
    },
  },
  "contract-stormwater-repair": {
    noticeType: "Solicitation",
    department: "County of Orange",
    subTier: "OC Public Works",
    office: "Stormwater Program Delivery",
    pscCode: "Y1QA",
    setAsideType: "Local Small Business Preference",
    primaryContact: {
      name: "Devon Scott",
      email: "devon.scott@ocpw.ocgov.com",
      phone: "(714) 555-0163",
    },
    secondaryContact: {
      name: "Marisol Kim",
      email: "marisol.kim@ocpw.ocgov.com",
      phone: "(714) 555-0182",
    },
  },
  "contract-va-custodial": {
    noticeType: "Presolicitation",
    department: "Department of Veterans Affairs",
    subTier: "Veterans Health Administration",
    office: "Phoenix Health Care System",
    pscCode: "S201",
    setAsideType: "Service-Disabled Veteran-Owned Small Business",
    primaryContact: {
      name: "Brandon Cole",
      email: "brandon.cole@va.gov",
      phone: "(602) 555-0118",
    },
    secondaryContact: {
      name: "Evelyn Shaw",
      email: "evelyn.shaw@va.gov",
      phone: "(602) 555-0132",
    },
  },
  "contract-base-landscaping": {
    noticeType: "Solicitation",
    department: "Department of Defense",
    subTier: "Department of the Air Force",
    office: "Kirtland Base Operations Support",
    pscCode: "S208",
    setAsideType: "Woman-Owned Small Business Set-Aside",
    primaryContact: {
      name: "Chris Harper",
      email: "chris.harper@us.af.mil",
      phone: "(505) 555-0178",
    },
    secondaryContact: {
      name: "Lauren Bell",
      email: "lauren.bell@us.af.mil",
      phone: "(505) 555-0149",
    },
  },
  "contract-warehouse-logistics": {
    noticeType: "Award",
    department: "Department of Defense",
    subTier: "Defense Logistics Agency",
    office: "Distribution Operations Directorate",
    pscCode: "R706",
    setAsideType: "Full and Open Competition",
    primaryContact: {
      name: "Nathan York",
      email: "nathan.york@dla.mil",
      phone: "(817) 555-0137",
    },
    secondaryContact: {
      name: "Taylor Boone",
      email: "taylor.boone@dla.mil",
      phone: "(817) 555-0174",
    },
  },
};

function fallbackMetadata(contract: DemoContract) {
  return {
    noticeType: "Solicitation" as NoticeType,
    department: contract.agency,
    subTier: `${contract.agency} Contracting`,
    office: `${contract.location} Acquisition Office`,
    pscCode: "R499",
    setAsideType: "Open Competition",
    primaryContact: {
      name: "Contracting Officer",
      email: "contracting@thebidvault.app",
      phone: "(555) 010-0001",
    },
    secondaryContact: {
      name: "Program Manager",
      email: "programs@thebidvault.app",
      phone: "(555) 010-0002",
    },
  };
}

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function buildOriginalPostingUrl(contract: DemoContract, noticeId: string) {
  const agency = contract.agency.toLowerCase();

  if (
    agency.includes("u.s.") ||
    agency.includes("general services administration") ||
    agency.includes("department") ||
    agency.includes("defense logistics")
  ) {
    return `https://sam.gov/opp/${noticeId}/view`;
  }

  if (agency.includes("city of los angeles")) {
    return `https://www.rampla.org/s/solicitations?noticeId=${noticeId}`;
  }

  if (agency.includes("county of orange")) {
    return `https://cpo.ocgov.com/solicitations/${noticeId}`;
  }

  return `https://sam.gov/search/?keywords=${encodeURIComponent(noticeId)}`;
}

function buildSupportingAttachmentUrl(contract: DemoContract, noticeId: string) {
  const agency = contract.agency.toLowerCase();

  if (
    agency.includes("u.s.") ||
    agency.includes("general services administration") ||
    agency.includes("department") ||
    agency.includes("defense logistics")
  ) {
    return `https://sam.gov/opp/${noticeId}/attachments`;
  }

  return `${buildOriginalPostingUrl(contract, noticeId)}#documents`;
}

export function enrichContract(contract: DemoContract): ContractSearchRecord {
  const metadata = contractMetadata[contract.id] ?? fallbackMetadata(contract);
  const expiration = contract.expirationDate ? new Date(contract.expirationDate) : new Date();
  const predicted = contract.predictedRebidDate ? new Date(contract.predictedRebidDate) : expiration;
  const posted = contract.awardDate ? new Date(contract.awardDate) : new Date();
  const updated = new Date(predicted);
  updated.setDate(updated.getDate() - 10);
  const responseDue = new Date(predicted);
  responseDue.setDate(responseDue.getDate() + 7);
  const today = new Date();
  const noticeId = `TBV-${contract.id.replace("contract-", "").replaceAll("-", "").slice(0, 10).toUpperCase()}`;
  const originalPostingUrl = buildOriginalPostingUrl(contract, noticeId);

  return {
    ...contract,
    noticeId,
    status: expiration >= today ? "Active" : "Inactive",
    noticeType: metadata.noticeType,
    department: metadata.department,
    subTier: metadata.subTier,
    office: metadata.office,
    placeOfPerformance: contract.location,
    pscCode: metadata.pscCode,
    setAsideType: metadata.setAsideType,
    postedDate: isoDate(posted),
    updatedDate: isoDate(updated),
    responseDueDate: isoDate(responseDue),
    primaryContact: metadata.primaryContact,
    secondaryContact: metadata.secondaryContact,
    attachments: [
      {
        label: agencyLinkLabel(contract.agency),
        href: originalPostingUrl,
      },
      {
        label: `${contract.naicsCode} supporting files`,
        href: buildSupportingAttachmentUrl(contract, noticeId),
      },
    ],
  };
}

function agencyLinkLabel(agency: string) {
  const agencyLower = agency.toLowerCase();

  if (
    agencyLower.includes("u.s.") ||
    agencyLower.includes("general services administration") ||
    agencyLower.includes("department") ||
    agencyLower.includes("defense logistics")
  ) {
    return "Open original SAM.gov posting";
  }

  return "Open original source posting";
}

function includesWords(blob: string, value: string, mode: "any" | "all" | "exact") {
  const query = value.trim().toLowerCase();

  if (!query) {
    return true;
  }

  if (mode === "exact") {
    return blob.includes(query);
  }

  const words = query.split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return true;
  }

  return mode === "any"
    ? words.some((word) => blob.includes(word))
    : words.every((word) => blob.includes(word));
}

function inDateRange(value: string, from?: string, to?: string) {
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

function scoreContract(contract: ContractSearchRecord, filters: ContractFilters) {
  const blob = [
    contract.title,
    contract.summary,
    contract.department,
    contract.subTier,
    contract.office,
    contract.noticeType,
    contract.noticeId,
    contract.naicsCode,
    contract.pscCode,
    contract.setAsideType,
    ...contract.keyTerms,
  ]
    .join(" ")
    .toLowerCase();

  let score = 0;

  for (const word of filters.anyWords.toLowerCase().split(/\s+/).filter(Boolean)) {
    if (blob.includes(word)) {
      score += 2;
    }
  }

  for (const word of filters.allWords.toLowerCase().split(/\s+/).filter(Boolean)) {
    if (blob.includes(word)) {
      score += 3;
    }
  }

  if (filters.exactPhrase && blob.includes(filters.exactPhrase.toLowerCase())) {
    score += 8;
  }

  if (filters.naicsCodes.includes(contract.naicsCode)) {
    score += 2;
  }

  if (filters.departments.includes(contract.department)) {
    score += 1;
  }

  return score;
}

export function filterContracts(records: ContractSearchRecord[], filters: ContractFilters) {
  return records
    .filter((contract) => {
      const blob = [
        contract.title,
        contract.summary,
        contract.department,
        contract.subTier,
        contract.office,
        contract.noticeId,
        contract.noticeType,
        contract.naicsCode,
        contract.pscCode,
        contract.setAsideType,
        contract.placeOfPerformance,
        ...contract.keyTerms,
      ]
        .join(" ")
        .toLowerCase();

      const matchesAny = includesWords(blob, filters.anyWords, "any");
      const matchesAll = includesWords(blob, filters.allWords, "all");
      const matchesExact = includesWords(blob, filters.exactPhrase, "exact");
      const matchesStatus =
        filters.statuses.length === 0 || filters.statuses.includes(contract.status);
      const matchesNoticeType =
        filters.noticeTypes.length === 0 || filters.noticeTypes.includes(contract.noticeType);
      const matchesDepartment =
        filters.departments.length === 0 || filters.departments.includes(contract.department);
      const matchesSubTier =
        filters.subTiers.length === 0 || filters.subTiers.includes(contract.subTier);
      const matchesOffice =
        filters.offices.length === 0 || filters.offices.includes(contract.office);
      const matchesState =
        filters.states.length === 0 || filters.states.includes(contract.state);
      const matchesPlace =
        filters.places.length === 0 || filters.places.includes(contract.placeOfPerformance);
      const matchesNaics =
        filters.naicsCodes.length === 0 || filters.naicsCodes.includes(contract.naicsCode);
      const matchesPsc =
        filters.pscCodes.length === 0 || filters.pscCodes.includes(contract.pscCode);
      const matchesSetAside =
        filters.setAsides.length === 0 || filters.setAsides.includes(contract.setAsideType);
      const matchesPosted = inDateRange(contract.postedDate, filters.postedFrom, filters.postedTo);
      const matchesResponse = inDateRange(
        contract.responseDueDate,
        filters.responseFrom,
        filters.responseTo,
      );
      const matchesUpdated = inDateRange(
        contract.updatedDate,
        filters.updatedFrom,
        filters.updatedTo,
      );

      return (
        matchesAny &&
        matchesAll &&
        matchesExact &&
        matchesStatus &&
        matchesNoticeType &&
        matchesDepartment &&
        matchesSubTier &&
        matchesOffice &&
        matchesState &&
        matchesPlace &&
        matchesNaics &&
        matchesPsc &&
        matchesSetAside &&
        matchesPosted &&
        matchesResponse &&
        matchesUpdated
      );
    })
    .sort((left, right) => {
      if (filters.sortBy === "relevance") {
        return scoreContract(right, filters) - scoreContract(left, filters);
      }

      return right.updatedDate.localeCompare(left.updatedDate);
    });
}

export function buildFilterOptions(records: ContractSearchRecord[]) {
  const unique = (values: string[]) => Array.from(new Set(values)).sort();

  return {
    departments: unique(records.map((contract) => contract.department)),
    subTiers: unique(records.map((contract) => contract.subTier)),
    offices: unique(records.map((contract) => contract.office)),
    states: unique(records.map((contract) => contract.state)),
    places: unique(records.map((contract) => contract.placeOfPerformance)),
    naicsCodes: unique(records.map((contract) => contract.naicsCode)),
    pscCodes: unique(records.map((contract) => contract.pscCode)),
    setAsides: unique(records.map((contract) => contract.setAsideType)),
  };
}
