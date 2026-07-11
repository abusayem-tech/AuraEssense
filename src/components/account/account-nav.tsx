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
    <nav className="flex items-stretch overflow-x-auto border-b border-line lg:flex-col lg:overflow-visible lg:border-b-0">
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
              "flex shrink-0 items-center gap-3 whitespace-nowrap border-b-2 px-4 py-3 text-sm transition-colors lg:border-b-0 lg:border-l-2",
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
          className="flex shrink-0 items-center gap-3 whitespace-nowrap border-b-2 border-transparent px-4 py-3 text-sm text-gold hover:bg-onyx-soft lg:mt-2 lg:border-b-0 lg:border-l-2"
        >
          <ShieldCheck size={16} /> Admin Panel
        </Link>
      )}
      <form action="/auth/signout" method="post" className="shrink-0 lg:mt-2">
        <button
          type="submit"
          className="flex w-full items-center gap-3 whitespace-nowrap border-b-2 border-transparent px-4 py-3 text-sm text-ivory-dim transition-colors hover:text-rose lg:border-b-0 lg:border-l-2"
        >
          <LogOut size={16} /> Sign Out
        </button>
      </form>
    </nav>
  );
}
