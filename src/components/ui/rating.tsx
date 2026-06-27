import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function Rating({
  value,
  count,
  size = 14,
  className,
  showCount = true,
}: {
  value: number;
  count?: number;
  size?: number;
  className?: string;
  showCount?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={size}
            className={cn(
              i <= Math.round(value)
                ? "fill-gold text-gold"
                : "fill-transparent text-line-strong",
            )}
            strokeWidth={1.5}
          />
        ))}
      </div>
      {showCount && (
        <span className="text-xs text-muted tnum">
          {value > 0 ? value.toFixed(1) : "New"}
          {count !== undefined && count > 0 ? ` (${count})` : ""}
        </span>
      )}
    </div>
  );
}
