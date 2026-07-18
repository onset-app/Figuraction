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
import { experienceLevels, userRoles } from "@/types/enums"
import { inEnum } from "./helpers"

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
    role: text("role", { enum: userRoles }).notNull(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    phone: text("phone"),
    city: text("city"),
    age: integer("age"),
    bio: text("bio"),
    experience: text("experience", { enum: experienceLevels }),
    photoUrl: text("photo_url"),
    available: boolean("available").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    check("profiles_role_check", inEnum(table.role, userRoles)),
    check("profiles_experience_check", inEnum(table.experience, experienceLevels)),
  ]
)

export type Profile = typeof profiles.$inferSelect
export type NewProfile = typeof profiles.$inferInsert
