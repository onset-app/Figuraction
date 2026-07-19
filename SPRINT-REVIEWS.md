# Sprint Reviews — ONSET

Production-readiness code reviews of Sprints 1–6, with the resolution status of every
finding. Each sprint was reviewed, then all recommended improvements were implemented
and verified in the same pass (see the matching "Revue Sprint N" notes in PROGRESS.md
for the French implementation logs). Scores are as assessed **at review time, before
the fixes**.

Verification baseline used by every fix pass: `pnpm check` (Biome), `tsc --noEmit`,
`pnpm build`, plus live checks against the dev Supabase project where relevant
(`pnpm db:verify-rls`, live RLS sessions, realtime subscription, HTTP smoke tests).

---

## Sprint 1 — Database (tickets #11–#18) — score 7/10

Scope: Zod schemas, Drizzle schemas + inferred types, RLS policies, seed data.

| Priority | Finding | Resolution |
|---|---|---|
| HIGH | **Privilege escalation**: RLS checks rows, not columns — any user could `PATCH` their own `profiles.role` to `admin` (or self-insert a profile with any role via the raw API), unlocking every `*_admin_all` policy | Fixed: column-scoped `UPDATE` grant on `profiles` (role/email immutable from the client API), `INSERT` grant + policy removed (signup is service-role). Live-verified denied |
| HIGH | **RLS not reproducibly applied**: tables via `drizzle-kit push`, policies only in a manual SQL file — and `db:push` was later proven to **DROP all policies** | Fixed: `db:rls` script (applies 007 + fails unless RLS enabled with policies everywhere), `db:provision` chain, `db:verify-rls` regression suite (17 live assertions via real anon-key sessions) |
| MED | `applications` update policies let a figurant move an application to another casting and a production reassign/fabricate applicants | Fixed: column-scoped grants (`casting_id`/`figurant_id` immutable post-insert), status pinned in `USING`/`WITH CHECK` |
| MED | Enum values triplicated (types / Zod / DB checks) with no single source | Fixed: `as const` arrays in `types/enums.ts` drive Zod, Drizzle column unions, and CHECK constraints (`inEnum` helper) |
| MED | `postgres` client default pool (10) unfit for serverless behind a pooler | Fixed: `max: 1, idle_timeout: 20` |
| MED | No indexes on FK columns used by RLS helpers and list queries | Fixed: 8 indexes added |
| LOW | Age-range refine skipped on legitimate `0`; blank `seatsAvailable` silently coerced to `0`; seed wipe missed `contracts`; nullable `contact_method`/booleans; no `updated_at` trigger | All fixed (`requiredNumber` helper, `moddatetime` triggers on 4 tables, `NOT NULL`s with backfill) |

Verdict then: schema content production-grade, **not shippable** until RLS provisioning
automated. Post-fix: 17/17 RLS assertions pass.

---

## Sprint 2 — Auth (tickets #19–#26) — score 8/10

Scope: signup/login/logout/reset actions, `/auth/callback`, proxy + role routing,
auth pages, `useCurrentUser`, app shell, dashboard.

| Priority | Finding | Resolution |
|---|---|---|
| HIGH | **Re-signup before email confirmation destroyed the pending account**: duplicate profile insert triggered the "rollback" `deleteUser` on the *original* auth user, dead-linking the re-sent confirmation email | Fixed: `isUniqueViolation` (walks `cause` chain for PG 23505) → "compte existe déjà, vérifiez votre boîte mail" without deleting; rollback kept for other failures, now best-effort + Sentry |
| MED | `result.success` read on redirecting server actions (framework-internals assumption) | Fixed: `result?.success` guards in login + update-password |
| MED | Admin nav linked to `/app/admin` with **no page** (404 from primary nav); empty scaffold dirs | Fixed: placeholder page; `admin/*` + `contrats` empty dirs removed |
| MED | Login lost the intended destination (no `?next=`) | Fixed: proxy appends `?next=`, `login(input, next)` validates via shared `safeAppPath` (open-redirect-safe), login page reads it under `Suspense` |
| LOW | Unguarded rollback `deleteUser`; bare `/app` 404; `NEXT_PUBLIC_APP_URL` → `"undefined/..."` links; anonymous `/update-password` UX; per-consumer auth listeners; ui-store dead code; unrecorded i18n deferral | All fixed (`getAppUrl()` fail-loud helper, `/app` → dashboard redirect, upfront session check + `(auth)` layout reuse, single `AuthInvalidationListener` in QueryProvider, i18n deferral recorded) |

Notes: enumeration protection, cookie carryover, and open-redirect guarding were
already correct. Regression scenarios added to the #51 e2e spec.

---

## Sprint 3 — Profil + Projets + Castings (tickets #27–#33) — score 7/10

Scope: profile actions/UI + photo upload, project & casting actions, forms,
list/detail pages.

| Priority | Finding | Resolution |
|---|---|---|
| HIGH | **Productions could never publish**: nothing ever set a project to `open`, so real castings were invisible to every figurant forever (masked by pre-opened seed data) | Fixed: `PROJECT_STATUS_TRANSITIONS` (schemas) + `updateProjectStatus` action (status & transition validated server-side, owner-scoped) + Publier/Fermer/Réouvrir/Archiver buttons + draft-invisibility hint. Live-verified (owner publishes, cross-prod blocked). `deleteProject` removed (archive = transition) |
| HIGH | **Photos 1–5 MB rejected**: server-action body limit defaults to 1 MB; the app's 5 MB validation never ran | Fixed: `serverActions.bodySizeLimit: "6mb"` |
| MED | Productions forced to pick an acting-experience level to save their profile | Fixed: `experience` optional (+ explicit `?? null`), role-aware form/view (`showFigurantFields`) |
| MED | Status labels/variants + date formatters copy-pasted ×3 | Fixed: `ProjectStatusBadge`, `PROJECT_STATUS_LABELS` in schemas, `formatDateShortFr`/`formatDateRangeShortFr` in lib/utils |
| MED | Action errors swallowed with no telemetry | Fixed: `Sentry.captureException` (feature/step tags) across profiles/projects/castings; expected RLS denials excluded |
| LOW | Unwired `updateProject`/`updateCasting`; vestigial enum casts; `CastingFilters` name collision; avatars-public + no-pagination decisions unrecorded | All fixed (edit dialogs wired for both forms; `CastingFilterState` rename; decisions recorded) |

Recurring insight recorded: ticket-complete ≠ journey-complete; seed data hides
missing lifecycle steps.

---

## Sprint 4 — Candidatures (tickets #34–#40) — score 7.5/10

Scope: public + authenticated casting catalogs, apply flow, my-applications,
candidate review (bulk), candidate detail. (Second pass — an earlier in-sprint
review had already fixed withdraw-resurrection, filter trim, `?application=` guard.)

| Priority | Finding | Resolution |
|---|---|---|
| HIGH | **`/app/candidats` 404**: "Candidats" nav entry + dashboard shortcut for productions pointed at a page no ticket ever built | Fixed with the real feature: `getFigurants()` (RLS-bounded), `useFigurants`, browse grid → candidate detail. Advanced filters stay Phase 2 |
| MED | `reviewApplications` trusted the TS type of `status`: a forged `"pending"` passed RLS but made `notifyReviewOutcome` send **rejection emails** for un-reviewed applications | Fixed: runtime guard (`confirmed`/`rejected` only) + `ids` validation (string array, cap 200) |
| MED | Zero Sentry telemetry in `applications.ts`; `notifyReviewOutcome`'s catch even swallowed failed SELECTs | Fixed: captures on every unexpected branch incl. the notify catch |
| MED | Realtime status updates (CLAUDE.md MVP §5) silently dropped from the plan | Implemented: `applications` added to the `supabase_realtime` publication (idempotent, in 007), `useMyApplicationsRealtime` (filtered `postgres_changes`, RLS-bounded) on `/app/candidatures`. Live-verified end-to-end (noted: ~1 min worker pickup delay after publication changes) |
| LOW | Formatter/label duplication continued into new files; vestigial casts; `FigurantProfile.experience` untyped; hooks split by ticket not domain; unbounded email `Promise.all` | All fixed (`formatAgeRangeFr`, `APPLICATION_STATUS_LABELS` export, hooks reorganized figurant/production, fan-out chunked ×5) |

---

## Sprint 5 — Emails + Covoiturage (tickets #41–#43) — score 8/10

Scope: Resend lib + templates, email wiring (welcome / review outcomes /
convocation), carpool CRUD. No High findings.

| Priority | Finding | Resolution |
|---|---|---|
| MED | Carpool form's project `Select` rendered the **raw value** ("none" / project UUID) — the Base UI `SelectValue` gotcha documented 4× elsewhere in this codebase | Fixed: render-prop mapping sentinel → "Aucun projet", id → title |
| MED | "Marquer complet" was one-way; passenger cancellation forced delete + recreate | Fixed: `setCarpoolFull(id, isFull)` toggle + "Rouvrir" button. Live-verified (owner both ways, non-owner 0 rows) |
| MED | No Sentry in `carpools.ts`/`emails.ts`; `sendConvocation` fan-out unbounded | Fixed: captures everywhere; shared `chunk()` helper used by both convocation and review notifications |
| LOW | `EMAIL_FROM` fallback pointed at an **unverified domain** (with a docstring claiming otherwise); third divergent APP_URL fallback in email layout; dead `href="#"` unsubscribe link; OnSet/ONSET branding split; welcome email on the signup response path; stale past carpools shown; 0-seat offers creatable | All fixed (`getEmailFrom()` fail-loud inside dispatch's try/catch, `getAppUrl()` in templates, unsubscribe removed, ONSET everywhere, `after()` for welcome, board date filter defaults to today, seats `min(1)` at creation) |

Backlog recorded: convocation history not persisted (Phase 2 call-sheets).

---

## Sprint 6 — Landing + SEO + PWA (tickets #44–#48) — score 8/10

Scope: landing, B2B + SEO pages, public chrome, sitemap/robots/OG/manifest,
service worker, icons, offline, install banner. Cleanest code of all sprints;
findings were launch-readiness, not defects.

| Priority | Finding | Resolution |
|---|---|---|
| HIGH | **Fabricated testimonials** — quotes attributed to invented named people, on a platform with no users (misleading-practice exposure, B2B trust risk) | Fixed: section replaced by "Pensé pour le terrain" — three unattributed product-scenario cards, each claiming only shipped functionality; real consented quotes tracked on the checklist |
| MED | Legal placeholders (editor identity, privacy policy) were untracked launch blockers for a GDPR-sensitive platform | Fixed: "Pré-lancement — checklist bloquante" section added to PROGRESS.md (legal identity, privacy policy, Vercel env vars, Resend domain, db:rls discipline, device PWA test, Lighthouse, real testimonials, auth redirect allowlist) |
| MED | Public site had **no mobile navigation** (header links `hidden md:flex`, footer-only fallback) on pages whose traffic is mostly mobile | Fixed: `SiteNavMobile` client dropdown (closes on click — CSS-only would stay open under client-side nav) |
| LOW | `sitemap.ts` localhost fallback could silently feed localhost URLs to crawlers (request-time route, unlike the build-time consumers); `orientation: portrait` over-constraint; install banner prompting anonymous landing visitors; empty `blog/[slug]` scaffold | All fixed (`getAppUrl()` in sitemap with build-vs-request rationale documented; orientation dropped; banner moved to the `/app` shell; scaffold deleted) |

Smoke-verified on the served build: fake names absent, new section + mobile menu
button rendered, sitemap 200/valid, manifest without `orientation`.

---

## Cross-sprint patterns worth keeping in mind

- **Ticket-complete ≠ journey-complete.** Every High that wasn't security was a
  missing keystone *between* tickets: project publishing (S3), `/app/candidats`
  (S4), admin page (S2). Seed data reliably masked these.
- **RLS thinks in rows; attackers think in columns.** The S1 escalation and the S4
  status-forgery both lived in that gap. `db:verify-rls` now codifies the invariants.
- **Consistency debt compounds.** Sentry telemetry, fan-out chunking, formatter
  dedupe, and the SelectValue render-prop each had to be re-applied to the next
  sprint's files after being established. New code should be checked against the
  previous fix pass, not just the plan.
- **Script-based live verification misses visual bugs** (raw UUID in a Select) and
  **content risks** (fake testimonials). Reviews need a browser pass and a
  "would we defend this copy publicly?" check.
- Outstanding manual items are consolidated in PROGRESS.md's pre-launch checklist;
  e2e regression scenarios for every fixed bug are recorded in the #51–#53 specs.
