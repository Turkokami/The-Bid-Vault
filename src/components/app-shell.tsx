import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";
import { signOutAction } from "@/app/auth/actions";
import { MobileBottomNav } from "@/components/mobile-nav";
import { WorkspaceSwitcher } from "@/components/workspace-switcher";
import { getViewerContext } from "@/lib/server/workspace";

const desktopNav = [
  { href: "/sam-search", label: "Search SAM" },
  { href: "/state-local", label: "State & Local" },
  { href: "/bid-builder", label: "Build Bid" },
  { href: "/dashboard", label: "My Work" },
  { href: "/tracking", label: "Tracking" },
  { href: "/learn", label: "Learn" },
];

export async function AppShell({ children }: { children: ReactNode }) {
  const viewer = await getViewerContext();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.18),_transparent_24%),linear-gradient(180deg,#050816_0%,#08101d_50%,#0b1324_100%)] text-slate-100">
      <div className="fixed inset-x-0 top-0 z-50 border-b border-white/8 bg-slate-950/78 shadow-[0_12px_40px_rgba(0,0,0,0.28)] backdrop-blur-xl supports-[backdrop-filter]:bg-slate-950/62">
        <div className="mx-auto w-full max-w-7xl px-2 py-2 sm:px-4 lg:px-8 lg:py-3">
          <header className="overflow-hidden rounded-[1.1rem] border border-white/10 bg-slate-950/88 shadow-[0_0_40px_rgba(34,197,94,0.08)] lg:rounded-[1.5rem]">

            {/* Brand bar — always visible */}
            <div className="relative overflow-hidden border-b border-emerald-400/10 bg-[linear-gradient(90deg,rgba(2,6,23,0.98)_0%,rgba(3,12,24,0.98)_35%,rgba(5,18,30,0.98)_65%,rgba(2,6,23,0.98)_100%)] px-3 py-2.5 lg:px-5 lg:py-3">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_left,rgba(34,197,94,0.18),transparent_32%),radial-gradient(circle_at_center,rgba(74,222,128,0.10),transparent_24%)]" />
              <div className="relative flex items-center justify-between gap-3">
                <Link href="/" className="flex min-w-0 items-center gap-3">
                  <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-[0.8rem] border border-emerald-400/30 bg-black/60 shadow-[0_0_30px_rgba(74,222,128,0.16)] sm:h-11 sm:w-11">
                    <Image
                      src="/bid-vault-logo.png"
                      alt="The Bid Vault"
                      fill
                      sizes="44px"
                      className="object-contain p-1"
                      priority
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-[0.28em] text-emerald-300/85">
                      The Bid Vault
                    </p>
                    <p className="truncate text-sm font-semibold tracking-[-0.02em] text-white">
                      Find contracts. Win more bids.
                    </p>
                  </div>
                </Link>

                {/* Mobile: hamburger + quick search link */}
                <div className="flex items-center gap-2 lg:hidden">
                  <Link
                    href="/sam-search"
                    className="flex h-9 items-center gap-1.5 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-3 text-xs font-medium text-emerald-200 active:scale-95"
                  >
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <circle cx="5.5" cy="5.5" r="4" />
                      <line x1="9" y1="9" x2="12" y2="12" />
                    </svg>
                    Search
                  </Link>
                  <Link
                    href="/menu"
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition hover:border-emerald-400/30 hover:bg-emerald-400/10"
                    aria-label="Open menu"
                  >
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <line x1="3" y1="5" x2="15" y2="5" />
                      <line x1="3" y1="9" x2="15" y2="9" />
                      <line x1="3" y1="13" x2="15" y2="13" />
                    </svg>
                  </Link>
                </div>

                {/* Desktop: auth + workspace */}
                <div className="hidden items-center gap-2 lg:flex">
                  {viewer.workspaces.length > 0 && (
                    <WorkspaceSwitcher
                      workspaces={viewer.workspaces}
                      activeWorkspaceSlug={viewer.activeWorkspace?.slug}
                    />
                  )}
                  {viewer.isAuthenticated ? (
                    <>
                      <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs text-emerald-100">
                        {viewer.user.name}
                      </span>
                      <Link
                        href="/workspaces/new"
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white transition hover:border-emerald-400/30 hover:bg-emerald-400/10 hover:text-emerald-200"
                      >
                        New workspace
                      </Link>
                      <form action={signOutAction}>
                        <button
                          type="submit"
                          className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white transition hover:border-emerald-400/30 hover:bg-emerald-400/10 hover:text-emerald-200"
                        >
                          Sign out
                        </button>
                      </form>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/sign-in"
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white transition hover:border-emerald-400/30 hover:bg-emerald-400/10 hover:text-emerald-200"
                      >
                        Sign in
                      </Link>
                      <Link
                        href="/sign-up"
                        className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs text-emerald-100 transition hover:border-emerald-400/40 hover:bg-emerald-400/15 hover:text-white"
                      >
                        Create account
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Desktop nav — hidden on mobile */}
            <div className="hidden px-5 py-3 lg:block">
              <div className="flex flex-wrap items-center gap-2">
                {desktopNav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="whitespace-nowrap rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium text-white shadow-[0_8px_24px_rgba(0,0,0,0.16)] transition hover:-translate-y-0.5 hover:border-emerald-400/30 hover:bg-emerald-400/10 hover:text-emerald-200 active:translate-y-0"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </header>
        </div>
      </div>

      <MobileBottomNav />

      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pb-24 pt-[var(--app-shell-offset)] sm:px-6 lg:px-8 lg:pb-10">
        <main className="flex-1">
          {children}
        </main>

        <footer className="mt-10 rounded-[2rem] border border-white/10 bg-slate-950/60 px-6 py-5 shadow-[0_0_30px_rgba(34,197,94,0.08)] backdrop-blur">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative h-10 w-10 overflow-hidden rounded-2xl border border-emerald-400/30 bg-black/40">
                <Image
                  src="/bid-vault-logo.png"
                  alt="The Bid Vault"
                  fill
                  sizes="40px"
                  className="object-contain p-1"
                />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-300/80">
                  The Bid Vault
                </p>
                <p className="text-xs text-slate-400">
                  Federal · State · Local contract search and bid tools
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-slate-500">
              <Link href="/sam-search" className="hover:text-slate-300">SAM Search</Link>
              <Link href="/state-local" className="hover:text-slate-300">State & Local</Link>
              <Link href="/bid-builder" className="hover:text-slate-300">Bid Builder</Link>
              <Link href="/learn" className="hover:text-slate-300">Learn</Link>
              <Link href="/pricing" className="hover:text-slate-300">Pricing</Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
