"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestPasswordResetAction } from "@/app/auth/password-actions";
import { buttonStyles } from "@/components/ui/button";

import type { PasswordActionState } from "@/app/auth/password-actions";
const empty: PasswordActionState = {};

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(requestPasswordResetAction, empty);

  return (
    <form action={formAction} className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 shadow-[0_0_30px_rgba(34,197,94,0.08)]">
      <div className="space-y-5">
        {state.error && (
          <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
            {state.error}
          </div>
        )}
        {state.success && (
          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
            {state.success}
          </div>
        )}

        {!state.success && (
          <>
            <label className="block space-y-2 text-sm text-slate-200">
              <span>Email address</span>
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@company.com"
                className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400/50"
              />
            </label>

            <button
              type="submit"
              disabled={pending}
              className={buttonStyles({ variant: "primary", size: "lg", className: "w-full justify-center" })}
            >
              {pending ? "Sending…" : "Send reset link"}
            </button>
          </>
        )}

        <p className="text-sm text-slate-400">
          Remember your password?{" "}
          <Link href="/sign-in" className="text-emerald-300 hover:text-emerald-200">
            Sign in
          </Link>
        </p>
      </div>
    </form>
  );
}
