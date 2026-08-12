export function allowDemoSourceData() {
  return process.env.BID_VAULT_ALLOW_DEMO_DATA === "true";
}

export function getSamApiKey() {
  // Only read server-side env vars — never NEXT_PUBLIC_ names, which would
  // expose the key in the client bundle if ever set under that prefix.
  return (
    process.env.SAM_GOV_API_KEY?.trim() ||
    process.env.SAM_API_KEY?.trim() ||
    process.env.SAM_API_TOKEN?.trim() ||
    ""
  );
}

export function samLiveConfigured() {
  return getSamApiKey().length > 0;
}

export function websLiveConfigured() {
  return true;
}
