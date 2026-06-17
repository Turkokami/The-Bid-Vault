"use client";

import { useActionState } from "react";
import { buttonStyles } from "@/components/ui/button";
import type { AuthActionState } from "@/app/auth/actions";

const emptyState: AuthActionState = {};

export function WorkspaceCreateForm({
  action,
}: {
  action: (state: AuthActionState, formData: FormData) => Promise<AuthActionState>;
}) {
  const [state, formAction, pending] = useActionState(action, emptyState);

  return (
    <form action={formAction} className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-6">
      <div className="space-y-5">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-300/80">
            Add company
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-white">
            Add a company to your account.
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Keep saved searches, watchlists, and bids organized separately for each business you manage.
          </p>
        </div>

        {state.error ? (
          <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
            {state.error}
          </div>
        ) : null}

        <label className="space-y-2 text-sm text-slate-200">
          <span>Company name</span>
          <input
            name="workspaceName"
            className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400/50"
            placeholder="Your company name"
          />
        </label>

        <button
          type="submit"
          disabled={pending}
          className={buttonStyles({ variant: "primary", size: "lg" })}
        >
          {pending ? "Adding company..." : "Add company"}
        </button>
      </div>
    </form>
  );
}
