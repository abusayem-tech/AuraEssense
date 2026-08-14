"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/admin/admin-ui";
import { deleteQuestion } from "@/lib/actions/admin/quiz";
import { unpackQuizTargets } from "@/lib/quiz-targets";
import type { CatalogPick, Collection, FragranceFamily, QuizQuestion } from "@/types";

function optionSummary(
  familyWeights: Record<string, number>,
  noteWeights: Record<string, number>,
  families: FragranceFamily[],
  collections: Collection[],
  products: CatalogPick[],
): string {
  const targets = unpackQuizTargets(familyWeights);
  const familyNames = targets.familySlugs.map(
    (slug) => families.find((f) => f.slug === slug)?.name ?? slug,
  );
  const collectionNames = targets.collectionIds.map(
    (id) => collections.find((c) => c.id === id)?.name,
  ).filter((name): name is string => Boolean(name));
  const productNames = targets.productIds.map(
    (id) => products.find((p) => p.id === id)?.name,
  ).filter((name): name is string => Boolean(name));
  const notes = Object.keys(noteWeights ?? {});
  const parts = [...familyNames, ...collectionNames, ...productNames, ...notes];
  return parts.length ? parts.join(" · ") : "No catalog matches linked";
}

export function QuizManager({
  questions,
  families,
  collections,
  products,
}: {
  questions: QuizQuestion[];
  families: FragranceFamily[];
  collections: Collection[];
  products: CatalogPick[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <div className="space-y-5">
      {questions.map((q) => (
        <Card key={q.id}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[0.6rem] uppercase tracking-widest text-muted">
                Question {q.position + 1}
              </p>
              <h3 className="mt-1 font-display text-xl text-ivory">{q.prompt}</h3>
              {q.subtitle && <p className="text-sm text-muted">{q.subtitle}</p>}
            </div>
            <div className="flex shrink-0 gap-2">
              <Link
                href={`/admin/quiz/${q.id}`}
                className="text-muted hover:text-gold"
                aria-label="Edit question"
              >
                <Pencil size={15} />
              </Link>
              <button
                type="button"
                disabled={pending}
                className="text-muted hover:text-rose"
                aria-label="Delete question"
                onClick={() => {
                  if (!confirm("Delete this question and its answers?")) return;
                  start(async () => {
                    await deleteQuestion(q.id);
                    toast.success("Question deleted");
                    router.refresh();
                  });
                }}
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {q.options.map((o) => (
              <Link
                key={o.id}
                href={`/admin/quiz/${q.id}`}
                className="border border-line px-3 py-2 hover:border-gold"
              >
                <p className="text-sm text-ivory">{o.label}</p>
                <p className="truncate text-xs text-muted">
                  {optionSummary(o.family_weights, o.note_weights, families, collections, products)}
                </p>
              </Link>
            ))}
          </div>
        </Card>
      ))}
      {questions.length === 0 && (
        <p className="py-10 text-center text-muted">
          No quiz questions yet. Add one to start matching customers to your catalog.
        </p>
      )}
    </div>
  );
}
