import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Hero } from "@/components/home/hero";
import { BrandMarquee } from "@/components/home/brand-marquee";
import { ProductGrid } from "@/components/product/product-grid";
import { ProductImage } from "@/components/product/product-image";
import { Container, SectionHeading, Divider } from "@/components/ui/misc";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";
import {
  getBrands,
  getCollections,
  getFamilies,
  getFeaturedProducts,
  getJournalPosts,
} from "@/lib/queries";
import { getWishlistIds } from "@/lib/actions/wishlist";
import { formatDate } from "@/lib/format";

export const revalidate = 120;

export default async function HomePage() {
  const [featured, collections, families, brands, journal, wishlist] =
    await Promise.all([
      getFeaturedProducts(8),
      getCollections(true),
      getFamilies(),
      getBrands(),
      getJournalPosts(3),
      getWishlistIds(),
    ]);

  return (
    <>
      <Hero />

      <BrandMarquee brands={brands} />

      {/* Featured */}
      <Container className="py-16 md:py-24">
        <Reveal>
          <div className="flex items-end justify-between">
            <SectionHeading
              eyebrow="Curated for You"
              title="The Featured Edit"
            />
            <Link
              href="/fragrances"
              className="link-underline hidden text-xs uppercase tracking-widest text-gold sm:block"
            >
              View All
            </Link>
          </div>
        </Reveal>
        <div className="mt-12">
          <ProductGrid products={featured} wishlist={wishlist} />
        </div>
      </Container>

      {/* Collections */}
      {collections.length > 0 && (
        <section className="bg-onyx-soft py-16 md:py-24">
          <Container>
            <Reveal>
              <SectionHeading
                eyebrow="Curated Worlds"
                title="Explore Our Collections"
                align="center"
              />
            </Reveal>
            <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {collections.slice(0, 3).map((c, i) => (
                <Reveal key={c.id} delay={i * 0.1}>
                  <Link
                    href={`/collections/${c.slug}`}
                    className="group relative block aspect-[4/5] overflow-hidden"
                  >
                    <ProductImage
                      src={c.cover_image}
                      alt={c.name}
                      initial={c.name}
                      className="transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width:768px) 100vw, 33vw"
                    />
                    <div className="photo-scrim-soft absolute inset-0" />
                    <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                      <p className="photo-eyebrow !mb-2">{c.subtitle}</p>
                      <h3 className="photo-text font-display text-3xl">
                        {c.name}
                      </h3>
                      <span className="mt-3 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-photo-gold opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                        Discover <ArrowRight size={14} />
                      </span>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Quiz CTA */}
      <section className="relative overflow-hidden py-16 md:py-28">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&w=1600&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-[var(--photo-ink)]/70" />
        <Container className="relative text-center">
          <Reveal>
            <Sparkles className="mx-auto mb-6 text-photo-gold" size={32} />
            <h2 className="photo-text mx-auto max-w-2xl font-display text-4xl sm:text-5xl">
              Not sure where to begin?
            </h2>
            <p className="photo-text-dim mx-auto mt-5 max-w-lg">
              Answer four simple questions and let our scent algorithm reveal the
              three fragrances destined to become your signature.
            </p>
            <Button
              asChild
              size="lg"
              className="mt-9 bg-photo-gold text-photo-on-gold hover:bg-photo-gold-soft"
            >
              <Link href="/quiz">Begin the Scent Quiz</Link>
            </Button>
          </Reveal>
        </Container>
      </section>

      {/* Family explorer */}
      <Container className="py-16 md:py-24">
        <Reveal>
          <SectionHeading
            eyebrow="By Olfactory Family"
            title="Find Your Family"
            align="center"
          />
        </Reveal>
        <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
          {families.map((f, i) => (
            <Reveal key={f.id} delay={i * 0.05}>
              <Link
                href={`/fragrances?family=${f.slug}`}
                className="group flex flex-col items-center justify-center border border-line p-4 sm:p-8 text-center transition-colors hover:border-gold"
              >
                <span
                  className="mb-4 h-10 w-10 rounded-full border"
                  style={{
                    backgroundColor: `${f.accent_color}22`,
                    borderColor: f.accent_color ?? undefined,
                  }}
                />
                <h3 className="font-display text-xl sm:text-2xl text-ivory transition-colors group-hover:text-gold">
                  {f.name}
                </h3>
                <p className="mt-2 line-clamp-2 text-xs text-muted">
                  {f.description}
                </p>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>

      <Divider />

      {/* Journal */}
      {journal.length > 0 && (
        <Container className="py-16 md:py-24">
          <Reveal>
            <div className="flex items-end justify-between">
              <SectionHeading eyebrow="The Journal" title="Notes & Stories" />
              <Link
                href="/journal"
                className="link-underline hidden text-xs uppercase tracking-widest text-gold sm:block"
              >
                Read More
              </Link>
            </div>
          </Reveal>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {journal.map((post, i) => (
              <Reveal key={post.id} delay={i * 0.1}>
                <Link href={`/journal/${post.slug}`} className="group block">
                  <div className="relative aspect-[3/2] overflow-hidden bg-onyx-raised">
                    <ProductImage
                      src={post.cover}
                      alt={post.title}
                      initial={post.title}
                      className="transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width:768px) 100vw, 33vw"
                    />
                  </div>
                  <p className="mt-5 text-xs uppercase tracking-widest text-muted">
                    {formatDate(post.published_at)}
                  </p>
                  <h3 className="mt-2 font-display text-2xl text-ivory transition-colors group-hover:text-gold">
                    {post.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-muted">
                    {post.excerpt}
                  </p>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      )}
    </>
  );
}
