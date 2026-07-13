import { sql } from "drizzle-orm"
import { check, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"
import { applications } from "./applications"
import { profiles } from "./profiles"
import { projects } from "./projects"

export const contracts = pgTable(
  "contracts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    applicationId: uuid("application_id")
      .notNull()
      .references(() => applications.id),
    figurantId: uuid("figurant_id")
      .notNull()
      .references(() => profiles.id),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id),
    contractUrl: text("contract_url"),
    signedAt: timestamp("signed_at", { withTimezone: true }),
    status: text("status").notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    check("contracts_status_check", sql`${table.status} in ('pending', 'signed', 'expired')`),
  ]
)

export type Contract = typeof contracts.$inferSelect
export type NewContract = typeof contracts.$inferInsert
