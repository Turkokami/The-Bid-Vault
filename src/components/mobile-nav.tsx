"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type NavGroup = {
  label: string;
  items: { href: string; label: string; description: string }[];
};

const navGroups: NavGroup[] = [
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
    ],
  },
  {
    label: "My Workspace",
    items: [
      { href: "/dashboard", label: "Dashboard", description: "Your saved contracts at a glance" },
      { href: "/contracts", label: "Contracts", description: "Track and manage bids" },
      { href: "/watchlist", label: "Watchlist", description: "Saved opportunities" },
      { href: "/alerts", label: "Alerts", description: "Get notified before rebids" },
      { href: "/calendar", label: "Calendar", description: "Upcoming deadlines" },
    ],
  },
  {
    label: "Learn & More",
    items: [
      { href: "/learn", label: "Training Guide", description: "How to win government contracts" },
      { href: "/pricing", label: "Plans & Pricing", description: "Compare service tiers" },
    ],
  },
];

export function MobileNav({
  isAuthenticated,
  userName,
}: {
  isAuthenticated: boolean;
  userName?: string;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition hover:border-emerald-400/30 hover:bg-emerald-400/10 active:scale-95"
        aria-label={open ? "Close menu" : "Open menu"}
      >
        {open ? (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="3" x2="15" y2="15" />
            <line x1="15" y1="3" x2="3" y2="15" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="5" x2="15" y2="5" />
            <line x1="3" y1="9" x2="15" y2="9" />
            <line x1="3" y1="13" x2="15" y2="13" />
          </svg>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-slate-950/98 backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-300/80">Menu</p>
            <button
              onClick={() => setOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="2" y1="2" x2="14" y2="14" />
                <line x1="14" y1="2" x2="2" y2="14" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
            {navGroups.map((group) => (
              <div key={group.label}>
                <p className="mb-2 text-[10px] uppercase tracking-[0.3em] text-emerald-400/60 font-medium">
                  {group.label}
                </p>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const active = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex flex-col rounded-xl border px-4 py-3 transition active:scale-[0.98] ${
                          active
                            ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
                            : "border-white/8 bg-white/4 text-white hover:border-emerald-400/20 hover:bg-white/8"
                        }`}
                      >
                        <span className="text-sm font-medium">{item.label}</span>
                        <span className="mt-0.5 text-xs text-slate-400">{item.description}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="border-t border-white/8 pt-4">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <p className="text-xs text-slate-400">Signed in as <span className="text-white">{userName}</span></p>
                  <Link
                    href="/workspaces/new"
                    className="block rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
                  >
                    New workspace
                  </Link>
                  <form action="/api/auth/sign-out" method="POST">
                    <button
                      type="submit"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-white"
                    >
                      Sign out
                    </button>
                  </form>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    href="/sign-in"
                    className="block rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm text-white"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/sign-up"
                    className="block rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-center text-sm font-medium text-emerald-200"
                  >
                    Create free account
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
