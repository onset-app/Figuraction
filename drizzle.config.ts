import { existsSync } from "node:fs"
import { defineConfig } from "drizzle-kit"

// drizzle-kit runs outside Next.js, so .env.local is not auto-loaded.
// Node 20.12+ provides process.loadEnvFile — no extra dependency needed.
if (existsSync(".env.local")) {
  process.loadEnvFile(".env.local")
}

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  throw new Error("Missing DATABASE_URL — set it in .env.local")
}

export default defineConfig({
  schema: "./src/db/schema/index.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
  verbose: true,
  strict: true,
})
