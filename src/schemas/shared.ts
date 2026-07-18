import { z } from "zod"

/**
 * An optional date that also accepts an empty string as "unset".
 *
 * Native `<input type="date">` fields submit `""` when left blank, not
 * `undefined` — and `z.coerce.date().optional()` alone rejects `""` with a
 * confusing "Invalid date" error, since `.optional()` only skips validation
 * for `undefined`. This normalises `""` to `undefined` before coercion.
 */
export const optionalDate = z.preprocess(
  (val) => (val === "" ? undefined : val),
  z.coerce.date().optional()
)

/**
 * Wrap a coerced-number schema so a blank input string ("" — what native
 * number inputs submit when left empty) is treated as "unset" instead of
 * `z.coerce.number()` turning it into `0`. Without this, an optional field
 * whose lower bound is 0 (e.g. an age minimum) would silently accept a blank
 * input as a real `0` rather than leaving it unset.
 */
export function optionalNumber<T extends z.ZodTypeAny>(schema: T) {
  return z.preprocess((val) => (val === "" ? undefined : val), schema.optional())
}

/**
 * Same blank-input normalisation for a REQUIRED coerced number: without it an
 * empty number input submits `""`, which `z.coerce.number()` silently turns
 * into `0` — accepted whenever the field's lower bound is 0 (e.g. a carpool
 * with 0 seats). Mapping `""` to `undefined` makes the field fail as missing
 * instead; give the inner schema a `message` for a French error.
 */
export function requiredNumber<T extends z.ZodTypeAny>(schema: T) {
  return z.preprocess((val) => (val === "" ? undefined : val), schema)
}
