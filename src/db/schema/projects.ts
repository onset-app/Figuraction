import { sql } from "drizzle-orm"
import { check, date, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"
import { profiles } from "./profiles"

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productionId: uuid("production_id")
      .notNull()
      .references(() => profiles.id),
    title: text("title").notNull(),
    description: text("description"),
    shootLocation: text("shoot_location"),
    shootDateStart: date("shoot_date_start"),
    shootDateEnd: date("shoot_date_end"),
    status: text("status").notNull().default("draft"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    check("projects_status_check", sql`${table.status} in ('draft', 'open', 'closed', 'archived')`),
  ]
)

export type Project = typeof projects.$inferSelect
export type NewProject = typeof projects.$inferInsert
