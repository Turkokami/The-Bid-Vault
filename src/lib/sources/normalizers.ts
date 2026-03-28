import type {
  NormalizedStateLocalOpportunity,
  RawWebsOpportunity,
  StateLocalSourceCode,
} from "@/lib/sources/types";

export function buildStateLocalOpportunityId(
  sourceCode: StateLocalSourceCode,
  externalId: string,
) {
  return `${sourceCode}-${externalId.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

export function normalizeWorkLocation(city: string, stateCode: string) {
  return `${city}, ${stateCode}`;
}

export function normalizeWebsOpportunity(record: RawWebsOpportunity): NormalizedStateLocalOpportunity {
  return {
    id: buildStateLocalOpportunityId("washington", record.solicitationNumber),
    externalId: record.solicitationNumber,
    sourceName: "WEBS",
    sourceCode: "washington",
    stateCode: record.stateCode,
    title: record.title,
    issuingEntity: record.issuingEntity,
    opportunityType: record.opportunityType,
    status: record.status,
    categoryCode: record.commodityCode,
    postedDate: record.postedDate,
    dueDate: record.dueDate,
    summary: record.summary,
    description: record.description,
    location: normalizeWorkLocation(record.city, record.stateCode),
    sourceUrl: record.sourceUrl,
    registrationRequired: record.registrationRequired,
    registrationNotes: record.registrationNotes,
    contactName: record.contactName,
    contactEmail: record.contactEmail,
    contactPhone: record.contactPhone,
    createdAt: record.postedDate,
    updatedAt: record.updatedAt,
  };
}
