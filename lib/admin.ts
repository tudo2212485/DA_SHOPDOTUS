import type { SupabaseClient, User } from "@supabase/supabase-js";

const ADMIN_EMAILS = new Set(["admin@dotus.test"]);

export async function isAdminUser(
  supabase: SupabaseClient,
  user: (Pick<User, "id"> & { email?: string | null }) | null,
) {
  if (!user) return false;
  if (user.email && ADMIN_EMAILS.has(user.email.toLowerCase())) return true;

  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  return data?.role === "admin";
}

export function safePath(value: string | null | undefined) {
  return value?.startsWith("/") ? value : null;
}
