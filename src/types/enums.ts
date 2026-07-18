/**
 * Single source of truth for every domain enum.
 *
 * The `as const` arrays drive all three layers: the TypeScript unions below,
 * the Zod `z.enum(...)` validators in src/schemas, and the Drizzle column
 * types + CHECK constraints in src/db/schema. Adding a value here propagates
 * everywhere; never redeclare these lists elsewhere.
 */

export const userRoles = ["figurant", "production", "admin"] as const
export type UserRole = (typeof userRoles)[number]

export const applicationStatuses = ["pending", "confirmed", "rejected", "withdrawn"] as const
export type ApplicationStatus = (typeof applicationStatuses)[number]

export const projectStatuses = ["draft", "open", "closed", "archived"] as const
export type ProjectStatus = (typeof projectStatuses)[number]

export const castingStatuses = ["open", "closed"] as const
export type CastingStatus = (typeof castingStatuses)[number]

export const contractStatuses = ["pending", "signed", "expired"] as const
export type ContractStatus = (typeof contractStatuses)[number]

export const experienceLevels = ["debutant", "premiere_fois", "confirme"] as const
export type ExperienceLevel = (typeof experienceLevels)[number]

export const roleTypes = ["figurant", "acteur", "doublure"] as const
export type RoleType = (typeof roleTypes)[number]

export const contactMethods = ["email", "phone"] as const
export type ContactMethod = (typeof contactMethods)[number]
