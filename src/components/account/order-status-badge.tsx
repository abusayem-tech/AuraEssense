import { Badge } from "@/components/ui/badge";
import { ORDER_STATUS_META, type OrderStatus } from "@/lib/constants";

const VARIANT: Record<string, "gold" | "emerald" | "rose" | "muted"> = {
  delivered: "emerald",
  paid: "emerald",
  cancelled: "rose",
  failed: "rose",
  refunded: "rose",
  pending: "muted",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const meta = ORDER_STATUS_META[status];
  return <Badge variant={VARIANT[status] ?? "gold"}>{meta?.label ?? status}</Badge>;
}
