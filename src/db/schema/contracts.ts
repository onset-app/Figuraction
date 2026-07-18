import { check, index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"
import { contractStatuses } from "@/types/enums"
import { applications } from "./applications"
import { inEnum } from "./helpers"
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
    status: text("status", { enum: contractStatuses }).notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    check("contracts_status_check", inEnum(table.status, contractStatuses)),
    // Unindexed FKs used by the RLS select policies and future joins.
    index("contracts_application_id_idx").on(table.applicationId),
    index("contracts_figurant_id_idx").on(table.figurantId),
    index("contracts_project_id_idx").on(table.projectId),
  ]
)

export type Contract = typeof contracts.$inferSelect
export type NewContract = typeof contracts.$inferInsert
