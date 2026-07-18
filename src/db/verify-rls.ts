/**
 * RLS regression assertions, run against a freshly seeded dev database.
 *
 * Codifies the security properties of 007_rls_policies.sql that the app
 * relies on — above all that a user can never escalate their own role — so a
 * policy change can be checked with one command instead of ad-hoc testing.
 * Real anon-key clients are used throughout, so these hit the same PostgREST
 * surface an attacker would.
 *
 * Requires a seeded database: pnpm db:push && pnpm db:rls && pnpm db:seed
 * Run with: pnpm db:verify-rls
 *
 * The one intentional mutation (production confirms an application) is
 * reverted at the end; everything else asserts on denials.
 */

import { existsSync } from "node:fs"
import { createClient, type SupabaseClient } from "@supabase/supabase-js"

if (existsSync(".env.local")) {
  process.loadEnvFile(".env.local")
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !anonKey || !serviceKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY"
  )
}

/** Matches SEED_PASSWORD in seed.ts. */
const SEED_PASSWORD = "Password123!"

const failures: string[] = []
function check(name: string, ok: boolean, details = "") {
  if (ok) {
    console.log(`  ✓ ${name}`)
  } else {
    console.error(`  ✗ ${name}${details ? ` — ${details}` : ""}`)
    failures.push(name)
  }
}

/** An operation counts as denied if it errored OR affected/returned no rows. */
function denied(res: { data: unknown; error: { message: string } | null }): boolean {
  const rows = Array.isArray(res.data) ? res.data : res.data ? [res.data] : []
  return res.error !== null || rows.length === 0
}

function client(): SupabaseClient {
  return createClient(url as string, anonKey as string, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

async function signIn(email: string): Promise<SupabaseClient> {
  const c = client()
  const { error } = await c.auth.signInWithPassword({ email, password: SEED_PASSWORD })
  if (error) {
    throw new Error(`Sign-in failed for ${email} (re-run pnpm db:seed?): ${error.message}`)
  }
  return c
}

const service = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})

async function profileId(email: string): Promise<string> {
  const { data, error } = await service.from("profiles").select("id").eq("email", email).single()
  if (error || !data) throw new Error(`Seed profile not found: ${email} (run pnpm db:seed)`)
  return data.id as string
}

async function castingId(title: string): Promise<string> {
  const { data, error } = await service.from("castings").select("id").eq("title", title).single()
  if (error || !data) throw new Error(`Seed casting not found: ${title} (run pnpm db:seed)`)
  return data.id as string
}

async function applicationOf(
  figurantId: string,
  casting: string
): Promise<{ id: string; status: string }> {
  const { data, error } = await service
    .from("applications")
    .select("id, status")
    .eq("figurant_id", figurantId)
    .eq("casting_id", casting)
    .single()
  if (error || !data) throw new Error("Seed application not found (run pnpm db:seed)")
  return { id: data.id as string, status: data.status as string }
}

async function main() {
  console.log("Verifying RLS policies against the live database…\n")

  const [lucasId, nathanId, emmaId, rtbfId, indifilmId] = await Promise.all([
    profileId("lucas.dubois@example.be"),
    profileId("nathan.petit@example.be"),
    profileId("emma.lambert@example.be"),
    profileId("rtbf.productions@example.be"),
    profileId("indifilm.brussels@example.be"),
  ])
  const [cMarket, cDancers] = await Promise.all([
    castingId("Passants pour scène de marché"),
    castingId("Danseurs de rue"),
  ])
  const lucasApp = await applicationOf(lucasId, cMarket) // pending (seed)
  const nathanApp = await applicationOf(nathanId, cMarket) // rejected (seed)
  const emmaApp = await applicationOf(emmaId, cDancers) // pending, indifilm's casting

  const anon = client()
  const lucas = await signIn("lucas.dubois@example.be")
  const nathan = await signIn("nathan.petit@example.be")
  const rtbf = await signIn("rtbf.productions@example.be")

  // --- anon --------------------------------------------------------------
  check("anon cannot read profiles", denied(await anon.from("profiles").select("id")))
  const anonProjects = await anon.from("projects").select("status")
  check(
    "anon sees only open projects",
    anonProjects.error === null &&
      (anonProjects.data ?? []).length > 0 &&
      (anonProjects.data ?? []).every((p) => p.status === "open")
  )

  // --- profiles: the escalation vectors -----------------------------------
  check(
    "figurant cannot set their own role to admin",
    denied(await lucas.from("profiles").update({ role: "admin" }).eq("id", lucasId).select())
  )
  const roleAfter = await service.from("profiles").select("role").eq("id", lucasId).single()
  check("role is unchanged after the attempt", roleAfter.data?.role === "figurant")
  check(
    "figurant cannot change their own email",
    denied(await lucas.from("profiles").update({ email: "evil@x.be" }).eq("id", lucasId).select())
  )
  check(
    "clients cannot insert profiles at all",
    denied(
      await lucas
        .from("profiles")
        .insert({ id: lucasId, email: "x@x.be", role: "admin", first_name: "X", last_name: "X" })
        .select()
    )
  )
  const rename = await lucas
    .from("profiles")
    .update({ first_name: "Lucas" })
    .eq("id", lucasId)
    .select()
  check("figurant can still edit ordinary profile fields", !denied(rename))
  check(
    "production cannot read another production's profile",
    denied(await rtbf.from("profiles").select("id").eq("id", indifilmId))
  )

  // --- applications: row isolation ----------------------------------------
  const lucasApps = await lucas.from("applications").select("figurant_id")
  check(
    "figurant sees only their own applications",
    lucasApps.error === null &&
      (lucasApps.data ?? []).length > 0 &&
      (lucasApps.data ?? []).every((a) => a.figurant_id === lucasId)
  )

  // --- applications: status and column tampering --------------------------
  check(
    "figurant cannot self-confirm an application",
    denied(
      await lucas
        .from("applications")
        .update({ status: "confirmed" })
        .eq("id", lucasApp.id)
        .select()
    )
  )
  check(
    "figurant cannot move an application to another casting",
    denied(
      await lucas
        .from("applications")
        .update({ casting_id: cDancers })
        .eq("id", lucasApp.id)
        .select()
    )
  )
  check(
    "figurant cannot revert a rejected application to pending",
    denied(
      await nathan
        .from("applications")
        .update({ status: "pending" })
        .eq("id", nathanApp.id)
        .select()
    )
  )
  check(
    "production cannot reassign an application to another figurant",
    denied(
      await rtbf.from("applications").update({ figurant_id: emmaId }).eq("id", lucasApp.id).select()
    )
  )
  check(
    "production cannot mark an application withdrawn",
    denied(
      await rtbf.from("applications").update({ status: "withdrawn" }).eq("id", lucasApp.id).select()
    )
  )
  check(
    "production cannot review another production's application",
    denied(
      await rtbf.from("applications").update({ status: "confirmed" }).eq("id", emmaApp.id).select()
    )
  )

  // --- applications: the legitimate review path still works ---------------
  const confirm = await rtbf
    .from("applications")
    .update({ status: "confirmed", reviewed_at: new Date().toISOString(), reviewed_by: rtbfId })
    .eq("id", lucasApp.id)
    .select()
  check("production can confirm an application on its own casting", !denied(confirm))
  const revert = await rtbf
    .from("applications")
    .update({ status: lucasApp.status, reviewed_at: null, reviewed_by: null })
    .eq("id", lucasApp.id)
    .select()
  check("state restored (confirm reverted)", !denied(revert))

  console.log(
    failures.length === 0
      ? "\nAll RLS assertions passed ✓"
      : `\n${failures.length} assertion(s) FAILED`
  )
  process.exit(failures.length === 0 ? 0 : 1)
}

main().catch((err) => {
  console.error("db:verify-rls failed:", err)
  process.exit(1)
})
