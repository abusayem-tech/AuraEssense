import { EntityManager } from "@/components/admin/entity-manager";
import { createClient } from "@/lib/supabase/server";
import { saveGiftCard, deleteGiftCard } from "@/lib/actions/admin/marketing";
import type { GiftCard } from "@/types";

export default async function GiftCardsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("gift_cards")
    .select("*")
    .order("created_at", { ascending: false });
  const cards = (data as unknown as GiftCard[]) ?? [];

  return (
    <EntityManager<GiftCard>
      title="Gift Cards"
      singular="Gift Card"
      items={cards}
      columns={[
        { key: "code", label: "Code", format: "mono" },
        { key: "initial_amount", label: "Initial", format: "currency" },
        { key: "balance", label: "Balance", format: "currency" },
        { key: "status", label: "Status", format: "badge-status" },
      ]}
      fields={[
        {
          name: "code",
          label: "Code",
          required: true,
          placeholder: "GIFT-AURA-5000",
        },
        { name: "initial_amount", label: "Amount (BDT)", type: "number" },
        {
          name: "status",
          label: "Status",
          type: "select",
          options: [
            { value: "active", label: "Active" },
            { value: "disabled", label: "Disabled" },
            { value: "depleted", label: "Depleted" },
          ],
        },
      ]}
      saveAction={saveGiftCard}
      deleteAction={deleteGiftCard}
    />
  );
}
