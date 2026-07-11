"use client";

import { useActionState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { subscribeNewsletter } from "@/lib/actions/newsletter";
import { cn } from "@/lib/utils";

export function NewsletterForm({
  source = "footer",
  className,
}: {
  source?: string;
  className?: string;
}) {
  const [state, action, pending] = useActionState(subscribeNewsletter, null);

  return (
    <div className={className}>
      <form action={action} className="flex items-center border-b border-line-strong focus-within:border-gold transition-colors">
        <input type="hidden" name="source" value={source} />
        <input
          type="email"
          name="email"
          required
          placeholder="Your email address"
          className="min-w-0 flex-1 bg-transparent py-3 text-sm text-ivory placeholder:text-muted focus:outline-none"
          aria-label="Email address"
        />
        <button
          type="submit"
          disabled={pending}
          className="p-2 text-ivory-dim transition-colors hover:text-gold disabled:opacity-50"
          aria-label="Subscribe"
        >
          {pending ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <ArrowRight size={18} />
          )}
        </button>
      </form>
      {state && (
        <p
          className={cn(
            "mt-2 text-xs",
            state.ok ? "text-emerald" : "text-rose",
          )}
        >
          {state.message}
        </p>
      )}
    </div>
  );
}
