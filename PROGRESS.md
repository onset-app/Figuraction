# Progress — FigurAction

Last updated: 2026-07-16 (ticket #36)

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
- [x] #22 — Middleware auth + role routing 〔opus〕 (protège /app/*, redirige auth pages si loggé, role gating projets/candidats→production, admin→admin; rôle lu depuis profiles via RLS.)
- [x] #23 — Pages auth UI (login + signup + forgot) 〔opus〕 ((auth) route group + layout centré; react-hook-form + zodResolver; erreurs inline; signup → écran "Vérifiez votre email", forgot → message neutre; les 4 pages rendent 200. Flow submit complet couvert par e2e #51)
- [x] #24 — Hook useCurrentUser 〔opus〕 (TanStack Query; expose user/profile/role/isLoading/isAuthenticated; select supabase alias snake→camel; invalide sur onAuthStateChange. Exercé en live par #25)
- [x] #25 — App shell: sidebar + topbar + mobile nav 〔opus〕 (nav-config partagé filtré par rôle; sidebar desktop collapsible via ui-store; topbar titre + drawer mobile (Sheet Base UI, contrôlé — pas de asChild); bottom tabs mobile; RoleGuard 403. Rendu live via #26)
- [x] #26 — Dashboard 〔opus〕 (page role-aware avec raccourcis cards; 1er consommateur live de #24/#25. FIX: `(app)` route group → segment littéral `app/` — les parens stripaient l'URL donc /app/dashboard 404ait vs le matcher proxy + nav. Vérifié via build + redirect 307)

## Sprint 3 — Profil + Projets + Castings (/clear avant ce sprint)

- [x] #27 — Server actions: profiles 〔opus〕 (updateProfile via client RLS-scoped; uploadPhoto via service-role → path `{userId}/profile.jpg` dérivé de l'user auth (jamais du client), upsert + `?v=` cache-bust; empty strings → null; revalidatePath /app/profil. Bucket `avatars` créé (public read) — upload en service-role donc pas besoin de write policy)
- [x] #28 — Profil figurant: formulaire + upload photo 〔sonnet〕 (profile-form.tsx: RHF+zodResolver, form values typed `z.input<profileSchema>`→submit receives coerced `ProfileInput` since `age` uses z.coerce; photo-upload.tsx: optimistic local object-URL preview, reverts on error; file-upload.tsx: generic label-wrapped hidden-input primitive, reusable. FIX: Base UI's `SelectValue` renders the raw enum value unless given a children render-prop — added one to show French labels. Added `<Toaster />` to root layout (sonner) since no page mounted it yet. Verified live end-to-end via Playwright: login → photo upload → form submit, all confirmed by toasts and persisted values)
- [x] #29 — Profil figurant: page vue + édition 〔sonnet〕 (src/app/app/profil/page.tsx; toggle vue/édition via useState; defaultValues construits depuis useCurrentUser avec isExperienceLevel guard car profile.experience est `string | null` en DB; onSuccess/onUploaded invalident CURRENT_USER_QUERY_KEY pour refléter les changements sans reload. EXPERIENCE_LABELS + isExperienceLevel déplacés de profile-form.tsx vers schemas/profile.ts pour être partagés. Vérifié live via Playwright : login → nav sidebar → vue → édition pré-remplie → save → vue mise à jour + toast)
- [x] #30 — Server actions: projects + castings 〔opus〕 (createProject/createCasting ajoutent un contrôle de rôle explicite — les policies RLS `..._manage_own` ne vérifient que la propriété, pas le rôle, donc un figurant pourrait sinon insérer une ligne dont il est "propriétaire"; update/delete/close s'appuient sur le filtrage RLS silencieux — 0 ligne affectée = accès refusé. FIX découvert en live-testing : `getPublicCastings` renvoyait aussi les castings non-publics du production connecté (RLS `castings_manage_own_project` donne au propriétaire une visibilité totale, indépendamment du statut) — `/app/castings` n'étant pas role-gated, une production pourrait y voir ses propres brouillons ; corrigé par une jointure explicite `projects!inner(status)` indépendante de qui appelle. Nouveau helper partagé `lib/supabase/roles.ts` (dédupliqué depuis proxy.ts). RE-REVIEW opus (le ticket avait été fait en sonnet) → 3 corrections : (1) `data as Project` était doublement faux — la lecture passe par supabase-js qui renvoie du snake_case + timestamps en ISO string, alors que le type Drizzle `Project` est camelCase + `Date` ; ajout de selects aliasés (`PROJECT_SELECT`/`CASTING_SELECT`) façon use-current-user + types `ProjectRow`/`CastingRow` honnêtes ; (2) `updated_at` n'était jamais bumpé sur update (pas de trigger DB, cf #27) — set explicite dans tous les updates ; (3) mapping d'erreur `createCasting` restreint au code RLS 42501. Vérifié en live : sortie camelCase, pas de décalage TZ sur les dates, updated_at bumpé, filtre âge (`.or().or()` = AND) correct — age=20→18-65 only, age=30→les deux, age=70→aucun)
- [x] #31 — Créer un projet (production) 〔sonnet〕 (project-form.tsx : RHF+zodResolver, même pattern `z.input`→`z.output` que ProfileForm pour les champs `z.coerce.date()` ; page `/app/projets/nouveau` avec RoleGuard production+admin — redondant avec le blocage serveur de proxy.ts (déjà vérifié en live : un figurant est redirigé vers /app/dashboard avant même que la page ne rende), mais gardé en défense en profondeur. FIX schéma découvert en live-testing (bloquant pour ce ticket) : `z.coerce.date().optional()` et `z.coerce.number().optional()` ne traitent PAS `""` comme "non renseigné" — un `<input type=\"date\">` ou `type=\"number\"` laissé vide soumet `\"\"`, que `.optional()` ne intercepte pas (il ne saute que `undefined`). Pour les dates ça plantait direct (\"Invalid date\") ; pour les nombres `Number('')` = `0`, qui passait silencieusement si le schéma autorise 0 (ex. `castingSchema.ageMin`) — corruption silencieuse. Ajout de `schemas/shared.ts` (`optionalDate`, `optionalNumber` — préprocessent `\"\"` → `undefined`) appliqué à `project.ts` (dates), `casting.ts` (dates + ageMin/ageMax, pas encore utilisé par une UI mais aurait cassé #33) et rétroactivement à `profile.ts` (age, déjà shippé en #28/#29 — masqué jusqu'ici par le `min(16)` qui transformait le bug en mauvais message d'erreur plutôt qu'en corruption silencieuse). Vérifié en live : soumission avec dates vides → projet créé avec `shootDateStart/End: null` (pas d'erreur, pas de `\"\"`) ; avec dates → valeurs correctes sans décalage TZ ; contrôle DB direct après coup pour confirmer). FIX post-hoc (re-check Sprint 3) : après création, le projet n'apparaissait pas dans la liste — `createProject` fait un `revalidatePath` (cache serveur) mais la liste lit le cache client TanStack Query (staleTime 60s), jamais invalidé ; le projet était bien en DB mais masqué jusqu'à expiration du staleTime. Ajout de `queryClient.invalidateQueries(MY_PROJECTS_QUERY_KEY)` dans project-form onSuccess (comme #29/#33 le faisaient déjà pour leurs queries). Seul createProject manquait cette invalidation.
- [x] #32 — Liste projets + hooks 〔sonnet〕 (use-projects.ts : TanStack Query autour de getMyProjects ; getMyProjects étendu avec un count agrégé PostgREST `castings(count)` plutôt qu'un fetch séparé par projet — expose `ProjectListItem.castingsCount` ; project-card.tsx : badge de statut, plage de dates formatée en manipulant directement la string `YYYY-MM-DD` (pas de `Date`/`Intl` — évite tout risque de décalage TZ comme repéré en #30/#31) ; page `/app/projets` : filtre par statut en state local (pas de store partagé, un seul consommateur), grid, empty state par statut, lien "Nouveau projet" stylé via `buttonVariants` sur `Link` plutôt qu'un `render` prop Base UI non éprouvé ailleurs dans le code. Vérifié en live : compteurs de castings corrects (2/2/0), dates sans décalage, filtres + empty state, boucle complète création→liste (le redirect de #31 vers /app/projets qui 404ait resout maintenant), figurant toujours redirigé par le rôle-gate serveur)
- [x] #33 — Détail projet + créer casting 〔opus〕 (page `/app/projets/[id]` client (useParams) : détail projet + grid castings + Dialog contrôlé "Ajouter un casting" ; nouvelle action `getProject(id)` scopée owner (`.eq(production_id)` + maybeSingle) plutôt que RLS seul — sinon `projects_select_open` laisserait une prod ouvrir le projet ouvert d'une autre prod dans cette vue de gestion ; hooks `useProject`/`useProjectCastings`, invalidation castings + MY_PROJECTS (le compteur de la liste) après ajout/fermeture ; casting-form.tsx (RHF+zodResolver, même z.input→z.output), casting-card.tsx (badge, places, tranche d'âge, "Fermer le casting" conditionnel aux ouverts). ROLE_TYPE_LABELS partagé ajouté à schemas/casting.ts. FIX découvert en live-testing (console error) : le Select roleType passait uncontrolled→controlled (field.value undefined au 1er render) → warning Base UI ; corrigé avec `value={field.value ?? null}` (null = placeholder tout en restant contrôlé), + même correctif rétroactif sur profile-form.tsx (experience null possible). Vérifié en live : nav liste→détail, ajout casting via dialog→grid mis à jour, fermeture→badge Fermé + bouton disparaît, toasts, 0 erreur console)

## Sprint 4 — Candidatures (/clear avant ce sprint)

- [x] #34 — Catalogue castings public (SSR/SEO) 〔sonnet〕 (`(public)/castings/page.tsx` Server Component réutilisant `getPublicCastings()` déjà écrit en #30 — pas de nouvelle query ; `components/castings/casting-card.tsx` nouveau (distinct du `casting-card.tsx` de gestion sous `projets/`, qui a un bouton "Fermer" et pas de lien) — prend un `href` fourni par l'appelant plutôt que de décider lui-même de la destination, pour être réutilisable tel quel par #35 (catalogue authentifié) ; la page vérifie `supabase.auth.getUser()` côté serveur pour choisir le CTA de chaque card : `/login` si non connecté, `/app/castings/[id]` si connecté (cette dernière route n'existe pas encore — livrée par #36, lien correct dès maintenant). Metadata SEO (title/description/OG) statique sur la page. Pas de page `(public)/castings/[id]` créée — hors périmètre du ticket, la CTA renvoie vers l'espace authentifié plutôt que vers une fiche publique. Vérifié en live : build + `pnpm check` propres, route `/castings` bien listée en ƒ (dynamic/SSR) dans l'output de build, fetch non-authentifié → 200, 2 castings ouverts affichés (les 4 autres du seed sont closed/draft ou sous projet non-open), titres/lieu/date/tranche d'âge/places rendus correctement, liens pointent vers `/login` en session anonyme)
- [x] #35 — Catalogue castings authentifié + filtres 〔opus〕 (`app/castings/page.tsx` client, réutilise le `CastingCard` de #34 tel quel (href `/app/castings/[id]` — la fiche+form de candidature arrivent en #36 ; pas de bouton "Postuler" séparé, la card entière EST la CTA, cohérent avec #34 et pour ne pas front-runner l'action `createApplication` de #36). Pas de RoleGuard : `/app/castings` est volontairement ouvert à tout authentifié (cf. rationale #30 — c'est pourquoi `getPublicCastings` a son inner-join `projects!inner(status)` indépendant de l'appelant, pour qu'une production n'y voie pas ses brouillons) ; le nav ne l'expose qu'aux figurant/admin mais la route reste accessible en direct. Pas de h1 dans la page — la topbar dérive déjà le titre "Castings" de nav-config. FIX (bloquant, découvert au build) : `use-castings.ts` existait déjà (créé en #33 : `useProjectCastings`/`projectCastingsQueryKey`, consommés par `projets/[id]`) — mon Write l'a d'abord écrasé, cassant le build ; restauré depuis git + fusionné avec le nouveau `useCastings(filters)`. Store filtres (`filters-store.ts`) : remplacé les placeholders `ageMin`/`ageMax` par un seul `age` (l'âge du figurant) — mapper une plage sur le filtre d'inclusion d'âge de `getPublicCastings` (garde les castings dont [ageMin,ageMax] accepte cette valeur) n'aurait aucun sens ; `casting-filters.tsx` : lieu (ilike), type de rôle (Select Base UI, sentinelle `"all"`→null, même render-prop SelectValue que casting-form), âge (number, garde `Number.isFinite` sinon null), date de tournage, + "Réinitialiser" conditionnel ; les filtres nourrissent la query key TanStack donc refetch auto par combinaison. Vérifié en live contre la DB seed (client anon, RLS expose les castings open comme prouvé en #34) : no-filter→2, location=Bruxelles→2, roleType=figurant→2, age=20→1 (seul le casting 18-65 ; le 25-55 exclu correctement), age=70→0 ; build + `pnpm check` propres, `/app/castings` bien listée, accès non-auth → 307 vers /login via proxy)
- [x] #36 — Postuler à un casting 〔opus〕 (page `app/castings/[id]/page.tsx` en Server Component (async `params` Next 16) : `getCastingDetail(id)` (nouvelle action dans castings.ts) → `notFound()` si null, + `getMyApplication(id)` pour l'état "déjà postulé" ; détail casting + bloc projet parent. `getCastingDetail` embarque le projet via `projects!inner(...)` — le `!inner` réutilise la RLS `projects_select_open` pour ré-imposer que le projet soit ouvert (un casting sous projet draft/closed n'est jamais postulable ici, quel que soit l'appelant) ; cast `as unknown as` car supabase-js (schéma non typé) infère l'embed to-one comme un array alors qu'au runtime c'est un objet. `actions/applications.ts` (nouveau) : `createApplication` prend `figurant_id` de la session (jamais du client) + status 'pending' (imposé aussi par la RLS `applications_insert_own_figurant` qui vérifie en plus le rôle figurant) ; garde explicite "casting ouvert" via lecture RLS-scoped (la policy insert ne checke PAS le statut du casting) ; contrainte UNIQUE(casting_id, figurant_id) = backstop anti-doublon race-safe → 23505 mappé "déjà postulé", 42501 → "seuls les figurants". `application-form.tsx` (client) : profil pré-rempli en lecture seule via useCurrentUser (nom/âge/ville/expérience — EXPERIENCE_LABELS+isExperienceLevel de #29), message libre optionnel (maxLength 2000), gate rôle≠figurant → message, état `appliedStatus` local pour flip immédiat sans reload + revalidatePath sur `/app/candidatures` et la fiche. Décision : pas de composant status-badge partagé ici (livré par #37) — libellé de statut inline. Vérifié en live contre la DB seed avec une VRAIE session figurant (signInWithPassword, RLS active) : insert valide (own id, pending) → OK ; 2e insert → bloqué 23505 ; insert forcé status=confirmed → bloqué 42501 (défense RLS confirmée, en plus du fait que l'action force pending) ; embed projet parent OK ("Les Ombres de Bruxelles") ; cleanup service-role. Build + `pnpm check` propres, `/app/castings/[id]` listée en ƒ, accès non-auth → 307 /login. NB: lucas.dubois avait déjà postulé aux 2 castings ouverts du seed → test basculé sur emma.lambert. Le lien depuis le catalogue #35 (`/app/castings/[id]`) résout désormais.)
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
