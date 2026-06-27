"use client";

import { motion } from "framer-motion";

function NoteRow({
  label,
  notes,
  delay,
  width,
}: {
  label: string;
  notes: string[];
  delay: number;
  width: string;
}) {
  if (!notes.length) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      className="mx-auto text-center"
      style={{ maxWidth: width }}
    >
      <p className="eyebrow !mb-3">{label} Notes</p>
      <div className="flex flex-wrap justify-center gap-2">
        {notes.map((n) => (
          <span
            key={n}
            className="border border-line-strong px-4 py-2 text-sm text-ivory-dim"
          >
            {n}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

export function OlfactoryPyramid({
  top,
  heart,
  base,
}: {
  top: string[];
  heart: string[];
  base: string[];
}) {
  return (
    <div className="space-y-8">
      <NoteRow label="Top" notes={top} delay={0} width="60%" />
      <div className="hr-gold mx-auto w-1/3" />
      <NoteRow label="Heart" notes={heart} delay={0.15} width="80%" />
      <div className="hr-gold mx-auto w-1/2" />
      <NoteRow label="Base" notes={base} delay={0.3} width="100%" />
    </div>
  );
}
