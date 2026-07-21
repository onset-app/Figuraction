# ONSET — Go-to-Market Strategy for Belgium

**Date:** 2026-07-21
**Basis:** Full codebase analysis of the ONSET repository (source code, `PROGRESS.md` ticket log, `SPRINT-REVIEWS.md` production-readiness reviews, `CLAUDE.md` architecture brief, live page copy) plus targeted market research. Every product claim in this document is traceable to the codebase; market claims cite sources or are explicitly labeled **[ASSUMPTION]**.

---

## Executive Summary

ONSET is a two-sided (B2B2C) casting platform for film/TV extras ("figurants") in Belgium. The codebase reveals a **genuinely complete, security-hardened MVP** — not a prototype: full auth with role routing, figurant profiles with photo upload, project/casting lifecycle management, one-click applications with realtime status updates, bulk candidate review with automated transactional emails, group convocations, carpooling, an SEO-ready public catalog with per-casting indexable pages, and an installable PWA. Six sprints of formal code review (scores 7–8/10, all findings resolved) and a 17-assertion live RLS security suite put this well above typical pre-launch quality.

The strategic picture that emerges from the code:

1. **The product is production-side-led.** The hardest, most differentiated features (bulk review, convocations, RLS-isolated multi-production tenancy, realtime status) all serve the production/régisseur workflow. Competitors in Belgium (becasting.be, figuratie.be, figurants.com) are **listing boards or paid agencies for the talent side** — none of them is a workflow SaaS for the production side. That is the gap.
2. **Supply (figurants) is the cheap side; demand (productions) is the scarce side.** The Belgian production market is small and dense (~tens of active production companies concentrated around Brussels, Liège, and Flanders, fuelled by a ~€200M/year Tax Shelter). GTM must be founder-led B2B sales to régisseurs and production managers, with figurant acquisition driven by each production's own casting calls (the "bring your own network" loop already implicit in the product's public casting pages).
3. **The single biggest go-to-market blocker is in the code, not the market:** the UI is 100% hardcoded French (i18n formally deferred in Sprint 2 review). This locks out Flanders — roughly half of Belgian production volume (VRT alone runs a permanent extras pipeline). Belgium-wide ambition requires NL before scale-up; the recommended path is to win French-speaking Belgium first (Brussels + Wallonia) and treat NL as the Series-A-of-features.
4. **Monetize the production side, keep figurants free forever.** The pricing page already promises "free during launch, prices announced before any billing" — an honest wedge. Phase-2 features already scoped in code (call-sheets, e-signature, advanced search) are exactly the right paid-tier gates.

Realistic 12-month goal: **8–15 paying production companies, 3,000–6,000 registered figurants, €2–5K MRR**, and category ownership of "casting figurants Belgique" in French-language search.

---

# Phase 1 — Product Understanding (from the codebase)

## 1.1 The problem it solves

Stated in `README.md` and verified by the feature set: extras casting in Belgium runs on WhatsApp groups, Facebook posts, lost emails, and hand-copied Excel sheets. Productions lose hours; figurants get no application status visibility; no-shows hurt shoot days. The B2B page copy (`src/app/(public)/pour-les-productions/page.tsx`) frames it precisely: *"Des appels à figurants postés dans dix groupes Facebook… Des heures à recopier des listes dans Excel."*

## 1.2 Target users (three roles, enforced in code)

`src/types/enums.ts` defines exactly three roles — `figurant`, `production`, `admin` — enforced at four layers: proxy route guards (`src/proxy.ts` gates `/app/projets` and `/app/candidats` to production/admin), client `RoleGuard`, Postgres RLS policies (`supabase/migrations/007_rls_policies.sql`, 390 lines), and column-scoped grants (role/email immutable from the client API — a privilege-escalation fix from the Sprint 1 review).

- **Figurants:** profile (photo, city, age 16–120 per `profileSchema`, experience level, bio), browse/filter castings, one-click apply, track status in realtime, carpool.
- **Productions:** projects → castings (role type figurant/acteur/doublure, age range, location, date, spots), publish lifecycle (draft→open→closed→archived with server-validated transitions), candidate review (single + bulk, capped at 200 ids), browse all figurants, group convocations.
- **Admins:** placeholder page only (`/app/admin`) — back-office is genuinely Phase 2.

## 1.3 Current feature set — what is actually shipped

Verified against `PROGRESS.md` (48/53 tickets done) and the file tree:

| Domain | Shipped | Evidence |
|---|---|---|
| Auth | Signup w/ role choice, login, logout, forgot/update password, email confirmation callback (PKCE + token_hash recovery), `?next=` deep-link preservation, open-redirect guard | `src/actions/auth.ts`, `src/app/auth/callback/route.ts`, Sprint 2 review |
| Profiles | Full CRUD, photo upload to Supabase Storage (path derived from session, 6MB action body limit fix), role-aware form | `src/actions/profiles.ts`, `src/components/profil/*` |
| Projects/Castings | CRUD + status transitions server-allow-listed, edit dialogs, casting counts | `src/actions/projects.ts`, `castings.ts`, `PROJECT_STATUS_TRANSITIONS` |
| Applications | Apply (duplicate-safe via UNIQUE constraint, withdraw→re-apply resurrection), my-applications with **Supabase Realtime** status flips, production review single/bulk with optimistic UI | `src/actions/applications.ts`, `useMyApplicationsRealtime` |
| Emails | Welcome, confirmation, rejection, convocation — React Email templates, Resend, chunked fan-out (×5, rate-limit aware), best-effort (failures → Sentry, never break the action) | `src/emails/*`, `src/lib/resend/send.ts` |
| Carpooling | Create/list/filter, mark full + reopen, delete, contact via mailto/tel | `src/actions/carpools.ts` |
| Public/SEO | Landing, B2B page, "devenir figurant" SEO guide with JSON-LD FAQPage, public casting catalog **with per-casting indexable pages + dynamic metadata + canonical**, sitemap (castings included dynamically), robots, OG image generated at build | `src/app/(public)/*`, `src/app/sitemap.ts` |
| PWA | Manifest, Serwist service worker (66 precached URLs), offline page, install banner (app shell only) | `src/sw.ts`, `serwist.config.mjs` |
| Observability | Sentry on every action error branch (feature/step tags), PostHog provider | `sentry.*.config.ts`, `posthog-provider.tsx` |
| Security | RLS on all tables, 17 live assertions replayed by `pnpm db:verify-rls` (in CI), column-scoped grants, service-role usage documented per-case | `src/db/verify-rls.ts`, `007_rls_policies.sql` |

## 1.4 Maturity level

**Late MVP / pre-launch.** The distinguishing signal is process quality: every sprint got a formal review with severity-ranked findings, and *all* were resolved and re-verified (SPRINT-REVIEWS.md). High-severity bugs that would have killed launch — productions could never publish a project (S3), re-signup destroyed pending accounts (S2), `/app/candidats` 404 from primary nav (S4), fabricated testimonials on the landing (S6) — were caught and fixed. This is more launch-ready than its "0.1.0" version number suggests.

**Not yet done (from the pre-launch checklist in PROGRESS.md):** legal notice with real company identity, privacy policy, Vercel env vars (`NEXT_PUBLIC_APP_URL`, `RESEND_FROM`), Resend domain verification (currently only the account owner receives emails), real-device PWA test, Lighthouse pass, Supabase auth redirect allowlist, real testimonials. **Sprint 7 (all tests: Vitest + 3 Playwright e2e specs) is entirely unstarted** — tickets #49–#53 unchecked; the `tests/` directory doesn't exist in the repo.

## 1.5 Missing features (relative to plan and market)

- **No monetization**: no Stripe code anywhere (`package.json` has no stripe dependency); pricing page shows "Lancement 0€" + grayed "Pro — Bientôt".
- **No i18n**: next-intl is in CLAUDE.md's plan but absent from `package.json`; all UI text hardcoded French (deferral formally recorded in Sprint 2 review). **No Dutch = no Flanders.**
- **No contracts/e-signature, no call-sheets, no push notifications, no admin back-office** (all scoped Phase 2; `contracts` table exists in the Drizzle schema but has zero UI/actions).
- **No pagination** on any list (accepted decision, "launch-scale OK" — Sprint 3 review).
- **No advanced candidate search/filters** for productions (`getFigurants()` returns a minimal unfiltered list — Sprint 4 bis).
- **No convocation history** (a production can't see it already convoked — recorded backlog).
- **No in-app messaging** — contact is mailto/tel only (carpools, candidate pages).
- **No availability calendar, no CSV/Excel export** (productions coming from Excel will ask for export almost immediately).

## 1.6 Competitive advantages visible in the code

1. **Production-side workflow depth** — bulk review with optimistic UI, group convocations deduplicated per figurant, status lifecycle enforcement. No Belgian competitor has this (see Phase 2).
2. **Realtime status for figurants** — the #1 talent-side pain (silence after applying) is structurally solved (`supabase_realtime` publication on `applications`).
3. **SEO machine already built** — every open casting is an indexable public page with dynamic metadata, sitemap inclusion, and JSON-LD; the "devenir figurant" guide targets the exact head terms. Competitors' listing pages are technically weak. This is a compounding, zero-cost acquisition asset.
4. **Trust/compliance posture** — RLS verified by live assertions in CI, honest pricing copy, fake testimonials proactively removed for EU consumer-law reasons. For selling to broadcasters (RTBF-tier), this discipline is a sales asset.
5. **Mobile-first PWA** — figurants are a mobile audience; installable app without app-store friction or fees.
6. **Anti-no-show story** — carpooling is uniquely framed on the B2B page as a production benefit ("Moins de no-shows"), a differentiator no listing site can copy structurally.

## 1.7 Weaknesses

- **French-only UI** (biggest market limiter — excludes ~60% of Belgian population and the VRT/Flemish production cluster).
- **Zero automated test coverage** — every regression so far was caught by manual review passes; this doesn't scale past launch.
- **Cold-start dependency**: catalog value = live castings; the seed data masking bugs (a recurring review theme) is a metaphor for the market risk — an empty catalog kills figurant retention.
- **GDPR exposure explicitly accepted in code review** (Sprint 4): *any* production account can read *any* figurant's full profile including email + phone, even non-applicants (`profiles_select_figurants_by_staff`), and the avatars bucket is public-read (unguessable URLs). Both are recorded as "to harden later." For a platform holding photos, ages, and phone numbers of (16+, possibly minor-adjacent) individuals in the EU, this is a pre-revenue liability, and production signup is unverified — anyone can self-declare as a production and harvest contact data.
- **No verification of production accounts** — related to the above; also a spam/fraud vector (fake castings are a known scourge in this market; the "devenir figurant" page even warns against scam agencies).
- **Convocation is fire-and-forget** (no history, no read receipts) — weakens the "replaces WhatsApp" claim for the highest-stakes communication.

## 1.8 Technical limitations affecting growth

- **Role lookup is a DB query per proxied request** (`getUserRole` in `src/proxy.ts`; the JWT-claims optimization is recorded backlog). Fine at launch scale, adds latency + Supabase load as traffic grows.
- **`db:push` drops all RLS policies** (drizzle-kit behavior) — mitigated by the chained `db:rls` script, but schema management is fragile-by-discipline; a mistake in production would be a data-exposure incident, not downtime.
- **Unpaginated lists + unfiltered `getFigurants()`** — the production-side browse dies at a few thousand figurants; this collides with success, not failure.
- **Serverless Postgres client pinned to `max: 1` connection** — correct for now, but heavy dashboard usage by a big production will surface latency.
- **Email deliverability is single-provider (Resend) and currently unverified-domain** — convocations are shoot-critical communications; a bounce is a no-show.
- **Scalability verdict:** the Vercel + Supabase architecture comfortably serves the realistic Belgian ceiling (low tens of thousands of users). Scaling risk is *feature* scaling (pagination, search) not infrastructure.

## 1.9 UX strengths and weaknesses

**Strengths (from review logs):** role-aware forms (productions aren't asked for acting experience), optimistic updates with rollback, empty states with CTAs everywhere, mobile nav on both public site and app (bottom tabs), status badges with icons, French date formatting with TZ-safe handling (a recurring, carefully solved bug class), draft-invisibility hints for productions.

**Weaknesses:** no onboarding sequence after signup (figurants land on a dashboard, nothing pushes profile completion — and an incomplete profile is invisible value to productions); no profile-completeness indicator; no saved notification preferences; no way for figurants to be *notified of new castings* (they must return and check — the single biggest retention gap; email digest or push is Phase 2); convocation lacks confirmation loop ("I'll be there" button).

---

# Phase 2 — Belgian Market Analysis

## 2.1 Market size

- **Production side (the paying side):** Belgium's federal Tax Shelter channels ~€200M/year into audiovisual production and has more than doubled filming volume since introduction ([FPS Finance](https://finance.belgium.be/en/enterprises/corporation-tax/tax-benefits/tax-shelter-audiovisual-production), [Cineuropa](https://cineuropa.org/en/newsdetail/219784), [Lexgo](https://www.lexgo.be/en/news-and-articles/2458-the-tax-shelter-for-audiovisual-productions-in-belgium-a-successful-tool-under-reform)). Up to 42% of Belgian spend is recoverable, which makes Belgium a European co-production hub ([Screen Flanders](https://www.screenflanders.be/en/financing/other-funds-incentives/tax-shelter), [Mbrella Films](https://mbrellafilms.com/incentives/belgium/)). **[ASSUMPTION]** From fund portfolios (Wallimage, screen.brussels, VAF/Screen Flanders slates) I estimate **60–120 organizations** that hire extras with any regularity: feature/TV production companies (Versus, Frakas, Scope, Panache, Caviar, De Mensen, Menuet…), broadcasters (RTBF, VRT, RTL Belgium), ad production houses, and a long tail of corporate/short-form. Serviceable paying market at Belgian SaaS prices: roughly **€150–400K ARR ceiling domestically** — a solid beachhead business, not the end-game (end-game = France/NL expansion or moving up the value chain into call-sheets/contracts/payroll like US comparator [Everyset](https://everyset.com/), which raised $9M and serves Netflix/HBO/Amazon — proof the category supports venture-scale outcomes in bigger markets).
- **Talent side:** **[ASSUMPTION]** based on competitor claims and Facebook group sizes, the active Belgian extras pool is **15,000–40,000 people**, heavily concentrated around Brussels, Liège (Wallonie = big Tax Shelter shooting hub), Ghent, and Antwerp. They churn fast (figuration is episodic income/hobby).

## 2.2 Existing competitors

| Competitor | Model | What they are | What they are not |
|---|---|---|---|
| [becasting.be](https://www.becasting.be/) | Talent-side listing board ("N°1 des castings en Belgique") | Casting ads across figuration/mode/TV, accepts beginners | Not a production workflow tool; no application pipeline management |
| [figurants.com](https://figurants.com/region/belgique/) | French listing site with a Belgium section | Volume of FR/BE casting ads | French-centric; Belgium is a side region; no BE production tooling |
| [figuratie.be](https://figuratie.be/) (In The Picture) | Flemish extras database/agency | Registration → email offers matching profile | Agency-mediated, not self-serve for productions; NL-side only |
| [figuranten-gezocht.be](https://www.figuranten-gezocht.be/) | Flemish listing/email list | Email notifications of opportunities | Same — a mailing list, not a platform |
| [castprod.com](https://castprod.com/) | Free FR/BE casting board since 2003 | Free listings | Dated UX, no pipeline, no BE focus |
| Casting agencies ([NK Casting](https://nkcasting.be/), [Smiling Agency](https://smiling.agency/casting-belgique/), and directors listed on [Sortlist](https://www.sortlist.be/fr/s/casting/belgique-be)) | Human-service agencies | Full-service extras casting, per-day fees | Expensive; productions doing self-casting (the WhatsApp/Excel crowd) are exactly ONSET's target |
| Facebook groups / WhatsApp | Free, incumbent "tool" | Where the market actually lives today | The status quo ONSET's own copy attacks — this is the real competitor |
| VRT figurantendatabank ([vrt.be](https://www.vrt.be/heb-je-een-vraag/s/article/Ik-wil-graag-figureren-in-een-programma-van-VRT)) | Broadcaster-internal | VRT's own pipeline | Closed; shows the NL side already self-organizes |

**Key insight:** every Belgian competitor monetizes or serves the **talent side** (listings, subscriptions, agency fees). **Nobody sells workflow software to the production side.** ONSET's codebase is 60% production-side workflow. The positioning writes itself: *the tool for the régisseur, with the talent pool included.*

## 2.3 Market gaps & unsolved pain points

1. **Application black hole** — talent applies into a void. ONSET's realtime status + automatic rejection emails structurally fix this (and rejection emails, uniquely, are a *supply-side retention feature*: rejected-but-informed figurants stay).
2. **Mass logistics** — confirming 60 extras and convoking them with date/time/address is copy-paste hell. Bulk review + group convocation (shipped) is the killer demo.
3. **Scam/fake casting anxiety** — paid "agencies" prey on aspiring extras (ONSET's own SEO page warns about this). A free, verified platform is a trust wedge.
4. **No-shows** — unaddressed by anyone; ONSET's carpooling + (future) confirmation loop is a unique story.
5. **GDPR-clean talent data** — productions passing Excel sheets of phone numbers around violate GDPR daily. "Your extras database, access-controlled and auditable" is a compliance sales angle Belgian broadcasters' legal teams will appreciate (and the RLS work in the codebase backs it up — once the browse-all-profiles policy is hardened).

## 2.4 Belgian-specific constraints & regulations

- **GDPR** (photos, ages, phones of individuals — some 16–17, since `profileSchema` allows age ≥16): DPO-lite duties, privacy policy (already a tracked launch blocker in PROGRESS.md), data-minimization pressure on the browse-all-figurants policy. Minors on set also implicate Belgian child-labor permit rules — worth a FAQ, not product scope.
- **Figurant remuneration** is a gray zone (volunteer defrayment ~€41.48/day cap vs. paid via SBK/payroll agencies like Amplo/Tentoo; **[ASSUMPTION]** exact 2026 ceilings to verify). ONSET wisely stays out of payment flows for now — the SEO page already presents pay as "variable, précisé dans l'annonce." Phase 3 opportunity, not launch scope.
- **Language law/culture:** Belgium is FR/NL/(DE) with separate media ecosystems, funds (Wallimage/screen.brussels vs VAF), and press. There is no "Belgian market" — there are two. The codebase (FR-only, `locale: fr_BE`, cities cited: Bruxelles/Liège/Namur/Charleroi/Mons/Gand/Anvers) has already implicitly chosen the francophone side first. Make it explicit strategy.
- **eIDAS** for Phase 2 contracts — DocuSeal already scoped in CLAUDE.md; a genuine EU-compliance differentiator vs US tools.

## 2.5 Why Belgium is a good (enough) first market

**For:** dense, small, reachable production community (everyone knows everyone — 10 good customers = market-wide reputation); Tax Shelter keeps volume high and international shoots coming in needing local extras fast; incumbent "competition" is Facebook; founder proximity **[ASSUMPTION: founder is Belgium-based, given fr_BE locale, Belgian cities in copy, and .be market focus]**.
**Against:** small revenue ceiling; two-language complexity; conservative buyers.
**Verdict:** Belgium is the right *beachhead*, wrong *end state*. Win francophone Belgium in 12 months, then choose: NL-Belgium (adjacent, needs i18n) or Northern France (same language, 10× market, Lille/Pas-de-Calais shooting corridor and Wallonia co-productions already overlap).

---

# Phase 3 — Ideal Customer Profiles

## ICP-1 (PRIMARY): The régisseur / production manager at a Belgian fiction producer

- **Industry:** Film & TV production (fiction features, series, Tax Shelter co-productions)
- **Company size:** 5–50 permanent staff, project crews of 30–150
- **Decision maker:** Directeur de production / régisseur général (user = buyer in small structures; at larger ones the line producer signs off)
- **Budget:** Per-production budgets where extras coordination is a line item; €100–300/month is invisible inside a €2M+ production. **[ASSUMPTION]**
- **Pain:** 50–200 extras per shoot, sourced via Facebook posts + email + Excel; convocations by copy-paste WhatsApp; no-shows force over-booking by 20%; GDPR-dubious spreadsheets circulating
- **Existing alternatives:** Facebook groups (free, chaotic), casting agencies (€300–600/day human service — **[ASSUMPTION]**), interns
- **Buying motivation:** hours saved per shoot day, fewer no-shows, defensible data handling
- **Objections:** "Are the figurants I need actually on there?" (cold-start), "Another tool for a 6-week shoot?", "Free Facebook works"
- **Channels:** direct founder outreach (the community is ~200 people), Wallimage/screen.brussels/Cluster TWIST networks, film-office referrals, on-set word of mouth
- **Why #1:** matches the exact shipped feature set (projects→castings→bulk review→convocation); one fiction shoot brings 50–200 figurants onto the platform *for you* — each customer is also an acquisition channel for the supply side.

## ICP-2: Broadcasters & high-volume episodic producers (RTBF, RTL Belgium, studio-based daily/weekly formats)

- **Company size:** 100+; **Decision maker:** casting/audience coordinator + procurement (longer cycle, needs security/GDPR documentation — which the RLS/verify-rls work supports)
- **Budget:** real software budgets; €500+/month plausible for enterprise features (SSO, audit, export)
- **Pain:** *recurring* extras needs (audiences, silhouettes) — the retention dream customer
- **Objections:** procurement, works councils, "we have an internal list" (see VRT's own databank)
- **Channels:** warm intros via ICP-1 productions that shoot for them; industry events
- **Why #2 not #1:** sales cycle 6–12 months; enterprise gaps (SSO, exports, admin console) not built yet. Start conversations early, close later.

## ICP-3: Ad/corporate production houses & film-school productions (supply-side seeding)

- **Company size:** 2–15; **Decision maker:** producer/director (same person)
- **Budget:** near zero — these stay on the free tier
- **Pain:** need 5–30 extras fast, no casting budget at all
- **Motivation:** free + instant; **Objections:** none that matter
- **Channels:** IAD/INSAS/HELB film schools, Kunstenpunt/mediarte job boards, Google (the SEO pages)
- **Role in strategy:** not revenue — **casting-volume flywheel**. They keep the public catalog full so figurants keep coming back. The current 0€ launch plan (already live on the pricing page) is perfectly designed for them; later they stay free-tier with usage caps.

**Figurants are not an ICP** — they are the supply side, acquired via SEO (already built), each production's own casting calls, and carpool/status-tracking word of mouth. They must never pay (this is also the anti-scam positioning).

**Priority: ICP-1 → ICP-3 (in parallel, zero-cost) → ICP-2 (slow-burn).**

---

# Phase 4 — Positioning (francophone Belgium)

**Unique Value Proposition:**
*« Vos figurants confirmés en quelques heures, pas en quelques semaines. »* — the hero line already shipped on `/pour-les-productions` is genuinely good; keep it as the B2B UVP. Figurant-side UVP: *« Postulez en un clic, sachez toujours où en est votre candidature. »* (the realtime status is the provable claim competitors can't make).

**Positioning statement:**
For Belgian production teams that cast their own extras, ONSET is the casting platform that replaces Facebook groups, mailboxes and Excel with one pipeline — publish, sort, confirm and convoke in clicks — unlike listing boards (becasting, figurants.com) that just repost ads, and unlike agencies that charge per day for what your régisseur can now do in an afternoon.

**Elevator pitch (20s):**
"Extras casting in Belgium still runs on WhatsApp and Excel. ONSET gives productions one place to publish castings, receive complete profiles with photos, confirm or reject in bulk — emails go out automatically — and convoke everyone in one action. Figurants finally see their application status in real time instead of silence. Free for figurants, free for productions during launch."

**Key differentiators (each maps to shipped code):** 1) full pipeline, not a listing board (bulk review + auto emails); 2) realtime status for talent (Supabase Realtime); 3) group convocations; 4) built-in carpooling = fewer no-shows; 5) GDPR-first architecture (RLS, EU stack, no data resale); 6) 100% free for figurants (anti-scam stance).

**Messaging pillars:** *Gagnez vos journées* (time saved, production-facing) · *Zéro candidature fantôme* (status transparency, talent-facing) · *Vos données restent en règle* (GDPR, enterprise-facing) · *Tout le monde arrive sur le plateau* (no-shows/carpooling, both-facing).

**Trust signals:** real, consented testimonials (fake ones were correctly stripped in Sprint 6 — get 3 real quotes from beta productions before public launch); logos of first productions; "conforme RGPD — données hébergées dans l'UE"; complete legal notice (currently a launch blocker); later: a public security page describing the RLS model (the verify-rls suite makes this credible).

**Brand personality & tone:** the shipped copy already has it right — *terrain, concret, sans jargon* ("Le casting sauvage vous coûte des journées de production"). Voice of a régisseur who's lived the chaos, not a tech vendor. FR: professional "vous," short sentences, film-set vocabulary (plateau, convocation, feuille de service). Never promise features that aren't live (the codebase's own "Bientôt" section discipline — keep it).

---

# Phase 5 — Pricing Strategy

**Context from code:** pricing page promises free launch + "tarifs annoncés avant toute facturation"; Stripe is Phase 2; Pro-tier gates already publicly listed (call-sheets PDF, e-signature, advanced search). Honor all of it.

**Model: freemium on the production side, per-organization (not per-seat — production teams share logins in practice), monthly with shoot-season flexibility. Figurants: free forever, contractually and loudly.**

| Tier | Price (excl. VAT) | Who | Gates | Rationale |
|---|---|---|---|---|
| **Figurant** | €0 forever | Talent | Everything talent-side | Supply side must be free (anti-scam trust; competitors charging talent is the wedge) |
| **Découverte** (free) | €0 | ICP-3, trials | 1 active project, 2 open castings, 30 confirmed candidates/month, no data export | Keeps the catalog full (flywheel); caps map to real objects in the schema (`projects.status='open'`, castings count — trivially enforceable) |
| **Studio** | €79/month or €790/yr | ICP-1 solo producers, small shoots | Unlimited projects/castings, convocations, CSV export, priority support | Under the "no approval needed" line for a production manager **[ASSUMPTION: Belgian SMB SaaS tolerance €50–150]**; anchored ~25% of one agency casting-day |
| **Production** | €199/month | ICP-1 core, active fiction producers | + call-sheets PDF, e-signature (DocuSeal), advanced figurant search, convocation history, multi-user | Gates = exactly the Phase-2 backlog already promised as "Pro" on the live pricing page; €199 ≈ 1–2 hours of production-manager cost |
| **Broadcast** (enterprise) | from €500/month, annual | ICP-2 | + SSO, audit exports, DPA/GDPR pack, SLA, onboarding | Priced on procurement expectations, not cost; don't build until an RTBF-tier buyer is at the table |

**Sequencing:** stay 100% free until **the catalog has ~10 castings/month live and 3+ productions have completed a full shoot cycle** on the platform (metric-triggered, not date-triggered). Then grandfather beta productions 12 months free on Studio (they're your testimonials) and turn on Stripe for new signups. During free phase, show the future prices on the pricing page ("0€ pendant le lancement, ensuite 79€") — anchors value and pre-qualifies.

**Why not commission-per-booking?** No payment rails exist in the product, figurant pay is a legal gray zone (§2.4), and commission models require payments infrastructure (the Everyset path) — a Series-A move, not a launch move.

---

# Phase 6 — Customer Acquisition Strategy

## Production side (ICP-1/2/3) — founder-led, near-zero budget

| Channel | Play | Est. cost | Expected conversion | Difficulty | Time to results |
|---|---|---|---|---|---|
| **Direct founder outreach** | Build the list of ~150 FR-BE production companies (Wallimage/screen.brussels/CFWB fund slates are public); personal email/LinkedIn to régisseurs: "15-min demo, your next shoot free" | Time only | 30–40% reply, 10–15% → active pilot (small community, relevant pitch) **[ASSUMPTION]** | Medium | 2–6 weeks |
| **Shoot-cycle piggyback** | Every pilot production's casting call is published on ONSET's public pages → offer to co-write the Facebook post pointing at the ONSET casting URL | €0 | Each shoot = 50–300 figurant signups **[ASSUMPTION based on typical extras-call volumes]** | Low | Immediate per shoot |
| **Ecosystem partnerships** | screen.brussels / Wallimage / Cluster TWIST / mediarte / film offices (Brussels, Liège, Wallonie): get listed as a local-resource; offer their portfolio companies extended free tier | €0 | Indirect — credibility + deal flow | Medium | 1–3 months |
| **Film schools (IAD, INSAS, HELB)** | Free forever for student productions; they seed castings + become tomorrow's régisseurs | €0 | High signup, zero revenue (by design) | Low | 1 month |
| **LinkedIn organic** | Founder posts in FR: shoot-logistics war stories, "how we cast 120 extras in 48h" case studies | €0 | Slow compounding; BE film community is present but small | Low | 3–6 months |
| **Local events** | FIFF Namur, BRIFF, Millenium, Mons; mediarte workshops — demo at side events, not booths | €0–500/event | 2–5 qualified conversations/event | Low | Per event |
| **Cold outreach at incoming foreign shoots** | Tax Shelter brings FR/US/NL productions needing local extras fast; film offices know the slate — be the "local extras solution" they recommend | Time | Low volume, high value | High | 3–6 months |

**Paid channels for the production side: don't.** The reachable universe is ~150 companies; LinkedIn Ads/Google Ads CAC would be absurd vs. founder emails. Estimated blended **CAC for a paying production: €200–600 in founder time-equivalent** — against €950–2,400 first-year ACV (Studio/Production tiers), that's a healthy 3–5× ratio.

## Figurant side (supply) — SEO + piggyback, small paid boosts

| Channel | Play | Est. cost | Notes |
|---|---|---|---|
| **SEO (already built)** | The per-casting public pages + sitemap + JSON-LD are live; add 6–10 more FR guides ("casting figurant Bruxelles", "combien gagne un figurant en Belgique", "casting série RTBF", per-city pages). The competitor set is technically weak — top-3 rankings on head terms within 6–9 months is realistic | €0 (writing time) | The compounding channel; every casting page is fresh indexable content |
| **Facebook/Instagram groups** | Don't fight the groups — *use* them: each real casting gets posted (by the production or ONSET) with the ONSET link as the only way to apply | €0 | The application funnel converts group members into accounts |
| **Meta Ads (surgical)** | Only when a big shoot needs fast fill: geo-targeted (city ±30km) "Figurants recherchés pour [production]" → casting page | €100–300/casting; CPL €0.5–2 **[ASSUMPTION]** | Sell this later as a paid "boost" feature to productions |
| **Word of mouth / carpool** | Carpooling is inherently social; status emails carry the brand to every applicant | €0 | Rejection emails with "voir d'autres castings" CTA = retention loop |

**Reddit:** negligible for BE figurants (community lives on Facebook); skip. **Google Ads:** hold until SEO plateau; search volumes on "casting figurant belgique" are low hundreds/month **[ASSUMPTION]** — SEO can own them for free.

---

# Phase 7 — Marketing Roadmap

## Month 1 — Get legally and technically launchable
- **Objectives:** clear the pre-launch checklist (it's already written in PROGRESS.md); recruit 3 design-partner productions.
- **Actions:** legal notice + privacy policy (engage a lawyer or use CFWB/hub.brussels SME legal resources); Vercel env vars + Resend domain verification (without it, **no user receives any email** — hard blocker); Supabase redirect allowlist; Lighthouse + real-device PWA pass; ship Sprint 7 e2e tests; harden the browse-all-figurants RLS policy or add production-account verification (pre-GDPR-complaint, cheap now); founder outreach wave #1 (30 companies).
- **KPIs:** checklist 100%; 3 signed pilot productions; 0 → 1 real casting live.
- **Expected outcome:** private beta running with real shoots.

## Months 2–3 — Private beta, prove the loop
- **Objectives:** 3–5 complete shoot cycles (publish → apply → confirm → convoke → shoot day) on the platform.
- **Actions:** white-glove each pilot (founder does data entry if needed); piggyback each casting into Facebook groups; collect 3 consented testimonials + 1 written case study with numbers ("X hours saved, Y% no-show"); publish 4 SEO guides; start founder LinkedIn cadence (1/week); fix the top-3 friction points pilots hit (expect: CSV export, notification of new castings, convocation confirmation).
- **KPIs:** 5 productions active; 500–1,500 figurants; ≥60% of applications reviewed within 72h (the transparency promise, measurable in `reviewed_at`); testimonial count 3.
- **Expected outcome:** provable case study; testimonials replace the "Pensé pour le terrain" placeholder section (tracked in the checklist).

## Months 4–6 — Public launch (francophone)
- **Objectives:** category visibility in FR-Belgium; 15 active productions; 3,000 figurants.
- **Actions:** public launch (see Phase 8); press push (Cineuropa, Le Soir/L'Echo tech-culture, RTBF Vivacité regional, mediarte newsletter); event presence (BRIFF/FIFF timing); 6 more SEO pages incl. per-city; partnerships formalized (screen.brussels resource listing); begin ICP-2 conversations (RTBF coordinators); ship the retention keystone: **new-casting email alerts for figurants** (the codebase has the email infra; this is the highest-leverage missing feature).
- **KPIs:** 15 productions with ≥1 published casting; 3,000 figurants; 20+ castings/month; organic top-10 for "casting figurant belgique"; email alert open rate >35%.
- **Expected outcome:** the FR-BE default for self-serve extras casting.

## Months 6–12 — Monetize + decide expansion
- **Objectives:** turn on billing; €2–5K MRR; expansion decision (NL-Belgium vs Nord-France).
- **Actions:** Stripe integration + tier gates (Phase 2 ticket exists in CLAUDE.md); build the two paid-gate features with highest willingness-to-pay from beta feedback (bet: call-sheets PDF + advanced search — both already promised on the live pricing page); grandfather betas; ICP-2 pilot with one broadcaster entity; if NL chosen: next-intl retrofit (budget 3–4 weeks — every UI string is hardcoded, Sprint 2 deferral) + NL SEO cluster + VAF/mediarte NL outreach; if France: Lille/Hauts-de-France film commission + the Wallonia co-production corridor.
- **KPIs:** 8–15 paying; MRR €2–5K; free→paid ≥25% of active productions **[ASSUMPTION: high because free-tier caps bite exactly at real-shoot scale]**; logo churn <10%/quarter; 6,000 figurants.

---

# Phase 8 — Launch Strategy

- **Pre-launch (now):** checklist completion; waitlist capture on the pricing page's existing "Être prévenu du lancement" mailto → replace with a proper form (mailto leaks conversions — see Phase 9); seed 10 castings via pilots so launch-day visitors never see an empty catalog (the seed-data-masks-emptiness lesson from the sprint reviews, applied to marketing).
- **Beta (M2–3):** 3–5 productions, white-glove, private. Exit criteria = the Phase 7 M2–3 KPIs, not a date.
- **Early adopters:** "Membre fondateur" deal — 12 months free Studio + logo on the site + roadmap input. Scarce (10 slots), explicit, in writing.
- **Public launch (M4–6):** anchor it to a **flagship shoot story** ("Production X cast 150 figurants for [series] on ONSET in 72h") — not to the product. Press kit in FR with the case-study numbers.
- **Press:** Belgian angle = local-tech-fixes-local-industry + Tax Shelter hook. Targets: Cineuropa (already covers BE production), L'Echo/De Tijd startup pages, Le Soir culture-tech, RTBF/BX1 regional, mediarte + Wallimage newsletters, Cinevox. One exclusive first (L'Echo), then broad.
- **Belgian startup ecosystem:** hub.brussels, Startups.be/Scale-ups.eu events, BeTech community, Digital Wallonia — useful for credibility and hires, **not** for customers (régisseurs don't attend startup events). Prioritize *film* ecosystem over *tech* ecosystem 4:1.
- **Product Hunt:** skip at launch — the buyer isn't there and a FR-language BE-local B2B tool will flop by design; reconsider only if/when the product goes multi-country in EN.
- **Referral program:** production→production referral = 2 months free on both sides (the community is tight; formalize what will happen anyway). Figurant-side referral is unnecessary — the casting calls themselves are the referral engine — and paying for supply-side referrals attracts fake profiles.
- **Influencers:** micro, not macro — 3–5 BE "vie de figurant" TikTok/Instagram creators **[ASSUMPTION: they exist at 5–50K followers; verify]** doing "how I find castings" content, paid in early access + small fees; plus one respected régisseur as public design partner (their endorsement moves the B2B market more than any ad).
- **Partnerships (launch-phase):** film offices (Brussels, Liège, Wallonie clusters) for the incoming-shoots referral; mediarte for training-content co-marketing; SBK/payroll agencies (Amplo) later — they touch every legally-paid figurant and could become a distribution *and* Phase-3 product partner.

---

# Phase 9 — Product Improvements (Impact × Effort)

## Build first (high impact / low–medium effort)
1. **New-casting alerts for figurants** (email digest by city/age match) — the retention keystone; infra exists (Resend, schemas have city/age); without it figurants visit once and forget. *Impact 5/5, Effort M.*
2. **Sprint 7 tests (#49–#53)** — three Playwright specs are already scoped with regression scenarios from every fixed bug; you are one refactor away from re-breaking "productions can't publish." *Impact 4/5 (velocity insurance), Effort M.*
3. **Waitlist/contact form replacing `mailto:contact@onset.app`** (appears on B2B hero, pricing, footer) — mailto loses every mobile visitor without a mail client and captures zero analytics. *Impact 3/5, Effort S.*
4. **Convocation "Je serai présent" confirmation + convocation history** — closes the no-show loop, makes the flagship feature auditable (history is already recorded backlog). *Impact 4/5, Effort M.*
5. **CSV export of confirmed candidates** — productions live in Excel; meet them halfway; also the natural free/paid gate. *Impact 4/5, Effort S.*
6. **Production account verification (manual approve at signup) + restrict `profiles_select_figurants_by_staff` to productions with ≥1 published casting or to applicants only** — closes the recorded GDPR exposure and the fake-casting vector in one move. *Impact 4/5 (risk kill), Effort S–M.*
7. **Profile-completeness meter + post-signup onboarding checklist for figurants** — incomplete profiles are worthless to productions; currently nothing pushes completion. *Impact 3/5, Effort S.*

## Postpone (high effort or premature)
- **i18n/NL** — 3–4 weeks of string extraction; do it only on the explicit Flanders go-decision (M6+). Doing it "for launch" would delay revenue learning by a month for a market you can't yet serve with sales attention.
- **Stripe billing** — until the metric trigger (Phase 5); building billing before willingness-to-pay signal is classic waste.
- **Push notifications** — email alerts first (simpler, measurable); push is a Phase-2 multiplier once alert content is proven.
- **Contracts/e-signature, call-sheets** — build as *paid-tier launch* features (M6–9), with a design partner committed to paying.
- **Admin back-office** — founder can use Supabase Studio for months; build when support volume demands it.
- **Pagination + advanced search** — the recorded "launch-scale OK" decision is correct; schedule when figurants >2,000.

## Remove / de-scope
- **Nothing significant.** The codebase is unusually free of speculative features (blog scaffold already deleted in Sprint 6). Keep the discipline. Candidate for demotion if data disagrees: role types `acteur`/`doublure` in `roleTypes` — if 95% of castings are `figurant`, hiding the selector simplifies the form (measure via PostHog first).

## Technical debt to address
- Resend domain verification (M1, blocking — no emails otherwise); role in JWT claims (recorded backlog — do when traffic makes the per-request role query visible in latency); the `db:push`-drops-RLS footgun (mitigated by script, but move to migration-based flow (`drizzle-kit generate`) before there is production data you can't re-provision); second email provider fallback for convocations (shoot-critical) — later.

## Revenue & retention opportunities beyond tiers
- **Casting "boost"** (the Meta-ads-as-a-service play, Phase 6) — per-casting €50–150 one-off, no subscription needed: monetizes ICP-3 without breaking free tier.
- **Rejection-email cross-sell** ("3 autres castings près de chez vous") — turns the highest-volume email (rejections) into the retention channel. Infra fully exists.

---

# Phase 10 — Risks & Mitigations

| Risk | Severity | Evidence / Mitigation |
|---|---|---|
| **Cold-start: empty catalog kills figurant retention** | High | The product's own reviews showed seed data masking emptiness. Mitigate: never market to figurants ahead of castings; pilots-first sequencing (Phase 7); per-shoot piggyback posts. |
| **GDPR incident or complaint** (open profile access, public avatar bucket, minors 16+) | High | Both exposures are *recorded in the sprint reviews as accepted-for-later* — make them "now": production verification + policy hardening (Phase 9 #6), privacy policy (checklist), DPA template for ICP-2. Cost is days; a CPD/APD complaint would be existential. |
| **Zero automated tests while iterating post-launch** | Medium-High | Every past regression was caught by manual review passes that won't happen weekly post-launch. Ship Sprint 7 in M1. |
| **Email deliverability failure at a shoot-critical moment** | Medium-High | `RESEND_FROM` currently unset ⇒ silent no-send (loud only in Sentry). Verify domain M1; add delivery-status surfacing to convocation UI; consider SMS fallback for convocations later (BE SMS is cheap, shoot-critical justifies it). |
| **Facebook inertia: productions post to groups anyway** | Medium | Don't fight it — the piggyback play makes Facebook the top of ONSET's funnel. The wedge is what Facebook can't do: pipeline, bulk emails, GDPR. |
| **A competitor (becasting, figurants.com) adds production tooling** | Medium | Their business model (charging/serving talent) conflicts with free-supply positioning; ONSET's moat = production workflow depth + BE-local trust + SEO pages per casting. Speed is the real defense: own the ~150 FR-BE production relationships before anyone reacts. |
| **Two-language trap: NL competitor consolidates Flanders first** (figuratie.be/In The Picture is already NL-native) | Medium | Accept the FR-first bet explicitly; keep NL retrofit scoped (3–4 wks) and trigger it on evidence (inbound NL demand, VAF conversations) rather than fear. |
| **Régisseurs are freelance & seasonal → subscription churn between shoots** | Medium | Price per organization (production company), not per shoot; annual discount; "pause mode" instead of cancel; usage-based Boost as churn-proof revenue. |
| **Legal gray zone of figurant pay drifts onto the platform** (users treat ONSET as employer/intermediary) | Low-Medium | Stay out of money flows; T&Cs state ONSET is a connection tool; FAQ points to SBK/payroll partners (also a partnership channel). |
| **Solo-founder bus factor & support load** **[ASSUMPTION: solo, given single-committer git history style]** | Medium | White-glove only during beta; ship self-serve onboarding before public launch; admin tooling deferred but document runbooks. |

---

# Phase 11 — Action Plan (ROI-ordered)

| # | Task | Priority | Impact | Effort | Depends on | Success metric | Deliverable |
|---|---|---|---|---|---|---|---|
| 1 | Clear pre-launch checklist: Resend domain + `RESEND_FROM`, `NEXT_PUBLIC_APP_URL`, auth allowlist, legal notice, privacy policy | P0 | Unblocks everything | S (days + lawyer) | — | Checklist 100%; real email delivered to non-owner address | Live compliant site |
| 2 | GDPR hardening: production verification + tighten `profiles_select_figurants_by_staff`; revisit public avatar bucket | P0 | Kills top legal risk | S–M | — | verify-rls assertions extended; unverified production sees no contact data | Migration + policy + signup flow |
| 3 | Founder outreach wave (30 FR-BE production companies) → 3 design partners | P0 | Revenue path starts | M (2 wks) | 1 | 3 pilots committed, 1 casting live | Pilot agreements, target-list CRM |
| 4 | Replace mailto CTAs with tracked contact/waitlist form | P1 | Funnel capture | S | — | 100% of B2B interest captured w/ source | Form + PostHog events |
| 5 | Sprint 7: Vitest + 3 Playwright e2e specs (#49–#53) | P1 | Velocity insurance | M (1–2 wks) | — | CI green incl. e2e; regression scenarios from reviews encoded | `tests/` suite in CI |
| 6 | Figurant new-casting email alerts (city/age match) | P1 | #1 retention lever | M (1–2 wks) | 1 | ≥35% open rate; W4 figurant retention +50% vs. baseline | Alert job + preference toggle |
| 7 | Beta shoot cycles ×3–5 with piggyback Facebook posts per casting | P1 | Proof + supply flywheel | M (continuous M2–3) | 3 | 5 completed cycles; 1,000 figurants; 3 consented testimonials | Case study w/ hours-saved numbers |
| 8 | SEO expansion: 6–10 FR guides + per-city pages on the existing stack | P1 | Compounding free acquisition | M (writing) | 1 | Top-10 "casting figurant belgique" by M6; 500 organic visits/mo | Published pages, GSC tracking |
| 9 | CSV export + convocation confirmation & history | P2 | Beta-retention + paid-gate prep | M | 3 (feedback) | Used by ≥3 pilots; no-show rate measured | Features shipped |
| 10 | Public launch: testimonials on landing, press kit, flagship case story, film-ecosystem partnerships | P2 | Category visibility | M (M4–6) | 7 | 15 active productions; 20 castings/mo; 2 press pieces | Launch campaign |
| 11 | Stripe + tier gates (Studio €79 / Production €199), grandfather betas | P2 | Revenue | M–L (2–3 wks) | 7, 9, metric trigger | €2K MRR by M9; ≥25% free→paid among active productions | Billing live |
| 12 | Paid-tier features: call-sheets PDF, advanced search (already promised on pricing page) | P3 | Expansion revenue | L | 11 + design partner | ≥50% of paying on Production tier | Phase-2 features |
| 13 | Expansion decision: NL retrofit (next-intl, 3–4 wks) vs. Nord-France | P3 | Next market | L | 11 + 12-month data | Decision memo with pipeline evidence | i18n build or FR-FR GTM plan |

**Decision points:** after #7 (M3): if <3 productions complete a cycle or figurant show-up quality is poor, pivot positioning toward ICP-2 recurring-format casting before spending on public launch. After #11 (M9): if free→paid <10%, revisit monetization (Boost-only model) before expansion.

---

## Final assessment

The codebase tells a rare story: the product is *more* ready than the business around it. The engineering discipline (RLS assertion suite, honest copy, review culture) is itself a marketable asset for a GDPR-sensitive, trust-poor market. The three moves that matter most in the next 90 days are not features: **(1)** clear the legal/email launch blockers already listed in PROGRESS.md, **(2)** close the recorded GDPR exposure before real figurant data accumulates, and **(3)** get three real productions through a full shoot cycle and turn their numbers into the launch story. Everything else — pricing tiers, Flanders, France, call-sheets — is downstream of those three.

**Sources:** [FPS Finance — Tax Shelter](https://finance.belgium.be/en/enterprises/corporation-tax/tax-benefits/tax-shelter-audiovisual-production) · [Cineuropa — Belgian tax shelter](https://cineuropa.org/en/newsdetail/219784) · [Lexgo — Tax Shelter reform](https://www.lexgo.be/en/news-and-articles/2458-the-tax-shelter-for-audiovisual-productions-in-belgium-a-successful-tool-under-reform) · [Screen Flanders — Tax Shelter](https://www.screenflanders.be/en/financing/other-funds-incentives/tax-shelter) · [Mbrella Films — Belgium incentives](https://mbrellafilms.com/incentives/belgium/) · [becasting.be](https://www.becasting.be/) · [figurants.com — Belgique](https://figurants.com/region/belgique/) · [castprod.com](https://castprod.com/) · [figuratie.be](https://figuratie.be/) · [figuranten-gezocht.be](https://www.figuranten-gezocht.be/) · [NK Casting](https://nkcasting.be/) · [Smiling Agency](https://smiling.agency/casting-belgique/) · [Sortlist — casting agencies BE](https://www.sortlist.be/fr/s/casting/belgique-be) · [VRT figuratie](https://www.vrt.be/heb-je-een-vraag/s/article/Ik-wil-graag-figureren-in-een-programma-van-VRT) · [Everyset](https://everyset.com/) · [Hollywood Reporter — Everyset](https://www.hollywoodreporter.com/business/business-news/extras-work-jobs-everyset-data-payroll-1236393829/)
