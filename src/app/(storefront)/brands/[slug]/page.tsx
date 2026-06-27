import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container, EmptyState } from "@/components/ui/misc";
import { PageHeader } from "@/components/ui/page-header";
import { ProductGrid } from "@/components/product/product-grid";
import { getBrandBySlug } from "@/lib/queries";
import { getCatalog } from "@/lib/catalog";
import { getWishlistIds } from "@/lib/actions/wishlist";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug);
  return {
    title: brand ? brand.name : "Brand",
    description: brand?.description ?? undefined,
  };
}

export default async function BrandPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug);
  if (!brand) notFound();

  const [{ products }, wishlist] = await Promise.all([
    getCatalog({ brand: [slug], sort: "featured", page: 1 }),
    getWishlistIds(),
  ]);

  return (
    <>
      <PageHeader
        eyebrow={brand.country ?? "Maison"}
        title={brand.name}
        description={brand.description ?? undefined}
      />
      <Container className="py-16">
        {products.length === 0 ? (
          <EmptyState title="No fragrances available" />
        ) : (
          <ProductGrid products={products} wishlist={wishlist} />
        )}
      </Container>
    </>
  );
}
