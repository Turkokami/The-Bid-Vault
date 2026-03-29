import { demoWinningBids, getContractById } from "@/lib/demo-data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const winningBid = demoWinningBids.find((bid) => bid.id === id);

  if (!winningBid) {
    return new Response("Award summary not found.", { status: 404 });
  }

  const contract = getContractById(winningBid.contractId);
  const fileBody = [
    "The Bid Vault Award Summary",
    "",
    `Contract title: ${contract?.title ?? "Unknown contract"}`,
    `Agency: ${contract?.agency ?? "Unknown agency"}`,
    `Winning company: ${winningBid.companyName}`,
    `Winning amount: ${winningBid.bidAmount}`,
    `Award date: ${winningBid.awardDate}`,
    `NAICS: ${contract?.naicsCode ?? ""}`,
    `Location: ${contract?.location ?? ""}`,
  ].join("\n");

  return new Response(fileBody, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename=\"${id}-award-summary.txt\"`,
    },
  });
}
