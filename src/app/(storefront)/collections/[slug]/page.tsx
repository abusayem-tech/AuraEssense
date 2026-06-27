import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container, EmptyState } from "@/components/ui/misc";
import { PageHeader } from "@/components/ui/page-header";
import { ProductGrid } from "@/components/product/product-grid";
import { getCollectionBySlug } from "@/lib/queries";
import { getWishlistIds } from "@/lib/actions/wishlist";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getCollectionBySlug(slug);
  return {
    title: data ? data.collection.name : "Collection",
    description: data?.collection.description ?? undefined,
  };
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getCollectionBySlug(slug);
  if (!data) notFound();

  const wishlist = await getWishlistIds();

  return (
    <>
      <PageHeader
        eyebrow={data.collection.subtitle ?? "Collection"}
        title={data.collection.name}
        description={data.collection.description ?? undefined}
      />
      <Container className="py-16">
        {data.products.length === 0 ? (
          <EmptyState title="This collection is being curated" />
        ) : (
          <ProductGrid products={data.products} wishlist={wishlist} />
        )}
      </Container>
    </>
  );
}
