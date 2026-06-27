import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => (
  <input
    type={type}
    ref={ref}
    className={cn(
      "flex h-11 w-full border border-line-strong bg-onyx-soft px-4 py-2 text-sm text-ivory placeholder:text-muted",
      "focus:border-gold focus:outline-none focus:ring-0 transition-colors",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-24 w-full border border-line-strong bg-onyx-soft px-4 py-3 text-sm text-ivory placeholder:text-muted",
      "focus:border-gold focus:outline-none transition-colors resize-y",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "text-xs uppercase tracking-widest text-ivory-dim mb-2 block",
      className,
    )}
    {...props}
  />
));
Label.displayName = "Label";
