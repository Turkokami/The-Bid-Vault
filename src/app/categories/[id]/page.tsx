import Link from "next/link";
import { notFound } from "next/navigation";
import { InfoTip } from "@/components/info-tip";
import { buttonStyles } from "@/components/ui/button";
import {
  categoryCodeRecords,
  findRelatedCategoryCodes,
} from "@/lib/category-codes";

export default async function CategoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const record = categoryCodeRecords.find((item) => item.id === id);

  if (!record) {
    notFound();
  }

  const parent = record.parentCode
    ? categoryCodeRecords.find((item) => item.code === record.parentCode)
    : null;
  const children = categoryCodeRecords.filter((item) => item.parentCode === record.code);
  const related = findRelatedCategoryCodes(record, categoryCodeRecords);

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_0_30px_rgba(34,197,94,0.08)] backdrop-blur">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-100">
            {record.code}
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
            {record.sourceName}
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
            {record.topLevelCategory}
          </span>
        </div>

        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">{record.title}</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
          This page shows the details for a work category code and the nearby categories that may also fit your business.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/categories" className={buttonStyles({ variant: "secondary", size: "md" })}>
            Back to category search
          </Link>
          <Link href="/contracts" className={buttonStyles({ variant: "ghost", size: "md" })}>
            Search contracts with these categories in mind
          </Link>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <article className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6">
            <h2 className="text-xl font-semibold text-white">Overview</h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">{record.description}</p>
            <dl className="mt-6 grid gap-4 text-sm text-slate-300 md:grid-cols-2">
              <div>
                <dt className="flex items-center gap-2 text-slate-500">
                  Category Code
                  <InfoTip>
                    A code used by some contract systems to group similar services or products.
                  </InfoTip>
                </dt>
                <dd className="mt-1 text-white">{record.code}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Source</dt>
                <dd className="mt-1 text-white">{record.sourceName}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Top-level family</dt>
                <dd className="mt-1 text-white">{record.topLevelCategory}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Parent category</dt>
                <dd className="mt-1 text-white">{parent ? `${parent.code} / ${parent.title}` : "Top-level family"}</dd>
              </div>
            </dl>
          </article>

          <article className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold text-white">Common service phrases</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              These are the plain-language terms that help us map business services to this category.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              {record.normalizedKeywords.map((keyword) => (
                <span
                  key={keyword}
                  className="rounded-full border border-white/10 bg-slate-950/70 px-4 py-2 text-sm text-slate-200"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </article>
        </div>

        <div className="space-y-6">
          <article className="rounded-[2rem] border border-emerald-400/20 bg-emerald-400/10 p-6">
            <p className="text-xs uppercase tracking-[0.25em] text-emerald-200">Why this matters</p>
            <p className="mt-4 text-sm leading-7 text-emerald-50/90">
              These categories can later help drive contract matching, saved searches, alerts, company profile targeting, and state or local monitoring.
            </p>
          </article>

          <article className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6">
            <h2 className="text-xl font-semibold text-white">Broader and narrower matches</h2>
            <div className="mt-5 space-y-3">
              {parent ? (
                <Link
                  href={`/categories/${parent.id}`}
                  className="block rounded-[1.25rem] border border-white/10 bg-white/5 p-4 transition hover:border-emerald-400/25 hover:bg-emerald-400/5"
                >
                  <p className="font-semibold text-white">{parent.code} / {parent.title}</p>
                  <p className="mt-1 text-sm text-slate-400">Broader family</p>
                </Link>
              ) : null}
              {children.map((child) => (
                <Link
                  key={child.id}
                  href={`/categories/${child.id}`}
                  className="block rounded-[1.25rem] border border-white/10 bg-white/5 p-4 transition hover:border-emerald-400/25 hover:bg-emerald-400/5"
                >
                  <p className="font-semibold text-white">{child.code} / {child.title}</p>
                  <p className="mt-1 text-sm text-slate-400">More specific match</p>
                </Link>
              ))}
              {!parent && children.length === 0 ? (
                <p className="text-sm text-slate-400">
                  This category does not have a broader or narrower match in the current library yet.
                </p>
              ) : null}
            </div>
          </article>

          <article className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold text-white">Related categories</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Nearby categories often help you find additional opportunities that use slightly different wording.
            </p>
            <div className="mt-5 space-y-3">
              {related.map((item) => (
                <Link
                  key={item.id}
                  href={`/categories/${item.id}`}
                  className="block rounded-[1.25rem] border border-white/10 bg-slate-950/60 p-4 transition hover:border-emerald-400/25 hover:bg-emerald-400/5"
                >
                  <p className="font-semibold text-white">{item.code} / {item.title}</p>
                  <p className="mt-1 text-sm text-slate-400">{item.topLevelCategory}</p>
                </Link>
              ))}
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
