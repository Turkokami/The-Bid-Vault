"use client";

import { useMemo, useState } from "react";
import { buttonStyles } from "@/components/ui/button";
import { industryRecommendations } from "@/lib/demo-data";

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export function IndustryCodeRecommender() {
  const [industryInput, setIndustryInput] = useState("");

  const recommendations = useMemo(() => {
    const query = normalize(industryInput);

    if (!query) {
      return industryRecommendations.slice(0, 3);
    }

    const scored = industryRecommendations
      .map((recommendation) => {
        const haystack = [
          recommendation.industry,
          recommendation.category,
          recommendation.summary,
          ...recommendation.codes.map((code) => `${code.naicsCode} ${code.title} ${code.fitReason}`),
        ]
          .join(" ")
          .toLowerCase();

        const score = query
          .split(/\s+/)
          .filter(Boolean)
          .reduce((total, term) => total + (haystack.includes(term) ? 1 : 0), 0);

        return { recommendation, score };
      })
      .filter((item) => item.score > 0)
      .sort((left, right) => right.score - left.score);

    return scored.length > 0
      ? scored.map((item) => item.recommendation)
      : industryRecommendations.slice(0, 3);
  }, [industryInput]);

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_0_30px_rgba(34,197,94,0.08)] backdrop-blur">
      <div className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">
          Industry code recommendations
        </p>
        <h2 className="mt-4 text-4xl font-semibold tracking-tight text-white">
          Enter an industry and get recommended codes that fit your work.
        </h2>
        <p className="mt-4 text-sm leading-7 text-slate-300">
          This gives contractors a starting point for relevant NAICS categories by
          mapping industry language to likely-fit codes and service categories.
        </p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
        <div className="rounded-[1.75rem] border border-emerald-400/20 bg-slate-950/70 p-5">
          <label className="space-y-2 text-sm text-slate-200">
            <span>Industry or service type</span>
            <input
              value={industryInput}
              onChange={(event) => setIndustryInput(event.target.value)}
              placeholder="Try: facilities maintenance, logistics, landscaping"
              className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-emerald-400/50"
            />
          </label>

          <div className="mt-5 space-y-3 text-sm text-slate-300">
            <p className="text-slate-400">Suggested inputs</p>
            {[
              "Facilities maintenance",
              "Construction and public works",
              "Logistics and warehousing",
              "Landscaping and grounds",
              "Security services",
            ].map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => setIndustryInput(suggestion)}
                className={buttonStyles({
                  variant: "ghost",
                  size: "md",
                  className: "flex w-full justify-start rounded-2xl px-4 py-3 text-left",
                })}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {recommendations.map((recommendation) => (
            <article
              key={recommendation.id}
              className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-5"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    {recommendation.industry}
                  </h3>
                  <p className="mt-1 text-sm text-emerald-300">
                    {recommendation.category}
                  </p>
                </div>
                <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-emerald-200">
                  Recommended fit
                </span>
              </div>

              <p className="mt-4 text-sm leading-7 text-slate-300">
                {recommendation.summary}
              </p>

              <div className="mt-5 grid gap-3">
                {recommendation.codes.map((code) => (
                  <div
                    key={code.naicsCode}
                    className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-emerald-300">
                          {code.naicsCode}
                        </p>
                        <p className="mt-1 text-sm text-white">{code.title}</p>
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-300">
                      {code.fitReason}
                    </p>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
