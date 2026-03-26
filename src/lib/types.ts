export type TrendDirection = "up" | "down" | "flat";

export type Contract = {
  id: string;
  title: string;
  agency: string;
  naicsCode: string;
  location: string;
  summary: string;
  awardAmount: number;
  awardDate: string;
  expirationDate: string;
  incumbent: string;
  stage: "active" | "watch" | "rebid-soon";
  predictedRebidDate: string;
  confidenceScore: number;
  watchlisted: boolean;
};

export type WinningBid = {
  contractId: string;
  companyName: string;
  bidAmount: number;
  awardDate: string;
};

export type MetricCard = {
  label: string;
  value: string;
  detail: string;
  trend: TrendDirection;
};

export type AlertItem = {
  id: string;
  title: string;
  detail: string;
  timeLabel: string;
  priority: "high" | "medium" | "low";
};

export type CalendarEvent = {
  id: string;
  title: string;
  date: string;
  category: "rebid" | "watchlist" | "agency";
};

export type Insight = {
  label: string;
  value: string;
  supportingText: string;
};
