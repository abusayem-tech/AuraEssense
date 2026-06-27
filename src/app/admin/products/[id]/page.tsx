import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Card } from "@/components/admin/admin-ui";
import { ProductForm } from "@/components/admin/product-form";
import { VariantManager, ImageManager } from "@/components/admin/variant-image-manager";
import { DeleteProductButton } from "@/components/admin/delete-product-button";
import { createClient } from "@/lib/supabase/server";
import { getBrands, getFamilies } from "@/lib/queries";
import type { Product } from "@/types";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data }, brands, families] = await Promise.all([
    supabase
      .from("products")
      .select("*, variants:product_variants(*), images:product_images(*)")
      .eq("id", id)
      .maybeSingle(),
    getBrands(),
    getFamilies(),
  ]);
  const product = data as unknown as Product | null;
  if (!product) notFound();

  const variants = (product.variants ?? []).sort((a, b) => a.size_ml - b.size_ml);
  const images = (product.images ?? []).sort((a, b) => a.position - b.position);

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between">
        <Link href="/admin/products" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted hover:text-gold">
          <ArrowLeft size={14} /> Back to Products
        </Link>
        <Link href={`/fragrances/${product.slug}`} className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-ivory-dim hover:text-gold">
          <ExternalLink size={13} /> View Live
        </Link>
      </div>
      <h1 className="mb-6 mt-4 font-display text-3xl text-ivory">{product.name}</h1>

      <div className="space-y-6">
        <Card>
          <ProductForm product={product} brands={brands} families={families} />
        </Card>
        <Card>
          <VariantManager productId={product.id} variants={variants} />
        </Card>
        <Card>
          <ImageManager productId={product.id} images={images} />
        </Card>
        <Card>
          <h2 className="mb-2 font-display text-xl text-rose">Danger Zone</h2>
          <p className="mb-4 text-sm text-muted">Permanently delete this product and all its variants.</p>
          <DeleteProductButton productId={product.id} />
        </Card>
      </div>
    </div>
  );
}
