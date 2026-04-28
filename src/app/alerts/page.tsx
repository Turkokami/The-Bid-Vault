import { OpportunityAlertsClient } from "@/components/opportunity-alerts-client";
import { stateDirectory } from "@/lib/sources/state-registry";

export default function AlertsPage() {
  return <OpportunityAlertsClient states={stateDirectory} />;
}
