"use client";

import { useState, useTransition } from "react";
import { ThumbsUp } from "lucide-react";
import { voteHelpful } from "@/lib/actions/reviews";
import { cn } from "@/lib/utils";

export function HelpfulButton({
  reviewId,
  count,
  initialVoted = false,
}: {
  reviewId: string;
  count: number;
  initialVoted?: boolean;
}) {
  const [voted, setVoted] = useState(initialVoted);
  const [n, setN] = useState(count);
  const [pending, start] = useTransition();

  return (
    <button
      onClick={() =>
        start(async () => {
          const res = await voteHelpful(reviewId);
          if (res.ok) {
            setVoted(res.voted);
            setN((c) => c + (res.voted ? 1 : -1));
          }
        })
      }
      disabled={pending}
      className={cn(
        "flex items-center gap-1.5 text-xs transition-colors",
        voted ? "text-gold" : "text-muted hover:text-ivory",
      )}
    >
      <ThumbsUp size={13} /> Helpful ({n})
    </button>
  );
}
