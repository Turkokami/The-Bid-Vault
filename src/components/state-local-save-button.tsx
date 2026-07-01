"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  readSavedStateLocalEntries,
  removeSavedStateLocalOpportunity,
  saveStateLocalOpportunity,
  syncSavedIdsFromDb,
} from "@/lib/demo-state-local-store";
import type { NormalizedStateLocalOpportunity } from "@/lib/sources/types";

export function StateLocalSaveButton({ opportunity }: { opportunity: NormalizedStateLocalOpportunity }) {
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Seed from localStorage immediately, then sync from DB
    setSavedIds(readSavedStateLocalEntries().map((e) => e.opportunityId));
    syncSavedIdsFromDb().then(setSavedIds).catch(() => null);

    const sync = () => setSavedIds(readSavedStateLocalEntries().map((e) => e.opportunityId));
    window.addEventListener("bid-vault-state-local-saved-updated", sync);
    return () => window.removeEventListener("bid-vault-state-local-saved-updated", sync);
  }, []);

  const isSaved = savedIds.includes(opportunity.id);

  const handleSave = async () => {
    setLoading(true);
    await saveStateLocalOpportunity({ opportunity });
    setLoading(false);
  };

  const handleRemove = async () => {
    setLoading(true);
    await removeSavedStateLocalOpportunity(opportunity.id);
    setLoading(false);
  };

  return isSaved ? (
    <Button variant="ghost" size="sm" onClick={handleRemove} disabled={loading}>
      {loading ? "Removing…" : "Saved for later"}
    </Button>
  ) : (
    <Button variant="secondary" size="sm" onClick={handleSave} disabled={loading}>
      {loading ? "Saving…" : "Save for later"}
    </Button>
  );
}
