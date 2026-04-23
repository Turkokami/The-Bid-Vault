import type {
  NevadaBrowserResult,
  NevadaBrowserRunSummary,
  NevadaBrowserSearchInput,
} from "@/lib/sources/nevada-browser-types";

export const NEVADA_ACTIVE_CONTRACTS_URL =
  "https://nevadaepro.com/bso/view/search/external/advancedSearchContractBlanket.xhtml?view=activeContracts";
export const NEVADA_OPEN_BIDS_URL =
  "https://nevadaepro.com/bso/view/search/external/advancedSearchBid.xhtml?openBids=true";

export function buildNevadaPortalLaunchUrl(input: NevadaBrowserSearchInput) {
  return input.mode === "active-contracts" ? NEVADA_ACTIVE_CONTRACTS_URL : NEVADA_OPEN_BIDS_URL;
}

export async function fetchNevadaBrowserAssistedResults(
  input: NevadaBrowserSearchInput,
): Promise<{
  results: NevadaBrowserResult[];
  summary: NevadaBrowserRunSummary;
}> {
  const portalUrl = buildNevadaPortalLaunchUrl(input);

  return {
    results: [],
    summary: {
      mode: input.mode,
      attemptedAt: new Date().toISOString(),
      resultCount: 0,
      portalUrl,
      blockedReason:
        "NevadaEPro currently blocks background result extraction from the app. This file is the upgrade point for a future browser-driven connector.",
    },
  };
}
