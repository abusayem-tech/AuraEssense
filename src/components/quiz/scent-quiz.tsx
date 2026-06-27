"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/product-card";
import { getQuizRecommendations, type QuizResult } from "@/lib/actions/quiz";
import { cn } from "@/lib/utils";

interface QOption {
  id: string;
  label: string;
  description: string | null;
  family_weights: Record<string, number>;
  note_weights: Record<string, number>;
}
interface Question {
  id: string;
  prompt: string;
  subtitle: string | null;
  options: QOption[];
}

export function ScentQuiz({ questions }: { questions: Question[] }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<QuizResult[] | null>(null);

  const total = questions.length;
  const current = questions[step];
  const progress = ((step + (results ? 1 : 0)) / total) * 100;

  async function choose(option: QOption) {
    const nextAnswers = { ...answers, [current.id]: option.id };
    setAnswers(nextAnswers);

    if (step < total - 1) {
      setStep(step + 1);
      return;
    }

    // Compute weights and fetch recommendations.
    setLoading(true);
    const familyWeights: Record<string, number> = {};
    const noteWeights: Record<string, number> = {};
    for (const q of questions) {
      const optId = nextAnswers[q.id];
      const opt = q.options.find((o) => o.id === optId);
      if (!opt) continue;
      for (const [k, v] of Object.entries(opt.family_weights ?? {}))
        familyWeights[k] = (familyWeights[k] ?? 0) + Number(v);
      for (const [k, v] of Object.entries(opt.note_weights ?? {}))
        noteWeights[k] = (noteWeights[k] ?? 0) + Number(v);
    }
    const res = await getQuizRecommendations(familyWeights, noteWeights);
    setResults(res);
    setLoading(false);
  }

  function restart() {
    setStep(0);
    setAnswers({});
    setResults(null);
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <Loader2 className="animate-spin text-gold" size={36} />
        <p className="mt-6 font-display text-2xl text-ivory">
          Composing your scent profile…
        </p>
      </div>
    );
  }

  if (results) {
    return (
      <div className="py-8">
        <div className="text-center">
          <Sparkles className="mx-auto mb-4 text-gold" size={32} />
          <p className="eyebrow">Your Scent Profile</p>
          <h2 className="mt-3 font-display text-4xl text-ivory sm:text-5xl">
            Your Three Matches
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-ivory-dim">
            Curated from our live collection, these fragrances align with your
            unique preferences.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-4xl gap-x-6 gap-y-10 sm:grid-cols-3">
          {results.map((r, i) => (
            <motion.div
              key={r.product.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15, duration: 0.6 }}
            >
              <div className="mb-3 text-center">
                <span className="font-display text-3xl text-gold">
                  0{i + 1}
                </span>
              </div>
              <ProductCard product={r.product} />
              <p className="mt-3 text-center text-xs italic text-muted">
                {r.matchReason}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="mt-14 flex justify-center gap-4">
          <Button onClick={restart} variant="outline">
            <RotateCcw size={15} /> Retake Quiz
          </Button>
          <Button asChild>
            <Link href="/fragrances">Explore All</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      {/* Progress */}
      <div className="mx-auto mb-12 max-w-xl">
        <div className="mb-3 flex justify-between text-xs uppercase tracking-widest text-muted">
          <span>
            Question {step + 1} of {total}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-px bg-line-strong">
          <motion.div
            className="h-full bg-gold"
            animate={{ width: `${((step + 1) / total) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="text-center">
            <h2 className="font-display text-3xl text-ivory sm:text-4xl">
              {current.prompt}
            </h2>
            {current.subtitle && (
              <p className="mt-3 text-ivory-dim">{current.subtitle}</p>
            )}
          </div>

          <div className="mx-auto mt-12 grid max-w-2xl gap-4 sm:grid-cols-2">
            {current.options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => choose(opt)}
                className={cn(
                  "group border border-line-strong p-6 text-left transition-all hover:border-gold hover:bg-gold/5",
                  answers[current.id] === opt.id && "border-gold bg-gold/5",
                )}
              >
                <p className="font-display text-xl text-ivory transition-colors group-hover:text-gold">
                  {opt.label}
                </p>
                {opt.description && (
                  <p className="mt-1 text-sm text-muted">{opt.description}</p>
                )}
              </button>
            ))}
          </div>

          {step > 0 && (
            <div className="mt-10 text-center">
              <button
                onClick={() => setStep(step - 1)}
                className="text-xs uppercase tracking-widest text-muted hover:text-ivory"
              >
                ← Previous
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
