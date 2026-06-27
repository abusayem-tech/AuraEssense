import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim();
  if (q.length < 2) return NextResponse.json({ products: [], brands: [] });

  const supabase = await createClient();

  const [{ data: products }, { data: brands }] = await Promise.all([
    supabase
      .from("products")
      .select(
        "id, slug, name, gender, brand:brands(name), images:product_images(url, position), variants:product_variants(price_bdt, sale_price_bdt)",
      )
      .eq("is_active", true)
      .ilike("search_text", `%${q.toLowerCase()}%`)
      .order("position", { referencedTable: "product_images", ascending: true })
      .limit(6),
    supabase.from("brands").select("name, slug").ilike("name", `%${q}%`).limit(4),
  ]);

  return NextResponse.json({
    products: products ?? [],
    brands: brands ?? [],
  });
}
