import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/ui/misc";
import { ProductImage } from "@/components/product/product-image";
import { getJournalPost } from "@/lib/queries";
import { formatDate } from "@/lib/format";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getJournalPost(slug);
  return {
    title: post ? post.title : "Journal",
    description: post?.excerpt ?? undefined,
  };
}

export default async function JournalPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getJournalPost(slug);
  if (!post || !post.published_at) notFound();

  return (
    <article className="pt-28 lg:pt-36">
      <Container className="max-w-3xl">
        <Link
          href="/journal"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted hover:text-gold"
        >
          <ArrowLeft size={14} /> Back to Journal
        </Link>
        <div className="mt-8 text-center">
          <p className="eyebrow">
            {formatDate(post.published_at)} · {post.author}
          </p>
          <h1 className="mt-4 break-words font-display text-4xl text-ivory sm:text-5xl">
            {post.title}
          </h1>
        </div>
      </Container>

      <Container className="mt-8 max-w-4xl md:mt-12">
        <div className="relative aspect-[16/9] overflow-hidden bg-onyx-raised">
          <ProductImage src={post.cover} alt={post.title} initial={post.title} priority sizes="100vw" />
        </div>
      </Container>

      <Container className="my-12 max-w-2xl md:my-16">
        <div className="space-y-6 text-base leading-relaxed text-ivory-dim md:text-lg">
          {post.body.split("\n\n").map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </Container>
    </article>
  );
}
