import type { StateLocalConnectionMode, StateLocalSourceStatus } from "@/lib/sources/types";

export type StateDirectoryEntry = {
  slug: string;
  stateCode: string;
  name: string;
  portalName: string;
  portalUrl: string;
  status: StateLocalSourceStatus;
  connectionMode: StateLocalConnectionMode;
  description: string;
  helperText: string;
};

export type LocalDirectoryEntry = {
  slug: string;
  label: string;
  level: "County" | "City" | "Parish" | "Borough" | "Metro";
  href: string;
  sourceType: "portal" | "search";
};

export const stateDirectory: StateDirectoryEntry[] = [
  {
    slug: "alabama",
    stateCode: "AL",
    name: "Alabama",
    portalName: "Alabama State Purchasing",
    portalUrl: "https://purchasing.alabama.gov/",
    status: "Planned",
    connectionMode: "planned",
    description: "Alabama statewide procurement and sourcing opportunities.",
    helperText: "This page will expand into Alabama statewide plus county and city procurement coverage.",
  },
  {
    slug: "alaska",
    stateCode: "AK",
    name: "Alaska",
    portalName: "Alaska Office of Procurement and Property Management",
    portalUrl: "http://doa.alaska.gov/oppm/",
    status: "Planned",
    connectionMode: "planned",
    description: "Alaska statewide procurement and sourcing opportunities.",
    helperText: "This page will expand into Alaska statewide plus borough and city procurement coverage.",
  },
  {
    slug: "arizona",
    stateCode: "AZ",
    name: "Arizona",
    portalName: "Arizona State Procurement Office",
    portalUrl: "https://spo.az.gov/",
    status: "Planned",
    connectionMode: "planned",
    description: "Arizona statewide procurement and sourcing opportunities.",
    helperText: "Arizona statewide coverage is staged first, then county and city portals are layered in.",
  },
  {
    slug: "arkansas",
    stateCode: "AR",
    name: "Arkansas",
    portalName: "Arkansas Procurement",
    portalUrl: "https://www.transform.ar.gov/procurement/",
    status: "Planned",
    connectionMode: "planned",
    description: "Arkansas statewide procurement and sourcing opportunities.",
    helperText: "This page will expand into Arkansas statewide plus county and municipal procurement coverage.",
  },
  {
    slug: "california",
    stateCode: "CA",
    name: "California",
    portalName: "California DGS Procurement Division",
    portalUrl: "https://www.dgs.ca.gov/PD",
    status: "Planned",
    connectionMode: "planned",
    description: "California statewide procurement and sourcing opportunities.",
    helperText: "California statewide coverage is planned, with county and city sources to follow.",
  },
  {
    slug: "colorado",
    stateCode: "CO",
    name: "Colorado",
    portalName: "Colorado State Purchasing and Contracts Office",
    portalUrl: "https://osc.colorado.gov/spco",
    status: "Planned",
    connectionMode: "planned",
    description: "Colorado statewide procurement and sourcing opportunities.",
    helperText: "Colorado statewide coverage will grow into county, school district, and city sources over time.",
  },
  {
    slug: "connecticut",
    stateCode: "CT",
    name: "Connecticut",
    portalName: "Connecticut DAS Procurement",
    portalUrl: "https://portal.ct.gov/DAS/Services/For-Agencies-and-Municipalities/Procurement",
    status: "Planned",
    connectionMode: "planned",
    description: "Connecticut statewide procurement and sourcing opportunities.",
    helperText: "Connecticut statewide coverage will be paired with county-equivalent and city buying sources.",
  },
  {
    slug: "delaware",
    stateCode: "DE",
    name: "Delaware",
    portalName: "Delaware Government Support Services",
    portalUrl: "https://gss.omb.delaware.gov/",
    status: "Planned",
    connectionMode: "planned",
    description: "Delaware statewide procurement and sourcing opportunities.",
    helperText: "Delaware statewide coverage will be expanded with county and local public purchasing sources.",
  },
  {
    slug: "district-of-columbia",
    stateCode: "DC",
    name: "District of Columbia",
    portalName: "DC Office of Contracting and Procurement",
    portalUrl: "https://ocp.dc.gov/",
    status: "Planned",
    connectionMode: "planned",
    description: "District of Columbia procurement and sourcing opportunities.",
    helperText: "DC coverage will include district-wide purchasing plus agency-level and school-level opportunities.",
  },
  {
    slug: "florida",
    stateCode: "FL",
    name: "Florida",
    portalName: "Florida State Purchasing",
    portalUrl: "https://www.dms.myflorida.com/business_operations/state_purchasing",
    status: "Planned",
    connectionMode: "planned",
    description: "Florida statewide procurement and sourcing opportunities.",
    helperText: "Florida statewide coverage will later branch into county and municipal procurement sources.",
  },
  {
    slug: "georgia",
    stateCode: "GA",
    name: "Georgia",
    portalName: "Georgia State Purchasing",
    portalUrl: "https://doas.ga.gov/state-purchasing",
    status: "Planned",
    connectionMode: "planned",
    description: "Georgia statewide procurement and sourcing opportunities.",
    helperText: "Georgia statewide coverage will expand into county, city, and authority-level sources.",
  },
  {
    slug: "hawaii",
    stateCode: "HI",
    name: "Hawaii",
    portalName: "Hawaii State Procurement Office",
    portalUrl: "https://spo.hawaii.gov/",
    status: "Planned",
    connectionMode: "planned",
    description: "Hawaii statewide procurement and sourcing opportunities.",
    helperText: "Hawaii statewide coverage will be expanded with county and public authority sources.",
  },
  {
    slug: "idaho",
    stateCode: "ID",
    name: "Idaho",
    portalName: "Idaho Division of Purchasing",
    portalUrl: "https://purchasing.idaho.gov/",
    status: "Planned",
    connectionMode: "planned",
    description: "Idaho statewide procurement and sourcing opportunities.",
    helperText: "Idaho statewide coverage is planned, followed by county and city procurement layers.",
  },
  {
    slug: "illinois",
    stateCode: "IL",
    name: "Illinois",
    portalName: "Illinois Procurement",
    portalUrl: "https://www2.illinois.gov/cms/business/procurement/Pages/default.aspx",
    status: "Planned",
    connectionMode: "planned",
    description: "Illinois statewide procurement and sourcing opportunities.",
    helperText: "Illinois statewide coverage will later include county, city, and higher-ed buying portals.",
  },
  {
    slug: "indiana",
    stateCode: "IN",
    name: "Indiana",
    portalName: "Indiana Procurement",
    portalUrl: "https://www.in.gov/idoa/procurement/",
    status: "Planned",
    connectionMode: "planned",
    description: "Indiana statewide procurement and sourcing opportunities.",
    helperText: "Indiana statewide coverage will expand into county and municipal procurement sources.",
  },
  {
    slug: "iowa",
    stateCode: "IA",
    name: "Iowa",
    portalName: "Iowa Procurement",
    portalUrl: "https://das.iowa.gov/procurement",
    status: "Planned",
    connectionMode: "planned",
    description: "Iowa statewide procurement and sourcing opportunities.",
    helperText: "Iowa statewide coverage will expand into county and local public purchasing sources.",
  },
  {
    slug: "kansas",
    stateCode: "KS",
    name: "Kansas",
    portalName: "Kansas Procurement and Contracts",
    portalUrl: "https://admin.ks.gov/offices/procurement-and-contracts",
    status: "Planned",
    connectionMode: "planned",
    description: "Kansas statewide procurement and sourcing opportunities.",
    helperText: "Kansas statewide coverage will expand into county and city procurement sources.",
  },
  {
    slug: "kentucky",
    stateCode: "KY",
    name: "Kentucky",
    portalName: "Kentucky Office of Procurement Services",
    portalUrl: "https://finance.ky.gov/office-of-the-controller/office-of-procurement-services/Pages/default.aspx",
    status: "Planned",
    connectionMode: "planned",
    description: "Kentucky statewide procurement and sourcing opportunities.",
    helperText: "Kentucky statewide coverage will expand into county and local public sector buying sources.",
  },
  {
    slug: "louisiana",
    stateCode: "LA",
    name: "Louisiana",
    portalName: "Louisiana Office of State Procurement",
    portalUrl: "https://www.doa.la.gov/doa/osp/",
    status: "Planned",
    connectionMode: "planned",
    description: "Louisiana statewide procurement and sourcing opportunities.",
    helperText: "Louisiana statewide coverage will expand into parish and local entity procurement sources.",
  },
  {
    slug: "maine",
    stateCode: "ME",
    name: "Maine",
    portalName: "Maine Procurement Services",
    portalUrl: "https://www.maine.gov/dafs/bbm/procurementservices/home",
    status: "Planned",
    connectionMode: "planned",
    description: "Maine statewide procurement and sourcing opportunities.",
    helperText: "Maine statewide coverage will be paired with county and municipal procurement sources.",
  },
  {
    slug: "maryland",
    stateCode: "MD",
    name: "Maryland",
    portalName: "Maryland Procurement",
    portalUrl: "https://procurement.maryland.gov/",
    status: "Planned",
    connectionMode: "planned",
    description: "Maryland statewide procurement and sourcing opportunities.",
    helperText: "Maryland statewide coverage will expand into county, school, and local authority sources.",
  },
  {
    slug: "massachusetts",
    stateCode: "MA",
    name: "Massachusetts",
    portalName: "Massachusetts Operational Services Division",
    portalUrl: "https://www.mass.gov/orgs/operational-services-division",
    status: "Planned",
    connectionMode: "planned",
    description: "Massachusetts statewide procurement and sourcing opportunities.",
    helperText: "Massachusetts statewide coverage will expand into county-equivalent and municipal procurement sources.",
  },
  {
    slug: "michigan",
    stateCode: "MI",
    name: "Michigan",
    portalName: "Michigan Procurement",
    portalUrl: "https://www.michigan.gov/dtmb/0,5552,7-358-82550_85746---,00.html",
    status: "Planned",
    connectionMode: "planned",
    description: "Michigan statewide procurement and sourcing opportunities.",
    helperText: "Michigan statewide coverage will expand into county, city, and school procurement sources.",
  },
  {
    slug: "minnesota",
    stateCode: "MN",
    name: "Minnesota",
    portalName: "Minnesota Materials Management Division",
    portalUrl: "http://www.mmd.admin.state.mn.us/",
    status: "Planned",
    connectionMode: "planned",
    description: "Minnesota statewide procurement and sourcing opportunities.",
    helperText: "Minnesota statewide coverage will expand into county and city procurement sources.",
  },
  {
    slug: "mississippi",
    stateCode: "MS",
    name: "Mississippi",
    portalName: "Mississippi Procurement and Contracts",
    portalUrl: "https://www.dfa.ms.gov/procurement-contracts",
    status: "Planned",
    connectionMode: "planned",
    description: "Mississippi statewide procurement and sourcing opportunities.",
    helperText: "Mississippi statewide coverage will expand into county and municipal procurement sources.",
  },
  {
    slug: "missouri",
    stateCode: "MO",
    name: "Missouri",
    portalName: "Missouri Purchasing",
    portalUrl: "https://oa.mo.gov/purchasing",
    status: "Planned",
    connectionMode: "planned",
    description: "Missouri statewide procurement and sourcing opportunities.",
    helperText: "Missouri statewide coverage will expand into county, city, and higher-ed procurement sources.",
  },
  {
    slug: "montana",
    stateCode: "MT",
    name: "Montana",
    portalName: "Montana State Procurement Bureau",
    portalUrl: "https://spb.mt.gov/",
    status: "Planned",
    connectionMode: "planned",
    description: "Montana statewide procurement and sourcing opportunities.",
    helperText: "Montana statewide coverage will expand into county and local public sector procurement sources.",
  },
  {
    slug: "nebraska",
    stateCode: "NE",
    name: "Nebraska",
    portalName: "Nebraska State Purchasing Bureau",
    portalUrl: "https://das.nebraska.gov/materiel/purchasing.html",
    status: "Planned",
    connectionMode: "planned",
    description: "Nebraska statewide procurement and sourcing opportunities.",
    helperText: "Nebraska statewide coverage will expand into county, city, and school procurement sources.",
  },
  {
    slug: "nevada",
    stateCode: "NV",
    name: "Nevada",
    portalName: "NEVADAePro / Nevada State Purchasing",
    portalUrl: "https://nevadaepro.com/bso/view/search/external/advancedSearchContractBlanket.xhtml?view=activeContracts",
    status: "Connected",
    connectionMode: "portal-assisted",
    description: "Nevada statewide procurement and sourcing opportunities.",
    helperText: "Nevada uses a portal-assisted mode today because the official live portal blocks background result extraction.",
  },
  {
    slug: "new-hampshire",
    stateCode: "NH",
    name: "New Hampshire",
    portalName: "New Hampshire Bureau of Purchase and Property",
    portalUrl: "https://das.nh.gov/purchasing/",
    status: "Planned",
    connectionMode: "planned",
    description: "New Hampshire statewide procurement and sourcing opportunities.",
    helperText: "New Hampshire statewide coverage will expand into county and local public procurement sources.",
  },
  {
    slug: "new-jersey",
    stateCode: "NJ",
    name: "New Jersey",
    portalName: "New Jersey Division of Purchase and Property",
    portalUrl: "https://www.nj.gov/treasury/purchase/",
    status: "Planned",
    connectionMode: "planned",
    description: "New Jersey statewide procurement and sourcing opportunities.",
    helperText: "New Jersey statewide coverage will expand into county and local public purchasing sources.",
  },
  {
    slug: "new-mexico",
    stateCode: "NM",
    name: "New Mexico",
    portalName: "New Mexico State Purchasing Division",
    portalUrl: "https://www.generalservices.state.nm.us/statepurchasing/",
    status: "Planned",
    connectionMode: "planned",
    description: "New Mexico statewide procurement and sourcing opportunities.",
    helperText: "New Mexico statewide coverage will expand into county and municipal procurement sources.",
  },
  {
    slug: "new-york",
    stateCode: "NY",
    name: "New York",
    portalName: "New York Procurement",
    portalUrl: "https://ogs.ny.gov/procurement",
    status: "Planned",
    connectionMode: "planned",
    description: "New York statewide procurement and sourcing opportunities.",
    helperText: "New York statewide coverage will expand into county, city, and authority-level procurement sources.",
  },
  {
    slug: "north-carolina",
    stateCode: "NC",
    name: "North Carolina",
    portalName: "North Carolina eVP",
    portalUrl: "https://evp.nc.gov/solicitations/?status=0",
    status: "Connected",
    connectionMode: "portal-assisted",
    description: "North Carolina statewide procurement and sourcing opportunities through the official eVP portal.",
    helperText:
      "North Carolina now has a stronger statewide portal page in The Bid Vault, with county and city source options layered underneath it.",
  },
  {
    slug: "north-dakota",
    stateCode: "ND",
    name: "North Dakota",
    portalName: "North Dakota Procurement",
    portalUrl: "https://www.omb.nd.gov/doing-business-state/procurement",
    status: "Planned",
    connectionMode: "planned",
    description: "North Dakota statewide procurement and sourcing opportunities.",
    helperText: "North Dakota statewide coverage will expand into county and local public procurement sources.",
  },
  {
    slug: "ohio",
    stateCode: "OH",
    name: "Ohio",
    portalName: "Ohio Procurement",
    portalUrl: "https://procure.ohio.gov/",
    status: "Planned",
    connectionMode: "planned",
    description: "Ohio statewide procurement and sourcing opportunities.",
    helperText: "Ohio statewide coverage will expand into county, city, and district procurement sources.",
  },
  {
    slug: "oklahoma",
    stateCode: "OK",
    name: "Oklahoma",
    portalName: "Oklahoma Purchasing",
    portalUrl: "https://oklahoma.gov/omes/services/purchasing.html",
    status: "Planned",
    connectionMode: "planned",
    description: "Oklahoma statewide procurement and sourcing opportunities.",
    helperText: "Oklahoma statewide coverage will expand into county and municipal procurement sources.",
  },
  {
    slug: "oregon",
    stateCode: "OR",
    name: "Oregon",
    portalName: "Oregon Procurement",
    portalUrl: "https://www.oregon.gov/DAS/Procurement/Pages/Index.aspx",
    status: "Planned",
    connectionMode: "planned",
    description: "Oregon statewide procurement and sourcing opportunities.",
    helperText: "Oregon statewide coverage will expand into county and city procurement sources.",
  },
  {
    slug: "pennsylvania",
    stateCode: "PA",
    name: "Pennsylvania",
    portalName: "Pennsylvania Procurement",
    portalUrl: "https://www.dgs.pa.gov/Materials-Services-Procurement/Pages/default.aspx",
    status: "Planned",
    connectionMode: "planned",
    description: "Pennsylvania statewide procurement and sourcing opportunities.",
    helperText: "Pennsylvania statewide coverage will expand into county, school, and local authority sources.",
  },
  {
    slug: "rhode-island",
    stateCode: "RI",
    name: "Rhode Island",
    portalName: "Rhode Island Division of Purchases",
    portalUrl: "https://www.ridop.ri.gov/",
    status: "Planned",
    connectionMode: "planned",
    description: "Rhode Island statewide procurement and sourcing opportunities.",
    helperText: "Rhode Island statewide coverage will expand into municipal and quasi-public procurement sources.",
  },
  {
    slug: "south-carolina",
    stateCode: "SC",
    name: "South Carolina",
    portalName: "South Carolina Procurement Services",
    portalUrl: "https://procurement.sc.gov/",
    status: "Planned",
    connectionMode: "planned",
    description: "South Carolina statewide procurement and sourcing opportunities.",
    helperText: "South Carolina statewide coverage will expand into county, city, and school district procurement sources.",
  },
  {
    slug: "south-dakota",
    stateCode: "SD",
    name: "South Dakota",
    portalName: "South Dakota Procurement",
    portalUrl: "https://www.sd.gov/bhra?id=cs_kb_article_view&sysparm_article=KB0044779&sys_kb_id=bc17eeec1b20f290ff55631ee54bcbdc&spa=1",
    status: "Planned",
    connectionMode: "planned",
    description: "South Dakota statewide procurement and sourcing opportunities.",
    helperText: "South Dakota statewide coverage will expand into county and municipal procurement sources.",
  },
  {
    slug: "tennessee",
    stateCode: "TN",
    name: "Tennessee",
    portalName: "Tennessee Procurement",
    portalUrl: "https://www.tn.gov/generalservices/procurement.html",
    status: "Planned",
    connectionMode: "planned",
    description: "Tennessee statewide procurement and sourcing opportunities.",
    helperText: "Tennessee statewide coverage will expand into county, city, and education procurement sources.",
  },
  {
    slug: "texas",
    stateCode: "TX",
    name: "Texas",
    portalName: "Texas ESBD / TxSmartBuy",
    portalUrl: "https://www.txsmartbuy.gov/esbd",
    status: "Connected",
    connectionMode: "live",
    description: "Texas statewide procurement and sourcing opportunities.",
    helperText: "Texas already has live statewide work through ESBD and will expand into county and city sources next.",
  },
  {
    slug: "utah",
    stateCode: "UT",
    name: "Utah",
    portalName: "Utah Purchasing",
    portalUrl: "https://purchasing.utah.gov/",
    status: "Planned",
    connectionMode: "planned",
    description: "Utah statewide procurement and sourcing opportunities.",
    helperText: "Utah statewide coverage will expand into county and municipal procurement sources.",
  },
  {
    slug: "vermont",
    stateCode: "VT",
    name: "Vermont",
    portalName: "Vermont Purchasing and Contracting",
    portalUrl: "https://bgs.vermont.gov/purchasing",
    status: "Planned",
    connectionMode: "planned",
    description: "Vermont statewide procurement and sourcing opportunities.",
    helperText: "Vermont statewide coverage will expand into local public sector purchasing sources.",
  },
  {
    slug: "virginia",
    stateCode: "VA",
    name: "Virginia",
    portalName: "Virginia Procurement",
    portalUrl: "https://dgs.virginia.gov/procurement",
    status: "Planned",
    connectionMode: "planned",
    description: "Virginia statewide procurement and sourcing opportunities.",
    helperText: "Virginia statewide coverage will expand into county, city, and school procurement sources.",
  },
  {
    slug: "washington",
    stateCode: "WA",
    name: "Washington",
    portalName: "WEBS / DES",
    portalUrl: "https://pr-webs-vendor.des.wa.gov/BidCalendar.aspx",
    status: "Connected",
    connectionMode: "live",
    description: "Washington statewide procurement and sourcing opportunities.",
    helperText: "Washington already has live WEBS coverage and will keep expanding local source depth.",
  },
  {
    slug: "west-virginia",
    stateCode: "WV",
    name: "West Virginia",
    portalName: "West Virginia Purchasing",
    portalUrl: "https://www.state.wv.us/admin/purchase/",
    status: "Planned",
    connectionMode: "planned",
    description: "West Virginia statewide procurement and sourcing opportunities.",
    helperText: "West Virginia statewide coverage will expand into county and local public procurement sources.",
  },
  {
    slug: "wisconsin",
    stateCode: "WI",
    name: "Wisconsin",
    portalName: "Wisconsin Procurement",
    portalUrl: "https://doa.wi.gov/Pages/StateEmployees/Procurement.aspx",
    status: "Planned",
    connectionMode: "planned",
    description: "Wisconsin statewide procurement and sourcing opportunities.",
    helperText: "Wisconsin statewide coverage will expand into county, city, and school procurement sources.",
  },
  {
    slug: "wyoming",
    stateCode: "WY",
    name: "Wyoming",
    portalName: "Wyoming Purchasing",
    portalUrl: "https://ai.wyo.gov/divisions/general-services/purchasing",
    status: "Planned",
    connectionMode: "planned",
    description: "Wyoming statewide procurement and sourcing opportunities.",
    helperText: "Wyoming statewide coverage will expand into county and local public procurement sources.",
  },
];

export function getStateDirectoryEntry(slugOrStateCode: string) {
  const normalized = slugOrStateCode.trim().toLowerCase();
  return (
    stateDirectory.find(
      (entry) => entry.slug === normalized || entry.stateCode.toLowerCase() === normalized,
    ) ?? null
  );
}

export function getStatePortalHref(sourceCode: string) {
  return sourceCode === "washington" ? "/state-local/washington" : `/state-local/${sourceCode}`;
}

function buildBingSearchUrl(query: string) {
  return `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
}

function slugifyDirectoryLabel(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildLocalAreaSearchUrl(stateName: string, areaLabel: string) {
  return buildBingSearchUrl(`${areaLabel} ${stateName} bid opportunities procurement site:.gov`);
}

const majorLocalAreasByStateCode: Record<string, Array<{ label: string; level: LocalDirectoryEntry["level"] }>> = {
  AL: [
    { label: "Jefferson County", level: "County" },
    { label: "Mobile County", level: "County" },
    { label: "Huntsville city", level: "City" },
  ],
  AK: [
    { label: "Anchorage Municipality", level: "Metro" },
    { label: "Fairbanks North Star Borough", level: "Borough" },
    { label: "Juneau city and borough", level: "Borough" },
  ],
  AZ: [
    { label: "Maricopa County", level: "County" },
    { label: "Pima County", level: "County" },
    { label: "Mohave County", level: "County" },
  ],
  AR: [
    { label: "Pulaski County", level: "County" },
    { label: "Washington County", level: "County" },
    { label: "Benton County", level: "County" },
  ],
  CA: [
    { label: "Los Angeles County", level: "County" },
    { label: "San Diego County", level: "County" },
    { label: "Orange County", level: "County" },
  ],
  CO: [
    { label: "Denver city and county", level: "Metro" },
    { label: "El Paso County", level: "County" },
    { label: "Jefferson County", level: "County" },
  ],
  CT: [
    { label: "Hartford city", level: "City" },
    { label: "New Haven city", level: "City" },
    { label: "Bridgeport city", level: "City" },
  ],
  DE: [
    { label: "New Castle County", level: "County" },
    { label: "Sussex County", level: "County" },
    { label: "Kent County", level: "County" },
  ],
  DC: [
    { label: "District agencies", level: "Metro" },
    { label: "DC Public Schools", level: "Metro" },
    { label: "DC Housing Authority", level: "Metro" },
  ],
  FL: [
    { label: "Miami-Dade County", level: "County" },
    { label: "Orange County", level: "County" },
    { label: "Hillsborough County", level: "County" },
  ],
  GA: [
    { label: "Fulton County", level: "County" },
    { label: "Cobb County", level: "County" },
    { label: "DeKalb County", level: "County" },
  ],
  HI: [
    { label: "Honolulu County", level: "County" },
    { label: "Maui County", level: "County" },
    { label: "Hawaii County", level: "County" },
  ],
  ID: [
    { label: "Ada County", level: "County" },
    { label: "Canyon County", level: "County" },
    { label: "Kootenai County", level: "County" },
  ],
  IL: [
    { label: "Cook County", level: "County" },
    { label: "DuPage County", level: "County" },
    { label: "Lake County", level: "County" },
  ],
  IN: [
    { label: "Marion County", level: "County" },
    { label: "Lake County", level: "County" },
    { label: "Allen County", level: "County" },
  ],
  IA: [
    { label: "Polk County", level: "County" },
    { label: "Linn County", level: "County" },
    { label: "Scott County", level: "County" },
  ],
  KS: [
    { label: "Johnson County", level: "County" },
    { label: "Sedgwick County", level: "County" },
    { label: "Shawnee County", level: "County" },
  ],
  KY: [
    { label: "Jefferson County", level: "County" },
    { label: "Fayette County", level: "County" },
    { label: "Boone County", level: "County" },
  ],
  LA: [
    { label: "Orleans Parish", level: "Parish" },
    { label: "East Baton Rouge Parish", level: "Parish" },
    { label: "Jefferson Parish", level: "Parish" },
  ],
  ME: [
    { label: "Cumberland County", level: "County" },
    { label: "York County", level: "County" },
    { label: "Penobscot County", level: "County" },
  ],
  MD: [
    { label: "Montgomery County", level: "County" },
    { label: "Prince George's County", level: "County" },
    { label: "Baltimore County", level: "County" },
  ],
  MA: [
    { label: "Middlesex County", level: "County" },
    { label: "Suffolk County", level: "County" },
    { label: "Worcester County", level: "County" },
  ],
  MI: [
    { label: "Wayne County", level: "County" },
    { label: "Oakland County", level: "County" },
    { label: "Macomb County", level: "County" },
  ],
  MN: [
    { label: "Hennepin County", level: "County" },
    { label: "Ramsey County", level: "County" },
    { label: "Dakota County", level: "County" },
  ],
  MS: [
    { label: "Hinds County", level: "County" },
    { label: "Harrison County", level: "County" },
    { label: "DeSoto County", level: "County" },
  ],
  MO: [
    { label: "St. Louis County", level: "County" },
    { label: "Jackson County", level: "County" },
    { label: "Greene County", level: "County" },
  ],
  MT: [
    { label: "Yellowstone County", level: "County" },
    { label: "Missoula County", level: "County" },
    { label: "Gallatin County", level: "County" },
  ],
  NE: [
    { label: "Douglas County", level: "County" },
    { label: "Lancaster County", level: "County" },
    { label: "Sarpy County", level: "County" },
  ],
  NV: [
    { label: "Clark County", level: "County" },
    { label: "Washoe County", level: "County" },
    { label: "Nye County", level: "County" },
  ],
  NH: [
    { label: "Hillsborough County", level: "County" },
    { label: "Rockingham County", level: "County" },
    { label: "Merrimack County", level: "County" },
  ],
  NJ: [
    { label: "Bergen County", level: "County" },
    { label: "Middlesex County", level: "County" },
    { label: "Essex County", level: "County" },
  ],
  NM: [
    { label: "Bernalillo County", level: "County" },
    { label: "Santa Fe County", level: "County" },
    { label: "Dona Ana County", level: "County" },
  ],
  NY: [
    { label: "Nassau County", level: "County" },
    { label: "Suffolk County", level: "County" },
    { label: "New York City agencies", level: "Metro" },
  ],
  NC: [
    { label: "Mecklenburg County", level: "County" },
    { label: "Wake County", level: "County" },
    { label: "Guilford County", level: "County" },
  ],
  ND: [
    { label: "Cass County", level: "County" },
    { label: "Burleigh County", level: "County" },
    { label: "Grand Forks County", level: "County" },
  ],
  OH: [
    { label: "Cuyahoga County", level: "County" },
    { label: "Franklin County", level: "County" },
    { label: "Hamilton County", level: "County" },
  ],
  OK: [
    { label: "Oklahoma County", level: "County" },
    { label: "Tulsa County", level: "County" },
    { label: "Cleveland County", level: "County" },
  ],
  OR: [
    { label: "Multnomah County", level: "County" },
    { label: "Washington County", level: "County" },
    { label: "Lane County", level: "County" },
  ],
  PA: [
    { label: "Allegheny County", level: "County" },
    { label: "Philadelphia city", level: "City" },
    { label: "Montgomery County", level: "County" },
  ],
  RI: [
    { label: "Providence city", level: "City" },
    { label: "Warwick city", level: "City" },
    { label: "Cranston city", level: "City" },
  ],
  SC: [
    { label: "Greenville County", level: "County" },
    { label: "Richland County", level: "County" },
    { label: "Charleston County", level: "County" },
  ],
  SD: [
    { label: "Minnehaha County", level: "County" },
    { label: "Pennington County", level: "County" },
    { label: "Lincoln County", level: "County" },
  ],
  TN: [
    { label: "Davidson County", level: "County" },
    { label: "Shelby County", level: "County" },
    { label: "Knox County", level: "County" },
  ],
  TX: [
    { label: "Harris County", level: "County" },
    { label: "Dallas County", level: "County" },
    { label: "Bexar County", level: "County" },
  ],
  UT: [
    { label: "Salt Lake County", level: "County" },
    { label: "Utah County", level: "County" },
    { label: "Davis County", level: "County" },
  ],
  VT: [
    { label: "Burlington city", level: "City" },
    { label: "Rutland County", level: "County" },
    { label: "Washington County", level: "County" },
  ],
  VA: [
    { label: "Fairfax County", level: "County" },
    { label: "Virginia Beach city", level: "City" },
    { label: "Prince William County", level: "County" },
  ],
  WA: [
    { label: "King County", level: "County" },
    { label: "Pierce County", level: "County" },
    { label: "Spokane County", level: "County" },
  ],
  WV: [
    { label: "Kanawha County", level: "County" },
    { label: "Monongalia County", level: "County" },
    { label: "Cabell County", level: "County" },
  ],
  WI: [
    { label: "Milwaukee County", level: "County" },
    { label: "Dane County", level: "County" },
    { label: "Waukesha County", level: "County" },
  ],
  WY: [
    { label: "Laramie County", level: "County" },
    { label: "Natrona County", level: "County" },
    { label: "Teton County", level: "County" },
  ],
};

const curatedLocalPortalEntries: Record<string, LocalDirectoryEntry[]> = {
  AZ: [
    {
      slug: "mohave-county",
      label: "Mohave County portal",
      level: "County",
      href: "https://procurement.opengov.com/portal/mohavecounty",
      sourceType: "portal",
    },
    {
      slug: "coconino-county",
      label: "Coconino County purchasing",
      level: "County",
      href: "https://www.coconino.az.gov/316/Purchasing",
      sourceType: "portal",
    },
    {
      slug: "flagstaff-city",
      label: "City of Flagstaff bids",
      level: "City",
      href: "https://flagstaff.az.gov/3922/Bid-Opportunities",
      sourceType: "portal",
    },
  ],
  NC: [
    {
      slug: "mecklenburg-county",
      label: "Mecklenburg County procurement",
      level: "County",
      href: "https://fin.mecknc.gov/procurement",
      sourceType: "portal",
    },
    {
      slug: "guilford-county",
      label: "Guilford County purchasing",
      level: "County",
      href: "https://www.guilfordcountync.gov/government/departments-and-agencies/finance/purchasing",
      sourceType: "portal",
    },
  ],
  NV: [
    {
      slug: "nye-county",
      label: "Nye County bids",
      level: "County",
      href: "https://www.nyecountynv.gov/Bids.aspx?CatID=showStatus&Status=open&showAllBids=&txtSort=BidNumberAsc",
      sourceType: "portal",
    },
    {
      slug: "white-pine-county",
      label: "White Pine County bids",
      level: "County",
      href: "https://www.whitepinecounty.net/Bids.aspx",
      sourceType: "portal",
    },
  ],
};

export function getCountyContractsSearchUrl(stateName: string) {
  return buildBingSearchUrl(`${stateName} county bid opportunities procurement site:.gov`);
}

export function getCityContractsSearchUrl(stateName: string) {
  return buildBingSearchUrl(`${stateName} city bid opportunities procurement site:.gov`);
}

export function getLocalGovernmentContractsSearchUrl(stateName: string) {
  return buildBingSearchUrl(`${stateName} local government bids procurement site:.gov`);
}

export function getLocalDirectoryEntries(
  stateCode: string,
  stateName: string,
): LocalDirectoryEntry[] {
  const curatedEntries = curatedLocalPortalEntries[stateCode] ?? [];
  const templateEntries = majorLocalAreasByStateCode[stateCode] ?? [];

  const generatedEntries = templateEntries
    .filter(
      (entry) =>
        !curatedEntries.some(
          (curated) => curated.label.toLowerCase().includes(entry.label.toLowerCase().replace(/\s+(county|city|parish|borough|municipality|metro)$/i, "")),
        ),
    )
    .map<LocalDirectoryEntry>((entry) => ({
      slug: slugifyDirectoryLabel(entry.label),
      label: `${entry.label} search`,
      level: entry.level,
      href: buildLocalAreaSearchUrl(stateName, entry.label),
      sourceType: "search",
    }));

  return [...curatedEntries, ...generatedEntries].slice(0, 6);
}
