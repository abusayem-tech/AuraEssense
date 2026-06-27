"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const reviewSchema = z.object({
  productId: z.string().uuid(),
  slug: z.string(),
  rating: z.coerce.number().min(1).max(5),
  title: z.string().max(120).optional(),
  body: z.string().max(2000).optional(),
});

export async function submitReview(
  _prev: { ok: boolean; message: string } | null,
  formData: FormData,
): Promise<{ ok: boolean; message: string }> {
  const parsed = reviewSchema.safeParse({
    productId: formData.get("productId"),
    slug: formData.get("slug"),
    rating: formData.get("rating"),
    title: formData.get("title") || undefined,
    body: formData.get("body") || undefined,
  });
  if (!parsed.success) return { ok: false, message: "Please provide a rating." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Please sign in to leave a review." };

  // Verified purchase check.
  const { data: purchased } = await supabase
    .from("order_items")
    .select("id, orders!inner(user_id, status)")
    .eq("product_id", parsed.data.productId)
    .eq("orders.user_id", user.id)
    .in("orders.status", ["paid", "processing", "dispatched", "in_transit", "delivered"])
    .limit(1);

  const isVerified = (purchased ?? []).length > 0;

  const { error } = await supabase.from("reviews").upsert(
    {
      product_id: parsed.data.productId,
      user_id: user.id,
      rating: parsed.data.rating,
      title: parsed.data.title ?? null,
      body: parsed.data.body ?? null,
      is_verified_purchase: isVerified,
      status: "pending",
    },
    { onConflict: "product_id,user_id" },
  );

  if (error) return { ok: false, message: "Could not submit review." };
  revalidatePath(`/fragrances/${parsed.data.slug}`);
  return {
    ok: true,
    message: "Thank you. Your review will appear once approved.",
  };
}

export async function voteHelpful(reviewId: string): Promise<{ ok: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false };

  const { data: existing } = await supabase
    .from("review_votes")
    .select("review_id")
    .eq("review_id", reviewId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("review_votes")
      .delete()
      .eq("review_id", reviewId)
      .eq("user_id", user.id);
  } else {
    await supabase
      .from("review_votes")
      .insert({ review_id: reviewId, user_id: user.id, helpful: true });
  }
  return { ok: true };
}
