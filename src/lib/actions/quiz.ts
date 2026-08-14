"use server";

import { createClient } from "@/lib/supabase/server";
import { totalStock } from "@/lib/pricing";
import type { Product } from "@/types";

const PRODUCT_SELECT = `
  *,
  brand:brands(*),
  family:fragrance_families(*),
  images:product_images(*),
  variants:product_variants(*)
`;

export interface QuizResult {
  product: Product;
  score: number;
  matchReason: string;
}

/**
 * Score active, in-stock products against quiz answers: fragrance families,
 * notes, specific perfumes, and collections picked in admin.
 */
export async function getQuizRecommendations(
  familyWeights: Record<string, number>,
  noteWeights: Record<string, number>,
  productIds: string[] = [],
  collectionIds: string[] = [],
): Promise<QuizResult[]> {
  const supabase = await createClient();

  const { data: families } = await supabase
    .from("fragrance_families")
    .select("id, slug, name");
  const familyById = new Map(
    (families ?? []).map((f) => [
      (f as { id: string }).id,
      f as { id: string; slug: string; name: string },
    ]),
  );

  const { data } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_active", true);

  const products = (data as unknown as Product[]) ?? [];
  const noteKeys = Object.keys(noteWeights).map((n) => n.toLowerCase());
  const directProducts = new Set(productIds);
  const collectionSet = new Set(collectionIds);

  const inCollections = new Set<string>();
  if (collectionSet.size > 0) {
    const { data: links } = await supabase
      .from("collection_products")
      .select("product_id, collection_id")
      .in("collection_id", [...collectionSet]);
    for (const row of (links ?? []) as Array<{ product_id: string; collection_id: string }>) {
      if (collectionSet.has(row.collection_id)) inCollections.add(row.product_id);
    }
  }

  const scored = products
    .filter((p) => totalStock(p) > 0)
    .map((p) => {
      let score = 0;
      let reason = "";

      if (directProducts.has(p.id)) {
        score += 12;
        reason = "Picked to match your answers";
      }

      if (inCollections.has(p.id)) {
        score += 5;
        if (!reason) reason = "From a collection that matches your taste";
      }

      const fam = p.family_id ? familyById.get(p.family_id) : undefined;
      if (fam && familyWeights[fam.slug]) {
        score += familyWeights[fam.slug] * 3;
        if (!reason) reason = `A ${fam.name.toLowerCase()} signature matched to your taste`;
      }

      const allNotes = [
        ...p.top_notes,
        ...p.heart_notes,
        ...p.base_notes,
      ].map((n) => n.toLowerCase());
      for (const nk of noteKeys) {
        if (allNotes.some((n) => n.includes(nk))) {
          score += noteWeights[nk] ?? 1;
          if (!reason) reason = `Featuring ${nk} you adore`;
        }
      }

      score += p.rating_avg * 0.5;
      if (p.is_featured) score += 0.5;

      return { product: p, score, matchReason: reason || "A house favourite" };
    })
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, 3);
}
