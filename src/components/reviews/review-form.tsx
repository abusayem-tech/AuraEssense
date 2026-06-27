"use client";

import { useActionState, useState } from "react";
import { Star, Loader2 } from "lucide-react";
import { submitReview } from "@/lib/actions/reviews";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function ReviewForm({
  productId,
  slug,
}: {
  productId: string;
  slug: string;
}) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [state, action, pending] = useActionState(submitReview, null);

  if (state?.ok) {
    return (
      <div className="border border-emerald/30 bg-emerald/5 p-6 text-center">
        <p className="text-sm text-emerald">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5 border border-line p-6">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="rating" value={rating} />
      <div>
        <Label>Your Rating</Label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => setRating(i)}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(0)}
              aria-label={`${i} star`}
            >
              <Star
                size={26}
                className={cn(
                  "transition-colors",
                  i <= (hover || rating)
                    ? "fill-gold text-gold"
                    : "fill-transparent text-line-strong",
                )}
              />
            </button>
          ))}
        </div>
      </div>
      <div>
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" placeholder="Summarise your experience" />
      </div>
      <div>
        <Label htmlFor="body">Your Review</Label>
        <Textarea id="body" name="body" placeholder="What did you love about this fragrance?" />
      </div>
      {state && !state.ok && <p className="text-xs text-rose">{state.message}</p>}
      <Button type="submit" disabled={pending || rating === 0}>
        {pending && <Loader2 size={15} className="animate-spin" />}
        Submit Review
      </Button>
    </form>
  );
}
