import { sql } from "drizzle-orm"
import {
  boolean,
  check,
  date,
  integer,
  pgTable,
  text,
  time,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core"
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
    contactMethod: text("contact_method"),
    contactValue: text("contact_value").notNull(),
    isFull: boolean("is_full").default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    check("carpools_seats_available_check", sql`${table.seatsAvailable} >= 0`),
    check("carpools_contact_method_check", sql`${table.contactMethod} in ('email', 'phone')`),
  ]
)

export type Carpool = typeof carpools.$inferSelect
export type NewCarpool = typeof carpools.$inferInsert
