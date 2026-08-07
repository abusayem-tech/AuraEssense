import { AdminHeader } from "@/components/admin/admin-ui";
import { SettingsForm } from "@/components/admin/settings-form";
import { PagesEditor } from "@/components/admin/pages-editor";
import { createClient } from "@/lib/supabase/server";

const DEFAULT_SLUGS = ["about", "faq", "shipping-returns", "privacy", "terms"];

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const [{ data: settings }, { data: zones }, { data: pagesData }] =
    await Promise.all([
      supabase.from("store_settings").select("*").maybeSingle(),
      supabase.from("shipping_zones").select("*").order("zone"),
      supabase.from("content_pages").select("slug, title, body"),
    ]);

  const s = (settings as Record<string, unknown> | null) ?? {};
  const existing =
    (pagesData as unknown as { slug: string; title: string; body: string }[]) ??
    [];
  const pages = DEFAULT_SLUGS.map((slug) => {
    const found = existing.find((p) => p.slug === slug);
    return found ?? { slug, title: slug.replace("-", " "), body: "" };
  });

  return (
    <div>
      <AdminHeader
        title="Settings"
        description="Store configuration, shipping, and informational pages."
      />
      <SettingsForm
        settings={{
          store_name: String(s.store_name ?? "AuraEssence"),
          contact_email: String(s.contact_email ?? ""),
          contact_phone: String(s.contact_phone ?? ""),
          free_ship_threshold: Number(s.free_ship_threshold ?? 8000),
          gift_wrap_fee: Number(s.gift_wrap_fee ?? 250),
          loyalty_earn_rate: Number(s.loyalty_earn_rate ?? 0.02),
          tax_rate: Number(s.tax_rate ?? 0),
          low_stock_threshold: Number(s.low_stock_threshold ?? 5),
          payment_provider: String(s.payment_provider ?? "mock"),
          logistics_provider: String(s.logistics_provider ?? "mock"),
        }}
        zones={
          (zones as unknown as {
            id: string;
            name: string;
            zone: string;
            fee_bdt: number;
            free_ship_min: number;
            est_days: string;
          }[]) ?? []
        }
      />

      <div className="mt-10">
        <h2 className="mb-2 font-display text-2xl text-ivory">Content Pages</h2>
        <p className="mb-6 text-sm text-muted">
          Edit about, FAQ, shipping, privacy, and terms pages shown on the storefront.
        </p>
        <PagesEditor pages={pages} />
      </div>
    </div>
  );
}
