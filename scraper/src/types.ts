export type ScrapedOpportunity = {
  sourceCode: string;
  stateCode: string;
  title: string;
  issuingEntity: string;
  opportunityType: string;
  status: string;
  postedDate?: Date;
  dueDate?: Date;
  summary?: string;
  sourceUrl?: string;
  categoryCode?: string;
  registrationRequired?: boolean;
};
