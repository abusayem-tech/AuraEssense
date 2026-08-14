import { createClient } from "@/lib/supabase/server";
import type {
  Banner,
  Brand,
  CatalogPick,
  Collection,
  FragranceFamily,
  JournalPost,
  Product,
  QuizQuestion,
  Review,
} from "@/types";

const PRODUCT_SELECT = `
  *,
  brand:brands(*),
  family:fragrance_families(*),
  images:product_images(*),
  variants:product_variants(*)
`;

const IMAGE_ORDER = {
  referencedTable: "product_images",
  ascending: true,
} as const;

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_active", true)
    .eq("is_featured", true)
    .order("position", IMAGE_ORDER)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data as unknown as Product[]) ?? [];
}

export async function getNewArrivals(limit = 8): Promise<Product[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_active", true)
    .order("position", IMAGE_ORDER)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data as unknown as Product[]) ?? [];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("slug", slug)
    .eq("is_active", true)
    .order("position", IMAGE_ORDER)
    .maybeSingle();
  return (data as unknown as Product) ?? null;
}

async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .in("id", ids)
    .eq("is_active", true)
    .order("position", IMAGE_ORDER);
  const byId = new Map(((data as unknown as Product[]) ?? []).map((p) => [p.id, p]));
  return ids.map((id) => byId.get(id)).filter((p): p is Product => Boolean(p));
}

export async function getRelatedProducts(
  product: Product,
  limit = 4,
): Promise<Product[]> {
  const supabase = await createClient();
  const { data: links } = await supabase
    .from("suggested_products")
    .select("suggested_product_id")
    .eq("product_id", product.id)
    .order("position");
  const curatedIds = (links ?? []).map(
    (l) => (l as { suggested_product_id: string }).suggested_product_id,
  );
  if (curatedIds.length > 0) return getProductsByIds(curatedIds);

  if (!product.family_id) return [];
  const { data } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_active", true)
    .eq("family_id", product.family_id)
    .neq("id", product.id)
    .order("position", IMAGE_ORDER)
    .limit(limit);
  return (data as unknown as Product[]) ?? [];
}

export async function getPairsWith(productId: string): Promise<Product[]> {
  const supabase = await createClient();
  const { data: links } = await supabase
    .from("pairs_with")
    .select("related_product_id")
    .eq("product_id", productId)
    .order("position");
  const ids = (links ?? []).map((l) => (l as { related_product_id: string }).related_product_id);
  return getProductsByIds(ids);
}

export async function getCatalogPicks(excludeId?: string): Promise<CatalogPick[]> {
  const supabase = await createClient();
  let q = supabase.from("products").select("id, name, brand:brands(name)").order("name");
  if (excludeId) q = q.neq("id", excludeId);
  const { data } = await q;
  const rows = (data ?? []) as unknown as Array<{
    id: string;
    name: string;
    brand: { name: string } | { name: string }[] | null;
  }>;
  return rows.map((p) => {
    const brand = Array.isArray(p.brand) ? p.brand[0] : p.brand;
    return {
      id: p.id,
      name: p.name,
      brandName: brand?.name ?? null,
    };
  });
}

export async function getProductRelationIds(productId: string): Promise<{
  pairingIds: string[];
  suggestedIds: string[];
}> {
  const supabase = await createClient();
  const [{ data: pairs }, { data: suggested }] = await Promise.all([
    supabase
      .from("pairs_with")
      .select("related_product_id")
      .eq("product_id", productId)
      .order("position"),
    supabase
      .from("suggested_products")
      .select("suggested_product_id")
      .eq("product_id", productId)
      .order("position"),
  ]);
  return {
    pairingIds: (pairs ?? []).map((r) => (r as { related_product_id: string }).related_product_id),
    suggestedIds: (suggested ?? []).map(
      (r) => (r as { suggested_product_id: string }).suggested_product_id,
    ),
  };
}

export async function getBrands(): Promise<Brand[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("brands").select("*").order("name");
  return (data as unknown as Brand[]) ?? [];
}

export async function getBrandBySlug(slug: string): Promise<Brand | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("brands")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  return (data as unknown as Brand) ?? null;
}

export async function getFamilies(): Promise<FragranceFamily[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("fragrance_families")
    .select("*")
    .order("name");
  return (data as unknown as FragranceFamily[]) ?? [];
}

export async function getCollections(featuredOnly = false): Promise<Collection[]> {
  const supabase = await createClient();
  let q = supabase.from("collections").select("*").order("position");
  if (featuredOnly) q = q.eq("is_featured", true);
  const { data } = await q;
  return (data as unknown as Collection[]) ?? [];
}

export async function getCollectionProductIds(collectionId: string): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("collection_products")
    .select("product_id")
    .eq("collection_id", collectionId)
    .order("position");
  return ((data ?? []) as Array<{ product_id: string }>).map((row) => row.product_id);
}

export async function getCollectionBySlug(
  slug: string,
): Promise<{ collection: Collection; products: Product[] } | null> {
  const supabase = await createClient();
  const { data: collection } = await supabase
    .from("collections")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (!collection) return null;

  const ids = await getCollectionProductIds((collection as Collection).id);
  const products = await getProductsByIds(ids);
  return { collection: collection as unknown as Collection, products };
}

export async function getProductReviews(productId: string): Promise<Review[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reviews")
    .select("*, profile:profiles(full_name)")
    .eq("product_id", productId)
    .eq("status", "approved")
    .eq("is_hidden", false)
    .order("helpful_count", { ascending: false })
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as unknown as (Review & {
    profile?: { full_name: string } | null;
  })[];

  // Seed which of these reviews the current viewer has already marked helpful.
  let votedSet = new Set<string>();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user && rows.length) {
    const { data: votes } = await supabase
      .from("review_votes")
      .select("review_id")
      .eq("user_id", user.id)
      .in(
        "review_id",
        rows.map((r) => r.id),
      );
    votedSet = new Set(
      (votes ?? []).map((v) => (v as { review_id: string }).review_id),
    );
  }

  return rows.map((r) => ({
    ...r,
    author_name: r.profile?.full_name ?? "Verified Buyer",
    viewer_voted: votedSet.has(r.id),
  }));
}

export async function getJournalPosts(limit?: number): Promise<JournalPost[]> {
  const supabase = await createClient();
  let q = supabase
    .from("journal_posts")
    .select("*")
    .not("published_at", "is", null)
    .order("published_at", { ascending: false });
  if (limit) q = q.limit(limit);
  const { data } = await q;
  return (data as unknown as JournalPost[]) ?? [];
}

export async function getJournalPost(slug: string): Promise<JournalPost | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("journal_posts")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  return (data as unknown as JournalPost) ?? null;
}

export async function getQuizQuestions(): Promise<QuizQuestion[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("quiz_questions")
    .select("*, options:quiz_options(*)")
    .order("position");
  const questions = (data ?? []) as unknown as QuizQuestion[];
  questions.forEach((q) => q.options.sort((a, b) => a.position - b.position));
  return questions;
}

export async function getQuizQuestion(id: string): Promise<QuizQuestion | null> {
  const questions = await getQuizQuestions();
  return questions.find((q) => q.id === id) ?? null;
}

export async function getCatalogNotes(): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("top_notes, heart_notes, base_notes");
  const byKey = new Map<string, string>();
  for (const row of (data ?? []) as Array<{
    top_notes: string[] | null;
    heart_notes: string[] | null;
    base_notes: string[] | null;
  }>) {
    for (const note of [...(row.top_notes ?? []), ...(row.heart_notes ?? []), ...(row.base_notes ?? [])]) {
      const trimmed = note.trim();
      if (!trimmed) continue;
      const key = trimmed.toLowerCase();
      if (!byKey.has(key)) byKey.set(key, trimmed);
    }
  }
  return [...byKey.values()].sort((a, b) => a.localeCompare(b));
}

export async function getContentPage(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("content_pages")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  return data as { title: string; body: string } | null;
}

export async function getActiveBanners(): Promise<Banner[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("banners")
    .select("*")
    .eq("active", true)
    .order("position", { ascending: true });
  return (data as unknown as Banner[]) ?? [];
}
