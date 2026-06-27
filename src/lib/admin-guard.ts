import { createClient } from "@/lib/supabase/server";

export interface AdminContext {
  userId: string;
  name: string;
}

/** Throws if the caller is not an authenticated admin. Use in admin actions. */
export async function requireAdmin(): Promise<AdminContext> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .maybeSingle();

  const p = profile as { role: string; full_name: string | null } | null;
  if (p?.role !== "admin") throw new Error("Forbidden");

  return { userId: user.id, name: p.full_name ?? user.email ?? "Admin" };
}

export async function isAdminUser(): Promise<boolean> {
  try {
    await requireAdmin();
    return true;
  } catch {
    return false;
  }
}
