import { EntityManager } from "@/components/admin/entity-manager";
import { createClient } from "@/lib/supabase/server";
import { savePromo, deletePromo } from "@/lib/actions/admin/marketing";
import type { PromoCode } from "@/types";

export default async function PromoCodesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("promo_codes")
    .select("*")
    .order("created_at", { ascending: false });
  const promos = (data as unknown as PromoCode[]) ?? [];

  return (
    <EntityManager<PromoCode>
      title="Promo Codes"
      singular="Promo"
      items={promos}
      columns={[
        { key: "code", label: "Code", format: "mono" },
        { key: "type", label: "Value", format: "promo-value" },
        { key: "min_order", label: "Min Order", format: "currency" },
        { key: "used_count", label: "Used", format: "promo-used" },
        { key: "active", label: "Status", format: "badge-active" },
      ]}
      fields={[
        { name: "code", label: "Code", required: true, placeholder: "WELCOME10" },
        {
          name: "type",
          label: "Type",
          type: "select",
          options: [
            { value: "percent", label: "Percent off" },
            { value: "fixed", label: "Fixed amount off" },
            { value: "free_ship", label: "Free shipping" },
          ],
        },
        { name: "value", label: "Value (% or BDT)", type: "number" },
        { name: "min_order", label: "Minimum Order (BDT)", type: "number" },
        {
          name: "usage_limit",
          label: "Usage Limit (blank = unlimited)",
          type: "number",
        },
        {
          name: "expires_at",
          label: "Expires At (YYYY-MM-DD)",
          placeholder: "2026-12-31",
        },
        { name: "active", label: "Active", type: "checkbox", defaultValue: "on" },
      ]}
      saveAction={savePromo}
      deleteAction={deletePromo}
    />
  );
}
