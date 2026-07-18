import { type SQL, sql } from "drizzle-orm"
import type { AnyPgColumn } from "drizzle-orm/pg-core"

/**
 * Build a CHECK expression constraining a text column to an enum list from
 * @/types/enums, so the DB constraint can never drift from the app's union
 * types. Renders as `col in ('a', 'b')`; NULL still passes (SQL `in` is
 * NULL-permissive), which nullable enum columns rely on.
 */
export function inEnum(column: AnyPgColumn, values: readonly string[]): SQL {
  return sql`${column} in ${sql.raw(`('${values.join("', '")}')`)}`
}
