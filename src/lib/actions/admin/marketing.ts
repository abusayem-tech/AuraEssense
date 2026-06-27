"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/actions/admin/audit";

/* ----------------------------- Promo codes ------------------------------- */
export async function savePromo(formData: FormData): Promise<{ ok: boolean; error?: string }> {
  const ctx = await requireAdmin();
  const supabase = createAdminClient();
  const id = formData.get("id") ? String(formData.get("id")) : null;
  const payload = {
    code: String(formData.get("code") || "").toUpperCase().trim(),
    type: String(formData.get("type") || "percent"),
    value: Number(formData.get("value") || 0),
    min_order: Number(formData.get("min_order") || 0),
    usage_limit: formData.get("usage_limit") ? Number(formData.get("usage_limit")) : null,
    active: formData.get("active") === "on",
    expires_at: formData.get("expires_at") ? String(formData.get("expires_at")) : null,
  };
  if (!payload.code) return { ok: false, error: "Code required." };
  if (id) await supabase.from("promo_codes").update(payload).eq("id", id);
  else await supabase.from("promo_codes").insert(payload);
  await logAudit(ctx, id ? "update" : "create", "promo_code", id);
  revalidatePath("/admin/promo-codes");
  return { ok: true };
}

export async function deletePromo(id: string): Promise<{ ok: boolean }> {
  await requireAdmin();
  const supabase = createAdminClient();
  await supabase.from("promo_codes").delete().eq("id", id);
  revalidatePath("/admin/promo-codes");
  return { ok: true };
}

/* ----------------------------- Gift cards -------------------------------- */
export async function saveGiftCard(formData: FormData): Promise<{ ok: boolean; error?: string }> {
  const ctx = await requireAdmin();
  const supabase = createAdminClient();
  const id = formData.get("id") ? String(formData.get("id")) : null;
  const amount = Number(formData.get("initial_amount") || 0);
  const code = String(formData.get("code") || "").toUpperCase().trim();
  if (!code) return { ok: false, error: "Code required." };
  if (id) {
    await supabase
      .from("gift_cards")
      .update({ code, status: String(formData.get("status") || "active") })
      .eq("id", id);
  } else {
    await supabase.from("gift_cards").insert({ code, initial_amount: amount, balance: amount });
  }
  await logAudit(ctx, id ? "update" : "create", "gift_card", id);
  revalidatePath("/admin/gift-cards");
  return { ok: true };
}

export async function deleteGiftCard(id: string): Promise<{ ok: boolean }> {
  await requireAdmin();
  const supabase = createAdminClient();
  await supabase.from("gift_cards").delete().eq("id", id);
  revalidatePath("/admin/gift-cards");
  return { ok: true };
}

/* ------------------------------- Banners --------------------------------- */
export async function saveBanner(formData: FormData): Promise<{ ok: boolean }> {
  await requireAdmin();
  const supabase = createAdminClient();
  const id = formData.get("id") ? String(formData.get("id")) : null;
  const payload = {
    title: String(formData.get("title") || "") || null,
    subtitle: String(formData.get("subtitle") || "") || null,
    image: String(formData.get("image") || "") || null,
    link: String(formData.get("link") || "") || null,
    cta_label: String(formData.get("cta_label") || "") || null,
    active: formData.get("active") === "on",
  };
  if (id) await supabase.from("banners").update(payload).eq("id", id);
  else await supabase.from("banners").insert(payload);
  revalidatePath("/admin/banners");
  return { ok: true };
}

export async function deleteBanner(id: string): Promise<{ ok: boolean }> {
  await requireAdmin();
  const supabase = createAdminClient();
  await supabase.from("banners").delete().eq("id", id);
  revalidatePath("/admin/banners");
  return { ok: true };
}

/* ------------------------------- Reviews --------------------------------- */
export async function moderateReview(
  id: string,
  status: "approved" | "rejected" | "pending",
): Promise<{ ok: boolean }> {
  const ctx = await requireAdmin();
  const supabase = createAdminClient();
  await supabase.from("reviews").update({ status }).eq("id", id);
  await logAudit(ctx, "moderate", "review", id, { status });
  revalidatePath("/admin/reviews");
  return { ok: true };
}

export async function deleteReview(id: string): Promise<{ ok: boolean }> {
  await requireAdmin();
  const supabase = createAdminClient();
  await supabase.from("reviews").delete().eq("id", id);
  revalidatePath("/admin/reviews");
  return { ok: true };
}
