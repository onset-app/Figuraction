import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Normalise an optional free-text field: blank/whitespace becomes null. */
export function nullableText(value: string | undefined): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

/** Format a Date as a `YYYY-MM-DD` string for a Postgres `date` column. */
export function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10)
}

const FR_DATE_FORMAT = new Intl.DateTimeFormat("fr-BE", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
})

/**
 * Format a `YYYY-MM-DD` date string as a human French date (e.g. "12 août 2026").
 * Parsed at UTC midnight and formatted in UTC so a date-only value never shifts
 * a day across timezones. Returns a neutral placeholder when the date is absent.
 */
export function formatDateFr(date: string | null | undefined): string {
  if (!date) {
    return "à confirmer"
  }
  const parsed = new Date(`${date}T00:00:00Z`)
  return Number.isNaN(parsed.getTime()) ? date : FR_DATE_FORMAT.format(parsed)
}
