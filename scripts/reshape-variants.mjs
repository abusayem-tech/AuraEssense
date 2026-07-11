/**
 * One-off: give every product the variant set 3ml/5ml/10ml/50ml/100ml.
 * - Existing 8ml sample rows are converted in place to 10ml (preserves order FK refs).
 * - 3ml and 5ml rows are inserted where missing.
 * - Small sizes stay is_sample=true (discovery sizes) so the catalog samples
 *   filter and bottle-based "from" pricing keep working.
 * - Pricing derived from the product's 50ml price: 3ml=10%, 5ml=15%, 10ml=25%,
 *   rounded to the nearest 5 BDT. 50ml/100ml untouched.
 *
 * Run: node --env-file=.env.local scripts/reshape-variants.mjs [--dry-run]
 */
import { createClient } from "@supabase/supabase-js";

const dryRun = process.argv.includes("--dry-run");
const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

const roundTo5 = (n) => Math.round(n / 5) * 5;
const SMALL_SIZES = [
  { size: 3, pct: 0.1 },
  { size: 5, pct: 0.15 },
];

const { data: products, error: pe } = await db
  .from("products")
  .select("id, sku_base, name, variants:product_variants(*)")
  .order("name");
if (pe) throw pe;

let updated = 0,
  inserted = 0,
  skipped = 0;

for (const p of products) {
  const variants = p.variants ?? [];
  const v50 = variants.find((v) => v.size_ml === 50 && !v.is_sample);
  if (!v50) {
    console.warn(`SKIP ${p.name}: no 50ml variant to derive pricing from`);
    skipped++;
    continue;
  }

  // 1) Convert the legacy 8ml sample to 10ml in place.
  const v8 = variants.find((v) => v.size_ml === 8 && v.is_sample);
  const has10 = variants.some((v) => v.size_ml === 10);
  if (v8 && !has10) {
    const patch = {
      size_ml: 10,
      sku: `${p.sku_base}-10`,
      price_bdt: roundTo5(v50.price_bdt * 0.25),
      sale_price_bdt: null,
    };
    console.log(`${p.name}: 8ml ${v8.sku} -> 10ml`, patch.price_bdt);
    if (!dryRun) {
      const { error } = await db
        .from("product_variants")
        .update(patch)
        .eq("id", v8.id);
      if (error) throw new Error(`${p.name} 8->10: ${error.message}`);
    }
    updated++;
  }

  // 2) Insert 3ml / 5ml where missing.
  const rows = SMALL_SIZES.filter(
    ({ size }) => !variants.some((v) => v.size_ml === size),
  ).map(({ size, pct }) => ({
    product_id: p.id,
    size_ml: size,
    sku: `${p.sku_base}-${size}`,
    price_bdt: roundTo5(v50.price_bdt * pct),
    sale_price_bdt: null,
    stock: v8?.stock ?? 40,
    is_sample: true,
  }));
  if (rows.length) {
    console.log(
      `${p.name}: insert ${rows.map((r) => `${r.size_ml}ml@${r.price_bdt}`).join(", ")}`,
    );
    if (!dryRun) {
      const { error } = await db.from("product_variants").insert(rows);
      if (error) throw new Error(`${p.name} insert: ${error.message}`);
    }
    inserted += rows.length;
  }
}

console.log(
  `\n${dryRun ? "[DRY RUN] " : ""}converted: ${updated}, inserted: ${inserted}, skipped products: ${skipped}`,
);
