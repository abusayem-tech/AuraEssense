"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Heart,
  MapPin,
  Sparkles,
  User,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/account", label: "Overview", icon: LayoutDashboard },
  { href: "/account/orders", label: "Orders", icon: Package },
  { href: "/account/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/account/loyalty", label: "Rewards", icon: Sparkles },
  { href: "/account/profile", label: "Profile", icon: User },
];

export function AccountNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col">
      {LINKS.map((l) => {
        const active =
          l.href === "/account"
            ? pathname === "/account"
            : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              "flex items-center gap-3 border-l-2 px-4 py-3 text-sm transition-colors",
              active
                ? "border-gold bg-onyx-soft text-ivory"
                : "border-transparent text-ivory-dim hover:border-line-strong hover:text-ivory",
            )}
          >
            <l.icon size={16} />
            {l.label}
          </Link>
        );
      })}
      {isAdmin && (
        <Link
          href="/admin"
          className="mt-2 flex items-center gap-3 border-l-2 border-transparent px-4 py-3 text-sm text-gold hover:bg-onyx-soft"
        >
          <ShieldCheck size={16} /> Admin Panel
        </Link>
      )}
      <form action="/auth/signout" method="post" className="mt-2">
        <button
          type="submit"
          className="flex w-full items-center gap-3 border-l-2 border-transparent px-4 py-3 text-sm text-ivory-dim transition-colors hover:text-rose"
        >
          <LogOut size={16} /> Sign Out
        </button>
      </form>
    </nav>
  );
}
