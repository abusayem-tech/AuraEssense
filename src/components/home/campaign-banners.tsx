import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/misc";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/product/product-image";
import type { Banner } from "@/types";

/** Full-bleed homepage campaigns for active banners that include an image. */
export function CampaignBanners({ banners }: { banners: Banner[] }) {
  const visual = banners.filter((b) => b.image?.trim()).slice(0, 2);
  if (visual.length === 0) return null;

  return (
    <section className="space-y-0">
      {visual.map((banner, i) => {
        const href = banner.link?.trim() || "/fragrances";
        const label = banner.cta_label?.trim() || "Explore";
        return (
          <div
            key={banner.id}
            className="relative overflow-hidden py-20 md:py-28"
          >
            <div className="absolute inset-0">
              <ProductImage
                src={banner.image}
                alt={banner.title ?? "Campaign"}
                initial={banner.title ?? "A"}
                className="object-cover scale-105"
                sizes="100vw"
                priority={i === 0}
              />
              <div className="pointer-events-none absolute inset-0 bg-[var(--photo-ink)]/65" />
            </div>
            <Container className="relative text-center">
              <Reveal>
                {banner.subtitle && (
                  <p className="photo-eyebrow !mb-4">{banner.subtitle}</p>
                )}
                {banner.title && (
                  <h2 className="photo-text mx-auto max-w-3xl font-display text-4xl sm:text-5xl md:text-6xl">
                    {banner.title}
                  </h2>
                )}
                <Button
                  asChild
                  size="lg"
                  className="mt-9 bg-photo-gold text-photo-on-gold hover:bg-photo-gold-soft"
                >
                  <Link href={href}>
                    {label} <ArrowRight size={16} />
                  </Link>
                </Button>
              </Reveal>
            </Container>
          </div>
        );
      })}
    </section>
  );
}
