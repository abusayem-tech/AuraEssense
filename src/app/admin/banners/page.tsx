import { EntityManager } from "@/components/admin/entity-manager";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { saveBanner, deleteBanner } from "@/lib/actions/admin/marketing";

interface Banner {
  id: string;
  title: string | null;
  subtitle: string | null;
  link: string | null;
  active: boolean;
}

export default async function BannersPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("banners").select("*").order("position");
  const banners = (data as unknown as Banner[]) ?? [];

  return (
    <EntityManager<Banner>
      title="Campaign Banners"
      singular="Banner"
      items={banners}
      columns={[
        { key: "title", label: "Title" },
        { key: "subtitle", label: "Subtitle" },
        { key: "active", label: "Status", render: (b) => (b.active ? <Badge variant="emerald">Active</Badge> : <Badge variant="muted">Hidden</Badge>) },
      ]}
      fields={[
        { name: "title", label: "Title" },
        { name: "subtitle", label: "Subtitle" },
        { name: "image", label: "Image URL" },
        { name: "link", label: "Link" },
        { name: "cta_label", label: "CTA Label" },
        { name: "active", label: "Active", type: "checkbox", defaultValue: "on" },
      ]}
      saveAction={saveBanner}
      deleteAction={deleteBanner}
    />
  );
}
