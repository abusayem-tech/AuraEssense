import { Check, Circle } from "lucide-react";
import { formatDateTime } from "@/lib/format";
import { ORDER_STATUS_META } from "@/lib/constants";
import type { OrderEvent } from "@/types";

const PIPELINE = [
  "paid",
  "processing",
  "dispatched",
  "in_transit",
  "delivered",
] as const;

export function TrackingTimeline({
  events,
  currentStatus,
}: {
  events: OrderEvent[];
  currentStatus: string;
}) {
  if (currentStatus === "cancelled" || currentStatus === "failed") {
    return (
      <div className="border border-rose/30 bg-rose/5 p-5 text-sm text-rose">
        This order was {currentStatus}.
      </div>
    );
  }

  const reachedIndex = PIPELINE.indexOf(currentStatus as (typeof PIPELINE)[number]);
  const eventMap = new Map<string, OrderEvent>();
  events.forEach((e) => {
    if (!eventMap.has(e.status)) eventMap.set(e.status, e);
  });

  return (
    <ol className="relative space-y-6">
      {PIPELINE.map((stage, i) => {
        const reached = reachedIndex >= i;
        const event = eventMap.get(stage);
        const meta = ORDER_STATUS_META[stage];
        return (
          <li key={stage} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full border ${
                  reached
                    ? "border-gold bg-gold text-onyx"
                    : "border-line-strong text-muted"
                }`}
              >
                {reached ? <Check size={14} /> : <Circle size={8} />}
              </span>
              {i < PIPELINE.length - 1 && (
                <span
                  className={`mt-1 h-10 w-px ${reached ? "bg-gold/50" : "bg-line"}`}
                />
              )}
            </div>
            <div className="pb-2">
              <p className={`text-sm ${reached ? "text-ivory" : "text-muted"}`}>
                {meta.label}
              </p>
              {event && (
                <p className="mt-0.5 text-xs text-muted">
                  {formatDateTime(event.created_at)}
                  {event.note ? ` · ${event.note}` : ""}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
