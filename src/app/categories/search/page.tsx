import { CategorySearchClient } from "@/components/category-search-client";
import { categoryCodeRecords } from "@/lib/category-codes";

type CategorySearchPageProps = {
  searchParams?: Promise<{
    query?: string;
    exactCode?: string;
    letter?: string;
  }>;
};

export default async function CategorySearchPage({ searchParams }: CategorySearchPageProps) {
  const params = (await searchParams) ?? {};

  return (
    <CategorySearchClient
      records={categoryCodeRecords}
      initialFilters={{
        query: params.query ?? "",
        exactCode: params.exactCode ?? "",
        sources: [],
        families: [],
        letter: params.letter ?? "",
      }}
    />
  );
}
