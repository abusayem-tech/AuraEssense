import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Truck, ShieldCheck, RefreshCw } from "lucide-react";
import { Container, SectionHeading } from "@/components/ui/misc";
import { Badge } from "@/components/ui/badge";
import { Rating } from "@/components/ui/rating";
import { Reveal } from "@/components/ui/reveal";
import { ProductGallery } from "@/components/product/product-gallery";
import { OlfactoryPyramid } from "@/components/product/olfactory-pyramid";
import { AttributeMeter } from "@/components/product/attribute-meter";
import { BuyBox } from "@/components/product/buy-box";
import { ProductGrid } from "@/components/product/product-grid";
import { ReviewsSection } from "@/components/reviews/reviews-section";
import { RecentlyViewedTracker } from "@/components/product/recently-viewed";
import {
  getProductBySlug,
  getRelatedProducts,
  getPairsWith,
  getProductReviews,
} from "@/lib/queries";
import { getWishlistIds } from "@/lib/actions/wishlist";
import { getUser } from "@/lib/auth";
import { fromPrice } from "@/lib/pricing";
import { formatBDT } from "@/lib/format";
import { CONCENTRATION_LABELS, SITE } from "@/lib/constants";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Not Found" };
  return {
    title: `${product.name} by ${product.brand?.name}`,
    description: product.description ?? undefined,
    openGraph: {
      title: `${product.name} — ${product.brand?.name}`,
      description: product.description ?? undefined,
      images: product.images?.[0]?.url ? [product.images[0].url] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [related, pairs, reviews, wishlist, user] = await Promise.all([
    getRelatedProducts(product),
    getPairsWith(product.id),
    getProductReviews(product.id),
    getWishlistIds(),
    getUser(),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    brand: { "@type": "Brand", name: product.brand?.name },
    description: product.description,
    image: product.images?.map((i) => i.url),
    aggregateRating:
      product.rating_count > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: product.rating_avg,
            reviewCount: product.rating_count,
          }
        : undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: "BDT",
      price: fromPrice(product),
      availability: "https://schema.org/InStock",
      url: `${SITE.url}/fragrances/${product.slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <RecentlyViewedTracker slug={product.slug} />

      <Container className="pt-28 lg:pt-36">
        {/* Breadcrumb */}
        <nav className="mb-8 flex flex-wrap items-center gap-2 text-xs text-muted">
          <Link href="/" className="hover:text-ivory">Home</Link>
          <ChevronRight size={12} />
          <Link href="/fragrances" className="hover:text-ivory">Fragrances</Link>
          <ChevronRight size={12} />
          <span className="text-ivory-dim">{product.name}</span>
        </nav>

        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Gallery */}
          <ProductGallery images={product.images ?? []} name={product.name} />

          {/* Info */}
          <div className="lg:py-4">
            <Link
              href={`/brands/${product.brand?.slug}`}
              className="text-xs uppercase tracking-[0.25em] text-gold hover:text-gold-soft"
            >
              {product.brand?.name}
            </Link>
            <h1 className="mt-3 font-display text-4xl text-ivory sm:text-5xl">
              {product.name}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-3">
              <Rating value={product.rating_avg} count={product.rating_count} />
              <div className="flex gap-2">
                <Badge variant="outline" className="capitalize">{product.gender}</Badge>
                <Badge variant="outline">{product.concentration}</Badge>
              </div>
            </div>

            <p className="mt-6 leading-relaxed text-ivory-dim">
              {product.description}
            </p>

            <div className="mt-8 border-t border-line pt-8">
              <BuyBox product={product} wished={wishlist.has(product.id)} />
            </div>

            {/* Assurances */}
            <div className="mt-8 grid grid-cols-3 gap-4 border-t border-line pt-8">
              {[
                { icon: ShieldCheck, label: "100% Authentic" },
                { icon: Truck, label: "Nationwide Delivery" },
                { icon: RefreshCw, label: "Easy Returns" },
              ].map((a) => (
                <div key={a.label} className="flex flex-col items-center gap-2 text-center">
                  <a.icon size={20} className="text-gold" />
                  <span className="text-[0.65rem] uppercase tracking-wider text-muted">
                    {a.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>

      {/* Story + Pyramid */}
      <section className="bg-onyx-soft py-16 mt-16 md:py-24 md:mt-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <Reveal>
              <div>
                <p className="eyebrow">The Story</p>
                <h2 className="mt-4 font-display text-3xl sm:text-4xl text-ivory">
                  An Olfactory Journey
                </h2>
                <p className="mt-6 leading-relaxed text-ivory-dim">
                  {product.story ?? product.description}
                </p>
                <dl className="mt-8 space-y-4 border-t border-line pt-8">
                  <div className="flex justify-between text-sm">
                    <dt className="text-muted">Concentration</dt>
                    <dd className="text-ivory">{CONCENTRATION_LABELS[product.concentration]}</dd>
                  </div>
                  <div className="flex justify-between text-sm">
                    <dt className="text-muted">Family</dt>
                    <dd className="text-ivory">{product.family?.name ?? "—"}</dd>
                  </div>
                  <div className="flex justify-between text-sm">
                    <dt className="text-muted">Best for</dt>
                    <dd className="text-ivory capitalize">{product.season?.join(", ") || "All seasons"}</dd>
                  </div>
                </dl>
                <div className="mt-8 grid grid-cols-2 gap-6">
                  <AttributeMeter label="Longevity" value={product.longevity} />
                  <AttributeMeter label="Sillage" value={product.sillage} />
                </div>
              </div>
            </Reveal>
            <div className="flex items-center">
              <div className="w-full">
                <OlfactoryPyramid
                  top={product.top_notes}
                  heart={product.heart_notes}
                  base={product.base_notes}
                />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Pairs with */}
      {pairs.length > 0 && (
        <Container className="py-16 md:py-24">
          <SectionHeading eyebrow="Layer It" title="Pairs Beautifully With" align="center" />
          <div className="mt-12">
            <ProductGrid products={pairs} wishlist={wishlist} columns={4} />
          </div>
        </Container>
      )}

      {/* Reviews */}
      <Container className="py-16 md:py-24 border-t border-line">
        <SectionHeading eyebrow="Reviews" title="What Our Clients Say" />
        <div className="mt-12">
          <ReviewsSection product={product} reviews={reviews} isAuthed={!!user} />
        </div>
      </Container>

      {/* Related */}
      {related.length > 0 && (
        <section className="bg-onyx-soft py-16 md:py-24">
          <Container>
            <SectionHeading eyebrow="Discover More" title="You May Also Like" align="center" />
            <div className="mt-12">
              <ProductGrid products={related} wishlist={wishlist} columns={4} />
            </div>
          </Container>
        </section>
      )}

      {/* Sticky mobile price (visual) */}
      <div className="sr-only">{formatBDT(fromPrice(product))}</div>
    </>
  );
}
