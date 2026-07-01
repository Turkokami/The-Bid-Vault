"use client";

import Link from "next/link";
import { useActionState } from "react";
import { resetPasswordAction } from "@/app/auth/password-actions";
import { buttonStyles } from "@/components/ui/button";

import type { PasswordActionState } from "@/app/auth/password-actions";
const empty: PasswordActionState = {};

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(resetPasswordAction, empty);

  if (!token) {
    return (
      <div className="rounded-[2rem] border border-amber-400/20 bg-amber-400/10 p-6 text-sm text-amber-100">
        This reset link is missing a token.{" "}
        <Link href="/forgot-password" className="underline">
          Request a new one.
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 shadow-[0_0_30px_rgba(34,197,94,0.08)]">
      <input type="hidden" name="token" value={token} />

      <div className="space-y-5">
        {state.error && (
          <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
            {state.error}{" "}
            {state.error.includes("expired") && (
              <Link href="/forgot-password" className="underline">
                Request a new link.
              </Link>
            )}
          </div>
        )}

        {state.success ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
              {state.success}
            </div>
            <Link
              href="/sign-in"
              className={buttonStyles({ variant: "primary", size: "lg", className: "block w-full text-center" })}
            >
              Sign in now →
            </Link>
          </div>
        ) : (
          <>
            <label className="block space-y-2 text-sm text-slate-200">
              <span>New password</span>
              <input
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                placeholder="At least 8 characters"
                className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400/50"
              />
            </label>

            <label className="block space-y-2 text-sm text-slate-200">
              <span>Confirm new password</span>
              <input
                name="confirm"
                type="password"
                autoComplete="new-password"
                required
                placeholder="Same password again"
                className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400/50"
              />
            </label>

            <button
              type="submit"
              disabled={pending}
              className={buttonStyles({ variant: "primary", size: "lg", className: "w-full justify-center" })}
            >
              {pending ? "Saving…" : "Set new password"}
            </button>
          </>
        )}
      </div>
    </form>
  );
}
