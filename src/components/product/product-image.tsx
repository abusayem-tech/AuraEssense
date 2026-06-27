"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Product image with a graceful, on-brand fallback if the remote (placeholder)
 * image fails to load — guarantees a polished look regardless of network/CDN.
 */
export function ProductImage({
  src,
  alt,
  fill = true,
  width,
  height,
  className,
  sizes,
  priority,
  initial,
}: {
  src?: string | null;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
  initial?: string;
}) {
  const [failed, setFailed] = useState(false);
  const letter = (initial || alt || "A").trim().charAt(0).toUpperCase();

  if (!src || failed) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gradient-to-br from-onyx-raised via-onyx-soft to-onyx",
          fill ? "absolute inset-0" : "relative",
          className,
        )}
        style={!fill ? { width, height } : undefined}
      >
        <span className="font-display text-6xl text-gold/30 select-none">
          {letter}
        </span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      sizes={sizes ?? (fill ? "(max-width:768px) 50vw, 25vw" : undefined)}
      priority={priority}
      onError={() => setFailed(true)}
      className={cn("object-cover", className)}
    />
  );
}
