import SamSearchRecordDetailPage from "@/app/government-data/[id]/page";
import { demoContracts } from "@/lib/demo-data";

export function generateStaticParams() {
  return demoContracts.map((c) => ({ id: [c.id] }));
}

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
