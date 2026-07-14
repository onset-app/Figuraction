# Progress — FigurAction

Last updated: 2026-07-14 (ticket #22)

```
Prompt: Read CLAUDE.md, CODING-PLAN.md and PROGRESS.md. Implement the next uncompleted ticket.
/clear : à chaque nouveau sprint ou si ça déraille
/model : switcher selon l'annotation 〔sonnet〕 ou 〔opus〕 avant chaque ticket
```

---

## Sprint 0 — Fondations

- [x] #01 — Init repo + toutes les dépendances 〔sonnet〕
- [x] #02 — Tailwind + shadcn/ui 〔sonnet〕
- [x] #03 — Structure de dossiers + types de base 〔sonnet〕
- [x] #04 — Biome (linter/formatter) 〔sonnet〕
- [x] #05 — Setup Supabase 〔opus〕 ⚠️ MANUAL (créer projet sur supabase.com, récupérer clés)
- [x] #06 — Setup Drizzle ORM 〔sonnet〕 (DB connectée via session pooler port 5432 — le transaction pooler 6543 ne s'authentifie pas sur ce projet)
- [x] #07 — Providers React (QueryClient + Zustand) 〔sonnet〕
- [x] #08 — Deploy Vercel (staging) ⚠️ MANUAL (connecter repo sur vercel.com)
- [x] #09 — GitHub Actions CI 〔sonnet〕
- [x] #10 — Sentry + PostHog 〔sonnet〕 ⚠️ MANUAL (créer comptes, récupérer clés)

## Sprint 1 — Base de données

- [x] #11 — Tous les schemas Zod 〔sonnet〕
- [x] #12 — Schema DB: profiles + types 〔sonnet〕
- [x] #13 — Schema DB: projects + types 〔sonnet〕
- [x] #14 — Schema DB: castings + types 〔sonnet〕
- [x] #15 — Schema DB: applications + types 〔sonnet〕
- [x] #16 — Schema DB: carpools + contracts + export global 〔sonnet〕
- [x] #17 — RLS Policies 〔opus〕 (helpers use `(select ...)` wrapping; 23/23 isolation assertions pass)
- [x] #18 — Seed data 〔opus〕 (8 users / 3 projects / 6 castings / 10 applications / 3 carpools; auth users via admin API — login `Password123!`; idempotent)

## Sprint 2 — Auth (/clear avant ce sprint)

- [x] #19 — Server action: signup 〔opus〕 (profile insert via Drizzle/service-role — bypasses RLS since no session exists pre-confirmation; rolls back orphaned auth user on failure)
- [x] #20 — Server actions: login + logout 〔opus〕 (server-side redirect on success; generic errors to avoid account enumeration)
- [x] #21 — Server action: reset password 〔opus〕 (resetPassword + updatePassword actions, /auth/callback route exchanges code→session, /update-password page; neutral success to avoid enumeration)
- [x] #22 — Middleware auth + role routing 〔opus〕 (protège /app/*, redirige auth pages si loggé, role gating projets/candidats→production, admin→admin; rôle lu depuis profiles via RLS. NOTE: Next 16 → `middleware.ts` déprécié au profit de `proxy.ts`, gardé middleware.ts pour coller au plan)
- [ ] #23 — Pages auth UI (login + signup + forgot) 〔opus〕
- [ ] #24 — Hook useCurrentUser 〔opus〕
- [ ] #25 — App shell: sidebar + topbar + mobile nav 〔opus〕
- [ ] #26 — Dashboard 〔opus〕

## Sprint 3 — Profil + Projets + Castings (/clear avant ce sprint)

- [ ] #27 — Server actions: profiles 〔opus〕 ⚠️ MANUAL (créer bucket avatars sur Supabase Storage)
- [ ] #28 — Profil figurant: formulaire + upload photo 〔sonnet〕
- [ ] #29 — Profil figurant: page vue + édition 〔sonnet〕
- [ ] #30 — Server actions: projects + castings 〔opus〕
- [ ] #31 — Créer un projet (production) 〔sonnet〕
- [ ] #32 — Liste projets + hooks 〔sonnet〕
- [ ] #33 — Détail projet + créer casting 〔opus〕

## Sprint 4 — Candidatures (/clear avant ce sprint)

- [ ] #34 — Catalogue castings public (SSR/SEO) 〔sonnet〕
- [ ] #35 — Catalogue castings authentifié + filtres 〔opus〕
- [ ] #36 — Postuler à un casting 〔opus〕
- [ ] #37 — Mes candidatures (figurant) 〔sonnet〕
- [ ] #38 — Liste candidats par casting (production) 〔opus〕
- [ ] #39 — Confirmer / Refuser un candidat 〔opus〕
- [ ] #40 — Fiche profil candidat (production) 〔sonnet〕

## Sprint 5 — Emails + Covoit (/clear avant ce sprint)

- [ ] #41 — Setup Resend + templates email 〔sonnet〕 ⚠️ MANUAL (créer compte Resend, API key, domaine)
- [ ] #42 — Brancher les emails sur les actions 〔opus〕
- [ ] #43 — Covoiturage: CRUD complet 〔sonnet〕

## Sprint 6 — Landing + SEO + PWA (/clear avant ce sprint)

- [ ] #44 — Landing page 〔opus〕
- [ ] #45 — Page B2B: Pour les productions 〔sonnet〕
- [ ] #46 — Page SEO: Devenir figurant 〔sonnet〕
- [ ] #47 — Meta tags + Open Graph + sitemap 〔sonnet〕
- [ ] #48 — PWA: manifest + service worker + install 〔sonnet〕

## Sprint 7 — Tests (/clear avant ce sprint)

- [ ] #49 — Setup Vitest + tests schemas 〔sonnet〕
- [ ] #50 — Setup Playwright 〔sonnet〕
- [ ] #51 — Test e2e: auth flow 〔opus〕
- [ ] #52 — Test e2e: flow candidature 〔opus〕
- [ ] #53 — Test e2e: flow production 〔opus〕

---

## Légende

- 〔sonnet〕 = ticket mécanique, bien défini → `/model sonnet`
- 〔opus〕 = ticket complexe, logique métier, sécurité, multi-fichiers → `/model opus`
- ⚠️ MANUAL = action manuelle requise sur un dashboard externe
- (/clear avant ce sprint) = faire `/clear` dans Claude Code avant d'attaquer

Après chaque ticket terminé : cocher [x], mettre à jour la date "Last updated".
