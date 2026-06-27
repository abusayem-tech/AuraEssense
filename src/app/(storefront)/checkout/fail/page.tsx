import Link from "next/link";
import { XCircle } from "lucide-react";
import { Container } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Payment Failed" };

export default function FailPage() {
  return (
    <Container className="flex min-h-[70vh] items-center justify-center py-24">
      <div className="w-full max-w-lg text-center">
        <XCircle className="mx-auto text-rose" size={56} />
        <h1 className="mt-6 font-display text-4xl text-ivory">Payment Failed</h1>
        <p className="mt-4 text-ivory-dim">
          We couldn&apos;t process your payment. Your bag has been saved — please
          try again.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Button asChild>
            <Link href="/checkout">Try Again</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/fragrances">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    </Container>
  );
}
