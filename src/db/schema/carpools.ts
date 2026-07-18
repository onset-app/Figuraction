import { sql } from "drizzle-orm"
import {
  boolean,
  check,
  date,
  index,
  integer,
  pgTable,
  text,
  time,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core"
import { contactMethods } from "@/types/enums"
import { inEnum } from "./helpers"
import { profiles } from "./profiles"
import { projects } from "./projects"

export const carpools = pgTable(
  "carpools",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id").references(() => projects.id),
    driverId: uuid("driver_id")
      .notNull()
      .references(() => profiles.id),
    driverName: text("driver_name").notNull(),
    departureArea: text("departure_area").notNull(),
    departureDate: date("departure_date").notNull(),
    departureTime: time("departure_time").notNull(),
    seatsAvailable: integer("seats_available").notNull(),
    contactMethod: text("contact_method", { enum: contactMethods }).notNull(),
    contactValue: text("contact_value").notNull(),
    isFull: boolean("is_full").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    check("carpools_seats_available_check", sql`${table.seatsAvailable} >= 0`),
    check("carpools_contact_method_check", inEnum(table.contactMethod, contactMethods)),
    // Unindexed FK: ownership checks and driver-scoped lookups hit driver_id.
    index("carpools_driver_id_idx").on(table.driverId),
  ]
)

export type Carpool = typeof carpools.$inferSelect
export type NewCarpool = typeof carpools.$inferInsert
