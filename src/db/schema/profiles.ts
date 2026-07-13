import { sql } from "drizzle-orm"
import {
  boolean,
  check,
  integer,
  pgSchema,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core"

// Supabase manages auth.users itself; this lets Drizzle reference it for the FK
// without trying to create or migrate that table.
const authSchema = pgSchema("auth")
export const authUsers = authSchema.table("users", {
  id: uuid("id").primaryKey(),
})

export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id")
      .primaryKey()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    email: text("email").notNull().unique(),
    role: text("role").notNull(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    phone: text("phone"),
    city: text("city"),
    age: integer("age"),
    bio: text("bio"),
    experience: text("experience"),
    photoUrl: text("photo_url"),
    available: boolean("available").default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    check("profiles_role_check", sql`${table.role} in ('figurant', 'production', 'admin')`),
    check(
      "profiles_experience_check",
      sql`${table.experience} in ('debutant', 'premiere_fois', 'confirme')`
    ),
  ]
)

export type Profile = typeof profiles.$inferSelect
export type NewProfile = typeof profiles.$inferInsert
