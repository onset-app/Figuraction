import { check, date, index, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"
import { castingStatuses, roleTypes } from "@/types/enums"
import { inEnum } from "./helpers"
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
    roleType: text("role_type", { enum: roleTypes }),
    ageMin: integer("age_min"),
    ageMax: integer("age_max"),
    location: text("location"),
    shootDate: date("shoot_date"),
    spotsAvailable: integer("spots_available").notNull().default(1),
    status: text("status", { enum: castingStatuses }).notNull().default("open"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    check("castings_role_type_check", inEnum(table.roleType, roleTypes)),
    check("castings_status_check", inEnum(table.status, castingStatuses)),
    // Unindexed FK: hit by project detail pages and the owns_casting() helper.
    index("castings_project_id_idx").on(table.projectId),
  ]
)

export type Casting = typeof castings.$inferSelect
export type NewCasting = typeof castings.$inferInsert
