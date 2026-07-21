# ONSET

**La plateforme qui connecte les productions audiovisuelles et les figurants en Belgique.**

ONSET remplace le workflow actuel — groupes WhatsApp éparpillés, emails perdus, fichiers
Excel copiés à la main — par une plateforme centralisée pour la gestion des castings, les
candidatures, la communication, le covoiturage et (à venir) la signature de contrats.

> État actuel : **MVP fonctionnel de bout en bout**, en phase de test avant les finitions
> pré-lancement. Voir [PROGRESS.md](PROGRESS.md) pour l'avancement détaillé et la checklist
> pré-lancement, et [SPRINT-REVIEWS.md](SPRINT-REVIEWS.md) pour l'historique des revues.

---

## 1. Le produit (côté business)

### Le problème

Le casting de figurants en Belgique repose aujourd'hui sur des outils non spécialisés :
l'information circule dans plusieurs groupes WhatsApp, les candidatures se perdent dans les
boîtes mail, et les régisseurs gèrent des tournages à plusieurs dizaines de figurants avec
des tableurs recopiés à la main. Résultat : des castings ratés côté figurants, des heures
perdues côté production, et aucune visibilité sur le statut d'une candidature.

### La solution

Une plateforme unique, **B2B2C**, avec trois types d'utilisateurs :

- **Figurants** — créent un profil (photo, ville, âge, expérience), parcourent les castings
  ouverts, postulent en un clic, suivent le statut de leurs candidatures en temps réel, et
  organisent leur covoiturage vers le tournage.
- **Productions** — publient projets et castings, gèrent les candidatures (confirmer /
  refuser, à l'unité ou en masse), envoient convocations et emails automatiques, parcourent
  les profils de figurants.
- **Admins** — accès back-office à l'ensemble des données (phase 2).

### Ce qui fonctionne aujourd'hui (MVP)

| Domaine | Fonctionnalités |
|---|---|
| **Comptes & accès** | Inscription, connexion, mot de passe oublié, rôles (figurant / production / admin) |
| **Profils** | Profil figurant complet avec upload de photo, édition adaptée au rôle |
| **Castings** | Création de projets + castings côté production, publication, cycle de statut |
| **Candidatures** | Catalogue filtrable, candidature en un clic, suivi de statut **en temps réel** |
| **Gestion prod** | Liste des candidats, confirmer / refuser (unitaire & en masse), parcours des figurants |
| **Emails** | Bienvenue, confirmation, refus, convocation (automatiques) |
| **Covoiturage** | Publication et recherche de trajets entre figurants |
| **Public / SEO** | Landing page, pages SEO (« devenir figurant »), catalogue public indexable |
| **Mobile** | PWA installable, offline de base |
| **Sécurité** | Isolation des données par utilisateur/rôle (RLS), vérifiée par une suite d'assertions |

### Ce qui arrive en phase 2

Contrats & signature électronique (eIDAS), feuilles de service (call-sheets),
abonnements productions (Stripe), notifications push, back-office admin complet,
multi-langue (NL / EN).

---

## 2. L'architecture (côté technique)

### Stack

**Frontend**
- **Next.js 16** (App Router) — SSR pour les pages publiques (SEO) + SPA pour l'app authentifiée
- **TypeScript** en mode strict
- **Tailwind CSS** + **shadcn/ui** (composants copiés, sur base Base UI)
- **TanStack Query** — état serveur (cache, refetch, updates optimistes)
- **Zustand** — état client léger (UI, filtres)
- **react-hook-form + Zod** — formulaires et validation partagée front ↔ back
- **Serwist** — service worker / PWA
- **Biome** — lint + format (remplace ESLint + Prettier)

**Backend**
- **Supabase** — PostgreSQL, Auth, Storage, Realtime
- **Drizzle ORM** — schéma et requêtes typés
- **Next.js Server Actions** — mutations (candidater, éditer un profil, créer un projet…)
- **Next.js Route Handlers** — endpoints spécifiques (callback OAuth/email, sitemap…)
- **Row Level Security (RLS)** — la frontière de sécurité : toute la protection des données
  vit dans les policies Postgres, appliquées à chaque requête

**Services**
- **Resend + React Email** — emails transactionnels applicatifs
- **Sentry** — monitoring d'erreurs
- **PostHog** — analytics produit
- *(phase 2 : Stripe, DocuSeal, react-pdf)*

**Infra**
- **Vercel** — hébergement, déploiements par PR
- **Supabase Cloud** — base, auth, storage, realtime managés
- **GitHub Actions** — CI (lint, build, assertions RLS)

### Principes d'architecture

- **La sécurité repose sur la RLS, pas sur le code applicatif.** La clé anon Supabase est
  publique ; ce sont les policies Postgres (par ligne *et* par colonne) qui garantissent que
  chaque utilisateur ne peut lire/écrire que ce à quoi il a droit. Une suite d'assertions
  (`pnpm db:verify-rls`) rejoue en live ces invariants (pas d'escalade de rôle, isolation
  entre productions, statuts non falsifiables…).
- **Les Server Actions sont des frontières de confiance** : toute entrée est re-validée
  côté serveur avec Zod, l'identité vient toujours de la session (jamais du client).
- **Source de vérité unique pour les enums** : les valeurs (`types/enums.ts`) pilotent à la
  fois les types TS, les schémas Zod et les contraintes CHECK de la base.
- **Emails best-effort** : un échec d'envoi ne casse jamais l'action déclenchante (il est
  remonté à Sentry, pas à l'utilisateur).

### Structure du dépôt (extrait)

```
src/
├── app/                 # Routes Next (public, auth, /app authentifié, api)
├── actions/             # Server Actions (auth, applications, projects, castings, emails…)
├── components/          # UI (ui/ shadcn, layout/, feature folders)
├── db/                  # Drizzle : schema/, seed, apply-rls, verify-rls
├── hooks/               # Hooks TanStack Query par domaine
├── schemas/             # Schémas Zod partagés front ↔ back
├── lib/                 # Clients Supabase/Resend, helpers, env
└── types/               # Enums et types partagés
supabase/migrations/     # 007_rls_policies.sql (RLS, grants, triggers, publication realtime)
```

Voir [CLAUDE.md](CLAUDE.md) pour le détail complet de la structure et du schéma de données.

---

## 3. Démarrage

Prérequis : **Node 20.12+**, **pnpm**, un projet **Supabase** (les variables dans
`.env.example`).

```bash
pnpm install
cp .env.example .env.local        # renseigner Supabase, Resend, NEXT_PUBLIC_APP_URL…

pnpm db:push                      # crée le schéma ET applique la RLS (007) automatiquement
pnpm db:seed                      # données de démo (comptes de test, mot de passe Password123!)
pnpm db:verify-rls                # rejoue les 17 assertions de sécurité (optionnel)

pnpm dev                          # http://localhost:3000
```

### Scripts utiles

| Script | Rôle |
|---|---|
| `pnpm dev` / `pnpm build` / `pnpm start` | Dev / build (inclut le service worker) / prod |
| `pnpm check` / `pnpm check:fix` | Lint + format (Biome) |
| `pnpm db:push` | Migration schéma **+ réapplication RLS** (⚠️ `drizzle-kit push` seul supprime les policies) |
| `pnpm db:push:raw` | Push nu, sans RLS (à éviter) |
| `pnpm db:rls` | Réapplique `007_rls_policies.sql` et vérifie que la RLS est active partout |
| `pnpm db:seed` | Peuple la base (⚠️ efface les tables d'abord — jamais sur prod) |
| `pnpm db:verify-rls` | Assertions de sécurité en live (base seedée requise) |
| `pnpm db:provision` | `db:push` + `db:seed` + `db:verify-rls` d'un coup |

> **Discipline base de données** : ne jamais lancer `drizzle-kit push` seul — il **supprime
> toutes les policies RLS**. Le script `pnpm db:push` enchaîne automatiquement `db:rls` pour
> éviter ce piège.

---

## 4. Conventions

- Code, commentaires et logs en **anglais** ; textes d'interface en **français**.
- TypeScript strict — pas de `any`.
- Fichiers en `kebab-case`, composants en `PascalCase`, colonnes DB en `snake_case`.
- Commits conventionnels (`feat:`, `fix:`, `chore:`…), une branche = une PR.
- Ne jamais committer de secrets ou de fichier `.env`.

Voir [CLAUDE.md](CLAUDE.md) pour les conventions complètes.
