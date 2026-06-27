import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-300 disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold/60 cursor-pointer select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-gold text-onyx hover:bg-gold-soft tracking-wide uppercase text-xs",
        outline:
          "border border-line-strong text-ivory hover:border-gold hover:text-gold bg-transparent tracking-wide uppercase text-xs",
        ghost: "text-ivory-dim hover:text-ivory hover:bg-onyx-raised",
        solid: "bg-ivory text-onyx hover:bg-white tracking-wide uppercase text-xs",
        danger:
          "border border-rose/40 text-rose hover:bg-rose/10 tracking-wide uppercase text-xs",
        link: "text-gold hover:text-gold-soft underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        sm: "h-9 px-4",
        md: "h-11 px-6",
        lg: "h-14 px-10",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
