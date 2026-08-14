"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { packNoteWeights, packQuizTargets } from "@/lib/quiz-targets";

export async function saveQuizQuestion(input: {
  id?: string;
  prompt: string;
  subtitle: string;
  position: number;
  options: Array<{
    id?: string;
    label: string;
    description: string;
    strength: number;
    familySlugs: string[];
    collectionIds: string[];
    productIds: string[];
    notes: string[];
  }>;
}): Promise<{ ok: boolean; id?: string; error?: string }> {
  await requireAdmin();
  const supabase = createAdminClient();

  const prompt = input.prompt.trim();
  if (!prompt) return { ok: false, error: "Question prompt is required." };

  const options = input.options
    .map((o) => ({
      ...o,
      label: o.label.trim(),
      description: o.description.trim(),
    }))
    .filter((o) => o.label);
  if (options.length < 2) {
    return { ok: false, error: "Add at least two answers." };
  }
  const missingMatch = options.find(
    (o) =>
      o.familySlugs.length === 0 &&
      o.collectionIds.length === 0 &&
      o.productIds.length === 0 &&
      o.notes.length === 0,
  );
  if (missingMatch) {
    return {
      ok: false,
      error: `“${missingMatch.label}” needs at least one family, collection, perfume, or note.`,
    };
  }

  const questionPayload = {
    prompt,
    subtitle: input.subtitle.trim() || null,
    position: Number.isFinite(input.position) ? input.position : 0,
  };

  let questionId = input.id ?? null;
  if (questionId) {
    const { error } = await supabase
      .from("quiz_questions")
      .update(questionPayload)
      .eq("id", questionId);
    if (error) return { ok: false, error: error.message };
  } else {
    const { data, error } = await supabase
      .from("quiz_questions")
      .insert(questionPayload)
      .select("id")
      .single();
    if (error) return { ok: false, error: error.message };
    questionId = (data as { id: string }).id;
  }

  const { data: existing } = await supabase
    .from("quiz_options")
    .select("id")
    .eq("question_id", questionId);
  const existingIds = new Set(
    ((existing ?? []) as Array<{ id: string }>).map((row) => row.id),
  );
  const keptIds = new Set(options.map((o) => o.id).filter((id): id is string => Boolean(id)));

  for (const id of existingIds) {
    if (!keptIds.has(id)) {
      await supabase.from("quiz_options").delete().eq("id", id);
    }
  }

  for (const [index, option] of options.entries()) {
    const payload = {
      question_id: questionId,
      label: option.label,
      description: option.description || null,
      family_weights: packQuizTargets({
        familySlugs: option.familySlugs,
        productIds: option.productIds,
        collectionIds: option.collectionIds,
        strength: option.strength,
      }),
      note_weights: packNoteWeights(option.notes, option.strength),
      position: index,
    };
    if (option.id && existingIds.has(option.id)) {
      const { error } = await supabase.from("quiz_options").update(payload).eq("id", option.id);
      if (error) return { ok: false, error: error.message };
    } else {
      const { error } = await supabase.from("quiz_options").insert(payload);
      if (error) return { ok: false, error: error.message };
    }
  }

  revalidatePath("/admin/quiz");
  revalidatePath("/quiz");
  return { ok: true, id: questionId };
}

export async function deleteQuestion(id: string): Promise<{ ok: boolean }> {
  await requireAdmin();
  const supabase = createAdminClient();
  await supabase.from("quiz_questions").delete().eq("id", id);
  revalidatePath("/admin/quiz");
  revalidatePath("/quiz");
  return { ok: true };
}
