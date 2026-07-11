import type { Metadata } from "next";
import Link from "next/link";
import { Container, EmptyState } from "@/components/ui/misc";
import { PageHeader } from "@/components/ui/page-header";
import { Reveal } from "@/components/ui/reveal";
import { ProductImage } from "@/components/product/product-image";
import { getJournalPosts } from "@/lib/queries";
import { formatDate } from "@/lib/format";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "The Journal",
  description: "Stories, guides and the art of fragrance from the AuraEssence house.",
};

export default async function JournalPage() {
  const posts = await getJournalPosts();

  return (
    <>
      <PageHeader
        eyebrow="The Journal"
        title="Notes & Stories"
        description="Guides, rituals and reflections on the art of fragrance."
      />
      <Container className="py-12 md:py-16">
        {posts.length === 0 ? (
          <EmptyState title="No stories yet" />
        ) : (
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, i) => (
              <Reveal key={post.id} delay={(i % 3) * 0.1}>
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
                    {formatDate(post.published_at)} · {post.author}
                  </p>
                  <h2 className="mt-2 font-display text-2xl text-ivory transition-colors group-hover:text-gold">
                    {post.title}
                  </h2>
                  <p className="mt-2 line-clamp-3 text-sm text-muted">
                    {post.excerpt}
                  </p>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </Container>
    </>
  );
}
