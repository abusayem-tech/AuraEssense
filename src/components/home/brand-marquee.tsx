import Link from "next/link";
import type { Brand } from "@/types";

export function BrandMarquee({ brands }: { brands: Brand[] }) {
  if (brands.length === 0) return null;
  const doubled = [...brands, ...brands];

  return (
    <div className="overflow-hidden border-y border-line py-8">
      <div className="flex w-max animate-marquee items-center gap-16 hover:[animation-play-state:paused]">
        {doubled.map((b, i) => (
          <Link
            key={`${b.id}-${i}`}
            href={`/brands/${b.slug}`}
            className="shrink-0 font-display text-2xl tracking-wide text-ivory-dim transition-colors hover:text-gold"
          >
            {b.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
