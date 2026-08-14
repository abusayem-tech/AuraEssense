"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAudit } from "@/lib/actions/admin/audit";
import { slugify } from "@/lib/utils";

function csv(value: FormDataEntryValue | null): string[] {
  return String(value ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function revalidateStorefrontCatalog() {
  revalidatePath("/");
  revalidatePath("/fragrances");
  revalidatePath("/brands");
  revalidatePath("/collections");
}

async function productSlug(
  supabase: ReturnType<typeof createAdminClient>,
  productId: string,
): Promise<string | null> {
  const { data } = await supabase
    .from("products")
    .select("slug")
    .eq("id", productId)
    .maybeSingle();
  return (data as { slug: string } | null)?.slug ?? null;
}

/* ----------------------------- Products ---------------------------------- */
export async function saveProduct(
  formData: FormData,
): Promise<{ ok: boolean; id?: string; error?: string }> {
  const ctx = await requireAdmin();
  const supabase = createAdminClient();

  const id = formData.get("id") ? String(formData.get("id")) : null;
  const name = String(formData.get("name") || "").trim();
  if (!name) return { ok: false, error: "Name is required." };

  const payload = {
    name,
    slug: String(formData.get("slug") || "") || slugify(name),
    sku_base: String(formData.get("sku_base") || "").toUpperCase() || slugify(name).toUpperCase().slice(0, 8),
    brand_id: String(formData.get("brand_id") || ""),
    family_id: String(formData.get("family_id") || "") || null,
    gender: String(formData.get("gender") || "unisex"),
    concentration: String(formData.get("concentration") || "EDP"),
    description: String(formData.get("description") || "") || null,
    story: String(formData.get("story") || "") || null,
    top_notes: csv(formData.get("top_notes")),
    heart_notes: csv(formData.get("heart_notes")),
    base_notes: csv(formData.get("base_notes")),
    season: csv(formData.get("season")),
    occasion: csv(formData.get("occasion")),
    longevity: Number(formData.get("longevity") || 3),
    sillage: Number(formData.get("sillage") || 3),
    is_active: formData.get("is_active") === "on",
    is_featured: formData.get("is_featured") === "on",
    search_text: `${name} ${String(formData.get("top_notes") || "")} ${String(formData.get("heart_notes") || "")} ${String(formData.get("base_notes") || "")}`.toLowerCase(),
  };

  if (!payload.brand_id) return { ok: false, error: "Brand is required." };

  const pairingIds = formData.getAll("pairing_ids").map(String);
  const suggestedIds = formData.getAll("suggested_ids").map(String);

  let savedId = id;
  let oldSlug: string | null = null;
  if (id) {
    oldSlug = await productSlug(supabase, id);
    const { error } = await supabase.from("products").update(payload).eq("id", id);
    if (error) return { ok: false, error: error.message };
    await logAudit(ctx, "update", "product", id);
  } else {
    const { data, error } = await supabase
      .from("products")
      .insert(payload)
      .select("id")
      .single();
    if (error) return { ok: false, error: error.message };
    savedId = (data as { id: string }).id;
    await logAudit(ctx, "create", "product", savedId);
  }

  const rel = await replaceProductRelations(supabase, savedId!, pairingIds, suggestedIds);
  if (!rel.ok) return rel;

  revalidatePath("/admin/products");
  revalidateStorefrontCatalog();
  revalidatePath(`/fragrances/${payload.slug}`);
  if (oldSlug && oldSlug !== payload.slug) revalidatePath(`/fragrances/${oldSlug}`);
  if (savedId) revalidatePath(`/admin/products/${savedId}`);
  return { ok: true, id: savedId! };
}

export async function deleteProduct(id: string): Promise<{ ok: boolean }> {
  const ctx = await requireAdmin();
  const supabase = createAdminClient();
  const slug = await productSlug(supabase, id);
  await supabase.from("products").delete().eq("id", id);
  await logAudit(ctx, "delete", "product", id);
  revalidatePath("/admin/products");
  revalidateStorefrontCatalog();
  if (slug) revalidatePath(`/fragrances/${slug}`);
  return { ok: true };
}

/* ----------------------------- Variants ---------------------------------- */
export async function saveVariant(
  formData: FormData,
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const supabase = createAdminClient();
  const id = formData.get("id") ? String(formData.get("id")) : null;
  const productId = String(formData.get("product_id"));
  const sizeMl = Number(formData.get("size_ml") || 0);
  const payload = {
    product_id: productId,
    size_ml: sizeMl,
    sku: String(formData.get("sku") || "").toUpperCase(),
    price_bdt: Number(formData.get("price_bdt") || 0),
    sale_price_bdt: formData.get("sale_price_bdt") ? Number(formData.get("sale_price_bdt")) : null,
    stock: Number(formData.get("stock") || 0),
    is_sample: formData.get("is_sample") === "on",
  };
  if (id) {
    const { error } = await supabase.from("product_variants").update(payload).eq("id", id);
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await supabase.from("product_variants").insert(payload);
    if (error) return { ok: false, error: error.message };
  }
  revalidatePath(`/admin/products/${productId}`);
  await revalidateProductStorefront(supabase, productId);
  return { ok: true };
}

export async function deleteVariant(id: string, productId: string): Promise<{ ok: boolean }> {
  await requireAdmin();
  const supabase = createAdminClient();
  await supabase.from("product_variants").delete().eq("id", id);
  revalidatePath(`/admin/products/${productId}`);
  await revalidateProductStorefront(supabase, productId);
  return { ok: true };
}

/* ----------------------------- Images ------------------------------------ */
export async function addImage(
  productId: string,
  url: string,
): Promise<{ ok: boolean }> {
  await requireAdmin();
  const supabase = createAdminClient();
  const { count } = await supabase
    .from("product_images")
    .select("id", { count: "exact", head: true })
    .eq("product_id", productId);
  await supabase.from("product_images").insert({
    product_id: productId,
    url,
    position: count ?? 0,
  });
  revalidatePath(`/admin/products/${productId}`);
  await revalidateProductStorefront(supabase, productId);
  return { ok: true };
}

export async function deleteImage(id: string, productId: string): Promise<{ ok: boolean }> {
  await requireAdmin();
  const supabase = createAdminClient();
  await supabase.from("product_images").delete().eq("id", id);
  revalidatePath(`/admin/products/${productId}`);
  await revalidateProductStorefront(supabase, productId);
  return { ok: true };
}

async function revalidateProductStorefront(
  supabase: ReturnType<typeof createAdminClient>,
  productId: string,
) {
  revalidateStorefrontCatalog();
  const slug = await productSlug(supabase, productId);
  if (slug) revalidatePath(`/fragrances/${slug}`);
}

function uniqueOtherIds(ids: string[], productId: string): string[] {
  return [...new Set(ids.filter((id) => id && id !== productId))];
}

async function replaceProductRelations(
  supabase: ReturnType<typeof createAdminClient>,
  productId: string,
  pairingIds: string[],
  suggestedIds: string[],
): Promise<{ ok: boolean; error?: string }> {
  const pairs = uniqueOtherIds(pairingIds, productId);
  const suggested = uniqueOtherIds(suggestedIds, productId);

  const { error: delPairs } = await supabase.from("pairs_with").delete().eq("product_id", productId);
  if (delPairs) return { ok: false, error: delPairs.message };

  const { error: delSug } = await supabase
    .from("suggested_products")
    .delete()
    .eq("product_id", productId);
  if (delSug) return { ok: false, error: delSug.message };

  if (pairs.length) {
    const { error } = await supabase.from("pairs_with").insert(
      pairs.map((related_product_id, position) => ({
        product_id: productId,
        related_product_id,
        position,
      })),
    );
    if (error) return { ok: false, error: error.message };
  }

  if (suggested.length) {
    const { error } = await supabase.from("suggested_products").insert(
      suggested.map((suggested_product_id, position) => ({
        product_id: productId,
        suggested_product_id,
        position,
      })),
    );
    if (error) return { ok: false, error: error.message };
  }

  return { ok: true };
}

/* ----------------------------- Brands ------------------------------------ */
export async function saveBrand(formData: FormData): Promise<{ ok: boolean; error?: string }> {
  const ctx = await requireAdmin();
  const supabase = createAdminClient();
  const id = formData.get("id") ? String(formData.get("id")) : null;
  const name = String(formData.get("name") || "").trim();
  if (!name) return { ok: false, error: "Name required." };
  const payload = {
    name,
    slug: String(formData.get("slug") || "") || slugify(name),
    country: String(formData.get("country") || "") || null,
    description: String(formData.get("description") || "") || null,
    logo_url: String(formData.get("logo_url") || "") || null,
    hero_image: String(formData.get("hero_image") || "") || null,
  };
  let oldSlug: string | null = null;
  if (id) {
    const { data } = await supabase.from("brands").select("slug").eq("id", id).maybeSingle();
    oldSlug = (data as { slug: string } | null)?.slug ?? null;
    await supabase.from("brands").update(payload).eq("id", id);
  } else {
    await supabase.from("brands").insert(payload);
  }
  await logAudit(ctx, id ? "update" : "create", "brand", id);
  revalidatePath("/admin/brands");
  revalidatePath("/brands");
  revalidatePath(`/brands/${payload.slug}`);
  if (oldSlug && oldSlug !== payload.slug) revalidatePath(`/brands/${oldSlug}`);
  revalidatePath("/");
  return { ok: true };
}

export async function deleteBrand(id: string): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const supabase = createAdminClient();
  const { data } = await supabase.from("brands").select("slug").eq("id", id).maybeSingle();
  const slug = (data as { slug: string } | null)?.slug ?? null;
  const { error } = await supabase.from("brands").delete().eq("id", id);
  if (error) return { ok: false, error: "Brand has products; reassign them first." };
  revalidatePath("/admin/brands");
  revalidatePath("/brands");
  if (slug) revalidatePath(`/brands/${slug}`);
  revalidatePath("/");
  return { ok: true };
}

/* ----------------------------- Families ---------------------------------- */
export async function saveFamily(formData: FormData): Promise<{ ok: boolean }> {
  await requireAdmin();
  const supabase = createAdminClient();
  const id = formData.get("id") ? String(formData.get("id")) : null;
  const name = String(formData.get("name") || "").trim();
  const payload = {
    name,
    slug: String(formData.get("slug") || "") || slugify(name),
    description: String(formData.get("description") || "") || null,
    accent_color: String(formData.get("accent_color") || "") || null,
  };
  if (id) await supabase.from("fragrance_families").update(payload).eq("id", id);
  else await supabase.from("fragrance_families").insert(payload);
  revalidatePath("/admin/families");
  revalidateStorefrontCatalog();
  return { ok: true };
}

export async function deleteFamily(id: string): Promise<{ ok: boolean }> {
  await requireAdmin();
  const supabase = createAdminClient();
  await supabase.from("fragrance_families").delete().eq("id", id);
  revalidatePath("/admin/families");
  revalidateStorefrontCatalog();
  return { ok: true };
}

/* --------------------------- Collections --------------------------------- */
export async function saveCollection(
  formData: FormData,
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const supabase = createAdminClient();
  const id = formData.get("id") ? String(formData.get("id")) : null;
  const name = String(formData.get("name") || "").trim();
  if (!name) return { ok: false, error: "Name is required." };

  const payload = {
    name,
    slug: String(formData.get("slug") || "") || slugify(name),
    subtitle: String(formData.get("subtitle") || "") || null,
    description: String(formData.get("description") || "") || null,
    cover_image: String(formData.get("cover_image") || "") || null,
    is_featured: formData.get("is_featured") === "on",
    position: Number(formData.get("position") || 0),
  };
  const productIds = [...new Set(formData.getAll("product_ids").map(String).filter(Boolean))];

  let savedId = id;
  let oldSlug: string | null = null;
  if (id) {
    const { data } = await supabase.from("collections").select("slug").eq("id", id).maybeSingle();
    oldSlug = (data as { slug: string } | null)?.slug ?? null;
    const { error } = await supabase.from("collections").update(payload).eq("id", id);
    if (error) return { ok: false, error: error.message };
  } else {
    const { data, error } = await supabase
      .from("collections")
      .insert(payload)
      .select("id")
      .single();
    if (error) return { ok: false, error: error.message };
    savedId = (data as { id: string }).id;
  }

  const { error: delError } = await supabase
    .from("collection_products")
    .delete()
    .eq("collection_id", savedId);
  if (delError) return { ok: false, error: delError.message };

  if (productIds.length) {
    const { error } = await supabase.from("collection_products").insert(
      productIds.map((product_id, position) => ({
        collection_id: savedId,
        product_id,
        position,
      })),
    );
    if (error) return { ok: false, error: error.message };
  }

  revalidatePath("/admin/collections");
  if (savedId) revalidatePath(`/admin/collections/${savedId}`);
  revalidatePath("/collections");
  revalidatePath(`/collections/${payload.slug}`);
  if (oldSlug && oldSlug !== payload.slug) revalidatePath(`/collections/${oldSlug}`);
  revalidatePath("/");
  revalidatePath("/quiz");
  return { ok: true };
}

export async function deleteCollection(id: string): Promise<{ ok: boolean }> {
  await requireAdmin();
  const supabase = createAdminClient();
  const { data } = await supabase.from("collections").select("slug").eq("id", id).maybeSingle();
  const slug = (data as { slug: string } | null)?.slug ?? null;
  await supabase.from("collections").delete().eq("id", id);
  revalidatePath("/admin/collections");
  revalidatePath("/collections");
  if (slug) revalidatePath(`/collections/${slug}`);
  revalidatePath("/");
  revalidatePath("/quiz");
  return { ok: true };
}

/* ---------------------------- Inventory ---------------------------------- */
export async function adjustStock(
  variantId: string,
  delta: number,
  reason: string,
): Promise<{ ok: boolean }> {
  const ctx = await requireAdmin();
  const supabase = createAdminClient();
  const { data: v } = await supabase
    .from("product_variants")
    .select("stock, product_id")
    .eq("id", variantId)
    .maybeSingle();
  const row = v as { stock: number; product_id: string } | null;
  const stock = row?.stock ?? 0;
  await supabase
    .from("product_variants")
    .update({ stock: Math.max(0, stock + delta) })
    .eq("id", variantId);
  await supabase.from("inventory_logs").insert({
    variant_id: variantId,
    delta,
    reason,
    actor_id: ctx.userId,
  });
  revalidatePath("/admin/inventory");
  if (row?.product_id) await revalidateProductStorefront(supabase, row.product_id);
  return { ok: true };
}
