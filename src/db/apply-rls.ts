/**
 * Apply supabase/migrations/007_rls_policies.sql to the database, then verify
 * that RLS is actually enabled (with at least one policy) on every app table.
 *
 * This exists so provisioning is reproducible: `pnpm db:push` creates tables
 * WITHOUT RLS — and Supabase's default privileges would leave them reachable
 * through the public API — so the full sequence for a fresh environment is:
 *
 *   pnpm db:push && pnpm db:rls && pnpm db:seed
 *
 * The SQL file is re-runnable; running this against an already-provisioned
 * database simply converges policies, grants and triggers to the file.
 *
 * Run with: pnpm db:rls
 */

import { existsSync, readFileSync } from "node:fs"
import postgres from "postgres"

if (existsSync(".env.local")) {
  process.loadEnvFile(".env.local")
}

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  throw new Error("Missing DATABASE_URL — set it in .env.local")
}

const APP_TABLES = ["profiles", "projects", "castings", "applications", "carpools", "contracts"]

async function main() {
  const sql = postgres(databaseUrl as string, { prepare: false, max: 1 })
  try {
    const policiesSql = readFileSync("supabase/migrations/007_rls_policies.sql", "utf8")
    await sql.unsafe(policiesSql)
    console.log("Applied supabase/migrations/007_rls_policies.sql")

    const rows = await sql<{ table: string; rls: boolean; policies: string }[]>`
      select c.relname as "table",
             c.relrowsecurity as rls,
             (select count(*) from pg_policy p where p.polrelid = c.oid) as policies
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public' and c.relname in ${sql(APP_TABLES)}
    `
    for (const row of rows) {
      console.log(`  ${row.table}: rls=${row.rls} policies=${row.policies}`)
    }

    const missing = APP_TABLES.filter((t) => !rows.some((r) => r.table === t))
    if (missing.length > 0) {
      throw new Error(`Tables missing (run pnpm db:push first): ${missing.join(", ")}`)
    }
    const insecure = rows.filter((r) => !r.rls || Number(r.policies) === 0)
    if (insecure.length > 0) {
      throw new Error(`RLS not effective on: ${insecure.map((r) => r.table).join(", ")}`)
    }
    console.log("RLS enabled with policies on all app tables ✓")
  } finally {
    await sql.end()
  }
}

main().catch((err) => {
  console.error("db:rls failed:", err)
  process.exit(1)
})
