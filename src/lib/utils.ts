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
