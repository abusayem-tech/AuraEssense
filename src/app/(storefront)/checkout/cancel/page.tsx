import Link from "next/link";
import { Ban } from "lucide-react";
import { Container } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Payment Cancelled" };

export default function CancelPage() {
  return (
    <Container className="flex min-h-[70vh] items-center justify-center py-24">
      <div className="w-full max-w-lg text-center">
        <Ban className="mx-auto text-muted" size={56} />
        <h1 className="mt-6 font-display text-4xl text-ivory">
          Payment Cancelled
        </h1>
        <p className="mt-4 text-ivory-dim">
          You cancelled the payment. Your bag is still saved whenever you&apos;re
          ready.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Button asChild>
            <Link href="/checkout">Return to Checkout</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/fragrances">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    </Container>
  );
}
