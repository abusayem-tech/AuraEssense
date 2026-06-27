import { createClient } from "@/lib/supabase/server";
import { fromPrice } from "@/lib/pricing";
import type { Product } from "@/types";

const PRODUCT_SELECT = `
  *,
  brand:brands(*),
  family:fragrance_families(*),
  images:product_images(*),
  variants:product_variants(*)
`;

export interface CatalogFilters {
  q?: string;
  brand?: string[];
  family?: string[];
  gender?: string[];
  concentration?: string[];
  season?: string[];
  occasion?: string[];
  notes?: string[];
  priceMin?: number;
  priceMax?: number;
  samples?: boolean;
  sort?: "featured" | "newest" | "price-asc" | "price-desc" | "rating";
  page?: number;
}

export const PAGE_SIZE = 12;

export interface CatalogResult {
  products: Product[];
  total: number;
  page: number;
  pageCount: number;
}

function toArray(v: string | string[] | undefined): string[] {
  if (!v) return [];
  return Array.isArray(v) ? v : v.split(",").filter(Boolean);
}

/** Parse Next.js searchParams into typed catalog filters. */
export function parseFilters(
  sp: Record<string, string | string[] | undefined>,
): CatalogFilters {
  return {
    q: typeof sp.q === "string" ? sp.q : undefined,
    brand: toArray(sp.brand),
    family: toArray(sp.family),
    gender: toArray(sp.gender),
    concentration: toArray(sp.concentration),
    season: toArray(sp.season),
    occasion: toArray(sp.occasion),
    notes: toArray(sp.notes),
    priceMin:
      sp.priceMin && Number.isFinite(Number(sp.priceMin))
        ? Number(sp.priceMin)
        : undefined,
    priceMax:
      sp.priceMax && Number.isFinite(Number(sp.priceMax))
        ? Number(sp.priceMax)
        : undefined,
    samples: sp.samples === "1",
    sort: (sp.sort as CatalogFilters["sort"]) ?? "featured",
    page: sp.page ? Math.max(1, Number(sp.page)) : 1,
  };
}

export async function getCatalog(
  filters: CatalogFilters,
): Promise<CatalogResult> {
  const supabase = await createClient();

  // Resolve brand/family slugs to ids.
  let brandIds: string[] = [];
  let familyIds: string[] = [];
  if (filters.brand?.length) {
    const { data } = await supabase
      .from("brands")
      .select("id")
      .in("slug", filters.brand);
    brandIds = (data ?? []).map((b) => (b as { id: string }).id);
  }
  if (filters.family?.length) {
    const { data } = await supabase
      .from("fragrance_families")
      .select("id")
      .in("slug", filters.family);
    familyIds = (data ?? []).map((f) => (f as { id: string }).id);
  }

  // Sentinel that matches no rows — used when a requested brand/family slug
  // resolves to zero ids, so the filter yields an empty set (not all products).
  const NONE = "00000000-0000-0000-0000-000000000000";

  let query = supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .order("position", { referencedTable: "product_images", ascending: true })
    .eq("is_active", true);

  if (filters.brand?.length)
    query = query.in("brand_id", brandIds.length ? brandIds : [NONE]);
  if (filters.family?.length)
    query = query.in("family_id", familyIds.length ? familyIds : [NONE]);
  if (filters.gender?.length) query = query.in("gender", filters.gender);
  if (filters.concentration?.length)
    query = query.in("concentration", filters.concentration);
  if (filters.season?.length) query = query.overlaps("season", filters.season);
  if (filters.occasion?.length)
    query = query.overlaps("occasion", filters.occasion);
  if (filters.q)
    query = query.ilike("search_text", `%${filters.q.toLowerCase()}%`);

  // Notes: match any selected note in any of the three layers.
  if (filters.notes?.length) {
    const arr = `{${filters.notes.map((n) => `"${n}"`).join(",")}}`;
    query = query.or(
      `top_notes.ov.${arr},heart_notes.ov.${arr},base_notes.ov.${arr}`,
    );
  }

  // DB-level ordering for non-price sorts.
  if (filters.sort === "newest") query = query.order("created_at", { ascending: false });
  else if (filters.sort === "rating") query = query.order("rating_avg", { ascending: false });
  else query = query.order("is_featured", { ascending: false }).order("created_at", { ascending: false });

  const { data } = await query;
  let products = (data as unknown as Product[]) ?? [];

  // Sample-only filter.
  if (filters.samples) {
    products = products.filter((p) =>
      (p.variants ?? []).some((v) => v.is_sample),
    );
  }

  // Price range (computed from variants).
  if (filters.priceMin != null)
    products = products.filter((p) => fromPrice(p) >= filters.priceMin!);
  if (filters.priceMax != null)
    products = products.filter((p) => fromPrice(p) <= filters.priceMax!);

  // Price sort (JS — depends on variant pricing).
  if (filters.sort === "price-asc")
    products.sort((a, b) => fromPrice(a) - fromPrice(b));
  else if (filters.sort === "price-desc")
    products.sort((a, b) => fromPrice(b) - fromPrice(a));

  const total = products.length;
  const page = filters.page ?? 1;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const paged = products.slice(start, start + PAGE_SIZE);

  return { products: paged, total, page, pageCount };
}

/** All distinct notes across products (for the filter UI). */
export async function getAllNotes(): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("top_notes, heart_notes, base_notes")
    .eq("is_active", true);
  const set = new Set<string>();
  for (const row of (data ?? []) as Array<{
    top_notes: string[] | null;
    heart_notes: string[] | null;
    base_notes: string[] | null;
  }>) {
    [
      ...(row.top_notes ?? []),
      ...(row.heart_notes ?? []),
      ...(row.base_notes ?? []),
    ].forEach((n) => set.add(n));
  }
  return Array.from(set).sort();
}
