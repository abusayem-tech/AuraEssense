"use client";

import { useState, useTransition } from "react";
import { Truck, RefreshCw, RotateCcw, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea, Label } from "@/components/ui/input";
import { pushToPaperfly, advanceTracking } from "@/lib/actions/admin/fulfillment";
import { updateOrderStatus, refundOrder, addOrderNote } from "@/lib/actions/admin/orders";
import { ORDER_STATUS, type OrderStatus } from "@/lib/constants";

export function OrderActions({
  orderId,
  status,
  hasTracking,
  note,
}: {
  orderId: string;
  status: OrderStatus;
  hasTracking: boolean;
  note: string;
}) {
  const [pending, start] = useTransition();
  // "paid" and "refunded" are excluded — they run through dedicated flows
  // (payment webhook / Refund) so their settlement side-effects always apply.
  const manualStatuses = ORDER_STATUS.filter(
    (s) => s !== "paid" && s !== "refunded",
  );
  const [sel, setSel] = useState<OrderStatus>(
    status !== "paid" && status !== "refunded" ? status : "processing",
  );
  const [noteText, setNoteText] = useState(note);

  return (
    <div className="space-y-6">
      {/* Fulfillment */}
      <div>
        <Label>Fulfillment</Label>
        <div className="space-y-2">
          {!hasTracking ? (
            <Button
              className="w-full"
              disabled={pending || status === "pending" || status === "failed"}
              onClick={() =>
                start(async () => {
                  const res = await pushToPaperfly(orderId);
                  if (res.ok) toast.success(`Dispatched · AWB ${res.trackingId}`);
                  else toast.error(res.error ?? "Dispatch failed (queued for retry).");
                })
              }
            >
              {pending ? <Loader2 size={15} className="animate-spin" /> : <Truck size={15} />}
              Push to Paperfly
            </Button>
          ) : (
            <Button
              variant="outline"
              className="w-full"
              disabled={pending || status === "delivered"}
              onClick={() =>
                start(async () => {
                  const res = await advanceTracking(orderId);
                  if (res.ok) toast.success(`Status → ${res.status?.replace("_", " ")}`);
                  else toast.error("No further status available.");
                })
              }
            >
              {pending ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
              Advance Tracking
            </Button>
          )}
        </div>
      </div>

      {/* Manual status */}
      <div>
        <Label>Set Status</Label>
        <div className="flex gap-2">
          <select
            value={sel}
            onChange={(e) => setSel(e.target.value as OrderStatus)}
            className="h-10 flex-1 border border-line-strong bg-onyx-soft px-3 text-sm capitalize text-ivory focus:border-gold focus:outline-none"
          >
            {manualStatuses.map((s) => (
              <option key={s} value={s}>{s.replace("_", " ")}</option>
            ))}
          </select>
          <Button
            variant="outline"
            disabled={pending}
            onClick={() =>
              start(async () => {
                await updateOrderStatus(orderId, sel, "Status updated by admin.");
                toast.success("Status updated");
              })
            }
          >
            Apply
          </Button>
        </div>
      </div>

      {/* Internal note */}
      <div>
        <Label>Internal Note</Label>
        <Textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Private note about this order…" />
        <Button
          variant="ghost"
          className="mt-2"
          disabled={pending}
          onClick={() => start(async () => { await addOrderNote(orderId, noteText); toast.success("Note saved"); })}
        >
          <Save size={14} /> Save Note
        </Button>
      </div>

      {/* Refund */}
      {(status === "paid" || status === "processing" || status === "dispatched") && (
        <div className="border-t border-line pt-4">
          <Button
            variant="danger"
            className="w-full"
            disabled={pending}
            onClick={() => {
              if (!confirm("Refund this order and restore stock? This cannot be undone."))
                return;
              start(async () => {
                const res = await refundOrder(orderId);
                if (res.ok) toast.success("Order refunded; stock restored.");
                else toast.error(res.error ?? "Could not refund order.");
              });
            }}
          >
            <RotateCcw size={14} /> Refund Order
          </Button>
        </div>
      )}
    </div>
  );
}
