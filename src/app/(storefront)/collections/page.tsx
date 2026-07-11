import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/misc";
import { PageHeader } from "@/components/ui/page-header";
import { Reveal } from "@/components/ui/reveal";
import { ProductImage } from "@/components/product/product-image";
import { getCollections } from "@/lib/queries";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Collections",
  description: "Curated worlds of scent, composed for every mood and moment.",
};

export default async function CollectionsPage() {
  const collections = await getCollections();

  return (
    <>
      <PageHeader
        eyebrow="Curated Worlds"
        title="Collections"
        description="Thoughtfully composed edits for every mood, season and occasion."
      />
      <Container className="py-16">
        <div className="grid gap-6 md:grid-cols-2">
          {collections.map((c, i) => (
            <Reveal key={c.id} delay={(i % 2) * 0.1}>
              <Link
                href={`/collections/${c.slug}`}
                className="group relative block aspect-[16/10] overflow-hidden"
              >
                <ProductImage
                  src={c.cover_image}
                  alt={c.name}
                  initial={c.name}
                  className="transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width:768px) 100vw, 50vw"
                />
                <div className="photo-scrim-soft absolute inset-0" />
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8">
                  <p className="photo-eyebrow !mb-2">{c.subtitle}</p>
                  <h2 className="photo-text font-display text-2xl sm:text-3xl">{c.name}</h2>
                  <p className="photo-text-dim mt-2 line-clamp-2 max-w-md text-sm sm:line-clamp-none">
                    {c.description}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-photo-gold">
                    Explore <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </>
  );
}
