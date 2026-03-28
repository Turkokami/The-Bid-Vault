"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { resetDemoState } from "@/lib/demo-contract-store";

export function DemoResetButton() {
  const [message, setMessage] = useState("");

  return (
    <div className="flex flex-col items-start gap-3">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => {
          resetDemoState();
          setMessage("Demo data reset. Created contracts, uploads, and planning saves were cleared.");
        }}
      >
        Reset demo data
      </Button>
      {message ? <p className="text-xs text-slate-400">{message}</p> : null}
    </div>
  );
}
