import Link from "next/link";
import { cn } from "@/lib/utils";

export function AdminHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl text-ivory">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("border border-line bg-onyx-soft p-5", className)}>
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  sub,
  trend,
}: {
  label: string;
  value: string;
  sub?: string;
  trend?: number;
}) {
  return (
    <Card>
      <p className="text-[0.65rem] uppercase tracking-widest text-muted">
        {label}
      </p>
      <p className="mt-2 font-display text-3xl text-ivory tnum">{value}</p>
      {sub && <p className="mt-1 text-xs text-muted">{sub}</p>}
      {trend !== undefined && (
        <p
          className={cn(
            "mt-1 text-xs tnum",
            trend >= 0 ? "text-emerald" : "text-rose",
          )}
        >
          {trend >= 0 ? "▲" : "▼"} {Math.abs(trend).toFixed(1)}% vs prev.
        </p>
      )}
    </Card>
  );
}

export function Table({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto border border-line">
      <table className="w-full min-w-[640px] text-sm">{children}</table>
    </div>
  );
}

export function Th({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <th
      className={cn(
        "border-b border-line bg-onyx-soft px-4 py-3 text-left text-[0.65rem] font-medium uppercase tracking-widest text-muted",
        className,
      )}
    >
      {children}
    </th>
  );
}

export function Td({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <td className={cn("border-b border-line px-4 py-3 text-ivory-dim", className)}>
      {children}
    </td>
  );
}

export function EmptyRow({ colSpan, label }: { colSpan: number; label: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-12 text-center text-muted">
        {label}
      </td>
    </tr>
  );
}

export function LinkButton({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-9 items-center gap-2 bg-gold px-4 text-xs font-medium uppercase tracking-widest text-onyx transition-colors hover:bg-gold-soft",
        className,
      )}
    >
      {children}
    </Link>
  );
}
