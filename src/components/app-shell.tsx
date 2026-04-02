import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";
import { signOutAction } from "@/app/auth/actions";
import { WorkspaceSwitcher } from "@/components/workspace-switcher";
import { getViewerContext } from "@/lib/server/workspace";

const navigation = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/sam-search", label: "Search SAM" },
  { href: "/state-local", label: "State & Local" },
  { href: "/pricing", label: "Pricing" },
];

export async function AppShell({ children }: { children: ReactNode }) {
  const viewer = await getViewerContext();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.18),_transparent_24%),linear-gradient(180deg,#050816_0%,#08101d_50%,#0b1324_100%)] text-slate-100">
      <div className="fixed inset-x-0 top-0 z-50 border-b border-white/8 bg-slate-950/72 shadow-[0_12px_40px_rgba(0,0,0,0.28)] backdrop-blur-xl supports-[backdrop-filter]:bg-slate-950/58">
        <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <header className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/85 shadow-[0_0_40px_rgba(34,197,94,0.08)]">
            <div className="relative overflow-hidden border-b border-emerald-400/10 bg-[linear-gradient(90deg,rgba(2,6,23,0.98)_0%,rgba(3,12,24,0.98)_35%,rgba(5,18,30,0.98)_65%,rgba(2,6,23,0.98)_100%)] px-4 py-4 xl:px-6">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_left,rgba(34,197,94,0.18),transparent_32%),radial-gradient(circle_at_center,rgba(74,222,128,0.10),transparent_24%)]" />
              <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16 overflow-hidden rounded-[1.35rem] border border-emerald-400/30 bg-black/60 shadow-[0_0_30px_rgba(74,222,128,0.16)]">
                    <Image
                      src="/bid-vault-logo.png"
                      alt="The Bid Vault logo"
                      fill
                      sizes="64px"
                      className="object-contain p-1.5"
                      priority
                    />
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.45em] text-emerald-300/85">
                      The Bid Vault
                    </p>
                    <p className="mt-2 max-w-xl text-lg font-semibold tracking-[-0.02em] text-white md:text-xl">
                      Find contracts, understand them fast, and plan your next move.
                    </p>
                  </div>
                </div>
                <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.28em] text-emerald-100">
                  Start here
                </div>
              </div>
            </div>

            <div className="px-4 py-3 xl:px-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative h-14 w-14 overflow-hidden rounded-2xl border border-emerald-400/30 bg-black/40 shadow-[0_0_24px_rgba(74,222,128,0.18)]">
                    <Image
                      src="/bid-vault-logo.png"
                      alt="The Bid Vault logo"
                      fill
                      sizes="56px"
                      className="object-contain p-1"
                      priority
                    />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">
                      Navigation
                    </p>
                    <p className="text-sm text-slate-300">
                      Simple tools for finding and tracking government work.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 lg:items-end">
                  <div className="flex flex-wrap items-center gap-2 text-sm text-slate-300">
                    {navigation.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-white shadow-[0_8px_24px_rgba(0,0,0,0.16)] transition hover:-translate-y-0.5 hover:border-emerald-400/30 hover:bg-emerald-400/10 hover:text-emerald-200 active:translate-y-0"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {viewer.workspaces.length > 0 ? (
                      <WorkspaceSwitcher
                        workspaces={viewer.workspaces}
                        activeWorkspaceSlug={viewer.activeWorkspace?.slug}
                      />
                    ) : null}
                    {viewer.isAuthenticated ? (
                      <>
                        <Link
                          href="/workspaces/new"
                          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white shadow-[0_8px_24px_rgba(0,0,0,0.16)] transition hover:-translate-y-0.5 hover:border-emerald-400/30 hover:bg-emerald-400/10 hover:text-emerald-200 active:translate-y-0"
                        >
                          New workspace
                        </Link>
                        <form action={signOutAction}>
                          <button
                            type="submit"
                            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white shadow-[0_8px_24px_rgba(0,0,0,0.16)] transition hover:-translate-y-0.5 hover:border-emerald-400/30 hover:bg-emerald-400/10 hover:text-emerald-200 active:translate-y-0"
                          >
                            Sign out
                          </button>
                        </form>
                        <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-100">
                          {viewer.user.name} / {viewer.activeWorkspace?.role ?? "owner"} / personal workspace
                        </div>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/sign-in"
                          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white shadow-[0_8px_24px_rgba(0,0,0,0.16)] transition hover:-translate-y-0.5 hover:border-emerald-400/30 hover:bg-emerald-400/10 hover:text-emerald-200 active:translate-y-0"
                        >
                          Sign in
                        </Link>
                        <Link
                          href="/sign-up"
                          className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-100 shadow-[0_8px_24px_rgba(34,197,94,0.12)] transition hover:-translate-y-0.5 hover:border-emerald-400/40 hover:bg-emerald-400/15 hover:text-white active:translate-y-0"
                        >
                          Create account
                        </Link>
                        <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-100">
                          Demo mode / sample workspace
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </header>
        </div>
      </div>

      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pb-10 pt-[var(--app-shell-offset)] sm:px-6 lg:px-8">
        <main className="flex-1">
          {children}
        </main>

        <footer className="mt-10 rounded-[2rem] border border-white/10 bg-slate-950/60 px-6 py-5 shadow-[0_0_30px_rgba(34,197,94,0.08)] backdrop-blur">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative h-12 w-12 overflow-hidden rounded-2xl border border-emerald-400/30 bg-black/40">
                <Image
                  src="/bid-vault-logo.png"
                  alt="The Bid Vault shield logo"
                  fill
                  sizes="48px"
                  className="object-contain p-1"
                />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-300/80">
                  The Bid Vault
                </p>
                <p className="text-sm text-slate-400">
                  Built for small businesses that want a simpler way to find and track government contracts.
                </p>
              </div>
            </div>
            <div className="text-sm text-slate-500">
              Contract search / saved opportunities / research help / bid planning
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
