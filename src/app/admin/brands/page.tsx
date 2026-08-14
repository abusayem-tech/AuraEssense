import { EntityManager } from "@/components/admin/entity-manager";
import { createClient } from "@/lib/supabase/server";
import { saveBrand, deleteBrand } from "@/lib/actions/admin/catalog";
import type { Brand } from "@/types";

export default async function AdminBrandsPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("brands").select("*").order("name");
  const brands = (data as unknown as Brand[]) ?? [];

  return (
    <EntityManager<Brand>
      title="Brands"
      singular="Brand"
      items={brands}
      columns={[
        { key: "name", label: "Name" },
        { key: "country", label: "Country" },
        { key: "slug", label: "Slug" },
      ]}
      fields={[
        { name: "name", label: "Name", required: true },
        { name: "slug", label: "Slug", placeholder: "auto-generated if blank" },
        { name: "country", label: "Country" },
        { name: "logo_url", label: "Logo URL" },
        { name: "hero_image", label: "Hero image URL" },
        { name: "description", label: "Description", type: "textarea" },
      ]}
      saveAction={saveBrand}
      deleteAction={deleteBrand}
    />
  );
}
