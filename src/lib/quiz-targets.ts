/** Pack catalog matches into quiz_options.family_weights without a schema change. */

const PRODUCT_KEY = "__p:";
const COLLECTION_KEY = "__c:";

export function packQuizTargets(input: {
  familySlugs: string[];
  productIds: string[];
  collectionIds: string[];
  strength: number;
}): Record<string, number> {
  const strength = Math.min(5, Math.max(1, Math.round(input.strength) || 2));
  const out: Record<string, number> = {};
  for (const slug of input.familySlugs) if (slug) out[slug] = strength;
  for (const id of input.productIds) if (id) out[`${PRODUCT_KEY}${id}`] = strength;
  for (const id of input.collectionIds) if (id) out[`${COLLECTION_KEY}${id}`] = strength;
  return out;
}

export function unpackQuizTargets(weights: Record<string, number> | null | undefined): {
  familySlugs: string[];
  productIds: string[];
  collectionIds: string[];
  strength: number;
} {
  const familySlugs: string[] = [];
  const productIds: string[] = [];
  const collectionIds: string[] = [];
  const strengths: number[] = [];
  for (const [key, raw] of Object.entries(weights ?? {})) {
    const value = Number(raw) || 2;
    strengths.push(value);
    if (key.startsWith(PRODUCT_KEY)) productIds.push(key.slice(PRODUCT_KEY.length));
    else if (key.startsWith(COLLECTION_KEY)) collectionIds.push(key.slice(COLLECTION_KEY.length));
    else familySlugs.push(key);
  }
  return {
    familySlugs,
    productIds,
    collectionIds,
    strength: strengths.length ? Math.max(...strengths) : 2,
  };
}

export function packNoteWeights(notes: string[], strength: number): Record<string, number> {
  const w = Math.min(5, Math.max(1, Math.round(strength) || 2));
  const out: Record<string, number> = {};
  for (const note of notes) {
    const key = note.trim().toLowerCase();
    if (key) out[key] = w;
  }
  return out;
}
