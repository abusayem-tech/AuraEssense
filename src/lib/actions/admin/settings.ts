"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/actions/admin/audit";

export async function saveSettings(formData: FormData): Promise<{ ok: boolean }> {
  const ctx = await requireAdmin();
  const supabase = createAdminClient();
  const payload = {
    id: true,
    store_name: String(formData.get("store_name") || "AuraEssence"),
    contact_email: String(formData.get("contact_email") || ""),
    contact_phone: String(formData.get("contact_phone") || ""),
    free_ship_threshold: Number(formData.get("free_ship_threshold") || 8000),
    gift_wrap_fee: Number(formData.get("gift_wrap_fee") || 250),
    loyalty_earn_rate: Number(formData.get("loyalty_earn_rate") || 0.02),
    tax_rate: Number(formData.get("tax_rate") || 0),
    low_stock_threshold: Number(formData.get("low_stock_threshold") || 5),
    payment_provider: String(formData.get("payment_provider") || "mock"),
    logistics_provider: String(formData.get("logistics_provider") || "mock"),
    updated_at: new Date().toISOString(),
  };
  await supabase.from("store_settings").upsert(payload, { onConflict: "id" });
  await logAudit(ctx, "update", "store_settings", "singleton");
  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");
  revalidatePath("/");
  revalidatePath("/contact");
  return { ok: true };
}

export async function saveShippingZone(formData: FormData): Promise<{ ok: boolean }> {
  await requireAdmin();
  const supabase = createAdminClient();
  const id = String(formData.get("id"));
  await supabase
    .from("shipping_zones")
    .update({
      fee_bdt: Number(formData.get("fee_bdt") || 0),
      free_ship_min: Number(formData.get("free_ship_min") || 0),
      est_days: String(formData.get("est_days") || ""),
    })
    .eq("id", id);
  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");
  revalidatePath("/");
  return { ok: true };
}

export async function markNotificationsRead(): Promise<{ ok: boolean }> {
  await requireAdmin();
  const supabase = createAdminClient();
  await supabase
    .from("admin_notifications")
    .update({ read_at: new Date().toISOString() })
    .is("read_at", null);
  revalidatePath("/admin/notifications");
  return { ok: true };
}
