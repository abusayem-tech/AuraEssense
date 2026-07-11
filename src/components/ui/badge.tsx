import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 px-2.5 py-1 text-[0.65rem] uppercase tracking-widest font-medium",
  {
    variants: {
      variant: {
        gold: "bg-gold/20 text-gold border border-gold/45",
        muted: "bg-onyx-raised text-ivory-dim border border-line",
        emerald: "bg-emerald/15 text-emerald border border-emerald/30",
        rose: "bg-rose/15 text-rose border border-rose/30",
        outline: "border border-line-strong text-ivory-dim",
        /** High-contrast chip for badges sitting on product photography */
        photo:
          "bg-[var(--photo-ink)]/75 text-[var(--photo-text)] border border-[var(--photo-text)]/25 backdrop-blur-sm",
        "photo-gold":
          "bg-photo-ink/75 text-photo-gold border border-photo-gold/55 backdrop-blur-sm",
      },
    },
    defaultVariants: { variant: "muted" },
  },
);

export function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
