import { EntityManager } from "@/components/admin/entity-manager";
import { createClient } from "@/lib/supabase/server";
import { saveFamily, deleteFamily } from "@/lib/actions/admin/catalog";
import type { FragranceFamily } from "@/types";

export default async function AdminFamiliesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("fragrance_families")
    .select("*")
    .order("name");
  const families = (data as unknown as FragranceFamily[]) ?? [];

  return (
    <EntityManager<FragranceFamily>
      title="Fragrance Families"
      singular="Family"
      items={families}
      columns={[
        { key: "name", label: "Name", format: "family-swatch" },
        { key: "slug", label: "Slug" },
      ]}
      fields={[
        { name: "name", label: "Name", required: true },
        { name: "slug", label: "Slug", placeholder: "auto-generated if blank" },
        {
          name: "accent_color",
          label: "Accent Color (hex)",
          placeholder: "#c8a96a",
        },
        { name: "description", label: "Description", type: "textarea" },
      ]}
      saveAction={saveFamily}
      deleteAction={deleteFamily}
    />
  );
}
