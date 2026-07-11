import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="grain flex min-h-screen flex-col items-center justify-center bg-onyx px-6 text-center">
      <p className="eyebrow">Error 404</p>
      <h1 className="mt-4 font-display text-4xl text-ivory sm:text-6xl md:text-8xl">
        Lost in the Notes
      </h1>
      <p className="mt-4 max-w-md text-ivory-dim">
        The page you&apos;re searching for has drifted away. Let&apos;s guide you
        back to the collection.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
        <Button asChild className="w-full sm:w-auto">
          <Link href="/">Return Home</Link>
        </Button>
        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link href="/fragrances">Browse Fragrances</Link>
        </Button>
      </div>
    </div>
  );
}
