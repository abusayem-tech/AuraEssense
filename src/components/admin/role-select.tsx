"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { setCustomerRole } from "@/lib/actions/admin/customers";

export function RoleSelect({
  userId,
  role,
}: {
  userId: string;
  role: string;
}) {
  const [pending, start] = useTransition();
  const current = role === "admin" ? "admin" : "customer";

  return (
    <select
      value={current}
      disabled={pending}
      aria-label="Change role"
      onChange={(e) => {
        const next = e.target.value as "customer" | "admin";
        if (next === current) return;
        if (
          next === "customer" &&
          !confirm("Revoke admin access for this user?")
        ) {
          e.target.value = current;
          return;
        }
        start(async () => {
          const res = await setCustomerRole(userId, next);
          if (res.ok) toast.success(next === "admin" ? "Granted admin" : "Role set to customer");
          else {
            toast.error(res.error ?? "Could not update role.");
            e.target.value = current;
          }
        });
      }}
      className={cn(
        "h-8 min-w-[7.5rem] border border-line-strong bg-onyx-soft px-2 text-[0.65rem] uppercase tracking-widest text-ivory",
        "focus:border-gold focus:outline-none disabled:opacity-50",
        current === "admin" ? "border-gold/50 text-gold" : "text-muted",
      )}
    >
      <option value="customer">Customer</option>
      <option value="admin">Admin</option>
    </select>
  );
}
