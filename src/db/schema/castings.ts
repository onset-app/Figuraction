import { sql } from "drizzle-orm"
import { check, date, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"
import { projects } from "./projects"

export const castings = pgTable(
  "castings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    roleType: text("role_type"),
    ageMin: integer("age_min"),
    ageMax: integer("age_max"),
    location: text("location"),
    shootDate: date("shoot_date"),
    spotsAvailable: integer("spots_available").notNull().default(1),
    status: text("status").notNull().default("open"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    check("castings_role_type_check", sql`${table.roleType} in ('figurant', 'acteur', 'doublure')`),
    check("castings_status_check", sql`${table.status} in ('open', 'closed')`),
  ]
)

export type Casting = typeof castings.$inferSelect
export type NewCasting = typeof castings.$inferInsert
