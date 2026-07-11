import { EntityManager } from "@/components/admin/entity-manager";
import { createClient } from "@/lib/supabase/server";
import { saveJournal, deleteJournal } from "@/lib/actions/admin/content";
import type { JournalPost } from "@/types";

export default async function AdminJournalPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("journal_posts")
    .select("*")
    .order("created_at", { ascending: false });
  const posts = (data as unknown as (JournalPost & { published?: boolean })[]) ?? [];
  const withFlag = posts.map((p) => ({ ...p, published: !!p.published_at }));

  return (
    <EntityManager
      title="Journal"
      singular="Article"
      items={withFlag}
      columns={[
        { key: "title", label: "Title" },
        { key: "author", label: "Author" },
        { key: "published", label: "Status", format: "badge-published" },
      ]}
      fields={[
        { name: "title", label: "Title", required: true },
        { name: "slug", label: "Slug", placeholder: "auto" },
        { name: "author", label: "Author", defaultValue: "AuraEssence" },
        { name: "cover", label: "Cover Image URL" },
        { name: "excerpt", label: "Excerpt", type: "textarea" },
        {
          name: "body",
          label: "Body (paragraphs separated by blank lines)",
          type: "textarea",
        },
        { name: "published", label: "Published", type: "checkbox" },
      ]}
      saveAction={saveJournal}
      deleteAction={deleteJournal}
    />
  );
}
