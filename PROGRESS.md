# Progress — FigurAction

Last updated: 2026-06-02 (ticket #02)
Prompt for Claude Code: `Read CLAUDE.md, CODING-PLAN.md and PROGRESS.md. Implement the next uncompleted ticket.`

---

## Sprint 0 — Fondations

- [x] #01 — Init repo + toutes les dépendances
- [x] #02 — Tailwind + shadcn/ui
- [ ] #03 — Structure de dossiers + types de base
- [ ] #04 — Biome (linter/formatter)
- [ ] #05 — Setup Supabase ⚠️ MANUAL (créer projet sur supabase.com, récupérer clés)
- [ ] #06 — Setup Drizzle ORM
- [ ] #07 — Providers React (QueryClient + Zustand)
- [ ] #08 — Deploy Vercel (staging) ⚠️ MANUAL (connecter repo sur vercel.com)
- [ ] #09 — GitHub Actions CI
- [ ] #10 — Sentry + PostHog ⚠️ MANUAL (créer comptes, récupérer clés)

## Sprint 1 — Base de données

- [ ] #11 — Tous les schemas Zod
- [ ] #12 — Schema DB: profiles + types
- [ ] #13 — Schema DB: projects + types
- [ ] #14 — Schema DB: castings + types
- [ ] #15 — Schema DB: applications + types
- [ ] #16 — Schema DB: carpools + contracts + export global
- [ ] #17 — RLS Policies
- [ ] #18 — Seed data

## Sprint 2 — Auth

- [ ] #19 — Server action: signup
- [ ] #20 — Server actions: login + logout
- [ ] #21 — Server action: reset password
- [ ] #22 — Middleware auth + role routing
- [ ] #23 — Pages auth UI (login + signup + forgot)
- [ ] #24 — Hook useCurrentUser
- [ ] #25 — App shell: sidebar + topbar + mobile nav
- [ ] #26 — Dashboard

## Sprint 3 — Profil + Projets + Castings

- [ ] #27 — Server actions: profiles ⚠️ MANUAL (créer bucket avatars sur Supabase Storage)
- [ ] #28 — Profil figurant: formulaire + upload photo
- [ ] #29 — Profil figurant: page vue + édition
- [ ] #30 — Server actions: projects + castings
- [ ] #31 — Créer un projet (production)
- [ ] #32 — Liste projets + hooks
- [ ] #33 — Détail projet + créer casting

## Sprint 4 — Candidatures

- [ ] #34 — Catalogue castings public (SSR/SEO)
- [ ] #35 — Catalogue castings authentifié + filtres
- [ ] #36 — Postuler à un casting
- [ ] #37 — Mes candidatures (figurant)
- [ ] #38 — Liste candidats par casting (production)
- [ ] #39 — Confirmer / Refuser un candidat
- [ ] #40 — Fiche profil candidat (production)

## Sprint 5 — Emails + Covoit

- [ ] #41 — Setup Resend + templates email ⚠️ MANUAL (créer compte Resend, API key, configurer domaine)
- [ ] #42 — Brancher les emails sur les actions
- [ ] #43 — Covoiturage: CRUD complet

## Sprint 6 — Landing + SEO + PWA

- [ ] #44 — Landing page
- [ ] #45 — Page B2B: Pour les productions
- [ ] #46 — Page SEO: Devenir figurant
- [ ] #47 — Meta tags + Open Graph + sitemap
- [ ] #48 — PWA: manifest + service worker + install

## Sprint 7 — Tests

- [ ] #49 — Setup Vitest + tests schemas
- [ ] #50 — Setup Playwright
- [ ] #51 — Test e2e: auth flow
- [ ] #52 — Test e2e: flow candidature
- [ ] #53 — Test e2e: flow production

---

## Notes

⚠️ MANUAL = action manuelle requise (dashboard externe), Claude Code ne peut pas le faire.
Après chaque ticket terminé, cocher [x] et mettre à jour la date "Last updated".
