# The Bid Vault — App Overview & Review Handoff

You are reviewing **The Bid Vault**, a government contract research tool built for small-to-mid-sized contractors. Your job is to read the codebase, understand what the app does, and recommend improvements across UX, performance, architecture, code quality, and completeness. This document gives you the full map so you don't have to guess.

---

## What the app does

The Bid Vault helps contractors find, track, and bid on government contracts. Core workflows:

1. **Search SAM.gov** — live federal opportunity search via the SAM.gov API (`SAM_GOV_API_KEY` env var required; falls back to an empty state if unconfigured)
2. **State & Local** — scrapes 6 live state procurement portals (WA, TX, GA, FL, OR, PA) plus pulls scraped records from a Neon PostgreSQL DB for CA, NY, WA, CO
3. **Contract tracker** — save, stage, and track contracts through a pipeline (Watch → Bid → Won etc.)
4. **Bid Builder** — AI-assisted bid workspace that calls Claude via `ANTHROPIC_API_KEY`
5. **FOIA request builder** — drafts FOIA letters from contract context
6. **Opportunity alerts** — email subscription to new matching opportunities
7. **Dashboard** — overview of tenant workspaces, contract pipeline, and stats
8. **Pricing / auth** — sign-up/sign-in, pricing page (Stripe not yet wired)

The app runs on **Vercel Hobby** (10-second serverless function timeout — this is the single biggest architectural constraint). Auth, workspace, and contract data live in **Neon PostgreSQL** accessed via **Prisma 7**. When the DB is unreachable the app falls back to in-memory demo data so pages still render.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.1 (App Router, RSC) |
| React | 19.2.4 |
| Database | Neon PostgreSQL via Prisma 7 |
| Styling | Tailwind CSS |
| Auth | Custom (Prisma User + session cookie) |
| AI | Anthropic Claude API (bid builder) |
| Hosting | Vercel Hobby |
| External APIs | SAM.gov Opportunities v2 API |

---

## File map — where everything lives

### App routes (`src/app/`)

| Route | File | What it does |
|---|---|---|
| `/` | `page.tsx` | Landing / hero page |
| `/sam-search` | `sam-search/page.tsx` | Live SAM federal opportunity search with filters |
| `/sam-search/[...id]` | `sam-search/[...id]/page.tsx` | Alias that delegates to government-data detail page |
| `/government-data/[id]` | `government-data/[id]/page.tsx` | **Main SAM detail page** — parallelizes SAM lookup + DB fetch |
| `/state-local` | `state-local/page.tsx` | State & local opportunity hub |
| `/state-local/[location]` | `state-local/[location]/page.tsx` | Location-filtered state/local view |
| `/state-local/[source]/[id]` | `state-local/[source]/[id]/page.tsx` | State/local opportunity detail |
| `/state-local/washington` | `state-local/washington/page.tsx` | WA WEBS-specific page |
| `/dashboard` | `dashboard/page.tsx` | Contract pipeline dashboard |
| `/contracts` | `contracts/page.tsx` | Saved contract list |
| `/contracts/[id]` | `contracts/[id]/page.tsx` | Contract detail + planning |
| `/contracts/new` | `contracts/new/page.tsx` | Add new contract manually |
| `/bid-builder` | `bid-builder/page.tsx` | AI bid workspace |
| `/bid-builder/print` | `bid-builder/print/page.tsx` | Printable bid output |
| `/attachments/review` | `attachments/review/page.tsx` | Attachment/document reviewer |
| `/foia` | `foia/page.tsx` | FOIA request builder |
| `/alerts` | `alerts/page.tsx` | Email alert subscriptions |
| `/tracking` | `tracking/page.tsx` | Contract tracking tabs |
| `/watchlist` | `watchlist/page.tsx` | Saved for later |
| `/planning` | `planning/page.tsx` | Bid planning calendar |
| `/categories` | `categories/page.tsx` | NAICS/NIGP category browser |
| `/categories/[id]` | `categories/[id]/page.tsx` | Category detail |
| `/categories/search` | `categories/search/page.tsx` | Category search |
| `/my-codes` | `my-codes/page.tsx` | Saved category codes |
| `/bids` | `bids/page.tsx` | Past winning bids research |
| `/bids/[id]/download` | `bids/[id]/download/route.ts` | Bid download route |
| `/research` | `research/page.tsx` | Research tools |
| `/calendar` | `calendar/page.tsx` | Deadline calendar |
| `/sync-center` | `sync-center/page.tsx` | Data source sync status |
| `/tenants/[slug]` | `tenants/[slug]/page.tsx` | Tenant workspace page |
| `/workspaces/new` | `workspaces/new/page.tsx` | Create workspace |
| `/pricing` | `pricing/page.tsx` | Pricing (Stripe not wired) |
| `/sign-in`, `/sign-up` | auth pages | Authentication |
| `/forgot-password`, `/reset-password` | auth pages | Password reset |
| `/menu` | `menu/page.tsx` | Mobile nav menu |
| `/learn` | `learn/page.tsx` | Learning resources |

### API routes (`src/app/api/`)

| Route | Purpose |
|---|---|
| `/api/bid-ai/generate` | Claude API call for bid builder |
| `/api/sam-search/snapshot` | Cached SAM search results endpoint |
| `/api/state-local/snapshot` | Cached state/local results endpoint |
| `/api/state-local/saves` | Save/unsave state/local opportunities |
| `/api/alerts/send` | Trigger alert email send |
| `/api/alerts/subscriptions` | Manage alert subscriptions |
| `/api/alerts/unsubscribe` | Unsubscribe from alerts |
| `/api/account/my-codes` | Saved NAICS code management |

### Core library (`src/lib/`)

| File/folder | What it does |
|---|---|
| `server/sam-search.ts` | **All SAM API logic** — `fetchSamRecords`, `getSamSearchSnapshot`, `getSamOpportunityById`, in-memory 15-min cache, dedup, filter, sort |
| `server/contracts.ts` | DB reads/writes for contracts, dashboard, tenants — falls back to demo data |
| `server/workspace.ts` | `getViewerContext()` — resolves current user, tenant, mode (database vs demo) |
| `server/auth.ts` | Session validation, password hashing |
| `server/planning.ts` | Bid planning calendar server actions |
| `server/alert-email.ts` | Resend-based email for alerts |
| `server/my-codes.ts` | NAICS code save/load |
| `sources/sync-state-local.ts` | **Orchestrates all 6 live portal fetches** with `Promise.allSettled` + 5s timeout each |
| `sources/webs-live.ts` | WA WEBS scraper |
| `sources/texas-live.ts` | Texas ESBD scraper |
| `sources/georgia-live.ts` | Georgia GPR scraper |
| `sources/florida-live.ts` | Florida VBS scraper |
| `sources/oregon-live.ts` | Oregon ORPIN scraper |
| `sources/pennsylvania-live.ts` | Pennsylvania eMarketplace scraper |
| `sources/source-runtime.ts` | `samLiveConfigured()`, `getSamApiKey()` — env var checks |
| `sources/normalizers.ts` | Normalize scraped records to shared type |
| `sources/state-registry.ts` | Registry of all state data sources |
| `sources/types.ts` | Shared types for state/local records |
| `demo-data.ts` | In-memory demo contracts, tenants, bids used when DB is offline |
| `db.ts` | Prisma client singleton |
| `format.ts` | Date/currency formatting helpers |
| `contracts-search.ts` | Client-side contract filtering |
| `state-local-search.ts` | Client-side state/local filtering |
| `category-codes.ts` | NAICS/PSC code lookup |

### Components (`src/components/`)

| File | What it does |
|---|---|
| `app-shell.tsx` | Root layout shell — nav, sidebar, mobile nav |
| `government-data-client.tsx` | SAM search results list + card rendering |
| `state-local-client.tsx` | State/local results list + filters |
| `state-local-detail-client.tsx` | State/local detail page client |
| `bid-builder-client.tsx` | AI bid workspace (calls `/api/bid-ai/generate`) |
| `dashboard-client.tsx` | Dashboard charts and stats |
| `contracts-client.tsx` | Contract list with search/filter |
| `filter-sidebar.tsx` | Reusable filter sidebar component |
| `contract-detail-layout.tsx` | Sticky section nav for detail pages |
| `us-state-tile-map.tsx` | Interactive US map for state picker |
| `foia-request-builder.tsx` | FOIA letter generation UI |
| `attachment-review-client.tsx` | Document/attachment review panel |
| `demo-reset-button.tsx` | Resets demo data (dev only — should be removed from production) |
| `workspace-switcher.tsx` | Switch between tenant workspaces |
| `mobile-nav.tsx` | Bottom mobile navigation |

### Error boundaries

Every major route segment has an `error.tsx` file that catches RSC crashes and shows a retry UI:
- `src/app/error.tsx` — root fallback
- `src/app/government-data/error.tsx`
- `src/app/sam-search/error.tsx`
- `src/app/state-local/error.tsx`
- `src/app/state-local/[location]/error.tsx`
- `src/app/state-local/[source]/[id]/error.tsx`
- `src/app/state-local/washington/error.tsx`
- `src/app/dashboard/error.tsx`
- `src/app/contracts/error.tsx`

---

## Key architectural patterns

### Vercel 10-second timeout mitigation
- All live portal fetches run in parallel via `Promise.allSettled` (never sequential)
- Every `fetch()` call has `AbortSignal.timeout(7000)` to cancel hung connections
- SAM API has an in-memory 15-minute cache (`samSnapshotCache`) to avoid repeat fetches
- `force-dynamic` is set on all data-heavy pages

### Demo/database duality
- `getViewerContext()` returns `mode: "database"` when the user is signed in with a Prisma workspace, or `mode: "demo"` otherwise
- Every server function has a try/catch that falls back to `demoContracts` / `demoTenants` if Neon throws (cold starts, unreachable)
- Demo data lives entirely in `src/lib/demo-data.ts`

### SAM detail page pattern (`government-data/[id]/page.tsx`)
- Takes `noticeId` from query params OR falls back to the URL slug as the lookup ID
- Runs `getSamOpportunityById` and `getContractsIndex` in parallel
- If SAM returns nothing AND no title in query params → shows a "record not found" panel
- If title IS in query params → builds a `fallbackRecord` from URL params and renders the full detail layout

---

## Known issues / incomplete areas

1. **Stripe not wired** — `/pricing` has a signup form (`PricingSignupForm`) that posts to nothing
2. **Demo Reset button** — `DemoResetButton` component appears in the UI; should be removed before going fully public
3. **ANTHROPIC_API_KEY not set in Vercel** — Bid Builder AI calls will fail until this env var is added in the Vercel dashboard
4. **SAM detail pages** — some specific noticeIds return 500 (being debugged; a `<Link>` with an absolute URL in the "not found" branch was a likely cause, fixed in latest commit)
5. **Nevada scraper** — `nevada-live.ts` and `nevada-browser-connector.ts` exist but Nevada isn't in the main `sync-state-local.ts` orchestrator
6. **Alert email sending** — wired to Resend but `RESEND_API_KEY` must be set in Vercel env
7. **`/bids` page** — shows past winning bids research but data is mostly demo

---

## Where to focus your review

Start with these files in order — they cover ~80% of the app's critical paths:

```
1.  src/app/government-data/[id]/page.tsx       ← SAM detail (recently fixed)
2.  src/lib/server/sam-search.ts                ← All SAM API logic + cache
3.  src/lib/sources/sync-state-local.ts         ← State/local parallel fetcher
4.  src/lib/server/contracts.ts                 ← DB reads, demo fallback
5.  src/lib/server/workspace.ts                 ← Auth/viewer context
6.  src/components/app-shell.tsx                ← Root layout
7.  src/components/government-data-client.tsx   ← SAM search results UI
8.  src/components/state-local-client.tsx       ← State/local UI
9.  src/components/bid-builder-client.tsx       ← AI bid workspace
10. src/app/dashboard/page.tsx                  ← Dashboard
11. src/app/sam-search/page.tsx                 ← SAM search page
12. src/app/state-local/page.tsx                ← State/local hub
13. src/app/layout.tsx                          ← Root layout + AppShell
14. src/app/pricing/page.tsx                    ← Pricing (incomplete)
15. src/app/api/bid-ai/generate/route.ts        ← Claude API route
```

---

## Questions worth answering in your review

- Are there any RSC-level throws that escape try/catch and reach the error boundary unnecessarily?
- Is there anything that runs sequentially that should be parallelized?
- Are there UI states that should exist but don't (loading skeletons, empty states, permission-gated content)?
- Is the demo/database duality clean, or do live state leaks happen (e.g., demo data showing for signed-in users)?
- What pages feel incomplete or placeholder-only?
- Any security concerns in the auth flow, API routes, or SAM API key handling?
- What would make the biggest UX difference for a contractor actually using this daily?
