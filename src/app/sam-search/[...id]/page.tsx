import SamSearchRecordDetailPage from "@/app/government-data/[id]/page";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SamSearchCatchAllDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id?: string[] }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id = [] } = await params;
  const joinedId = id.join("/");

  return SamSearchRecordDetailPage({
    params: Promise.resolve({ id: joinedId }),
    searchParams,
  });
}
