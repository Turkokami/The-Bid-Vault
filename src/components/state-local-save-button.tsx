"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  readSavedStateLocalEntries,
  removeSavedStateLocalOpportunity,
  saveStateLocalOpportunity,
} from "@/lib/demo-state-local-store";

export function StateLocalSaveButton({ opportunityId }: { opportunityId: string }) {
  const [savedIds, setSavedIds] = useState<string[]>([]);

  useEffect(() => {
    const sync = () => {
      setSavedIds(readSavedStateLocalEntries().map((entry) => entry.opportunityId));
    };

    sync();
    window.addEventListener("bid-vault-state-local-saved-updated", sync);
    return () => window.removeEventListener("bid-vault-state-local-saved-updated", sync);
  }, []);

  const isSaved = useMemo(() => savedIds.includes(opportunityId), [opportunityId, savedIds]);

  return isSaved ? (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => removeSavedStateLocalOpportunity(opportunityId)}
    >
      Saved for later
    </Button>
  ) : (
    <Button
      variant="secondary"
      size="sm"
      onClick={() =>
        saveStateLocalOpportunity({
          opportunityId,
          reminderDaysBefore: 14,
          notes: "Saved from the results page for follow-up review.",
        })
      }
    >
      Save for later
    </Button>
  );
}
