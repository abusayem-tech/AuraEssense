"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  TrendingUp,
  Boxes,
  Tag as TagIcon,
  Layers,
  Sparkles,
  Warehouse,
  ShoppingCart,
  Users,
  Ticket,
  Gift,
  Star,
  ImageIcon,
  Mail,
  HelpCircle,
  Newspaper,
  FileText,
  Settings,
  ScrollText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SITE } from "@/lib/constants";

const GROUPS: {
  label: string;
  items: { href: string; label: string; icon: React.ElementType }[];
}[] = [
  {
    label: "Overview",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/analytics", label: "Sales & Analytics", icon: TrendingUp },
    ],
  },
  {
    label: "Catalog",
    items: [
      { href: "/admin/products", label: "Products", icon: Boxes },
      { href: "/admin/brands", label: "Brands", icon: TagIcon },
      { href: "/admin/families", label: "Families", icon: Layers },
      { href: "/admin/collections", label: "Collections", icon: Sparkles },
      { href: "/admin/inventory", label: "Inventory", icon: Warehouse },
    ],
  },
  {
    label: "Sales",
    items: [
      { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
      { href: "/admin/customers", label: "Customers", icon: Users },
    ],
  },
  {
    label: "Marketing",
    items: [
      { href: "/admin/promo-codes", label: "Promo Codes", icon: Ticket },
      { href: "/admin/gift-cards", label: "Gift Cards", icon: Gift },
      { href: "/admin/reviews", label: "Reviews", icon: Star },
      { href: "/admin/banners", label: "Banners", icon: ImageIcon },
      { href: "/admin/newsletter", label: "Newsletter", icon: Mail },
      { href: "/admin/quiz", label: "Quiz", icon: HelpCircle },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/journal", label: "Journal", icon: Newspaper },
      { href: "/admin/pages", label: "Pages", icon: FileText },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/admin/settings", label: "Settings", icon: Settings },
      { href: "/admin/audit", label: "Audit Log", icon: ScrollText },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="border-b border-line px-6 py-5">
        <Link href="/admin" className="font-display text-xl tracking-[0.12em] text-ivory">
          {SITE.name.toUpperCase()}
        </Link>
        <p className="mt-0.5 text-[0.55rem] uppercase tracking-[0.3em] text-gold">
          Admin Console
        </p>
      </div>
      <nav className="flex-1 px-3 py-4">
        {GROUPS.map((group) => (
          <div key={group.label} className="mb-5">
            <p className="px-3 pb-2 text-[0.6rem] uppercase tracking-[0.2em] text-muted">
              {group.label}
            </p>
            {group.items.map((item) => {
              const active =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-sm px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-gold/15 text-gold ring-1 ring-inset ring-gold/25"
                      : "text-ivory-dim hover:bg-onyx-raised hover:text-ivory",
                  )}
                >
                  <item.icon size={16} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </div>
  );
}
