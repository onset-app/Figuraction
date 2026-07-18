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

/**
 * Validate a user-supplied post-login destination (e.g. the `?next=` param).
 * Only in-app paths are allowed — anything else (external URLs, `//host`
 * tricks, arbitrary internal pages) falls back to the dashboard, so the value
 * can never become an open redirect.
 */
export function safeAppPath(path: string | null | undefined): string {
  return path === "/app" || path?.startsWith("/app/") ? path : "/app/dashboard"
}

const FR_DATE_FORMAT = new Intl.DateTimeFormat("fr-BE", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
})

/** Format a `YYYY-MM-DD` string as `DD/MM/YYYY` without Date/timezone conversion. */
export function formatDateShortFr(isoDate: string): string {
  const [year, month, day] = isoDate.split("-")
  return `${day}/${month}/${year}`
}

/** Format a start/end `YYYY-MM-DD` pair as a short range; either side optional. */
export function formatDateRangeShortFr(start: string | null, end: string | null): string | null {
  if (!start && !end) return null
  if (start && end) return `${formatDateShortFr(start)} – ${formatDateShortFr(end)}`
  return formatDateShortFr(start ?? (end as string))
}

/** Human age-range label for a casting ("18–65 ans", "18+ ans", "≤ 65 ans"). */
export function formatAgeRangeFr(ageMin: number | null, ageMax: number | null): string | null {
  if (ageMin != null && ageMax != null) return `${ageMin}–${ageMax} ans`
  if (ageMin != null) return `${ageMin}+ ans`
  if (ageMax != null) return `≤ ${ageMax} ans`
  return null
}

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
