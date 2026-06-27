"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";

function parseJson(value: FormDataEntryValue | null): Record<string, number> {
  try {
    const obj = JSON.parse(String(value || "{}"));
    return typeof obj === "object" && obj ? obj : {};
  } catch {
    return {};
  }
}

export async function saveQuestion(formData: FormData): Promise<{ ok: boolean }> {
  await requireAdmin();
  const supabase = createAdminClient();
  const id = formData.get("id") ? String(formData.get("id")) : null;
  const payload = {
    prompt: String(formData.get("prompt") || ""),
    subtitle: String(formData.get("subtitle") || "") || null,
    position: Number(formData.get("position") || 0),
  };
  if (id) await supabase.from("quiz_questions").update(payload).eq("id", id);
  else await supabase.from("quiz_questions").insert(payload);
  revalidatePath("/admin/quiz");
  return { ok: true };
}

export async function deleteQuestion(id: string): Promise<{ ok: boolean }> {
  await requireAdmin();
  const supabase = createAdminClient();
  await supabase.from("quiz_questions").delete().eq("id", id);
  revalidatePath("/admin/quiz");
  return { ok: true };
}

export async function saveOption(formData: FormData): Promise<{ ok: boolean }> {
  await requireAdmin();
  const supabase = createAdminClient();
  const id = formData.get("id") ? String(formData.get("id")) : null;
  const payload = {
    question_id: String(formData.get("question_id")),
    label: String(formData.get("label") || ""),
    description: String(formData.get("description") || "") || null,
    family_weights: parseJson(formData.get("family_weights")),
    note_weights: parseJson(formData.get("note_weights")),
    position: Number(formData.get("position") || 0),
  };
  if (id) await supabase.from("quiz_options").update(payload).eq("id", id);
  else await supabase.from("quiz_options").insert(payload);
  revalidatePath("/admin/quiz");
  return { ok: true };
}

export async function deleteOption(id: string): Promise<{ ok: boolean }> {
  await requireAdmin();
  const supabase = createAdminClient();
  await supabase.from("quiz_options").delete().eq("id", id);
  revalidatePath("/admin/quiz");
  return { ok: true };
}
