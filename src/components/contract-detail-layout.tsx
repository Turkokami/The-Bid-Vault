import Link from "next/link";
import { ReactNode } from "react";

type SectionLink = {
  id: string;
  label: string;
};

export function ContractDetailLayout({
  links,
  children,
}: {
  links: SectionLink[];
  children: ReactNode;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="sticky top-36 h-fit rounded-[2rem] border border-white/10 bg-slate-950/80 p-5 shadow-[0_14px_40px_rgba(0,0,0,0.28)]">
        <p className="text-xs uppercase tracking-[0.3em] text-emerald-300/80">On this page</p>
        <nav className="mt-4 space-y-2">
          {links.map((link) => (
            <Link
              key={link.id}
              href={`#${link.id}`}
              className="block rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-emerald-400/25 hover:bg-emerald-400/[0.08] hover:text-emerald-100"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="space-y-6">{children}</div>
    </div>
  );
}
