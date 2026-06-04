import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error("Missing DATABASE_URL — set it in .env.local")
}

// Connects through the Supabase session pooler (Supavisor, port 5432), which is
// IPv4-compatible and works for both runtime queries and drizzle-kit migrations.
// prepare:false keeps it safe across pooler modes (and the transaction pooler).
const client = postgres(connectionString, { prepare: false })

export const db = drizzle(client)
