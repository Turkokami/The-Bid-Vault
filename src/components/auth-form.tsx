"use client";

import Link from "next/link";
import { useActionState } from "react";
import { buttonStyles } from "@/components/ui/button";
import type { AuthActionState } from "@/app/auth/actions";

const emptyState: AuthActionState = {};

export function AuthForm({
  mode,
  action,
}: {
  mode: "sign-in" | "sign-up";
  action: (state: AuthActionState, formData: FormData) => Promise<AuthActionState>;
}) {
  const [state, formAction, pending] = useActionState(action, emptyState);

  return (
    <form action={formAction} className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 shadow-[0_0_30px_rgba(34,197,94,0.08)]">
      <div className="space-y-5">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-300/80">
            {mode === "sign-up" ? "Create your account" : "Welcome back"}
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-white">
            {mode === "sign-up" ? "Start your Bid Vault workspace." : "Sign in to your workspace."}
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            {mode === "sign-up"
              ? "Create an account so your saved searches, watchlist, and workspace stay personal to your business."
              : "Use your email and password to get back into your saved opportunities and workspace."}
          </p>
        </div>

        {state.error ? (
          <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
            {state.error}
          </div>
        ) : null}

        <div className="grid gap-4">
          {mode === "sign-up" ? (
            <>
              <label className="space-y-2 text-sm text-slate-200">
                <span>Your name</span>
                <input
                  name="name"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400/50"
                  placeholder="Kris Turk"
                />
              </label>

              <label className="space-y-2 text-sm text-slate-200">
                <span>Workspace name</span>
                <input
                  name="workspaceName"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400/50"
                  placeholder="Turkokami Pest Control"
                />
              </label>
            </>
          ) : null}

          <label className="space-y-2 text-sm text-slate-200">
            <span>Email</span>
            <input
              name="email"
              type="email"
              autoComplete="email"
              className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400/50"
              placeholder="you@company.com"
            />
          </label>

          <label className="space-y-2 text-sm text-slate-200">
            <span>Password</span>
            <input
              name="password"
              type="password"
              autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
              className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400/50"
              placeholder="At least 8 characters"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={pending}
          className={buttonStyles({ variant: "primary", size: "lg", className: "w-full justify-center" })}
        >
          {pending
            ? mode === "sign-up"
              ? "Creating account..."
              : "Signing in..."
            : mode === "sign-up"
              ? "Create account and workspace"
              : "Sign in"}
        </button>

        <p className="text-sm text-slate-400">
          {mode === "sign-up" ? (
            <>
              Already have an account?{" "}
              <Link href="/sign-in" className="text-emerald-300 hover:text-emerald-200">
                Sign in
              </Link>
            </>
          ) : (
            <>
              Need an account?{" "}
              <Link href="/sign-up" className="text-emerald-300 hover:text-emerald-200">
                Create one
              </Link>
            </>
          )}
        </p>
      </div>
    </form>
  );
}
