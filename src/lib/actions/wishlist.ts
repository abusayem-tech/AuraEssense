"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function toggleWishlist(
  productId: string,
): Promise<{ ok: boolean; wished: boolean; needsAuth?: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, wished: false, needsAuth: true };

  const { data: existing } = await supabase
    .from("wishlists")
    .select("product_id")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("wishlists")
      .delete()
      .eq("user_id", user.id)
      .eq("product_id", productId);
    revalidatePath("/account/wishlist");
    return { ok: true, wished: false };
  }

  await supabase
    .from("wishlists")
    .insert({ user_id: user.id, product_id: productId });
  revalidatePath("/account/wishlist");
  return { ok: true, wished: true };
}

export async function getWishlistIds(): Promise<Set<string>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Set();
  const { data } = await supabase
    .from("wishlists")
    .select("product_id")
    .eq("user_id", user.id);
  return new Set((data ?? []).map((r) => (r as { product_id: string }).product_id));
}
