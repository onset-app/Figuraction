import { sql } from "drizzle-orm"
import { check, pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core"
import { castings } from "./castings"
import { profiles } from "./profiles"

export const applications = pgTable(
  "applications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    castingId: uuid("casting_id")
      .notNull()
      .references(() => castings.id, { onDelete: "cascade" }),
    figurantId: uuid("figurant_id")
      .notNull()
      .references(() => profiles.id),
    status: text("status").notNull().default("pending"),
    message: text("message"),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    reviewedBy: uuid("reviewed_by").references(() => profiles.id),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    unique("applications_casting_figurant_unique").on(table.castingId, table.figurantId),
    check(
      "applications_status_check",
      sql`${table.status} in ('pending', 'confirmed', 'rejected', 'withdrawn')`
    ),
  ]
)

export type Application = typeof applications.$inferSelect
export type NewApplication = typeof applications.$inferInsert
