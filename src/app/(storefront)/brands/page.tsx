import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/misc";
import { PageHeader } from "@/components/ui/page-header";
import { Reveal } from "@/components/ui/reveal";
import { ProductImage } from "@/components/product/product-image";
import { getBrands } from "@/lib/queries";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Maisons & Brands",
  description: "Explore the celebrated houses behind our curated fragrances.",
};

export default async function BrandsPage() {
  const brands = await getBrands();

  return (
    <>
      <PageHeader
        eyebrow="The Houses"
        title="Maisons & Brands"
        description="From storied Parisian ateliers to boundary-pushing niche perfumers."
      />
      <Container className="py-16">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
          {brands.map((b, i) => (
            <Reveal key={b.id} delay={(i % 4) * 0.05}>
              <Link
                href={`/brands/${b.slug}`}
                className="group relative block aspect-[4/5] overflow-hidden"
              >
                <ProductImage
                  src={b.hero_image ?? b.logo_url}
                  alt={b.name}
                  initial={b.name}
                  sizes="(max-width:768px) 50vw, 25vw"
                  className="transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-onyx via-onyx/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-center">
                  <h3 className="font-display text-2xl text-ivory">{b.name}</h3>
                  {b.country && (
                    <span className="mt-2 block text-[0.6rem] uppercase tracking-widest text-gold">
                      {b.country}
                    </span>
                  )}
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </>
  );
}
