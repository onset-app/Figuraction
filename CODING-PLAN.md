# ONSET — Plan de Coding v2 (Optimisé)

Chaque ticket liste ses dépendances strictes. Aucun ticket ne doit être commencé
sans que ses dépendances soient terminées. Un ticket = une branche = une PR.

Changements vs v1 :
- Toutes les installations npm consolidées dans le Sprint 0
- Schemas Zod regroupés en un seul ticket
- Seed data remonté juste après RLS (nécessaire pour tester)
- Types Drizzle intégrés dans le ticket schema DB (pas de ticket séparé)
- Login + logout fusionnés
- Ordre global resserré : 62 tickets au lieu de 70, même périmètre

---

## SPRINT 0 — Fondations (Jour 1-2)

Objectif : repo prêt à coder, toutes les dépendances installées, déployé en staging.

---

### #01 — Init repo + toutes les dépendances
- **Priorité :** HIGH
- **Dépend de :** —
- **Estimation :** 1.5h
- **Quoi faire :**
  - `pnpm create next-app@latest onset --typescript --tailwind --eslint --app --src-dir`
  - Configurer `tsconfig.json` strict mode
  - Installer TOUT d'un coup (plus jamais d'install en milieu de sprint) :
    ```bash
    # UI
    pnpm add @tanstack/react-query zustand

    # Forms + validation
    pnpm add react-hook-form @hookform/resolvers zod

    # Supabase
    pnpm add @supabase/supabase-js @supabase/ssr

    # ORM
    pnpm add drizzle-orm postgres

    # Dev
    pnpm add -D drizzle-kit @biomejs/biome supabase
    ```
  - Créer `.env.local` et `.env.example` avec toutes les variables (vides)
  - Créer `.gitignore` (node_modules, .env.local, .next, .vercel)
  - Premier commit + push GitHub
- **Livrable :** App Next.js qui tourne, toutes les deps installées

---

### #02 — Tailwind + shadcn/ui
- **Priorité :** HIGH
- **Dépend de :** #01
- **Estimation :** 45min
- **Quoi faire :**
  - Configurer `tailwind.config.ts` (paths, CSS variables theming)
  - `pnpm dlx shadcn@latest init` (style "New York")
  - Installer les composants de base :
    ```bash
    pnpm dlx shadcn@latest add button card dialog input select table badge
    form label textarea separator sheet dropdown-menu avatar toast tabs
    ```
- **Livrable :** shadcn/ui fonctionnel, composants importables

---

### #03 — Structure de dossiers + types de base
- **Priorité :** HIGH
- **Dépend de :** #01
- **Estimation :** 30min
- **Quoi faire :**
  - Créer l'arborescence complète avec fichiers placeholder :
    ```
    src/app/(public)/ (auth)/ (app)/ api/
    src/components/ui/ layout/ castings/ projets/ profil/ covoiturage/ shared/
    src/lib/supabase/ stripe/ resend/
    src/db/schema/ migrations/
    src/actions/
    src/hooks/
    src/stores/
    src/schemas/
    src/emails/
    src/types/
    ```
  - Créer `src/types/enums.ts` avec tous les types :
    ```ts
    export type UserRole = 'figurant' | 'production' | 'admin'
    export type ApplicationStatus = 'pending' | 'confirmed' | 'rejected' | 'withdrawn'
    export type ProjectStatus = 'draft' | 'open' | 'closed' | 'archived'
    export type CastingStatus = 'open' | 'closed'
    export type ContractStatus = 'pending' | 'signed' | 'expired'
    export type ExperienceLevel = 'debutant' | 'premiere_fois' | 'confirme'
    ```
- **Livrable :** Arborescence visible, types de base disponibles

---

### #04 — Biome (linter/formatter)
- **Priorité :** MED
- **Dépend de :** #01
- **Estimation :** 20min
- **Quoi faire :**
  - Créer `biome.json` (rules strictes, no-any, consistent imports)
  - Scripts : `"check": "biome check ."`, `"check:fix": "biome check . --fix"`
  - `.vscode/settings.json` pour format on save
- **Livrable :** `pnpm check` passe sans erreur

---

### #05 — Setup Supabase
- **Priorité :** HIGH
- **Dépend de :** #01
- **Estimation :** 1h
- **Quoi faire :**
  - Créer le projet sur supabase.com (eu-west)
  - Remplir `.env.local` (URL, anon key, service role key)
  - Créer `src/lib/supabase/client.ts` (browser client)
  - Créer `src/lib/supabase/server.ts` (server client avec cookies)
  - Créer `src/lib/supabase/middleware.ts` (session refresh helper)
  - `pnpm supabase init` → dossier `supabase/`
  - Tester la connexion
- **Livrable :** Clients Supabase fonctionnels

---

### #06 — Setup Drizzle ORM
- **Priorité :** HIGH
- **Dépend de :** #05
- **Estimation :** 30min
- **Quoi faire :**
  - Créer `drizzle.config.ts` (connection string depuis .env)
  - Créer `src/db/index.ts` (instance drizzle)
  - Scripts : `"db:push"`, `"db:generate"`, `"db:studio"`
  - Tester `pnpm db:studio`
- **Livrable :** Drizzle connecté, studio accessible

---

### #07 — Providers React (QueryClient + Zustand)
- **Priorité :** HIGH
- **Dépend de :** #01
- **Estimation :** 30min
- **Quoi faire :**
  - Créer `src/components/providers/query-provider.tsx` (QueryClientProvider)
  - Créer `src/stores/ui-store.ts` (sidebar state, placeholder)
  - Créer `src/stores/filters-store.ts` (placeholder)
  - Ajouter le QueryProvider dans `src/app/layout.tsx`
  - Vérifier que TanStack Query devtools apparaissent en dev
- **Livrable :** State management prêt à l'emploi

---

### #08 — Deploy Vercel (staging)
- **Priorité :** MED
- **Dépend de :** #01
- **Estimation :** 30min
- **Quoi faire :**
  - Connecter le repo GitHub à Vercel
  - Configurer env vars sur Vercel
  - Activer preview deployments par PR
  - Vérifier build + accès en ligne
- **Livrable :** URL staging live, auto-deploy

---

### #09 — GitHub Actions CI
- **Priorité :** MED
- **Dépend de :** #04, #08
- **Estimation :** 30min
- **Quoi faire :**
  - Créer `.github/workflows/ci.yml` : checkout → pnpm install → biome check → build
  - Tester sur une PR
- **Livrable :** CI verte sur chaque PR

---

### #10 — Sentry + PostHog
- **Priorité :** LOW
- **Dépend de :** #01, #08
- **Estimation :** 45min
- **Quoi faire :**
  - Sentry : `pnpm add @sentry/nextjs`, configs client/server/edge, SENTRY_DSN en env
  - PostHog : `pnpm add posthog-js`, créer provider, ajouter dans layout
  - Tester un throw + un pageview
- **Livrable :** Monitoring actif

---

## SPRINT 1 — Base de données (Jour 3-4)

Objectif : toutes les tables, RLS, seeds. La DB est prête, sécurisée, et peuplée.

---

### #11 — Tous les schemas Zod (front ↔ back)
- **Priorité :** HIGH
- **Dépend de :** #03
- **Estimation :** 1h
- **Quoi faire :**
  - Créer d'un coup tous les schemas de validation :
  - `src/schemas/auth.ts` : signupSchema, loginSchema, resetPasswordSchema
  - `src/schemas/profile.ts` : profileSchema (firstName, lastName, phone, city, age, bio, experience)
  - `src/schemas/project.ts` : projectSchema (title, description, shootLocation, dates)
  - `src/schemas/casting.ts` : castingSchema (title, description, roleType, ageMin/Max, location, date, spots)
  - `src/schemas/application.ts` : applicationSchema (castingId, message)
  - `src/schemas/carpool.ts` : carpoolSchema (projectId, driverName, departureArea, date, time, seats, contactMethod, contactValue)
  - Exporter tout depuis `src/schemas/index.ts`
- **Livrable :** Tous les schemas Zod prêts, réutilisables front et back
- **Pourquoi maintenant :** Indépendant de tout, nécessaire partout. On n'y revient plus.

---

### #12 — Schema DB: profiles + types inférés
- **Priorité :** HIGH
- **Dépend de :** #06
- **Estimation :** 45min
- **Quoi faire :**
  - Créer `src/db/schema/profiles.ts` (Drizzle)
  - Inclure les types inférés directement :
    ```ts
    export type Profile = typeof profiles.$inferSelect
    export type NewProfile = typeof profiles.$inferInsert
    ```
  - `pnpm db:push`
- **Livrable :** Table `profiles` en DB + types TS

---

### #13 — Schema DB: projects + types
- **Priorité :** HIGH
- **Dépend de :** #12
- **Estimation :** 30min
- **Quoi faire :**
  - `src/db/schema/projects.ts` : production_id FK → profiles, title, description, location, dates, status
  - Types inférés
  - `pnpm db:push`
- **Livrable :** Table `projects` en DB + types TS

---

### #14 — Schema DB: castings + types
- **Priorité :** HIGH
- **Dépend de :** #13
- **Estimation :** 30min
- **Quoi faire :**
  - `src/db/schema/castings.ts` : project_id FK → projects (CASCADE), title, role_type, age range, location, spots, status
  - Types inférés
  - `pnpm db:push`
- **Livrable :** Table `castings` en DB + types TS

---

### #15 — Schema DB: applications + types
- **Priorité :** HIGH
- **Dépend de :** #12, #14
- **Estimation :** 30min
- **Quoi faire :**
  - `src/db/schema/applications.ts` : casting_id FK, figurant_id FK, status, message, reviewed_at/by
  - UNIQUE(casting_id, figurant_id)
  - Types inférés
  - `pnpm db:push`
- **Livrable :** Table `applications` en DB + types TS

---

### #16 — Schema DB: carpools + contracts + export global
- **Priorité :** MED
- **Dépend de :** #12, #13, #15
- **Estimation :** 45min
- **Quoi faire :**
  - `src/db/schema/carpools.ts` : project_id FK (nullable), driver_id FK, departure info, seats, contact, is_full
  - `src/db/schema/contracts.ts` : application_id FK, figurant_id FK, project_id FK, contract_url, signed_at, status
  - Types inférés pour les deux
  - Créer `src/db/schema/index.ts` : re-export de TOUTES les tables + types
  - Créer `src/types/database.ts` : re-export centralisé des types pour import facile
  - `pnpm db:push`
- **Livrable :** Toutes les tables en DB, types centralisés

---

### #17 — RLS Policies
- **Priorité :** HIGH
- **Dépend de :** #12-#16
- **Estimation :** 2h
- **Quoi faire :**
  - Créer `supabase/migrations/007_rls_policies.sql`
  - Pour CHAQUE table : ENABLE RLS + policies par rôle
  - Policies critiques :
    - profiles : user voit/modifie le sien, production voit les figurants, admin voit tout
    - projects : production CRUD les siens, figurants lisent les ouverts, admin tout
    - castings : idem projects (via join project)
    - applications : figurant voit les siennes, production voit celles de ses castings, admin tout
    - carpools : tous peuvent lire, créateur peut modifier/supprimer, admin tout
    - contracts : figurant voit les siens, production voit ceux de ses projets, admin tout
  - TESTER chaque policy (login as figurant → verify can't see other's data)
- **Livrable :** RLS active et testée sur TOUTES les tables

---

### #18 — Seed data
- **Priorité :** HIGH
- **Dépend de :** #17
- **Estimation :** 1h
- **Quoi faire :**
  - Créer `src/db/seed.ts`
  - Données réalistes Belgique :
    - 5 figurants (Bruxelles, Liège, Namur, Charleroi, Gent)
    - 2 productions ("RTBF Productions", "IndiFilm Brussels")
    - 1 admin
    - 3 projets (1 draft, 1 open, 1 closed)
    - 6 castings (2 par projet)
    - 10 candidatures (mix de statuts)
    - 3 covoiturages
  - Script `"db:seed": "tsx src/db/seed.ts"`
  - Exécuter et vérifier dans Supabase dashboard
- **Livrable :** DB peuplée, `pnpm db:seed` fonctionnel
- **Pourquoi maintenant :** Les seeds sont essentiels pour tester l'auth, le middleware, et toutes les pages qui suivent. Sans données, tu testes à l'aveugle.

---

## SPRINT 2 — Auth (Jour 5-7)

Objectif : un user peut s'inscrire, se connecter, se déconnecter, et arriver sur le bon dashboard selon son rôle.

---

### #19 — Server actions: signup
- **Priorité :** HIGH
- **Dépend de :** #05, #11, #12
- **Estimation :** 2h
- **Quoi faire :**
  - Créer `src/actions/auth.ts` → `signup(formData)`
  - Valider avec signupSchema
  - `supabase.auth.signUp({ email, password })`
  - Insérer dans profiles (id, email, role, first_name, last_name)
  - Gestion erreurs (email pris, password faible)
  - Retourner `{ success, error }` typé
  - Configurer redirect URL dans Supabase dashboard
- **Livrable :** Server action signup fonctionnelle

---

### #20 — Server actions: login + logout
- **Priorité :** HIGH
- **Dépend de :** #05, #11
- **Estimation :** 1h
- **Quoi faire :**
  - Ajouter dans `src/actions/auth.ts` :
  - `login(formData)` : valider loginSchema, `signInWithPassword`, gestion erreurs, redirect `/app/dashboard`
  - `logout()` : `signOut()`, redirect `/login`
- **Livrable :** Login + logout fonctionnels

---

### #21 — Server action: reset password
- **Priorité :** MED
- **Dépend de :** #05, #11
- **Estimation :** 1h
- **Quoi faire :**
  - `resetPassword(email)` : `supabase.auth.resetPasswordForEmail(email)` (API v2)
  - Page callback `/auth/callback` pour gérer le lien
  - Page `/update-password` pour le nouveau mot de passe
- **Livrable :** Flow reset password complet

---

### #22 — Middleware auth + role routing
- **Priorité :** HIGH
- **Dépend de :** #05, #19, #20
- **Estimation :** 2h
- **Quoi faire :**
  - `src/middleware.ts` :
    - Refresh session Supabase sur chaque requête
    - `/app/*` sans session → redirect `/login`
    - `/login` ou `/signup` avec session → redirect `/app/dashboard`
    - Vérification rôle pour routes spécifiques (/app/projets → production, /app/admin → admin)
  - Matcher : `['/app/:path*', '/login', '/signup']`
  - Tester avec les seed users
- **Livrable :** Routes protégées, redirections par rôle

---

### #23 — Pages auth UI (login + signup + forgot)
- **Priorité :** HIGH
- **Dépend de :** #02, #11, #19, #20, #21
- **Estimation :** 3h
- **Quoi faire :**
  - `src/app/(auth)/layout.tsx` : layout centré, card, logo
  - `src/app/(auth)/login/page.tsx` :
    - react-hook-form + zodResolver(loginSchema)
    - Champs email + password
    - Bouton "Se connecter" → login action
    - Liens vers signup et forgot-password
    - Messages erreur inline
  - `src/app/(auth)/signup/page.tsx` :
    - Champs prénom, nom, email, password, rôle (figurant/production)
    - Bouton "Créer mon compte" → signup action
    - Message "Vérifiez votre email"
  - `src/app/(auth)/forgot-password/page.tsx` :
    - Champ email → resetPassword action
- **Livrable :** 3 pages auth fonctionnelles et stylées

---

### #24 — Hook useCurrentUser
- **Priorité :** HIGH
- **Dépend de :** #05, #07, #12
- **Estimation :** 1h
- **Quoi faire :**
  - `src/hooks/use-current-user.ts`
  - TanStack Query : fetch user auth + profil (role, nom, photo)
  - Expose : `user`, `profile`, `role`, `isLoading`, `isAuthenticated`
- **Livrable :** Hook prêt, utilisable partout

---

### #25 — App shell: sidebar + topbar + mobile nav
- **Priorité :** HIGH
- **Dépend de :** #02, #03, #07, #24
- **Estimation :** 3h
- **Quoi faire :**
  - `src/app/(app)/layout.tsx` : structure sidebar + content
  - `src/components/layout/sidebar.tsx` :
    - Nav conditionnelle par rôle :
      - Figurant : Castings, Candidatures, Covoiturage, Profil
      - Production : Projets, Candidats, Profil
      - Admin : tout + Admin
    - User info (nom, photo, logout)
  - `src/components/layout/topbar.tsx` : titre page
  - `src/components/layout/mobile-nav.tsx` : bottom tabs responsive
  - `src/components/layout/role-guard.tsx` : wrapper vérifie le rôle, 403 si pas autorisé
  - Sidebar open/close dans `ui-store.ts`
- **Livrable :** App shell responsive avec nav par rôle

---

### #26 — Dashboard
- **Priorité :** MED
- **Dépend de :** #25
- **Estimation :** 1h
- **Quoi faire :**
  - `src/app/(app)/dashboard/page.tsx`
  - Figurant : "Bienvenue [prénom]", raccourcis castings + candidatures
  - Production : raccourcis projets + candidats
  - Admin : raccourcis back-office
  - Cards shadcn/ui
- **Livrable :** Page d'accueil après login

---

## SPRINT 3 — Profil + Projets + Castings (Jour 8-11)

Objectif : figurants ont un profil complet, productions peuvent créer et gérer projets/castings.

---

### #27 — Server actions: profiles
- **Priorité :** HIGH
- **Dépend de :** #05, #06, #11, #12
- **Estimation :** 1h
- **Quoi faire :**
  - `src/actions/profiles.ts` :
    - `updateProfile(formData)` : valide profileSchema, update en DB
    - `uploadPhoto(file)` : upload Supabase Storage bucket `avatars`, retourne URL, update profiles.photo_url
  - Créer bucket `avatars` dans Supabase Storage avec policy (user upload/read son avatar)
- **Livrable :** Actions profil + storage prêts

---

### #28 — Profil figurant: formulaire + upload photo
- **Priorité :** HIGH
- **Dépend de :** #02, #11, #24, #27
- **Estimation :** 2.5h
- **Quoi faire :**
  - `src/components/profil/profile-form.tsx` :
    - react-hook-form + zodResolver(profileSchema)
    - Champs : prénom, nom, téléphone, ville, âge, bio, expérience (select)
    - Toast succès/erreur
  - `src/components/profil/photo-upload.tsx` :
    - Input file avec preview
    - Restriction : images, max 5MB
    - Upload → Storage → URL en DB
    - Avatar actuel avec fallback initiales
  - `src/components/shared/file-upload.tsx` : composant réutilisable
- **Livrable :** Formulaire profil complet avec photo

---

### #29 — Profil figurant: page vue + édition
- **Priorité :** HIGH
- **Dépend de :** #28
- **Estimation :** 1.5h
- **Quoi faire :**
  - `src/app/(app)/profil/page.tsx`
  - Mode vue : photo, nom, ville, âge, bio, expérience
  - Bouton "Modifier" → mode édition (réutilise profile-form)
  - Design : photo en haut, infos en cards
- **Livrable :** Page profil consultable et modifiable

---

### #30 — Server actions: projects + castings
- **Priorité :** HIGH
- **Dépend de :** #05, #06, #11, #13, #14
- **Estimation :** 2h
- **Quoi faire :**
  - `src/actions/projects.ts` :
    - `createProject(data)` : valide projectSchema, insère, retourne projet
    - `updateProject(id, data)` : vérifie ownership, update
    - `deleteProject(id)` : vérifie ownership, archive
    - `getMyProjects()` : projets de la production connectée
  - `src/actions/castings.ts` :
    - `createCasting(projectId, data)` : vérifie ownership projet, insère
    - `updateCasting(id, data)` : vérifie ownership via project
    - `closeCasting(id)` : status → 'closed'
    - `getPublicCastings(filters?)` : castings ouverts (page publique + catalogue)
    - `getCastingsByProject(projectId)` : pour détail projet
- **Livrable :** CRUD projets + castings complet

---

### #31 — Créer un projet (production)
- **Priorité :** HIGH
- **Dépend de :** #25, #30
- **Estimation :** 1.5h
- **Quoi faire :**
  - `src/components/projets/project-form.tsx` : react-hook-form + zodResolver
  - Champs : titre, description, lieu, dates
  - `src/app/(app)/projets/nouveau/page.tsx`
  - RoleGuard → production only
  - Après submit → redirect liste projets
- **Livrable :** Page création projet

---

### #32 — Liste projets + hooks
- **Priorité :** HIGH
- **Dépend de :** #30, #31
- **Estimation :** 2h
- **Quoi faire :**
  - `src/hooks/use-projects.ts` : TanStack Query fetch projets
  - `src/components/projets/project-card.tsx` : card (titre, lieu, dates, status badge, nb castings)
  - `src/app/(app)/projets/page.tsx` :
    - Grid de project-cards
    - Filtre par status
    - Bouton "Nouveau projet"
    - Empty state
- **Livrable :** Page liste projets

---

### #33 — Détail projet + créer casting
- **Priorité :** HIGH
- **Dépend de :** #30, #32
- **Estimation :** 2h
- **Quoi faire :**
  - `src/app/(app)/projets/[id]/page.tsx` : détail projet + liste castings associés
  - Bouton "Ajouter un casting" → dialog/modal avec formulaire
  - Casting card : titre, type de rôle, places, date, status
  - Bouton "Fermer le casting"
  - TanStack Query invalidation après ajout
- **Livrable :** Page projet avec gestion castings

---

## SPRINT 4 — Candidatures (Jour 12-15)

Objectif : le flow complet figurant → postuler → production → confirmer/refuser.

---

### #34 — Catalogue castings public (SSR/SEO)
- **Priorité :** HIGH
- **Dépend de :** #30
- **Estimation :** 2h
- **Quoi faire :**
  - `src/app/(public)/castings/page.tsx` : Server Component (SSR)
  - `src/components/castings/casting-card.tsx` : titre, lieu, date, âge, type, places
  - Grid responsive
  - Metadata SEO : "Castings figurants en Belgique"
  - CTA : redirect /login si non-connecté, /app/castings/[id] si connecté
- **Livrable :** Page publique castings indexable

---

### #35 — Catalogue castings authentifié + filtres
- **Priorité :** HIGH
- **Dépend de :** #24, #34
- **Estimation :** 2h
- **Quoi faire :**
  - `src/app/(app)/castings/page.tsx`
  - Réutilise casting-card.tsx
  - `src/components/castings/casting-filters.tsx` : lieu, âge, date, type de rôle
  - Filtres dans `filters-store.ts` (Zustand)
  - `src/hooks/use-castings.ts` : TanStack Query avec filtres
  - Bouton "Postuler" sur chaque card
- **Livrable :** Catalogue filtrable pour figurants

---

### #36 — Postuler à un casting
- **Priorité :** HIGH
- **Dépend de :** #35
- **Estimation :** 2h
- **Quoi faire :**
  - `src/app/(app)/castings/[id]/page.tsx` : détail casting + infos projet parent
  - `src/components/castings/application-form.tsx` :
    - Champs pré-remplis depuis profil (lecture seule)
    - Message libre optionnel
    - Bouton "Envoyer ma candidature"
  - `src/actions/applications.ts` → `createApplication` :
    - Vérifie pas déjà postulé (unique constraint)
    - Vérifie casting ouvert
    - Insert status 'pending'
  - Désactiver bouton si déjà postulé
- **Livrable :** Flow candidature complet

---

### #37 — Mes candidatures (figurant)
- **Priorité :** HIGH
- **Dépend de :** #36
- **Estimation :** 2h
- **Quoi faire :**
  - `src/hooks/use-applications.ts` : TanStack Query, candidatures du figurant + infos casting jointes
  - `src/components/shared/status-badge.tsx` : ⏳ jaune, ✔ vert, ❌ rouge
  - `src/components/shared/empty-state.tsx`
  - `src/app/(app)/candidatures/page.tsx` :
    - Liste : titre casting, lieu, date, status badge
    - Clic → détail casting
    - Possibilité retirer candidature (status → withdrawn)
- **Livrable :** Page "Mes candidatures"

---

### #38 — Liste candidats par casting (production)
- **Priorité :** HIGH
- **Dépend de :** #33, #36
- **Estimation :** 2h
- **Quoi faire :**
  - `src/app/(app)/projets/[id]/candidats/page.tsx`
  - Fetch applications des castings du projet + profils figurants
  - `src/components/projets/candidate-list.tsx` :
    - Photo (avatar), nom, âge, ville, status
    - Checkbox sélection multiple
    - "Sélectionner tout"
  - Clic sur candidat → profil détaillé
- **Livrable :** Vue candidatures pour la production

---

### #39 — Confirmer / Refuser un candidat
- **Priorité :** HIGH
- **Dépend de :** #38
- **Estimation :** 1.5h
- **Quoi faire :**
  - `src/actions/applications.ts` :
    - `confirmApplication(id)` : vérifie ownership, status → confirmed, set reviewed_at/by
    - `rejectApplication(id)` : idem, status → rejected
    - `bulkUpdateApplications(ids[], status)` : actions en masse
  - Boutons "Confirmer" (vert) / "Refuser" (rouge) dans candidate-list
  - Optimistic update TanStack Query
  - Toast confirmation
- **Livrable :** Production peut confirmer/refuser

---

### #40 — Fiche profil candidat (production)
- **Priorité :** MED
- **Dépend de :** #29, #38
- **Estimation :** 1.5h
- **Quoi faire :**
  - `src/app/(app)/candidats/[id]/page.tsx`
  - Profil complet : grande photo, infos, bio, expérience
  - Boutons : confirmer, refuser, contacter (mailto avec vrai email)
  - RoleGuard → production + admin
- **Livrable :** Fiche candidat détaillée

---

## SPRINT 5 — Emails + Covoit (Jour 16-18)

Objectif : emails automatiques sur les changements de statut, covoiturage fonctionnel.

---

### #41 — Setup Resend + templates email
- **Priorité :** MED
- **Dépend de :** #01
- **Estimation :** 2h
- **Quoi faire :**
  - `pnpm add resend @react-email/components`
  - `src/lib/resend/client.ts` : init client
  - RESEND_API_KEY dans .env
  - Créer TOUS les templates d'un coup :
    - `src/emails/welcome.tsx` : bienvenue, prochaines étapes, lien app
    - `src/emails/application-confirmed.tsx` : nom figurant, titre casting, lieu, date, prochaines étapes
    - `src/emails/application-rejected.tsx` : ton bienveillant, encouragement
    - `src/emails/convocation.tsx` : date, heure, adresse, consignes, contact
  - Layout commun : header logo, footer
  - Tester envoi en dev
- **Livrable :** Tous les templates email prêts

---

### #42 — Brancher les emails sur les actions
- **Priorité :** HIGH
- **Dépend de :** #19, #39, #41
- **Estimation :** 1.5h
- **Quoi faire :**
  - `src/actions/emails.ts` : `sendWelcome`, `sendConfirmation`, `sendRejection`, `sendConvocation`
  - Brancher dans les actions existantes :
    - `signup` → sendWelcome
    - `confirmApplication` → sendConfirmation
    - `rejectApplication` → sendRejection
  - Ajouter UI convocation côté production : bouton "Envoyer convocation" → formulaire détails → sendConvocation aux figurants confirmés
- **Livrable :** Emails envoyés automatiquement aux bons moments

---

### #43 — Covoiturage: CRUD complet
- **Priorité :** MED
- **Dépend de :** #05, #06, #11, #16, #25
- **Estimation :** 3h
- **Quoi faire :**
  - `src/actions/carpools.ts` :
    - `createCarpool(data)` : valide carpoolSchema, insert
    - `markCarpoolFull(id)` : vérifie ownership, is_full → true
    - `deleteCarpool(id)` : vérifie ownership, delete
  - `src/hooks/use-carpools.ts` : TanStack Query
  - `src/components/covoiturage/carpool-form.tsx` : formulaire complet
  - `src/components/covoiturage/carpool-list.tsx` :
    - Cards : projet, conducteur, départ, date/heure, places, contact
    - Filtres date + projet
    - Bouton contacter (mailto/tel)
    - Boutons "Complet" + "Supprimer" (conditionnel : créateur only)
  - `src/app/(app)/covoiturage/page.tsx` : form + liste
- **Livrable :** Feature covoiturage complète

---

## SPRINT 6 — Landing + SEO + PWA (Jour 19-22)

Objectif : le site est trouvable sur Google, installable sur mobile, prêt à montrer.

---

### #44 — Landing page
- **Priorité :** HIGH
- **Dépend de :** #02
- **Estimation :** 4h
- **Quoi faire :**
  - `src/app/page.tsx` (ou `src/app/(public)/page.tsx`)
  - Sections :
    - Hero : headline, sous-titre, 2 CTA (figurant + production)
    - Problème/Solution
    - Features clés (3-4 avec icônes)
    - Comment ça marche (3 étapes)
    - Témoignages (placeholders)
    - CTA final
    - Footer : liens, mentions légales, contact
  - Design soigné, responsive, animations subtiles
- **Livrable :** Landing page pro

---

### #45 — Page B2B: Pour les productions
- **Priorité :** MED
- **Dépend de :** #44
- **Estimation :** 2h
- **Quoi faire :**
  - `src/app/(public)/pour-les-productions/page.tsx`
  - Argumentaire B2B, features pro, pricing preview, CTA
- **Livrable :** Landing B2B

---

### #46 — Page SEO: Devenir figurant
- **Priorité :** MED
- **Dépend de :** #44
- **Estimation :** 2h
- **Quoi faire :**
  - `src/app/(public)/devenir-figurant/page.tsx`
  - Guide complet, FAQ, CTA
  - Ciblage : "devenir figurant belgique", "casting figurant bruxelles"
- **Livrable :** Page SEO evergreen

---

### #47 — Meta tags + Open Graph + sitemap
- **Priorité :** MED
- **Dépend de :** #44, #45, #46, #34
- **Estimation :** 1h
- **Quoi faire :**
  - Metadata dans chaque page publique + root layout
  - Image OG par défaut (1200x630)
  - Metadata dynamiques sur /castings/[id]
  - `pnpm add next-sitemap`, configurer, robots.txt
- **Livrable :** SEO technique complet

---

### #48 — PWA: manifest + service worker + install
- **Priorité :** MED
- **Dépend de :** #01
- **Estimation :** 2h
- **Quoi faire :**
  - `public/manifest.json` : name, icons 192/512, start_url /app/dashboard, display standalone
  - Générer icônes
  - `pnpm add @serwist/next`, configurer dans `next.config.ts`
  - Stratégies cache : static cache-first, API network-first, pages SWR
  - Page offline fallback `/offline`
  - `src/components/shared/install-banner.tsx` : beforeinstallprompt, bannière, stockage choix
  - Tester install sur Android + mode offline
- **Livrable :** PWA installable avec offline

---

## SPRINT 7 — Tests + Polish (Jour 23-25)

Objectif : flows critiques couverts par des tests, prêt pour les premiers utilisateurs.

---

### #49 — Setup Vitest + tests schemas
- **Priorité :** MED
- **Dépend de :** #01, #11
- **Estimation :** 1.5h
- **Quoi faire :**
  - `pnpm add -D vitest @vitejs/plugin-react`
  - `vitest.config.ts`
  - Scripts : `"test": "vitest"`, `"test:run": "vitest run"`
  - Tests unitaires pour TOUS les schemas Zod (cas valides + invalides)
  - Ajouter Vitest au CI GitHub Actions
- **Livrable :** Tests schemas verts, intégrés au CI

---

### #50 — Setup Playwright
- **Priorité :** MED
- **Dépend de :** #01
- **Estimation :** 45min
- **Quoi faire :**
  - `pnpm add -D @playwright/test && pnpm playwright install`
  - `playwright.config.ts` (base URL, projects: chromium + mobile)
  - Script `"test:e2e": "playwright test"`
- **Livrable :** Playwright prêt

---

### #51 — Test e2e: auth flow
- **Priorité :** MED
- **Dépend de :** #50, #23
- **Estimation :** 2h
- **Quoi faire :**
  - `tests/e2e/auth.spec.ts` :
    - Signup → message email
    - Login valide → redirect dashboard
    - Login invalide → erreur
    - Logout → redirect login
    - Accès /app/* sans auth → redirect login
- **Livrable :** Tests auth verts

---

### #52 — Test e2e: flow candidature
- **Priorité :** MED
- **Dépend de :** #50, #37
- **Estimation :** 2h
- **Quoi faire :**
  - `tests/e2e/application.spec.ts` :
    - Login figurant → castings → postuler → vérifier dans "Mes candidatures" (pending)
    - Vérifier impossible de postuler deux fois
- **Livrable :** Tests candidature verts

---

### #53 — Test e2e: flow production
- **Priorité :** MED
- **Dépend de :** #50, #39
- **Estimation :** 2h
- **Quoi faire :**
  - `tests/e2e/production.spec.ts` :
    - Login production → créer projet → ajouter casting → voir candidatures → confirmer → vérifier status
- **Livrable :** Tests production verts

---

## Récap

| Sprint | Contenu | Tickets | Estimation |
|--------|---------|---------|------------|
| 0 | Fondations | #01-#10 | ~6.5h |
| 1 | Base de données | #11-#18 | ~7h |
| 2 | Auth | #19-#26 | ~13h |
| 3 | Profil + Projets | #27-#33 | ~12.5h |
| 4 | Candidatures | #34-#40 | ~13h |
| 5 | Emails + Covoit | #41-#43 | ~6.5h |
| 6 | Landing + SEO + PWA | #44-#48 | ~11h |
| 7 | Tests | #49-#53 | ~8.5h |
| **TOTAL** | | **53 tickets** | **~78h** |

À ~15h/semaine → **~5 semaines de dev**.
À ~20h/semaine → **~4 semaines de dev**.

---

## Graphe de dépendances simplifié

```
#01 Init repo
├── #02 Tailwind + shadcn
├── #03 Structure + types
├── #04 Biome
├── #05 Supabase
│   └── #06 Drizzle
│       └── #12-#16 DB schemas
│           └── #17 RLS
│               └── #18 Seeds
├── #07 Providers (Query + Zustand)
├── #08 Vercel
│   └── #09 CI
└── #10 Sentry + PostHog

#11 Zod schemas (indépendant, fait tôt)

#05 + #12 → #19 Signup
#05 + #12 → #20 Login/Logout
#05 → #21 Reset password
#19 + #20 → #22 Middleware
#02 + #19-#21 → #23 Pages auth
#05 + #07 + #12 → #24 useCurrentUser
#02 + #07 + #24 → #25 App shell
#25 → #26 Dashboard

#05 + #12 → #27 Actions profiles
#24 + #27 → #28-#29 Profil figurant UI
#05 + #13 + #14 → #30 Actions projets/castings
#25 + #30 → #31-#33 Projets UI

#30 → #34 Castings public
#24 + #34 → #35 Castings filtres
#35 → #36 Postuler
#36 → #37 Mes candidatures
#33 + #36 → #38 Liste candidats
#38 → #39 Confirmer/Refuser
#29 + #38 → #40 Fiche candidat

#41 Resend + templates (indépendant)
#19 + #39 + #41 → #42 Brancher emails
#25 + #16 → #43 Covoiturage

#02 → #44-#46 Landing pages
#34 + #44-#46 → #47 SEO technique
#48 PWA (indépendant)

#49-#53 Tests (après les features)
```

---

## Règles

1. **Jamais commencer un ticket sans dépendances terminées.**
2. **Un ticket = une branche = une PR.**
3. **Conventional commits** : `feat: #XX description`.
4. **Tester manuellement avant merge.**
5. **Montrer à ton ami via l'URL staging à chaque fin de sprint.**
6. **Si un ticket prend plus de 2x l'estimation, le découper.**
