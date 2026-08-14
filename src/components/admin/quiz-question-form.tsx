"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label } from "@/components/ui/input";
import { AdminMultiSelect } from "@/components/admin/admin-multi-select";
import { saveQuizQuestion } from "@/lib/actions/admin/quiz";
import { unpackQuizTargets } from "@/lib/quiz-targets";
import type { CatalogPick, Collection, FragranceFamily, QuizQuestion } from "@/types";

interface DraftOption {
  key: string;
  id?: string;
  label: string;
  description: string;
  strength: number;
  familyIds: string[];
  collectionIds: string[];
  productIds: string[];
  notes: string[];
}

function blankOption(): DraftOption {
  return {
    key: crypto.randomUUID(),
    label: "",
    description: "",
    strength: 2,
    familyIds: [],
    collectionIds: [],
    productIds: [],
    notes: [],
  };
}

function fromQuestion(
  question: QuizQuestion,
  families: FragranceFamily[],
): DraftOption[] {
  const bySlug = new Map(families.map((f) => [f.slug, f.id]));
  return question.options.map((option) => {
    const targets = unpackQuizTargets(option.family_weights);
    const notes = Object.keys(option.note_weights ?? {});
    return {
      key: option.id,
      id: option.id,
      label: option.label,
      description: option.description ?? "",
      strength: targets.strength,
      familyIds: targets.familySlugs
        .map((slug) => bySlug.get(slug))
        .filter((id): id is string => Boolean(id)),
      collectionIds: targets.collectionIds,
      productIds: targets.productIds,
      notes,
    };
  });
}

export function QuizQuestionForm({
  question,
  nextPosition,
  families,
  collections,
  products,
  notes,
}: {
  question?: QuizQuestion;
  nextPosition: number;
  families: FragranceFamily[];
  collections: Collection[];
  products: CatalogPick[];
  notes: string[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [prompt, setPrompt] = useState(question?.prompt ?? "");
  const [subtitle, setSubtitle] = useState(question?.subtitle ?? "");
  const [position, setPosition] = useState(question?.position ?? nextPosition);
  const [options, setOptions] = useState<DraftOption[]>(
    question ? fromQuestion(question, families) : [blankOption(), blankOption()],
  );

  function updateOption(key: string, patch: Partial<DraftOption>) {
    setOptions((current) =>
      current.map((option) => (option.key === key ? { ...option, ...patch } : option)),
    );
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const res = await saveQuizQuestion({
        id: question?.id,
        prompt,
        subtitle,
        position,
        options: options.map((option) => ({
          id: option.id,
          label: option.label,
          description: option.description,
          strength: option.strength,
          familySlugs: option.familyIds
            .map((id) => families.find((f) => f.id === id)?.slug)
            .filter((slug): slug is string => Boolean(slug)),
          collectionIds: option.collectionIds,
          productIds: option.productIds,
          notes: option.notes,
        })),
      });
      if (res.ok) {
        toast.success("Question saved");
        router.push("/admin/quiz");
        router.refresh();
      } else toast.error(res.error ?? "Could not save.");
    });
  }

  const noteItems = (() => {
    const map = new Map(notes.map((note) => [note.toLowerCase(), note]));
    for (const option of options) {
      for (const note of option.notes) {
        const key = note.toLowerCase();
        if (!map.has(key)) map.set(key, note);
      }
    }
    return [...map.entries()]
      .sort((a, b) => a[1].localeCompare(b[1]))
      .map(([id, name]) => ({ id, name }));
  })();

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="prompt">Question</Label>
          <Input
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Which mood calls to you?"
            required
          />
        </div>
        <div>
          <Label htmlFor="subtitle">Helper text (optional)</Label>
          <Textarea
            id="subtitle"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="A short line under the question"
          />
        </div>
        <div>
          <Label htmlFor="position">Display order</Label>
          <Input
            id="position"
            type="number"
            min={0}
            value={position}
            onChange={(e) => setPosition(Number(e.target.value) || 0)}
          />
          <p className="mt-1 text-xs text-muted">Lower numbers appear first in the quiz.</p>
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl text-ivory">Answers</h2>
            <p className="text-sm text-muted">
              For each answer, pick what it should recommend from your catalog.
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setOptions((current) => [...current, blankOption()])}
          >
            <Plus size={14} /> Add answer
          </Button>
        </div>

        <div className="space-y-4">
          {options.map((option, index) => (
            <div key={option.key} className="space-y-4 border border-line p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[0.65rem] uppercase tracking-widest text-muted">
                  Answer {index + 1}
                </p>
                {options.length > 2 && (
                  <button
                    type="button"
                    className="text-muted hover:text-rose"
                    aria-label="Remove answer"
                    onClick={() =>
                      setOptions((current) => current.filter((row) => row.key !== option.key))
                    }
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor={`label-${option.key}`}>Label</Label>
                  <Input
                    id={`label-${option.key}`}
                    value={option.label}
                    onChange={(e) => updateOption(option.key, { label: e.target.value })}
                    placeholder="Bold & Magnetic"
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor={`desc-${option.key}`}>Description (optional)</Label>
                  <Input
                    id={`desc-${option.key}`}
                    value={option.description}
                    onChange={(e) => updateOption(option.key, { description: e.target.value })}
                    placeholder="Command the room"
                  />
                </div>
                <div>
                  <Label htmlFor={`strength-${option.key}`}>Match strength</Label>
                  <select
                    id={`strength-${option.key}`}
                    value={option.strength}
                    onChange={(e) =>
                      updateOption(option.key, { strength: Number(e.target.value) })
                    }
                    className="h-11 w-full border border-line-strong bg-onyx-soft px-3 text-sm text-ivory focus:border-gold focus:outline-none"
                  >
                    <option value={1}>1 — Subtle</option>
                    <option value={2}>2 — Light</option>
                    <option value={3}>3 — Medium</option>
                    <option value={4}>4 — Strong</option>
                    <option value={5}>5 — Very strong</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <AdminMultiSelect
                  label="Fragrance families"
                  hint="Recommend perfumes in these families"
                  items={families.map((f) => ({ id: f.id, name: f.name }))}
                  selectedIds={option.familyIds}
                  onChange={(familyIds) => updateOption(option.key, { familyIds })}
                  placeholder="Select families…"
                  searchPlaceholder="Search families…"
                />
                <AdminMultiSelect
                  label="Collections"
                  hint="Recommend perfumes from these collections"
                  items={collections.map((c) => ({ id: c.id, name: c.name }))}
                  selectedIds={option.collectionIds}
                  onChange={(collectionIds) => updateOption(option.key, { collectionIds })}
                  placeholder="Select collections…"
                  searchPlaceholder="Search collections…"
                  emptyLabel="No collections yet"
                />
                <AdminMultiSelect
                  label="Perfumes"
                  hint="Boost these specific bottles in the results"
                  items={products.map((p) => ({
                    id: p.id,
                    name: p.name,
                    hint: p.brandName ?? undefined,
                  }))}
                  selectedIds={option.productIds}
                  onChange={(productIds) => updateOption(option.key, { productIds })}
                  placeholder="Select perfumes…"
                  searchPlaceholder="Search perfumes…"
                  emptyLabel="No products yet"
                />
                <AdminMultiSelect
                  label="Notes"
                  hint="From notes already used on your products"
                  items={noteItems}
                  selectedIds={option.notes}
                  onChange={(next) => updateOption(option.key, { notes: next })}
                  placeholder="Select notes…"
                  searchPlaceholder="Search notes…"
                  emptyLabel="No notes on products yet"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <Button type="submit" disabled={pending}>
        {pending && <Loader2 size={15} className="animate-spin" />}
        Save question
      </Button>
    </form>
  );
}
