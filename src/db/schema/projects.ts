import { check, date, index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"
import { projectStatuses } from "@/types/enums"
import { inEnum } from "./helpers"
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
    status: text("status", { enum: projectStatuses }).notNull().default("draft"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    check("projects_status_check", inEnum(table.status, projectStatuses)),
    // Postgres doesn't index FK columns automatically; production_id is hit by
    // every "my projects" query and by the owns_project() RLS helper.
    index("projects_production_id_idx").on(table.productionId),
  ]
)

export type Project = typeof projects.$inferSelect
export type NewProject = typeof projects.$inferInsert
