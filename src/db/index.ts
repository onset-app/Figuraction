import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error("Missing DATABASE_URL — set it in .env.local")
}

// The Supabase connection string points at the transaction pooler (pgbouncer,
// port 6543), which does not support prepared statements. Disable them here.
const client = postgres(connectionString, { prepare: false })

export const db = drizzle(client)
