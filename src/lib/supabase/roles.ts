import type { SupabaseClient } from "@supabase/supabase-js"
import type { UserRole } from "@/types/enums"

/** Read the caller's authoritative role from their profile (RLS: own row only). */
export async function getUserRole(
  supabase: SupabaseClient,
  userId: string
): Promise<UserRole | null> {
  const { data } = await supabase.from("profiles").select("role").eq("id", userId).single()
  return (data?.role as UserRole | undefined) ?? null
}
