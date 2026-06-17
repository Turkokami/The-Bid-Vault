import Link from "next/link";
import { getViewerContext } from "@/lib/server/workspace";
import { signOutAction } from "@/app/auth/actions";

const navGroups = [
  {
    label: "Find Contracts",
    items: [
      { href: "/sam-search", label: "Search SAM.gov", description: "Federal contracts & opportunities" },
      { href: "/state-local", label: "State & Local", description: "State, county & city bids" },
      { href: "/government-data", label: "Browse Awards", description: "Past award history & pricing" },
    ],
  },
  {
    label: "Bid Tools",
    items: [
      { href: "/bid-builder", label: "Build a Bid", description: "Draft and structure your response" },
      { href: "/foia", label: "FOIA Request", description: "Request prior contract records" },
      { href: "/categories", label: "NAICS / PSC Codes", description: "Find your industry codes" },
      { href: "/my-codes", label: "My Saved Codes", description: "Your saved category code lists" },
    ],
  },
  {
    label: "My Workspace",
    items: [
      { href: "/dashboard", label: "Dashboard", description: "Your saved contracts at a glance" },
      { href: "/tracking", label: "Tracking", description: "Watchlist & alerts in one place" },
      { href: "/bids", label: "My Bids", description: "Bid drafts you're working on" },
      { href: "/contracts", label: "Contracts", description: "Track and manage bids" },
      { href: "/calendar", label: "Calendar", description: "Upcoming deadlines" },
    ],
  },
  {
    label: "Learn & More",
    items: [
      { href: "/learn", label: "Training Guide", description: "How to win government contracts" },
      { href: "/pricing", label: "Plans & Pricing", description: "Compare service tiers" },
      { href: "/sync-center", label: "Sync Center", description: "Data source status" },
    ],
  },
];

export default async function MenuPage() {
  const viewer = await getViewerContext();

  return (
    <div className="space-y-6 pb-4">
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
        <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">The Bid Vault</p>
        <h1 className="mt-2 text-2xl font-semibold text-white">Menu</h1>
        {viewer.isAuthenticated ? (
          <p className="mt-1 text-sm text-slate-400">Signed in as <span className="text-white">{viewer.user.name}</span></p>
        ) : (
          <div className="mt-4 flex gap-3">
            <Link href="/sign-in" className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white">
              Sign in
            </Link>
            <Link href="/sign-up" className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-2.5 text-sm font-medium text-emerald-200">
              Create account
            </Link>
          </div>
        )}
      </div>

      {navGroups.map((group) => (
        <div key={group.label}>
          <p className="mb-2 px-1 text-[10px] uppercase tracking-[0.3em] text-emerald-400/60 font-medium">
            {group.label}
          </p>
          <div className="space-y-1">
            {group.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/4 px-4 py-3.5 transition hover:border-emerald-400/20 hover:bg-white/8 active:scale-[0.98]"
              >
                <div>
                  <p className="text-sm font-medium text-white">{item.label}</p>
                  <p className="mt-0.5 text-xs text-slate-400">{item.description}</p>
                </div>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="shrink-0 text-slate-600">
                  <line x1="4" y1="8" x2="12" y2="8" />
                  <polyline points="9,5 12,8 9,11" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      ))}

      {viewer.isAuthenticated && (
        <div className="space-y-2">
          <Link
            href="/workspaces/new"
            className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/4 px-4 py-3.5"
          >
            <p className="text-sm font-medium text-white">New workspace</p>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="shrink-0 text-slate-600">
              <line x1="4" y1="8" x2="12" y2="8" />
              <polyline points="9,5 12,8 9,11" />
            </svg>
          </Link>
          <form action={signOutAction}>
            <button
              type="submit"
              className="w-full rounded-2xl border border-white/8 bg-white/4 px-4 py-3.5 text-left text-sm text-slate-300"
            >
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
