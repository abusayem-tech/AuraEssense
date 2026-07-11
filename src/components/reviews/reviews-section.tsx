import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { Rating } from "@/components/ui/rating";
import { Badge } from "@/components/ui/badge";
import { ReviewForm } from "@/components/reviews/review-form";
import { HelpfulButton } from "@/components/reviews/helpful-button";
import { EmptyState } from "@/components/ui/misc";
import { formatDate } from "@/lib/format";
import type { Product, Review } from "@/types";

export function ReviewsSection({
  product,
  reviews,
  isAuthed,
}: {
  product: Product;
  reviews: Review[];
  isAuthed: boolean;
}) {
  const dist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));
  const total = reviews.length;

  return (
    <div className="grid gap-12 lg:grid-cols-12">
      {/* Summary */}
      <div className="lg:col-span-4">
        <div className="text-center lg:text-left">
          <p className="font-display text-6xl text-ivory tnum">
            {product.rating_avg > 0 ? product.rating_avg.toFixed(1) : "—"}
          </p>
          <div className="mt-2 flex justify-center lg:justify-start">
            <Rating value={product.rating_avg} showCount={false} size={16} />
          </div>
          <p className="mt-2 text-xs text-muted">
            Based on {product.rating_count}{" "}
            {product.rating_count === 1 ? "review" : "reviews"}
          </p>
        </div>
        <div className="mt-6 space-y-2">
          {dist.map((d) => (
            <div key={d.star} className="flex items-center gap-3 text-xs">
              <span className="w-3 text-muted tnum">{d.star}</span>
              <div className="h-1 flex-1 bg-line-strong">
                <div
                  className="h-full bg-gold"
                  style={{ width: total ? `${(d.count / total) * 100}%` : "0%" }}
                />
              </div>
              <span className="w-6 text-right text-muted tnum">{d.count}</span>
            </div>
          ))}
        </div>

        <div className="mt-8">
          {isAuthed ? (
            <ReviewForm productId={product.id} slug={product.slug} />
          ) : (
            <Link
              href={`/login?redirect=/fragrances/${product.slug}`}
              className="block border border-line p-6 text-center text-sm text-ivory-dim transition-colors hover:border-gold hover:text-gold"
            >
              Sign in to write a review
            </Link>
          )}
        </div>
      </div>

      {/* List */}
      <div className="lg:col-span-8">
        {reviews.length === 0 ? (
          <EmptyState
            title="No reviews yet"
            description="Be the first to share your impressions of this fragrance."
          />
        ) : (
          <ul className="space-y-8">
            {reviews.map((r) => (
              <li key={r.id} className="border-b border-line pb-8">
                <div className="flex items-center justify-between">
                  <Rating value={r.rating} showCount={false} size={14} />
                  <span className="text-xs text-muted">
                    {formatDate(r.created_at)}
                  </span>
                </div>
                {r.title && (
                  <h4 className="mt-3 font-display text-xl text-ivory">
                    {r.title}
                  </h4>
                )}
                {r.body && (
                  <p className="mt-2 text-sm leading-relaxed text-ivory-dim break-words">
                    {r.body}
                  </p>
                )}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted">
                      {r.author_name ?? "Verified Buyer"}
                    </span>
                    {r.is_verified_purchase && (
                      <Badge variant="emerald" className="!py-0.5">
                        <BadgeCheck size={11} /> Verified
                      </Badge>
                    )}
                  </div>
                  <HelpfulButton
                    reviewId={r.id}
                    count={r.helpful_count}
                    initialVoted={r.viewer_voted ?? false}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
