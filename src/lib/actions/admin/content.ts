"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/utils";

export async function saveJournal(formData: FormData): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  const supabase = createAdminClient();
  const id = formData.get("id") ? String(formData.get("id")) : null;
  const title = String(formData.get("title") || "").trim();
  if (!title) return { ok: false, error: "Title required." };
  const published = formData.get("published") === "on";
  let publishedAt: string | null = null;
  let oldSlug: string | null = null;
  if (id) {
    const { data } = await supabase
      .from("journal_posts")
      .select("published_at, slug")
      .eq("id", id)
      .maybeSingle();
    const existing = data as { published_at: string | null; slug: string } | null;
    oldSlug = existing?.slug ?? null;
    if (published) publishedAt = existing?.published_at ?? new Date().toISOString();
  } else if (published) {
    publishedAt = new Date().toISOString();
  }

  const payload = {
    title,
    slug: String(formData.get("slug") || "") || slugify(title),
    excerpt: String(formData.get("excerpt") || "") || null,
    cover: String(formData.get("cover") || "") || null,
    body: String(formData.get("body") || ""),
    author: String(formData.get("author") || "AuraEssence"),
    published_at: publishedAt,
  };
  if (id) await supabase.from("journal_posts").update(payload).eq("id", id);
  else await supabase.from("journal_posts").insert(payload);
  revalidatePath("/admin/journal");
  revalidatePath("/journal");
  revalidatePath(`/journal/${payload.slug}`);
  if (oldSlug && oldSlug !== payload.slug) revalidatePath(`/journal/${oldSlug}`);
  return { ok: true };
}

export async function deleteJournal(id: string): Promise<{ ok: boolean }> {
  await requireAdmin();
  const supabase = createAdminClient();
  const { data } = await supabase.from("journal_posts").select("slug").eq("id", id).maybeSingle();
  const slug = (data as { slug: string } | null)?.slug ?? null;
  await supabase.from("journal_posts").delete().eq("id", id);
  revalidatePath("/admin/journal");
  revalidatePath("/journal");
  if (slug) revalidatePath(`/journal/${slug}`);
  return { ok: true };
}

export async function savePage(
  slug: string,
  title: string,
  body: string,
): Promise<{ ok: boolean }> {
  await requireAdmin();
  const supabase = createAdminClient();
  await supabase
    .from("content_pages")
    .upsert({ slug, title, body, updated_at: new Date().toISOString() }, { onConflict: "slug" });
  revalidatePath(`/${slug}`);
  revalidatePath("/admin/settings");
  return { ok: true };
}
