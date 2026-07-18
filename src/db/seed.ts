/**
 * Development seed for ONSET.
 *
 * Populates the database with realistic Belgian data: figurants, productions,
 * an admin, projects, castings, applications and carpools.
 *
 * Auth users are created through the Supabase Auth admin API (service role) so
 * the seeded accounts can actually log in — the profiles table only holds
 * metadata and its id FKs to auth.users. Everything else is inserted with
 * Drizzle over the pooled postgres connection (which bypasses RLS).
 *
 * Idempotent: re-running wipes the app tables and deletes the seed auth users
 * (matched by email) before recreating them. Safe on the dev database only.
 *
 * Run with: pnpm db:seed
 */

import { existsSync } from "node:fs"
import { createClient } from "@supabase/supabase-js"

// drizzle/db reads DATABASE_URL at import time, so load env before importing it.
if (existsSync(".env.local")) {
  process.loadEnvFile(".env.local")
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY — set them in .env.local"
  )
}

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// Shared dev password for every seeded account.
const SEED_PASSWORD = "Password123!"

type SeedUser = {
  key: string
  email: string
  role: "figurant" | "production" | "admin"
  firstName: string
  lastName: string
  phone: string
  city: string
  age?: number
  bio?: string
  experience?: "debutant" | "premiere_fois" | "confirme"
}

const users: SeedUser[] = [
  // Figurants across Belgium
  {
    key: "lucas",
    email: "lucas.dubois@example.be",
    role: "figurant",
    firstName: "Lucas",
    lastName: "Dubois",
    phone: "+32 470 11 22 33",
    city: "Bruxelles",
    age: 28,
    bio: "Passionné de cinéma, disponible en semaine et le week-end.",
    experience: "confirme",
  },
  {
    key: "emma",
    email: "emma.lambert@example.be",
    role: "figurant",
    firstName: "Emma",
    lastName: "Lambert",
    phone: "+32 471 22 33 44",
    city: "Liège",
    age: 34,
    bio: "Première expérience de figuration l'an dernier, envie de continuer.",
    experience: "premiere_fois",
  },
  {
    key: "nathan",
    email: "nathan.petit@example.be",
    role: "figurant",
    firstName: "Nathan",
    lastName: "Petit",
    phone: "+32 472 33 44 55",
    city: "Namur",
    age: 22,
    bio: "Étudiant, flexible sur les horaires.",
    experience: "debutant",
  },
  {
    key: "chloe",
    email: "chloe.martin@example.be",
    role: "figurant",
    firstName: "Chloé",
    lastName: "Martin",
    phone: "+32 473 44 55 66",
    city: "Charleroi",
    age: 41,
    bio: "Habituée des tournages, ponctuelle et fiable.",
    experience: "confirme",
  },
  {
    key: "louis",
    email: "louis.peeters@example.be",
    role: "figurant",
    firstName: "Louis",
    lastName: "Peeters",
    phone: "+32 474 55 66 77",
    city: "Gent",
    age: 30,
    bio: "Néerlandophone et francophone, ouvert à tous types de rôles.",
    experience: "premiere_fois",
  },
  // Productions
  {
    key: "rtbf",
    email: "rtbf.productions@example.be",
    role: "production",
    firstName: "RTBF",
    lastName: "Productions",
    phone: "+32 2 737 21 11",
    city: "Bruxelles",
  },
  {
    key: "indifilm",
    email: "indifilm.brussels@example.be",
    role: "production",
    firstName: "IndiFilm",
    lastName: "Brussels",
    phone: "+32 2 512 00 00",
    city: "Bruxelles",
  },
  // Admin
  {
    key: "admin",
    email: "admin@onset.be",
    role: "admin",
    firstName: "Admin",
    lastName: "ONSET",
    phone: "+32 2 000 00 00",
    city: "Bruxelles",
  },
]

/** Delete any existing auth user with this email so createUser can recreate it. */
async function deleteAuthUserByEmail(email: string): Promise<void> {
  // listUsers is paginated; scan pages until we find the email or run out.
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 })
    if (error) throw error
    const existing = data.users.find((u) => u.email === email)
    if (existing) {
      const { error: delError } = await admin.auth.admin.deleteUser(existing.id)
      if (delError) throw delError
      return
    }
    if (data.users.length < 200) return // last page
  }
}

async function main() {
  console.log("Seeding ONSET dev database…")

  // Imported dynamically: ./index reads DATABASE_URL at module load, so the
  // env must be loaded (above) before this runs.
  const { db } = await import("./index")
  const { applications, carpools, castings, contracts, profiles, projects } = await import(
    "./schema"
  )

  // 1. Wipe app tables (FK-safe order). Dev DB only — no real data.
  // contracts first: it references applications/profiles/projects without
  // cascade, so any contract row would otherwise block the deletes below.
  await db.delete(contracts)
  await db.delete(carpools)
  await db.delete(applications)
  await db.delete(castings)
  await db.delete(projects)
  await db.delete(profiles)
  console.log("  cleared existing app data")

  // 2. Create auth users + profiles.
  const ids: Record<string, string> = {}
  for (const u of users) {
    await deleteAuthUserByEmail(u.email)
    const { data, error } = await admin.auth.admin.createUser({
      email: u.email,
      password: SEED_PASSWORD,
      email_confirm: true,
      user_metadata: { first_name: u.firstName, last_name: u.lastName, role: u.role },
    })
    if (error || !data.user) throw error ?? new Error(`Failed to create auth user ${u.email}`)
    ids[u.key] = data.user.id
    await db.insert(profiles).values({
      id: data.user.id,
      email: u.email,
      role: u.role,
      firstName: u.firstName,
      lastName: u.lastName,
      phone: u.phone,
      city: u.city,
      age: u.age ?? null,
      bio: u.bio ?? null,
      experience: u.experience ?? null,
      available: true,
    })
  }
  console.log(`  created ${users.length} auth users + profiles`)

  // 3. Projects (1 open, 1 draft, 1 closed).
  const [projShadows, projNight, projTram] = await db
    .insert(projects)
    .values([
      {
        productionId: ids.rtbf,
        title: "Les Ombres de Bruxelles",
        description: "Série policière tournée dans le centre de Bruxelles.",
        shootLocation: "Bruxelles",
        shootDateStart: "2026-09-01",
        shootDateEnd: "2026-11-30",
        status: "open",
      },
      {
        productionId: ids.indifilm,
        title: "Nuit Blanche",
        description: "Court-métrage indépendant, ambiance nocturne.",
        shootLocation: "Liège",
        shootDateStart: "2026-10-15",
        shootDateEnd: "2026-10-20",
        status: "draft",
      },
      {
        productionId: ids.rtbf,
        title: "Le Dernier Tram",
        description: "Drame social, tournage terminé.",
        shootLocation: "Charleroi",
        shootDateStart: "2026-03-01",
        shootDateEnd: "2026-04-15",
        status: "closed",
      },
    ])
    .returning({ id: projects.id })

  // 4. Castings (2 per project).
  // The "Musiciens de jazz" casting (4th) is intentionally left with no
  // applications — a closed casting nobody applied to.
  const [cMarket, cCafe, cDancers, , cTram, cControllers] = await db
    .insert(castings)
    .values([
      {
        projectId: projShadows.id,
        title: "Passants pour scène de marché",
        description: "Figurants pour une scène de marché animée.",
        roleType: "figurant",
        ageMin: 18,
        ageMax: 65,
        location: "Bruxelles",
        shootDate: "2026-09-10",
        spotsAvailable: 20,
        status: "open",
      },
      {
        projectId: projShadows.id,
        title: "Clients de café",
        description: "Figurants attablés en terrasse.",
        roleType: "figurant",
        ageMin: 25,
        ageMax: 55,
        location: "Bruxelles",
        shootDate: "2026-09-18",
        spotsAvailable: 10,
        status: "open",
      },
      {
        projectId: projNight.id,
        title: "Danseurs de rue",
        description: "Danseurs pour une séquence nocturne.",
        roleType: "figurant",
        ageMin: 18,
        ageMax: 35,
        location: "Liège",
        shootDate: "2026-10-16",
        spotsAvailable: 6,
        status: "open",
      },
      {
        projectId: projNight.id,
        title: "Musiciens de jazz",
        description: "Acteurs jouant des musiciens (jeu requis).",
        roleType: "acteur",
        ageMin: 30,
        ageMax: 60,
        location: "Liège",
        shootDate: "2026-10-17",
        spotsAvailable: 3,
        status: "closed",
      },
      {
        projectId: projTram.id,
        title: "Voyageurs de tram",
        description: "Figurants dans un tram d'époque.",
        roleType: "figurant",
        ageMin: 18,
        ageMax: 80,
        location: "Charleroi",
        shootDate: "2026-03-12",
        spotsAvailable: 15,
        status: "closed",
      },
      {
        projectId: projTram.id,
        title: "Contrôleurs",
        description: "Figurants en uniforme de contrôleur.",
        roleType: "figurant",
        ageMin: 30,
        ageMax: 60,
        location: "Charleroi",
        shootDate: "2026-03-14",
        spotsAvailable: 4,
        status: "closed",
      },
    ])
    .returning({ id: castings.id })

  console.log("  created 3 projects + 6 castings")

  // 5. Applications (mix of statuses). Reviewed ones carry reviewer + timestamp.
  const reviewedAt = new Date()
  await db.insert(applications).values([
    {
      castingId: cMarket.id,
      figurantId: ids.lucas,
      status: "pending",
      message: "Disponible toute la semaine.",
    },
    {
      castingId: cMarket.id,
      figurantId: ids.emma,
      status: "confirmed",
      reviewedAt,
      reviewedBy: ids.rtbf,
    },
    {
      castingId: cMarket.id,
      figurantId: ids.nathan,
      status: "rejected",
      reviewedAt,
      reviewedBy: ids.rtbf,
    },
    { castingId: cCafe.id, figurantId: ids.chloe, status: "pending" },
    {
      castingId: cCafe.id,
      figurantId: ids.louis,
      status: "confirmed",
      reviewedAt,
      reviewedBy: ids.rtbf,
    },
    {
      castingId: cCafe.id,
      figurantId: ids.lucas,
      status: "pending",
      message: "Intéressé par ce rôle.",
    },
    { castingId: cDancers.id, figurantId: ids.emma, status: "pending" },
    {
      castingId: cTram.id,
      figurantId: ids.nathan,
      status: "confirmed",
      reviewedAt,
      reviewedBy: ids.rtbf,
    },
    {
      castingId: cTram.id,
      figurantId: ids.chloe,
      status: "rejected",
      reviewedAt,
      reviewedBy: ids.rtbf,
    },
    { castingId: cControllers.id, figurantId: ids.louis, status: "withdrawn" },
  ])
  console.log("  created 10 applications")

  // 6. Carpools.
  await db.insert(carpools).values([
    {
      projectId: projShadows.id,
      driverId: ids.lucas,
      driverName: "Lucas Dubois",
      departureArea: "Bruxelles — Gare du Midi",
      departureDate: "2026-09-10",
      departureTime: "07:30",
      seatsAvailable: 3,
      contactMethod: "phone",
      contactValue: "+32 470 11 22 33",
      isFull: false,
    },
    {
      projectId: projShadows.id,
      driverId: ids.emma,
      driverName: "Emma Lambert",
      departureArea: "Liège — Place Saint-Lambert",
      departureDate: "2026-09-18",
      departureTime: "06:45",
      seatsAvailable: 2,
      contactMethod: "email",
      contactValue: "emma.lambert@example.be",
      isFull: false,
    },
    {
      projectId: null,
      driverId: ids.nathan,
      driverName: "Nathan Petit",
      departureArea: "Namur — Gare",
      departureDate: "2026-03-12",
      departureTime: "08:00",
      seatsAvailable: 4,
      contactMethod: "phone",
      contactValue: "+32 472 33 44 55",
      isFull: true,
    },
  ])
  console.log("  created 3 carpools")

  console.log(`\nDone. All accounts use the password: ${SEED_PASSWORD}`)
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err)
    process.exit(1)
  })
