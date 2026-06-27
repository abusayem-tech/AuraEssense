import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/admin/admin-ui";
import { ProductForm } from "@/components/admin/product-form";
import { getBrands, getFamilies } from "@/lib/queries";

export default async function NewProductPage() {
  const [brands, families] = await Promise.all([getBrands(), getFamilies()]);

  return (
    <div className="max-w-3xl">
      <Link href="/admin/products" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted hover:text-gold">
        <ArrowLeft size={14} /> Back to Products
      </Link>
      <h1 className="mb-6 mt-4 font-display text-3xl text-ivory">New Product</h1>
      <Card>
        <ProductForm brands={brands} families={families} />
        <p className="mt-4 text-xs text-muted">
          Save the product to add sizes (variants) and images.
        </p>
      </Card>
    </div>
  );
}
