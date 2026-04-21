export function allowDemoSourceData() {
  return process.env.BID_VAULT_ALLOW_DEMO_DATA === "true";
}

export function getSamApiKey() {
  return (
    process.env.SAM_GOV_API_KEY?.trim() ||
    process.env.SAM_API_KEY?.trim() ||
    process.env.SAM_API_TOKEN?.trim() ||
    process.env.NEXT_PUBLIC_SAM_GOV_API_KEY?.trim() ||
    ""
  );
}

export function samLiveConfigured() {
  return getSamApiKey().length > 0;
}

export function websLiveConfigured() {
  return true;
}
