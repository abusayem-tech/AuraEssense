"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/actions/admin/audit";

export async function adjustCustomerLoyalty(
  userId: string,
  points: number,
  reason: string,
): Promise<{ ok: boolean }> {
  const ctx = await requireAdmin();
  const supabase = createAdminClient();
  const { data: p } = await supabase
    .from("profiles")
    .select("loyalty_points")
    .eq("id", userId)
    .maybeSingle();
  const current = (p as { loyalty_points: number } | null)?.loyalty_points ?? 0;
  await supabase
    .from("profiles")
    .update({ loyalty_points: Math.max(0, current + points) })
    .eq("id", userId);
  await supabase.from("loyalty_transactions").insert({
    user_id: userId,
    points,
    reason: reason || "Admin adjustment",
  });
  await logAudit(ctx, "loyalty_adjust", "profile", userId, { points });
  revalidatePath(`/admin/customers/${userId}`);
  return { ok: true };
}

export async function toggleBlockCustomer(userId: string): Promise<{ ok: boolean }> {
  const ctx = await requireAdmin();
  const supabase = createAdminClient();
  const { data: p } = await supabase
    .from("profiles")
    .select("is_blocked")
    .eq("id", userId)
    .maybeSingle();
  const blocked = (p as { is_blocked: boolean } | null)?.is_blocked ?? false;
  await supabase.from("profiles").update({ is_blocked: !blocked }).eq("id", userId);
  await logAudit(ctx, blocked ? "unblock" : "block", "profile", userId);
  revalidatePath(`/admin/customers/${userId}`);
  return { ok: true };
}

export async function setCustomerRole(
  userId: string,
  role: "customer" | "admin",
): Promise<{ ok: boolean }> {
  const ctx = await requireAdmin();
  const supabase = createAdminClient();
  await supabase.from("profiles").update({ role }).eq("id", userId);
  await logAudit(ctx, "role_change", "profile", userId, { role });
  revalidatePath(`/admin/customers/${userId}`);
  return { ok: true };
}

export async function saveCustomerNote(
  userId: string,
  notes: string,
): Promise<{ ok: boolean }> {
  await requireAdmin();
  const supabase = createAdminClient();
  await supabase.from("profiles").update({ notes }).eq("id", userId);
  revalidatePath(`/admin/customers/${userId}`);
  return { ok: true };
}
