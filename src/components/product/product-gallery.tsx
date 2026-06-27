"use client";

import { useRef, useState } from "react";
import { ProductImage } from "@/components/product/product-image";
import { cn } from "@/lib/utils";
import type { ProductImage as PImage } from "@/types";

export function ProductGallery({
  images,
  name,
}: {
  images: PImage[];
  name: string;
}) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const ref = useRef<HTMLDivElement>(null);
  const list = images.length ? images : [{ id: "ph", url: "", alt: name } as PImage];

  function onMove(e: React.MouseEvent) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }

  return (
    <div className="flex flex-col-reverse gap-4 lg:flex-row">
      {/* Thumbnails */}
      {list.length > 1 && (
        <div className="flex gap-3 lg:flex-col">
          {list.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActive(i)}
              className={cn(
                "relative aspect-[3/4] w-16 shrink-0 overflow-hidden border transition-colors lg:w-20",
                i === active ? "border-gold" : "border-line hover:border-line-strong",
              )}
            >
              <ProductImage src={img.url} alt={img.alt || name} initial={name} sizes="80px" />
            </button>
          ))}
        </div>
      )}

      {/* Main */}
      <div
        ref={ref}
        className="relative aspect-[3/4] flex-1 overflow-hidden bg-onyx-raised cursor-zoom-in"
        onMouseEnter={() => setZoom(true)}
        onMouseLeave={() => setZoom(false)}
        onMouseMove={onMove}
      >
        <div
          className={cn("h-full w-full transition-transform duration-200", zoom && "scale-[1.8]")}
          style={zoom ? { transformOrigin: `${pos.x}% ${pos.y}%` } : undefined}
        >
          <ProductImage
            src={list[active]?.url}
            alt={list[active]?.alt || name}
            initial={name}
            priority
            sizes="(max-width:1024px) 100vw, 50vw"
          />
        </div>
      </div>
    </div>
  );
}
