import { Container } from "@/components/ui/misc";

export default function StorefrontLoading() {
  return (
    <div className="pt-28 lg:pt-36" aria-busy="true" aria-live="polite">
      <Container className="py-16 md:py-24">
        <div className="mx-auto max-w-md space-y-4 text-center">
          <div className="mx-auto h-3 w-28 shimmer rounded-sm" />
          <div className="mx-auto h-10 w-64 shimmer rounded-sm sm:w-80" />
          <div className="mx-auto h-3 w-48 shimmer rounded-sm" />
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-[3/4] shimmer" />
              <div className="h-3 w-1/3 shimmer rounded-sm" />
              <div className="h-4 w-2/3 shimmer rounded-sm" />
              <div className="h-3 w-1/4 shimmer rounded-sm" />
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}
