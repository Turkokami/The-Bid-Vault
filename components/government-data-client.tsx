"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type {
  ExtractedContractRecord,
  UploadedSourceDocument,
} from "@/lib/demo-data";
import { addDemoGovUpload, getMergedGovData } from "@/lib/demo-contract-store";

function filterRecords(
  records: ExtractedContractRecord[],
  keywords: string[],
  naics?: string,
  agency?: string,
  state?: string,
) {
  return records.filter((record) => {
    const matchesNaics = naics ? record.naicsCode === naics : true;
    const matchesAgency = agency ? record.agency === agency : true;
    const matchesState = state ? record.state === state : true;
    const blob = [
      record.title,
      record.synopsis,
      record.agency,
      record.location,
      record.opportunityType,
      ...record.keyTerms,
    ]
      .join(" ")
      .toLowerCase();

    const matchesKeywords =
      keywords.length === 0 ||
      keywords.every((keyword) => blob.includes(keyword.toLowerCase()));

    return matchesNaics && matchesAgency && matchesState && matchesKeywords;
  });
}

export function GovernmentDataClient({
  initialDocuments,
  initialRecords,
  initialKeywords,
  initialNaics,
  initialAgency,
  initialState,
}: {
  initialDocuments: UploadedSourceDocument[];
  initialRecords: ExtractedContractRecord[];
  initialKeywords: string[];
  initialNaics?: string;
  initialAgency?: string;
  initialState?: string;
}) {
  const [documents, setDocuments] = useState(initialDocuments);
  const [records, setRecords] = useState(initialRecords);
  const [uploadMessage, setUploadMessage] = useState("");

  useEffect(() => {
    const sync = () => {
      const next = getMergedGovData();
      setDocuments(next.documents);
      setRecords(next.records);
    };
    sync();
    window.addEventListener("bid-vault-gov-data-updated", sync);
    return () => window.removeEventListener("bid-vault-gov-data-updated", sync);
  }, []);

  const results = useMemo(
    () => filterRecords(records, initialKeywords, initialNaics, initialAgency, initialState),
    [initialAgency, initialKeywords, initialNaics, initialState, records],
  );

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_0_30px_rgba(34,197,94,0.08)] backdrop-blur">
          <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">
            Uploaded government contract data
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">
            Search uploaded contract files to identify available opportunities.
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
            Upload a demo government file and watch searchable extracted contract
            records appear immediately in the prototype.
          </p>

          <div className="mt-6 rounded-[1.75rem] border border-emerald-400/20 bg-slate-950/70 p-5">
            <button
              type="button"
              onClick={() => {
                addDemoGovUpload();
                setUploadMessage(
                  "Demo government data uploaded. New extracted opportunities were added to the search results.",
                );
              }}
              className="rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
            >
              Upload government data
            </button>
          </div>
          {uploadMessage ? (
            <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
              <span>{uploadMessage}</span>
              <Link
                href="/government-data"
                className="rounded-full border border-emerald-400/20 px-3 py-1 text-xs font-medium text-emerald-100"
              >
                Refresh filters
              </Link>
            </div>
          ) : null}
        </div>

        <section className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6">
          <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">
            Source files
          </p>
          <div className="mt-5 space-y-4">
            {documents.map((document) => (
              <article
                key={document.id}
                className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4"
              >
                <h2 className="text-base font-semibold text-white">{document.fileName}</h2>
                <p className="mt-1 text-sm text-slate-400">{document.sourceAgency}</p>
              </article>
            ))}
          </div>
        </section>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <form
          action="/government-data"
          className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-200 md:col-span-2">
              <span>Multiple key terms</span>
              <input
                name="keywords"
                defaultValue={initialKeywords.join(", ")}
                className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400/50"
              />
            </label>
            <label className="space-y-2 text-sm text-slate-200">
              <span>NAICS</span>
              <input
                name="naics"
                defaultValue={initialNaics ?? ""}
                className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400/50"
              />
            </label>
            <label className="space-y-2 text-sm text-slate-200">
              <span>Agency</span>
              <input
                name="agency"
                defaultValue={initialAgency ?? ""}
                className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400/50"
              />
            </label>
            <label className="space-y-2 text-sm text-slate-200">
              <span>State</span>
              <input
                name="state"
                defaultValue={initialState ?? ""}
                className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-emerald-400/50"
              />
            </label>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="submit"
              className="rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
            >
              Search uploaded data
            </button>
            <Link
              href="/government-data"
              className="rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/5"
            >
              Reset search
            </Link>
          </div>
        </form>

        <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <p className="text-xs uppercase tracking-[0.35em] text-emerald-300/80">
            Search results
          </p>
          <div className="mt-5 space-y-4">
            {results.map((result) => (
              <article
                key={result.id}
                className="rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-5"
              >
                <h2 className="text-lg font-semibold text-white">{result.title}</h2>
                <p className="mt-1 text-sm text-slate-400">
                  {result.agency} / {result.location} / {result.opportunityType}
                </p>
              </article>
            ))}
          </div>
        </section>
      </section>
    </div>
  );
}
