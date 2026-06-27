import { EntityManager } from "@/components/admin/entity-manager";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { saveGiftCard, deleteGiftCard } from "@/lib/actions/admin/marketing";
import { formatBDT } from "@/lib/format";
import type { GiftCard } from "@/types";

export default async function GiftCardsPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("gift_cards").select("*").order("created_at", { ascending: false });
  const cards = (data as unknown as GiftCard[]) ?? [];

  return (
    <EntityManager<GiftCard>
      title="Gift Cards"
      singular="Gift Card"
      items={cards}
      columns={[
        { key: "code", label: "Code", render: (c) => <span className="font-mono text-ivory">{c.code}</span> },
        { key: "initial_amount", label: "Initial", render: (c) => formatBDT(c.initial_amount) },
        { key: "balance", label: "Balance", render: (c) => formatBDT(c.balance) },
        {
          key: "status",
          label: "Status",
          render: (c) =>
            c.status === "active" ? <Badge variant="emerald">Active</Badge> : <Badge variant="muted">{c.status}</Badge>,
        },
      ]}
      fields={[
        { name: "code", label: "Code", required: true, placeholder: "GIFT-AURA-5000" },
        { name: "initial_amount", label: "Amount (BDT)", type: "number" },
        { name: "status", label: "Status", type: "select", options: [
          { value: "active", label: "Active" },
          { value: "disabled", label: "Disabled" },
          { value: "depleted", label: "Depleted" },
        ] },
      ]}
      saveAction={saveGiftCard}
      deleteAction={deleteGiftCard}
    />
  );
}
