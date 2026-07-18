-- 007_rls_policies.sql
-- Row Level Security for every ONSET table.
--
-- Sits on top of the Drizzle-managed schema (profiles, projects, castings,
-- applications, carpools, contracts). Each table gets RLS enabled plus
-- per-role policies. Only the anon/authenticated Supabase roles are
-- constrained here; the service_role and the postgres superuser bypass RLS,
-- which is what server-side operations rely on (signup profile insert with
-- the service client, contract generation, and the seed script).
--
-- Re-runnable: every policy is dropped-if-exists before creation and the
-- helper functions use CREATE OR REPLACE.
--
-- Every call to auth.uid() and to the helper functions below is wrapped in a
-- scalar subquery — (select auth.uid()), (select public.is_admin()), etc. This
-- is the Supabase-recommended pattern: it forces the STABLE result to be
-- evaluated once per statement as an InitPlan instead of per-row, which both
-- avoids a per-row function-call cost and sidesteps stale-evaluation of these
-- SECURITY DEFINER helpers inside WITH CHECK clauses.

-- ---------------------------------------------------------------------------
-- Helper functions
--
-- SECURITY DEFINER so they bypass RLS when reading profiles/projects/castings.
-- Without this, a policy on `profiles` that looks up the caller's role would
-- recurse into the same table's policies (infinite recursion). Functions are
-- owned by the migration role (postgres), which bypasses RLS on the tables
-- they read. search_path is pinned to '' so every reference is schema-qualified.
-- ---------------------------------------------------------------------------

create or replace function public.current_user_role()
returns text
language sql
security definer
stable
set search_path = ''
as $$
  select role from public.profiles where id = (select auth.uid());
$$;

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select coalesce(public.current_user_role() = 'admin', false);
$$;

create or replace function public.owns_project(p_project_id uuid)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1 from public.projects p
    where p.id = p_project_id and p.production_id = (select auth.uid())
  );
$$;

create or replace function public.owns_casting(p_casting_id uuid)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1
    from public.castings c
    join public.projects p on p.id = c.project_id
    where c.id = p_casting_id and p.production_id = (select auth.uid())
  );
$$;

-- These helpers are only referenced by policies that apply to `authenticated`,
-- so anon never needs to execute them.
revoke execute on function public.current_user_role() from public;
revoke execute on function public.is_admin() from public;
revoke execute on function public.owns_project(uuid) from public;
revoke execute on function public.owns_casting(uuid) from public;
grant execute on function public.current_user_role() to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.owns_project(uuid) to authenticated;
grant execute on function public.owns_casting(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Table privileges
--
-- RLS filters rows, but a role still needs the underlying table grant to touch
-- the table at all. anon may only read the public catalogue (open projects and
-- castings); authenticated gets DML gated per-row by the policies below.
--
-- RLS policies constrain ROWS, not COLUMNS: a WITH CHECK like
-- `auth.uid() = id` would happily accept an update that flips the row's own
-- `role` to 'admin'. Column-level grants are the guard for that, so the
-- sensitive tables get column-scoped update/insert grants:
--   - profiles: `role` and `email` are immutable from the client API (and
--     inserts are service-role only — signup inserts the profile server-side).
--     Consequently, role/email changes are a service-role operation, including
--     for admins; the future back-office must go through the server.
--   - applications: `casting_id`/`figurant_id` are immutable once created, so
--     a figurant can't move an application to another (e.g. closed) casting
--     and a production can't reassign an application to another figurant.
--
-- Grants are revoked before being re-issued so re-running this file always
-- converges to exactly these privileges (older, broader grants don't linger).
-- ---------------------------------------------------------------------------

revoke all privileges on public.profiles, public.projects, public.castings,
  public.applications, public.carpools, public.contracts from anon, authenticated;

grant select on public.projects to anon;
grant select on public.castings to anon;

grant select, delete on public.profiles to authenticated;
grant update (first_name, last_name, phone, city, age, bio, experience,
  photo_url, available, updated_at) on public.profiles to authenticated;

grant select, insert, update, delete on public.projects to authenticated;
grant select, insert, update, delete on public.castings to authenticated;

grant select, delete on public.applications to authenticated;
grant insert (casting_id, figurant_id, status, message) on public.applications to authenticated;
grant update (status, message, reviewed_at, reviewed_by, updated_at)
  on public.applications to authenticated;

grant select, insert, update, delete on public.carpools to authenticated;

-- Contracts are written exclusively with the service role; clients only read.
grant select on public.contracts to authenticated;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select to authenticated
  using ((select auth.uid()) = id);

-- Productions (and admins) need to browse figurant profiles to review candidates.
drop policy if exists "profiles_select_figurants_by_staff" on public.profiles;
create policy "profiles_select_figurants_by_staff" on public.profiles
  for select to authenticated
  using (role = 'figurant' and (select public.current_user_role()) in ('production', 'admin'));

-- No insert policy: profiles are created server-side with the service role
-- during signup (there is no insert grant for authenticated either). A
-- client-side insert policy would let a user who signed up directly against
-- the auth API create their own profile with an arbitrary role.
drop policy if exists "profiles_insert_own" on public.profiles;

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists "profiles_admin_all" on public.profiles;
create policy "profiles_admin_all" on public.profiles
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- ---------------------------------------------------------------------------
-- projects
-- ---------------------------------------------------------------------------

alter table public.projects enable row level security;

-- Open projects are public (SSR SEO catalogue + in-app browsing).
drop policy if exists "projects_select_open" on public.projects;
create policy "projects_select_open" on public.projects
  for select to anon, authenticated
  using (status = 'open');

-- A production has full control over its own projects (any status).
drop policy if exists "projects_manage_own" on public.projects;
create policy "projects_manage_own" on public.projects
  for all to authenticated
  using (production_id = (select auth.uid()))
  with check (production_id = (select auth.uid()));

drop policy if exists "projects_admin_all" on public.projects;
create policy "projects_admin_all" on public.projects
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- ---------------------------------------------------------------------------
-- castings
-- ---------------------------------------------------------------------------

alter table public.castings enable row level security;

-- Open castings inside an open project are public.
drop policy if exists "castings_select_open" on public.castings;
create policy "castings_select_open" on public.castings
  for select to anon, authenticated
  using (
    status = 'open'
    and exists (
      select 1 from public.projects p
      where p.id = castings.project_id and p.status = 'open'
    )
  );

-- The owning production manages its castings via project ownership.
drop policy if exists "castings_manage_own_project" on public.castings;
create policy "castings_manage_own_project" on public.castings
  for all to authenticated
  using ((select public.owns_project(project_id)))
  with check ((select public.owns_project(project_id)));

drop policy if exists "castings_admin_all" on public.castings;
create policy "castings_admin_all" on public.castings
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- ---------------------------------------------------------------------------
-- applications
-- ---------------------------------------------------------------------------

alter table public.applications enable row level security;

-- A figurant sees only their own applications.
drop policy if exists "applications_select_own_figurant" on public.applications;
create policy "applications_select_own_figurant" on public.applications
  for select to authenticated
  using (figurant_id = (select auth.uid()));

-- A figurant applies for themselves; the row must start as 'pending'.
drop policy if exists "applications_insert_own_figurant" on public.applications;
create policy "applications_insert_own_figurant" on public.applications
  for insert to authenticated
  with check (
    figurant_id = (select auth.uid())
    and (select public.current_user_role()) = 'figurant'
    and status = 'pending'
  );

-- A figurant may only move their own application to pending/withdrawn — they
-- can never self-confirm. Confirm/reject is the production's decision below.
-- The USING clause also pins the CURRENT status to pending/withdrawn, so a
-- decided (confirmed/rejected) application can't be reverted by the figurant;
-- withdrawn stays updatable so re-applying can resurrect it (see Sprint 4).
drop policy if exists "applications_update_own_figurant" on public.applications;
create policy "applications_update_own_figurant" on public.applications
  for update to authenticated
  using (figurant_id = (select auth.uid()) and status in ('pending', 'withdrawn'))
  with check (figurant_id = (select auth.uid()) and status in ('pending', 'withdrawn'));

-- The production owning the casting sees and reviews (confirm/reject) applications.
drop policy if exists "applications_select_production" on public.applications;
create policy "applications_select_production" on public.applications
  for select to authenticated
  using ((select public.owns_casting(casting_id)));

-- A production reviews toward pending/confirmed/rejected — never withdrawn,
-- which is the figurant's own act ('pending' stays allowed so a decision can
-- be fully un-reviewed if needed).
drop policy if exists "applications_update_production" on public.applications;
create policy "applications_update_production" on public.applications
  for update to authenticated
  using ((select public.owns_casting(casting_id)))
  with check (
    (select public.owns_casting(casting_id))
    and status in ('pending', 'confirmed', 'rejected')
  );

drop policy if exists "applications_admin_all" on public.applications;
create policy "applications_admin_all" on public.applications
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- ---------------------------------------------------------------------------
-- carpools
-- ---------------------------------------------------------------------------

alter table public.carpools enable row level security;

-- Any authenticated user can browse carpool offers.
drop policy if exists "carpools_select_all" on public.carpools;
create policy "carpools_select_all" on public.carpools
  for select to authenticated
  using (true);

drop policy if exists "carpools_insert_own" on public.carpools;
create policy "carpools_insert_own" on public.carpools
  for insert to authenticated
  with check (driver_id = (select auth.uid()));

drop policy if exists "carpools_update_own" on public.carpools;
create policy "carpools_update_own" on public.carpools
  for update to authenticated
  using (driver_id = (select auth.uid()))
  with check (driver_id = (select auth.uid()));

drop policy if exists "carpools_delete_own" on public.carpools;
create policy "carpools_delete_own" on public.carpools
  for delete to authenticated
  using (driver_id = (select auth.uid()));

drop policy if exists "carpools_admin_all" on public.carpools;
create policy "carpools_admin_all" on public.carpools
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- ---------------------------------------------------------------------------
-- contracts
--
-- Rows are created/updated (signing) server-side with the service role, which
-- bypasses RLS. Here we only expose read access to the right people.
-- ---------------------------------------------------------------------------

alter table public.contracts enable row level security;

drop policy if exists "contracts_select_own_figurant" on public.contracts;
create policy "contracts_select_own_figurant" on public.contracts
  for select to authenticated
  using (figurant_id = (select auth.uid()));

drop policy if exists "contracts_select_production" on public.contracts;
create policy "contracts_select_production" on public.contracts
  for select to authenticated
  using ((select public.owns_project(project_id)));

drop policy if exists "contracts_admin_all" on public.contracts;
create policy "contracts_admin_all" on public.contracts
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- ---------------------------------------------------------------------------
-- updated_at triggers
--
-- Keep updated_at accurate at the database level instead of relying on every
-- code path remembering to bump it (which was already forgotten twice, see
-- tickets #30/#31). moddatetime ships with Supabase; it overwrites the column
-- with now() on every UPDATE, so explicit bumps in app code stay harmless.
-- ---------------------------------------------------------------------------

create extension if not exists moddatetime with schema extensions;

drop trigger if exists set_updated_at on public.profiles;
create trigger set_updated_at before update on public.profiles
  for each row execute function extensions.moddatetime(updated_at);

drop trigger if exists set_updated_at on public.projects;
create trigger set_updated_at before update on public.projects
  for each row execute function extensions.moddatetime(updated_at);

drop trigger if exists set_updated_at on public.castings;
create trigger set_updated_at before update on public.castings
  for each row execute function extensions.moddatetime(updated_at);

drop trigger if exists set_updated_at on public.applications;
create trigger set_updated_at before update on public.applications
  for each row execute function extensions.moddatetime(updated_at);
