import { AdminHeader } from "@/components/admin/admin-ui";
import { PagesEditor } from "@/components/admin/pages-editor";
import { createClient } from "@/lib/supabase/server";

const DEFAULT_SLUGS = ["about", "faq", "shipping-returns", "privacy", "terms"];

export default async function AdminPagesPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("content_pages").select("slug, title, body");
  const existing = (data as unknown as { slug: string; title: string; body: string }[]) ?? [];

  const pages = DEFAULT_SLUGS.map((slug) => {
    const found = existing.find((p) => p.slug === slug);
    return found ?? { slug, title: slug.replace("-", " "), body: "" };
  });

  return (
    <div>
      <AdminHeader title="Content Pages" description="Edit your storefront's informational pages." />
      <PagesEditor pages={pages} />
    </div>
  );
}
