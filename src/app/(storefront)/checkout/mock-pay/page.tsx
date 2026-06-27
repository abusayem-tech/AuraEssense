import { MockPayClient } from "@/components/checkout/mock-pay-client";
import { formatBDT } from "@/lib/format";

export const metadata = { title: "Secure Payment" };

export default async function MockPayPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; tran?: string; amount?: string }>;
}) {
  const { order, tran, amount } = await searchParams;

  if (!order || !tran) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center pt-28">
        <p className="text-muted">Invalid payment session.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-5 pt-28">
      <div className="w-full max-w-md border border-line bg-onyx-soft">
        <div className="border-b border-line bg-onyx px-6 py-4 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-gold">
            SSL Commerz · Sandbox
          </p>
          <p className="mt-1 text-[0.65rem] text-muted">
            Simulated Payment Gateway (Mock)
          </p>
        </div>
        <div className="p-8 text-center">
          <p className="text-sm text-muted">Amount payable</p>
          <p className="mt-2 font-display text-5xl text-ivory tnum">
            {formatBDT(Number(amount ?? 0))}
          </p>
          <p className="mt-4 text-xs text-muted">
            Transaction: <span className="text-ivory-dim">{tran}</span>
          </p>

          <div className="mt-8 grid gap-3">
            <p className="mb-1 text-xs uppercase tracking-widest text-muted">
              Choose a simulated outcome
            </p>
            <MockPayClient orderId={order} transactionId={tran} />
          </div>

          <p className="mt-6 text-[0.65rem] leading-relaxed text-muted">
            This is a mock gateway for demonstration. In production, customers are
            redirected to the real SSL Commerze portal (bKash, Nagad, cards),
            which calls our IPN webhook to confirm payment.
          </p>
        </div>
      </div>
    </div>
  );
}
