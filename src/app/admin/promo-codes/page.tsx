import { EntityManager } from "@/components/admin/entity-manager";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { savePromo, deletePromo } from "@/lib/actions/admin/marketing";
import { formatBDT } from "@/lib/format";
import type { PromoCode } from "@/types";

export default async function PromoCodesPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("promo_codes").select("*").order("created_at", { ascending: false });
  const promos = (data as unknown as PromoCode[]) ?? [];

  return (
    <EntityManager<PromoCode>
      title="Promo Codes"
      singular="Promo"
      items={promos}
      columns={[
        { key: "code", label: "Code", render: (p) => <span className="font-mono text-ivory">{p.code}</span> },
        {
          key: "type",
          label: "Value",
          render: (p) =>
            p.type === "percent" ? `${p.value}%` : p.type === "fixed" ? formatBDT(p.value) : "Free Shipping",
        },
        { key: "min_order", label: "Min Order", render: (p) => formatBDT(p.min_order) },
        { key: "used_count", label: "Used", render: (p) => `${p.used_count}${p.usage_limit ? `/${p.usage_limit}` : ""}` },
        { key: "active", label: "Status", render: (p) => (p.active ? <Badge variant="emerald">Active</Badge> : <Badge variant="muted">Inactive</Badge>) },
      ]}
      fields={[
        { name: "code", label: "Code", required: true, placeholder: "WELCOME10" },
        { name: "type", label: "Type", type: "select", options: [
          { value: "percent", label: "Percent off" },
          { value: "fixed", label: "Fixed amount off" },
          { value: "free_ship", label: "Free shipping" },
        ] },
        { name: "value", label: "Value (% or BDT)", type: "number" },
        { name: "min_order", label: "Minimum Order (BDT)", type: "number" },
        { name: "usage_limit", label: "Usage Limit (blank = unlimited)", type: "number" },
        { name: "expires_at", label: "Expires At (YYYY-MM-DD)", placeholder: "2026-12-31" },
        { name: "active", label: "Active", type: "checkbox", defaultValue: "on" },
      ]}
      saveAction={savePromo}
      deleteAction={deletePromo}
    />
  );
}
