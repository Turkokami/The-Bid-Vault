import type {
  AlertItem,
  CalendarEvent,
  Contract,
  Insight,
  MetricCard,
  WinningBid,
} from "@/lib/types";

export const metricCards: MetricCard[] = [
  {
    label: "Tracked opportunities",
    value: "148",
    detail: "23 added this month across facilities, IT, and logistics.",
    trend: "up",
  },
  {
    label: "Rebids in next 90 days",
    value: "19",
    detail: "8 are tied to saved contracts with strong historical spend.",
    trend: "up",
  },
  {
    label: "Average award size",
    value: "$412K",
    detail: "Federal custodial contracts continue to price above last quarter.",
    trend: "flat",
  },
  {
    label: "Alert precision",
    value: "86%",
    detail: "Mock benchmark for saved criteria matching likely-fit work.",
    trend: "up",
  },
];

export const contracts: Contract[] = [
  {
    id: "ct-001",
    title: "Regional HVAC Preventive Maintenance",
    agency: "U.S. Army Corps of Engineers",
    naicsCode: "238220",
    location: "Sacramento, CA",
    summary:
      "Multi-site HVAC maintenance and emergency response coverage for district facilities.",
    awardAmount: 684000,
    awardDate: "2024-07-16",
    expirationDate: "2026-07-15",
    incumbent: "Sierra Mechanical Group",
    stage: "rebid-soon",
    predictedRebidDate: "2026-05-30",
    confidenceScore: 0.91,
    watchlisted: true,
  },
  {
    id: "ct-002",
    title: "Janitorial Services for Veterans Outpatient Clinics",
    agency: "Department of Veterans Affairs",
    naicsCode: "561720",
    location: "Phoenix, AZ",
    summary:
      "Nightly janitorial, supply restocking, and inspection reporting for three outpatient clinics.",
    awardAmount: 392500,
    awardDate: "2025-02-03",
    expirationDate: "2027-02-02",
    incumbent: "Desert Peak Services",
    stage: "watch",
    predictedRebidDate: "2026-11-18",
    confidenceScore: 0.68,
    watchlisted: true,
  },
  {
    id: "ct-003",
    title: "Fleet Vehicle Parts Distribution",
    agency: "City of Los Angeles",
    naicsCode: "423120",
    location: "Los Angeles, CA",
    summary:
      "Supply and delivery of OEM-equivalent fleet maintenance parts under annual blanket purchase terms.",
    awardAmount: 1185000,
    awardDate: "2024-10-11",
    expirationDate: "2026-10-10",
    incumbent: "Metro Industrial Supply",
    stage: "active",
    predictedRebidDate: "2026-08-14",
    confidenceScore: 0.73,
    watchlisted: false,
  },
];

export const winningBids: WinningBid[] = [
  {
    contractId: "ct-001",
    companyName: "Sierra Mechanical Group",
    bidAmount: 684000,
    awardDate: "2024-07-16",
  },
  {
    contractId: "ct-002",
    companyName: "Desert Peak Services",
    bidAmount: 392500,
    awardDate: "2025-02-03",
  },
  {
    contractId: "ct-003",
    companyName: "Metro Industrial Supply",
    bidAmount: 1185000,
    awardDate: "2024-10-11",
  },
];

export const alerts: AlertItem[] = [
  {
    id: "alt-1",
    title: "HVAC rebid window is opening",
    detail:
      "Historical term length suggests the Sacramento maintenance contract may post 46 days before expiration.",
    timeLabel: "Today",
    priority: "high",
  },
  {
    id: "alt-2",
    title: "New similar janitorial contract detected",
    detail:
      "A related VA clinic services opportunity matched your saved NAICS and location criteria.",
    timeLabel: "Tomorrow",
    priority: "medium",
  },
  {
    id: "alt-3",
    title: "Award pattern shifted in California",
    detail:
      "Average winning bids in your tracked facilities segment moved up 7% over the last two awards.",
    timeLabel: "This week",
    priority: "low",
  },
];

export const calendarEvents: CalendarEvent[] = [
  {
    id: "cal-1",
    title: "HVAC preventive maintenance predicted rebid",
    date: "May 30",
    category: "rebid",
  },
  {
    id: "cal-2",
    title: "Janitorial watchlist reminder",
    date: "Nov 04",
    category: "watchlist",
  },
  {
    id: "cal-3",
    title: "Army Corps agency review cycle",
    date: "Jun 12",
    category: "agency",
  },
];

export const insights: Insight[] = [
  {
    label: "Top NAICS by volume",
    value: "561720",
    supportingText: "Janitorial services account for the most active tracked opportunities.",
  },
  {
    label: "Highest spend agency",
    value: "Army Corps",
    supportingText: "Facilities work is leading your pipeline by total award value.",
  },
  {
    label: "Fastest rebid cadence",
    value: "22 months",
    supportingText: "Municipal fleet supply contracts are cycling faster than federal maintenance work.",
  },
];
