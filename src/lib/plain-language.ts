import type { NoticeType } from "@/lib/contracts-search";

export function describeNoticeType(noticeType: NoticeType) {
  switch (noticeType) {
    case "Sources Sought":
      return "Early Opportunity (Government is researching vendors)";
    case "Solicitation":
      return "Open for Bids";
    case "Award":
      return "Contract Already Awarded";
    case "Presolicitation":
      return "Coming Soon";
    default:
      return noticeType;
  }
}
