import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/misc";
import { PageHeader } from "@/components/ui/page-header";
import { Reveal } from "@/components/ui/reveal";
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
        <div className="grid grid-cols-2 gap-px bg-line md:grid-cols-3 lg:grid-cols-4">
          {brands.map((b, i) => (
            <Reveal key={b.id} delay={(i % 4) * 0.05}>
              <Link
                href={`/brands/${b.slug}`}
                className="flex aspect-square flex-col items-center justify-center bg-onyx p-6 text-center transition-colors hover:bg-onyx-soft"
              >
                <span className="font-display text-2xl text-ivory">{b.name}</span>
                <span className="mt-2 text-[0.6rem] uppercase tracking-widest text-muted">
                  {b.country}
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </>
  );
}
