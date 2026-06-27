import { EntityManager } from "@/components/admin/entity-manager";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { saveCollection, deleteCollection } from "@/lib/actions/admin/catalog";
import type { Collection } from "@/types";

export default async function AdminCollectionsPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("collections").select("*").order("position");
  const collections = (data as unknown as Collection[]) ?? [];

  return (
    <EntityManager<Collection>
      title="Collections"
      singular="Collection"
      items={collections}
      columns={[
        { key: "name", label: "Name" },
        { key: "subtitle", label: "Subtitle" },
        {
          key: "is_featured",
          label: "Featured",
          render: (c) => (c.is_featured ? <Badge variant="gold">Featured</Badge> : "—"),
        },
      ]}
      fields={[
        { name: "name", label: "Name", required: true },
        { name: "slug", label: "Slug", placeholder: "auto-generated if blank" },
        { name: "subtitle", label: "Subtitle" },
        { name: "cover_image", label: "Cover Image URL" },
        { name: "description", label: "Description", type: "textarea" },
        { name: "is_featured", label: "Feature on homepage", type: "checkbox" },
      ]}
      saveAction={saveCollection}
      deleteAction={deleteCollection}
    />
  );
}
