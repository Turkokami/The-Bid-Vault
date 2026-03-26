import { GovernmentDataClient } from "@/components/government-data-client";
import { extractedContractRecords, uploadedSourceDocuments } from "@/lib/demo-data";

type GovernmentDataPageProps = {
  searchParams?: Promise<{
    keywords?: string;
    naics?: string;
    agency?: string;
    state?: string;
  }>;
};

export default async function GovernmentDataPage({
  searchParams,
}: GovernmentDataPageProps) {
  const params = (await searchParams) ?? {};
  const keywords = (params.keywords ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return (
    <GovernmentDataClient
      initialDocuments={uploadedSourceDocuments}
      initialRecords={extractedContractRecords}
      initialKeywords={keywords}
      initialNaics={params.naics}
      initialAgency={params.agency}
      initialState={params.state}
    />
  );
}
