"use server"

import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { type ProfileInput, profileSchema } from "@/schemas/profile"

/** Discriminated result returned by profile mutations that carry no payload. */
export type ProfileActionResult = { success: true } | { success: false; error: string }

/** Result of a photo upload — returns the public URL on success. */
export type PhotoUploadResult = { success: true; url: string } | { success: false; error: string }

/** Accepted avatar formats. Stored under a `.jpg` path regardless (see below). */
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"]
const MAX_PHOTO_BYTES = 5 * 1024 * 1024 // 5 MB

/** Normalise an optional free-text field: blank/whitespace becomes null. */
function nullableText(value: string | undefined): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

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
      experience,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)

  if (error) {
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
    return {
      success: false,
      error: "La photo a été envoyée mais n'a pas pu être enregistrée. Réessayez.",
    }
  }

  revalidatePath("/app/profil")
  return { success: true, url: photoUrl }
}
