import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";
import { WorkspaceSwitcher } from "@/components/workspace-switcher";
import { getViewerContext } from "@/lib/server/workspace";

const navigation = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/contracts", label: "Contracts" },
  { href: "/contracts/new", label: "New Contract" },
  { href: "/government-data", label: "Gov Data" },
  { href: "/foia", label: "FOIA" },
  { href: "/watchlist", label: "Watchlist" },
  { href: "/calendar", label: "Calendar" },
  { href: "/bids", label: "Winning Bids" },
];

export async function AppShell({ children }: { children: ReactNode }) {
  const viewer = await getViewerContext();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.18),_transparent_24%),linear-gradient(180deg,#050816_0%,#08101d_50%,#0b1324_100%)] text-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pb-10 pt-4 sm:px-6 lg:px-8">
        <header className="fixed left-1/2 top-4 z-40 w-[calc(100%-2rem)] max-w-7xl -translate-x-1/2 rounded-full border border-white/10 bg-slate-950/80 px-4 py-3 shadow-[0_0_40px_rgba(34,197,94,0.10)] backdrop-blur xl:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="relative h-14 w-14 overflow-hidden rounded-2xl border border-emerald-400/30 bg-black/40 shadow-[0_0_24px_rgba(74,222,128,0.18)]">
                <Image
                  src="/BVlogo.png"
                  alt="The Bid Vault logo"
                  fill
                  sizes="56px"
                  className="object-contain p-1"
                  priority
                />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">
                  The Bid Vault
                </p>
                <p className="text-sm text-slate-300">
                  Track the past. Predict the future.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 lg:items-end">
              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-300">
                {navigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-full border border-transparent px-4 py-2 transition hover:border-emerald-400/30 hover:bg-emerald-400/10 hover:text-emerald-200"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <WorkspaceSwitcher
                  workspaces={viewer.workspaces}
                  activeWorkspaceSlug={viewer.activeWorkspace?.slug}
                />
                <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-100">
                  {viewer.user.name} / {viewer.activeWorkspace?.role ?? "viewer"} /{" "}
                  {viewer.mode === "database" ? "beta database" : "demo mode"}
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 pt-32">{children}</main>

        <footer className="mt-10 rounded-[2rem] border border-white/10 bg-slate-950/60 px-6 py-5 shadow-[0_0_30px_rgba(34,197,94,0.08)] backdrop-blur">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative h-12 w-12 overflow-hidden rounded-2xl border border-emerald-400/30 bg-black/40">
                <Image
                  src="/BVlogo.png"
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
                  Built for contractors who want earlier signal, tighter planning, and full margin retention.
                </p>
              </div>
            </div>
            <div className="text-sm text-slate-500">
              Contract discovery / planning / FOIA research / rebid timing
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
