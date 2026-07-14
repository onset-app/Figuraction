# CLAUDE.md — ONSET Project Brief

## Project Overview

ONSET is a B2B2C SaaS platform connecting film/TV productions with extras (figurants) in Belgium. It replaces the current fragmented workflow (WhatsApp groups, scattered emails, Excel spreadsheets) with a centralized platform for casting management, applications, communication, carpooling, and contract signing.

**Current state:** Legacy codebase in vanilla HTML/CSS/JS + Supabase. No real users in production. Full rebuild required.

**Target users:**
- **Extras (figurants):** Browse castings, apply, track applications, manage profile, carpool to shoots
- **Productions:** Post projects/castings, manage candidates, send confirmation/rejection emails, generate call-sheets
- **Admins:** Full back-office access to all data

---

## Tech Stack

### Frontend
- **Next.js 16** (App Router) — SSR for public SEO pages + SPA for authenticated app. Note: the root request handler uses the `proxy.ts` convention (the old `middleware.ts` name is deprecated in Next 16)
- **TypeScript** — strict mode enabled
- **Tailwind CSS** — utility-first styling
- **shadcn/ui** — component library (copy-paste, no dependency lock-in)
- **TanStack Query** — server state management (cache, refetch, optimistic updates)
- **Zustand** — lightweight client state (UI state, filters, current user)
- **react-hook-form + Zod** — form handling + shared validation schemas (front ↔ back)
- **next-intl** — i18n ready (FR default, NL/EN later)
- **Serwist** — PWA service worker management
- **Web Push API** — native push notifications
- **Biome** — linter + formatter (replaces ESLint + Prettier)

### Backend
- **Supabase** — PostgreSQL database, Auth, Storage, Realtime, Edge Functions
- **Drizzle ORM** — type-safe SQL queries + migrations
- **Next.js Server Actions** — simple mutations (apply, update profile, create project)
- **Next.js API Routes** — complex endpoints (Stripe webhooks, OAuth callbacks)
- **Supabase Edge Functions** — triggered logic (send emails, generate PDFs, cron reminders)

### Services
- **Resend + React Email** — transactional emails (confirmation, rejection, convocation)
- **Stripe Billing** — production subscriptions (implement when monetizing)
- **react-pdf (@react-pdf/renderer)** — PDF generation (call-sheets, contracts, export profiles)
- **DocuSeal** — electronic contract signing (eIDAS compliant)

### Infrastructure
- **Vercel** — hosting, auto-deploy from Git, preview deployments per PR
- **Supabase Cloud** — managed DB, auth, storage, realtime
- **Cloudflare** — DNS, cache, DDoS protection
- **GitHub Actions** — CI/CD (lint, test, build, deploy)
- **Sentry** — error monitoring in production
- **PostHog** — product analytics, feature flags, session replays

### Testing
- **Vitest** — unit tests (business logic, validation, utils)
- **Playwright** — e2e tests on critical flows (signup → apply → confirm)

---

## Project Structure

```
onset/
├── CLAUDE.md                          # This file
├── CODING-PLAN.md
├── PROGRESS.md
├── next.config.ts
├── tailwind.config.ts
├── drizzle.config.ts
├── biome.json
├── package.json
├── tsconfig.json
│
├── public/
│   ├── manifest.json                  # PWA manifest
│   ├── icons/                         # App icons (192, 512)
│   └── images/                        # Static images
│
├── src/
│   ├── app/                           # Next.js App Router
│   │   ├── layout.tsx                 # Root layout (fonts, providers, metadata)
│   │   ├── page.tsx                   # Landing page (public, SSG)
│   │   ├── globals.css                # Tailwind imports + CSS variables
│   │   │
│   │   ├── (public)/                  # Public pages (SEO, no auth)
│   │   │   ├── castings/
│   │   │   │   ├── page.tsx           # Public casting catalog
│   │   │   │   └── [id]/page.tsx      # Individual casting page
│   │   │   ├── devenir-figurant/
│   │   │   │   └── page.tsx           # SEO landing: "devenir figurant belgique"
│   │   │   ├── pour-les-productions/
│   │   │   │   └── page.tsx           # B2B landing page
│   │   │   └── blog/
│   │   │       ├── page.tsx           # Blog index
│   │   │       └── [slug]/page.tsx    # Blog post (MDX)
│   │   │
│   │   ├── (auth)/                    # Auth pages (no sidebar/nav)
│   │   │   ├── login/page.tsx
│   │   │   ├── signup/page.tsx
│   │   │   ├── forgot-password/page.tsx
│   │   │   └── layout.tsx             # Centered card layout
│   │   │
│   │   ├── app/                       # Authenticated app (with sidebar/nav) — real /app/* URL segment (not a route group, so proxy /app/:path* and nav links resolve)
│   │   │   ├── layout.tsx             # App shell: sidebar, topbar, role-based nav
│   │   │   ├── dashboard/page.tsx     # Home after login (role-dependent)
│   │   │   │
│   │   │   ├── castings/             # [figurant] Browse + apply
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── candidatures/         # [figurant] My applications tracker
│   │   │   │   └── page.tsx
│   │   │   ├── profil/               # [figurant + production] Edit profile
│   │   │   │   └── page.tsx
│   │   │   ├── covoiturage/          # [figurant] Carpooling
│   │   │   │   └── page.tsx
│   │   │   ├── contrats/             # [figurant] My contracts
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── projets/              # [production] Manage projects
│   │   │   │   ├── page.tsx           # List projects
│   │   │   │   ├── nouveau/page.tsx   # Create project form
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx       # Project detail
│   │   │   │       └── candidats/page.tsx  # Candidates for this project
│   │   │   ├── candidats/            # [production] Browse all candidates
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx      # Candidate profile detail
│   │   │   │
│   │   │   └── admin/                # [admin] Back-office
│   │   │       ├── page.tsx           # Admin dashboard
│   │   │       ├── utilisateurs/page.tsx
│   │   │       ├── projets/page.tsx
│   │   │       └── parametres/page.tsx
│   │   │
│   │   └── api/                       # API Routes
│   │       ├── webhooks/
│   │       │   └── stripe/route.ts    # Stripe webhook handler
│   │       └── cron/
│   │           └── reminders/route.ts # Scheduled notification reminders
│   │
│   ├── components/
│   │   ├── ui/                        # shadcn/ui components (button, card, dialog, etc.)
│   │   ├── layout/                    # App shell components
│   │   │   ├── sidebar.tsx
│   │   │   ├── topbar.tsx
│   │   │   ├── mobile-nav.tsx
│   │   │   └── role-guard.tsx         # Client-side role check wrapper
│   │   ├── castings/
│   │   │   ├── casting-card.tsx
│   │   │   ├── casting-list.tsx
│   │   │   ├── casting-filters.tsx
│   │   │   └── application-form.tsx
│   │   ├── projets/
│   │   │   ├── project-card.tsx
│   │   │   ├── project-form.tsx
│   │   │   └── candidate-list.tsx
│   │   ├── profil/
│   │   │   ├── profile-form.tsx
│   │   │   ├── photo-upload.tsx
│   │   │   └── availability-calendar.tsx
│   │   ├── covoiturage/
│   │   │   ├── carpool-form.tsx
│   │   │   └── carpool-list.tsx
│   │   └── shared/
│   │       ├── status-badge.tsx       # Application status (pending/confirmed/rejected)
│   │       ├── empty-state.tsx
│   │       ├── loading-skeleton.tsx
│   │       └── file-upload.tsx
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts              # Browser Supabase client
│   │   │   ├── server.ts              # Server-side Supabase client
│   │   │   └── middleware.ts          # Auth session refresh middleware
│   │   ├── stripe/
│   │   │   └── client.ts              # Stripe SDK init
│   │   ├── resend/
│   │   │   └── client.ts              # Resend SDK init
│   │   └── utils.ts                   # Generic helpers (cn, formatDate, etc.)
│   │
│   ├── db/
│   │   ├── schema/                    # Drizzle schema definitions
│   │   │   ├── profiles.ts
│   │   │   ├── projects.ts
│   │   │   ├── castings.ts
│   │   │   ├── applications.ts
│   │   │   ├── carpools.ts
│   │   │   ├── contracts.ts
│   │   │   └── index.ts               # Re-export all schemas
│   │   ├── migrations/                # Drizzle migration files (auto-generated)
│   │   └── seed.ts                    # Seed data for development
│   │
│   ├── actions/                       # Next.js Server Actions
│   │   ├── auth.ts                    # signup, login, logout, resetPassword
│   │   ├── applications.ts            # apply, withdraw, updateStatus
│   │   ├── projects.ts                # createProject, updateProject, deleteProject
│   │   ├── castings.ts                # createCasting, updateCasting
│   │   ├── profiles.ts                # updateProfile, uploadPhoto
│   │   ├── carpools.ts                # createCarpool, markFull, deleteCarpool
│   │   └── emails.ts                  # sendConfirmation, sendRejection, sendConvocation
│   │
│   ├── hooks/                         # Custom React hooks
│   │   ├── use-current-user.ts        # Current authenticated user + role
│   │   ├── use-applications.ts        # TanStack Query: fetch/mutate applications
│   │   ├── use-projects.ts
│   │   ├── use-castings.ts
│   │   └── use-carpools.ts
│   │
│   ├── stores/                        # Zustand stores
│   │   ├── ui-store.ts                # Sidebar open/closed, modals, mobile nav
│   │   └── filters-store.ts           # Casting/candidate filters state
│   │
│   ├── schemas/                       # Zod validation schemas (shared front ↔ back)
│   │   ├── profile.ts
│   │   ├── project.ts
│   │   ├── casting.ts
│   │   ├── application.ts
│   │   ├── carpool.ts
│   │   └── auth.ts
│   │
│   ├── emails/                        # React Email templates
│   │   ├── welcome.tsx
│   │   ├── application-received.tsx
│   │   ├── application-confirmed.tsx
│   │   ├── application-rejected.tsx
│   │   └── convocation.tsx
│   │
│   ├── types/                         # Shared TypeScript types
│   │   ├── database.ts                # Inferred from Drizzle schema
│   │   ├── auth.ts
│   │   └── enums.ts                   # UserRole, ApplicationStatus, etc.
│   │
│   └── proxy.ts                       # Next.js proxy (ex-middleware): auth check, redirects, role routing
│
├── supabase/
│   ├── config.toml                    # Supabase local dev config
│   ├── seed.sql                       # Initial seed data
│   └── migrations/                    # Supabase SQL migrations (RLS policies)
│       ├── 001_create_profiles.sql
│       ├── 002_create_projects.sql
│       ├── 003_create_castings.sql
│       ├── 004_create_applications.sql
│       ├── 005_create_carpools.sql
│       ├── 006_create_contracts.sql
│       └── 007_rls_policies.sql
│
├── tests/
│   ├── unit/                          # Vitest unit tests
│   │   ├── schemas/                   # Zod schema validation tests
│   │   └── utils/                     # Utility function tests
│   └── e2e/                           # Playwright e2e tests
│       ├── auth.spec.ts               # Signup → login → logout
│       ├── application.spec.ts        # Browse casting → apply → track status
│       └── production.spec.ts         # Create project → review candidates → confirm
│
└── .github/
    └── workflows/
        ├── ci.yml                     # Lint + test + build on PR
        └── deploy.yml                 # Deploy to Vercel on merge to main
```

---

## Database Schema

### Core Tables

#### `profiles`
Extends Supabase auth.users. Stores user metadata.
```sql
id              UUID PRIMARY KEY REFERENCES auth.users(id)
email           TEXT NOT NULL UNIQUE
role            TEXT NOT NULL CHECK (role IN ('figurant', 'production', 'admin'))
first_name      TEXT NOT NULL
last_name       TEXT NOT NULL
phone           TEXT
city            TEXT
age             INTEGER
bio             TEXT
experience      TEXT CHECK (experience IN ('debutant', 'premiere_fois', 'confirme'))
photo_url       TEXT                    -- Supabase Storage URL
available       BOOLEAN DEFAULT true
created_at      TIMESTAMPTZ DEFAULT now()
updated_at      TIMESTAMPTZ DEFAULT now()
```

#### `projects`
Created by productions. Contains one or more castings.
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
production_id   UUID NOT NULL REFERENCES profiles(id)   -- the production user
title           TEXT NOT NULL
description     TEXT
shoot_location  TEXT
shoot_date_start DATE
shoot_date_end  DATE
status          TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'open', 'closed', 'archived'))
created_at      TIMESTAMPTZ DEFAULT now()
updated_at      TIMESTAMPTZ DEFAULT now()
```

#### `castings`
Specific role/casting call within a project.
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE
title           TEXT NOT NULL            -- e.g. "Passants pour scène de marché"
description     TEXT
role_type       TEXT CHECK (role_type IN ('figurant', 'acteur', 'doublure'))
age_min         INTEGER
age_max         INTEGER
location        TEXT
shoot_date      DATE
spots_available INTEGER DEFAULT 1
status          TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed'))
created_at      TIMESTAMPTZ DEFAULT now()
updated_at      TIMESTAMPTZ DEFAULT now()
```

#### `applications`
A figurant applies to a casting.
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
casting_id      UUID NOT NULL REFERENCES castings(id) ON DELETE CASCADE
figurant_id     UUID NOT NULL REFERENCES profiles(id)
status          TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected', 'withdrawn'))
message         TEXT                     -- optional note from figurant
reviewed_at     TIMESTAMPTZ
reviewed_by     UUID REFERENCES profiles(id)  -- production user who reviewed
created_at      TIMESTAMPTZ DEFAULT now()
updated_at      TIMESTAMPTZ DEFAULT now()

UNIQUE(casting_id, figurant_id)          -- prevent duplicate applications
```

#### `carpools`
Carpool offers between extras for a specific shoot.
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
project_id      UUID REFERENCES projects(id)  -- optional link to project
driver_id       UUID NOT NULL REFERENCES profiles(id)
driver_name     TEXT NOT NULL
departure_area  TEXT NOT NULL
departure_date  DATE NOT NULL
departure_time  TIME NOT NULL
seats_available INTEGER NOT NULL CHECK (seats_available >= 0)
contact_method  TEXT CHECK (contact_method IN ('email', 'phone'))
contact_value   TEXT NOT NULL
is_full         BOOLEAN DEFAULT false
created_at      TIMESTAMPTZ DEFAULT now()
```

#### `contracts`
Participation contracts for confirmed extras.
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
application_id  UUID NOT NULL REFERENCES applications(id)
figurant_id     UUID NOT NULL REFERENCES profiles(id)
project_id      UUID NOT NULL REFERENCES projects(id)
contract_url    TEXT                     -- Supabase Storage URL of signed PDF
signed_at       TIMESTAMPTZ
status          TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'signed', 'expired'))
created_at      TIMESTAMPTZ DEFAULT now()
```

### Row Level Security (RLS) Policies

All tables MUST have RLS enabled. Key rules:

```sql
-- Profiles: users can read their own, productions can read figurant profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Productions can view figurant profiles" ON profiles FOR SELECT
  USING (role = 'figurant' AND EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('production', 'admin')
  ));

-- Applications: figurants see their own, productions see applications to their castings
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Figurants see own applications" ON applications FOR SELECT
  USING (figurant_id = auth.uid());
CREATE POLICY "Productions see applications to their castings" ON applications FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM castings c
    JOIN projects p ON c.project_id = p.id
    WHERE c.id = applications.casting_id AND p.production_id = auth.uid()
  ));

-- Admin: full access to everything
CREATE POLICY "Admin full access" ON profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
-- Repeat admin policy for all tables
```

---

## Features — MVP (Phase 1)

Build in this order. Each feature is a vertical slice (DB + backend + frontend).

### 1. Auth & Onboarding
- [ ] Supabase Auth: email/password signup + login
- [ ] Role selection at signup (figurant / production)
- [ ] Email verification flow
- [ ] Password reset flow
- [ ] Protected routes middleware (redirect to /login if not authenticated)
- [ ] Role-based routing (/app/projets only visible to productions, etc.)

### 2. Figurant Profile
- [ ] Profile creation form (name, phone, city, age, experience level, bio)
- [ ] Photo upload to Supabase Storage (face + full body)
- [ ] Profile view page (public to productions)
- [ ] Profile edit page
- [ ] Zod validation on all fields

### 3. Projects & Castings (Production Side)
- [ ] Create project form (title, description, location, dates)
- [ ] Create casting within a project (role type, age range, spots, date)
- [ ] List my projects with status
- [ ] Project detail page with list of associated castings
- [ ] Open/close castings

### 4. Casting Catalog (Figurant Side)
- [ ] Public casting list page (/castings — SSR for SEO)
- [ ] Authenticated casting list with filters (location, age, date, role type)
- [ ] Casting detail page
- [ ] "Apply" button → application form (pre-filled from profile)
- [ ] Prevent duplicate applications (DB unique constraint)

### 5. Application Management
- [ ] Figurant: "My Applications" page with status badges (pending/confirmed/rejected)
- [ ] Production: candidate list per casting with profile preview
- [ ] Production: confirm / reject candidates (update status)
- [ ] Automated email on status change (Resend + React Email)
- [ ] Supabase Realtime: status updates without page refresh

### 6. Carpooling
- [ ] Create carpool offer form (project, departure, date, time, seats, contact)
- [ ] List available carpools (filter by project/date)
- [ ] Mark as full
- [ ] Delete own carpool
- [ ] Contact driver (open email/phone)

### 7. Landing Page & SEO
- [ ] Public landing page (hero, features, CTA for productions + figurants)
- [ ] /pour-les-productions — B2B landing
- [ ] /devenir-figurant — SEO page targeting "figurant belgique" keywords
- [ ] Open Graph + meta tags on all public pages
- [ ] sitemap.xml + robots.txt

### 8. PWA
- [ ] Web app manifest (icons, theme color, display: standalone)
- [ ] Service worker via Serwist (cache strategy for assets + API)
- [ ] Offline fallback page
- [ ] Install prompt (Add to Home Screen)

---

## Features — Phase 2 (Post-MVP)

### 9. Push Notifications
- [ ] Web Push API setup
- [ ] Notify figurant: "Candidature acceptée", "Nouvelle convocation"
- [ ] Notify production: "Nouvelle candidature reçue"
- [ ] Notification preferences page

### 10. Contracts & E-Signature
- [ ] Generate participation contract PDF (react-pdf)
- [ ] DocuSeal integration for e-signature
- [ ] Store signed PDF in Supabase Storage
- [ ] Contract status tracking (pending/signed)

### 11. Call-Sheets
- [ ] Production generates call-sheet PDF per project (confirmed extras, location, times)
- [ ] Email call-sheet to all confirmed extras
- [ ] Download as PDF

### 12. Payments (Stripe)
- [ ] Stripe Billing integration for production subscriptions
- [ ] Pricing page with plans
- [ ] Checkout flow (Stripe Checkout)
- [ ] Webhook handler for payment events
- [ ] Subscription status in DB → gate features accordingly

### 13. Admin Back-Office
- [ ] Admin dashboard: key metrics (users, applications, active projects)
- [ ] User management (list, view, deactivate)
- [ ] Project oversight
- [ ] System settings

### 14. Advanced Features (Later)
- [ ] Availability calendar for extras
- [ ] Import/export Excel (candidate lists, project data)
- [ ] Advanced search & filters for productions (find extras by criteria)
- [ ] Figurant premium profile (boosted visibility)
- [ ] Multi-language support (NL, EN)
- [ ] Analytics dashboard for productions (application rates, fill rates)

---

## Conventions & Rules

### Code Style
- All code, comments, variable names, function names, log messages in **English**
- UI text (labels, buttons, messages) in **French** (via next-intl translation keys)
- Strict TypeScript — no `any`, no `@ts-ignore` unless absolutely necessary with comment explaining why
- Biome for formatting and linting — run on save and in CI
- Functional components only, no class components
- Prefer Server Components by default, add "use client" only when needed

### Naming Conventions
- Files: `kebab-case.ts` / `kebab-case.tsx`
- Components: `PascalCase` export, `kebab-case` filename
- DB columns: `snake_case`
- TypeScript types/interfaces: `PascalCase`
- Zod schemas: `camelCase` with `Schema` suffix (e.g., `profileSchema`)
- Server Actions: `camelCase` verb-first (e.g., `createProject`, `updateApplicationStatus`)

### Git
- Branch naming: `feat/feature-name`, `fix/bug-name`, `chore/task-name`
- Conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`
- PR required for merge to main (even solo — forces CI to run)
- Never commit secrets, .env files, or Supabase keys

### Security
- RLS enabled on ALL tables — no exceptions
- All user input validated with Zod before touching the DB
- All dynamic content rendered with proper escaping (React handles this by default, but no dangerouslySetInnerHTML with user data)
- Supabase anon key is public — all security relies on RLS policies
- Server-side auth check in proxy.ts (Next.js proxy convention, ex-middleware.ts) for all /app/* routes
- Rate limiting on auth endpoints (Supabase handles this)

### Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=         # Server-side only, never exposed to client
RESEND_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
SENTRY_DSN=
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_APP_URL=               # https://onset.app or localhost
```

---

## Getting Started

```bash
# Install dependencies
pnpm install

# Setup environment variables
cp .env.example .env.local
# Fill in Supabase, Resend, Stripe keys

# Start Supabase locally (requires Docker)
pnpm supabase start

# Run DB migrations
pnpm drizzle-kit push

# Seed development data
pnpm db:seed

# Start dev server
pnpm dev

# Run tests
pnpm test          # Vitest unit tests
pnpm test:e2e      # Playwright e2e tests

# Lint & format
pnpm check         # Biome check
pnpm check:fix     # Biome auto-fix
```

---

## Priority Order for Implementation

1. **Project setup** — Next.js + TS + Tailwind + shadcn + Supabase + Drizzle scaffold
2. **DB schema + migrations + RLS** — All tables, policies, seed data
3. **Auth flow** — Signup, login, logout, middleware, role routing
4. **Figurant profile** — CRUD + photo upload
5. **Projects + castings** — Production CRUD
6. **Casting catalog + applications** — Figurant browsing + applying
7. **Application management** — Status updates + email notifications
8. **Carpooling** — CRUD + list
9. **Landing page + SEO pages** — Public-facing pages
10. **PWA setup** — Manifest, service worker, install prompt
