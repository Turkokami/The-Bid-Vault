"use client";

import { useState } from "react";
import { resetDemoState } from "@/lib/demo-contract-store";

export function DemoResetButton() {
  const [message, setMessage] = useState("");

  return (
    <div className="flex flex-col items-start gap-3">
      <button
        type="button"
        onClick={() => {
          resetDemoState();
          setMessage("Demo data reset. Created contracts, uploads, and planning saves were cleared.");
        }}
        className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/5"
      >
        Reset demo data
      </button>
      {message ? <p className="text-xs text-slate-400">{message}</p> : null}
    </div>
  );
}
