"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative flex h-[100svh] min-h-[640px] items-center justify-center overflow-hidden"
    >
      {/* Background */}
      <motion.div style={{ y }} className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=2000&q=80')",
          }}
        />
        <div className="photo-scrim absolute inset-0" />
        <div className="absolute inset-0 bg-[var(--photo-ink)]/25" />
      </motion.div>

      {/* Content */}
      <motion.div
        style={{ opacity }}
        className="relative z-10 mx-auto max-w-3xl px-6 text-center"
      >
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="photo-eyebrow"
        >
          The Art of Luxury Fragrance
        </motion.p>
        <motion.h1
          initial={reduce ? false : { opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="photo-text mt-6 font-display text-4xl leading-[1.05] min-[420px]:text-5xl sm:text-7xl lg:text-8xl"
        >
          Discover Your
          <br />
          <span className="text-photo-gold-soft">Signature Scent</span>
        </motion.h1>
        <motion.p
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="photo-text-dim mx-auto mt-7 max-w-xl text-base leading-relaxed"
        >
          An exquisite house of the world&apos;s most coveted perfumes — curated,
          authentic, and delivered across Bangladesh.
        </motion.p>
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.75 }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Button
            asChild
            size="lg"
            className="w-full bg-photo-gold text-photo-on-gold hover:bg-photo-gold-soft sm:w-auto"
          >
            <Link href="/fragrances">Explore the Collection</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full border-photo-text/55 bg-photo-ink/25 text-photo-text backdrop-blur-sm hover:border-photo-gold hover:bg-photo-ink/40 hover:text-photo-gold sm:w-auto"
          >
            <Link href="/quiz">Take the Scent Quiz</Link>
          </Button>
        </motion.div>
      </motion.div>

      {/* Scroll cue */}
      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2">
        <div className="h-12 w-px bg-gradient-to-b from-photo-gold to-transparent" />
      </div>
    </section>
  );
}
