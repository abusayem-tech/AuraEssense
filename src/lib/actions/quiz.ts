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
 * Weighted matching (REQ-5): score active, in-stock products against the
 * accumulated family and note weights from the quiz, return the top 3.
 */
export async function getQuizRecommendations(
  familyWeights: Record<string, number>,
  noteWeights: Record<string, number>,
): Promise<QuizResult[]> {
  const supabase = await createClient();

  // Resolve family slugs -> ids for matching.
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

  const scored = products
    .filter((p) => totalStock(p) > 0)
    .map((p) => {
      let score = 0;
      let reason = "";

      const fam = p.family_id ? familyById.get(p.family_id) : undefined;
      if (fam && familyWeights[fam.slug]) {
        score += familyWeights[fam.slug] * 3;
        reason = `A ${fam.name.toLowerCase()} signature matched to your taste`;
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

      // Gentle boost for highly-rated and featured picks.
      score += p.rating_avg * 0.5;
      if (p.is_featured) score += 0.5;

      return { product: p, score, matchReason: reason || "A house favourite" };
    })
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, 3);
}
