"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Banner } from "@/types";

export function PromoStrip({ banners }: { banners: Banner[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const id = window.setInterval(
      () => setIndex((i) => (i + 1) % banners.length),
      5000,
    );
    return () => window.clearInterval(id);
  }, [banners.length]);

  if (banners.length === 0) return null;

  const banner = banners[index] ?? banners[0];
  const href = banner.link?.trim() || "/fragrances";
  const label = banner.cta_label?.trim() || "Shop Now";
  const title = banner.title?.trim();
  const subtitle = banner.subtitle?.trim();

  if (!title && !subtitle) return null;

  return (
    <div className="bg-gold text-on-gold">
      <Link
        href={href}
        className="mx-auto flex h-9 max-w-7xl items-center justify-center gap-2 px-4 text-center text-[0.65rem] uppercase tracking-[0.18em] transition-opacity hover:opacity-90 sm:gap-3 sm:text-[0.7rem]"
      >
        {title && <span className="font-medium">{title}</span>}
        {title && subtitle && (
          <span className="hidden text-on-gold/50 sm:inline" aria-hidden>
            ·
          </span>
        )}
        {subtitle && (
          <span className="truncate text-on-gold/85">{subtitle}</span>
        )}
        <span className="inline-flex items-center gap-1 font-medium underline-offset-2 hover:underline">
          {label}
          <ArrowRight size={12} />
        </span>
      </Link>
    </div>
  );
}
