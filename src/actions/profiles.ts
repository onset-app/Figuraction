"use server"

import * as Sentry from "@sentry/nextjs"
import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { nullableText } from "@/lib/utils"
import { type ProfileInput, profileSchema } from "@/schemas/profile"
import type { ExperienceLevel } from "@/types/enums"

/** Discriminated result returned by profile mutations that carry no payload. */
export type ProfileActionResult = { success: true } | { success: false; error: string }

/** Result of a photo upload — returns the public URL on success. */
export type PhotoUploadResult = { success: true; url: string } | { success: false; error: string }

/** Accepted avatar formats. Stored under a `.jpg` path regardless (see below). */
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"]
const MAX_PHOTO_BYTES = 5 * 1024 * 1024 // 5 MB

/**
 * Update the current user's profile.
 *
 * Runs through the RLS-scoped server client and filters on the authenticated
 * user's id, so a user can only ever mutate their own row (the "Users can update
 * own profile" policy enforces this a second time at the database). Input is
 * re-validated server-side because the action is a trust boundary.
 */
export async function updateProfile(input: ProfileInput): Promise<ProfileActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: "Vous devez être connecté." }
  }

  const parsed = profileSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Données invalides.",
    }
  }

  const { firstName, lastName, phone, city, age, bio, experience } = parsed.data

  const { error } = await supabase
    .from("profiles")
    .update({
      first_name: firstName,
      last_name: lastName,
      phone: nullableText(phone),
      city: nullableText(city),
      age: age ?? null,
      bio: nullableText(bio),
      // Optional since the role-aware form doesn't show it to productions;
      // explicit null (not undefined/omitted) so the column reflects the input.
      experience: experience ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)

  if (error) {
    Sentry.captureException(error, { tags: { feature: "profiles" }, extra: { step: "update" } })
    return {
      success: false,
      error: "Une erreur est survenue lors de l'enregistrement du profil. Réessayez.",
    }
  }

  revalidatePath("/app/profil")
  return { success: true }
}

/**
 * Upload the current user's avatar and persist its URL on the profile.
 *
 * The storage path is derived exclusively from the authenticated user's id
 * (`{userId}/profile.jpg`), never from client input, so a user can only write
 * their own avatar. The upload uses the service-role client to bypass storage
 * RLS — the path scoping above is what enforces ownership — and `upsert` so a
 * new photo replaces the previous one at the same key. A cache-busting query
 * param is appended to the stored URL so clients pick up the replacement
 * instead of a stale cached image.
 */
export async function uploadPhoto(file: File): Promise<PhotoUploadResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: "Vous devez être connecté." }
  }

  if (!file || file.size === 0) {
    return { success: false, error: "Aucun fichier fourni." }
  }
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return { success: false, error: "Format non supporté. Utilisez JPEG, PNG ou WebP." }
  }
  if (file.size > MAX_PHOTO_BYTES) {
    return { success: false, error: "L'image ne doit pas dépasser 5 Mo." }
  }

  const path = `${user.id}/profile.jpg`
  const admin = createAdminClient()

  const { error: uploadError } = await admin.storage.from("avatars").upload(path, file, {
    contentType: file.type,
    upsert: true,
  })
  if (uploadError) {
    Sentry.captureException(uploadError, {
      tags: { feature: "profiles" },
      extra: { step: "photo-upload" },
    })
    return {
      success: false,
      error: "Une erreur est survenue lors de l'envoi de la photo. Réessayez.",
    }
  }

  const {
    data: { publicUrl },
  } = admin.storage.from("avatars").getPublicUrl(path)
  const photoUrl = `${publicUrl}?v=${Date.now()}`

  const { error: dbError } = await supabase
    .from("profiles")
    .update({ photo_url: photoUrl, updated_at: new Date().toISOString() })
    .eq("id", user.id)
  if (dbError) {
    Sentry.captureException(dbError, {
      tags: { feature: "profiles" },
      extra: { step: "photo-persist" },
    })
    return {
      success: false,
      error: "La photo a été envoyée mais n'a pas pu être enregistrée. Réessayez.",
    }
  }

  revalidatePath("/app/profil")
  return { success: true, url: photoUrl }
}

/** A figurant profile as viewed by a production/admin on the candidate detail page. */
export type FigurantProfile = {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string | null
  city: string | null
  age: number | null
  bio: string | null
  // The DB check constraint guarantees the value set, so type it as the union.
  experience: ExperienceLevel | null
  photoUrl: string | null
}

/**
 * Fetch a figurant's full profile for the production candidate view.
 *
 * Relies on RLS's `profiles_select_figurants_by_staff`, which only lets a
 * production/admin read rows where `role = 'figurant'`. A production therefore
 * can't reach a non-figurant profile through this path; `.eq('role','figurant')`
 * also keeps the result honest. Returns null when not found / not permitted.
 */
export async function getFigurantProfile(id: string): Promise<FigurantProfile | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return null
  }

  const { data } = await supabase
    .from("profiles")
    .select(
      "id, email, firstName:first_name, lastName:last_name, phone, city, age, bio, experience, photoUrl:photo_url"
    )
    .eq("id", id)
    .eq("role", "figurant")
    .maybeSingle()

  return (data as FigurantProfile | null) ?? null
}

/** A figurant summary row for the production's browse-all-candidates page. */
export type FigurantSummary = {
  id: string
  firstName: string
  lastName: string
  city: string | null
  age: number | null
  experience: ExperienceLevel | null
  photoUrl: string | null
  available: boolean
}

/**
 * Every figurant profile, for the production's candidate browser
 * (/app/candidats). Same RLS boundary as getFigurantProfile:
 * `profiles_select_figurants_by_staff` only exposes figurant rows to
 * production/admin callers — anyone else gets an empty list.
 */
export async function getFigurants(): Promise<FigurantSummary[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return []
  }

  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, firstName:first_name, lastName:last_name, city, age, experience, photoUrl:photo_url, available"
    )
    .eq("role", "figurant")
    .order("last_name", { ascending: true })

  if (error) {
    Sentry.captureException(error, { tags: { feature: "profiles" }, extra: { step: "figurants" } })
  }
  return (data as FigurantSummary[] | null) ?? []
}
