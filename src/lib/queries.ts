import { createClient } from "@/lib/supabase/server";
import type {
  Banner,
  Brand,
  Collection,
  FragranceFamily,
  JournalPost,
  Product,
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

export async function getRelatedProducts(
  product: Product,
  limit = 4,
): Promise<Product[]> {
  // No family => nothing to relate by (and avoids an invalid uuid filter).
  if (!product.family_id) return [];
  const supabase = await createClient();
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
    .eq("product_id", productId);
  const ids = (links ?? []).map((l) => (l as { related_product_id: string }).related_product_id);
  if (ids.length === 0) return [];
  const { data } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .in("id", ids)
    .order("position", IMAGE_ORDER);
  return (data as unknown as Product[]) ?? [];
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

  const { data: links } = await supabase
    .from("collection_products")
    .select("product_id")
    .eq("collection_id", (collection as Collection).id);
  const ids = (links ?? []).map((l) => (l as { product_id: string }).product_id);

  let products: Product[] = [];
  if (ids.length > 0) {
    const { data } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .in("id", ids)
      .eq("is_active", true)
      .order("position", IMAGE_ORDER);
    products = (data as unknown as Product[]) ?? [];
  }
  return { collection: collection as unknown as Collection, products };
}

export async function getProductReviews(productId: string): Promise<Review[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reviews")
    .select("*, profile:profiles(full_name)")
    .eq("product_id", productId)
    .eq("status", "approved")
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

export async function getQuizQuestions() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("quiz_questions")
    .select("*, options:quiz_options(*)")
    .order("position");
  const questions = (data ?? []) as unknown as Array<{
    id: string;
    position: number;
    prompt: string;
    subtitle: string | null;
    options: Array<{
      id: string;
      label: string;
      description: string | null;
      family_weights: Record<string, number>;
      note_weights: Record<string, number>;
      position: number;
    }>;
  }>;
  questions.forEach((q) => q.options.sort((a, b) => a.position - b.position));
  return questions;
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
