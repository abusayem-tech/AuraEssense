"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Heart,
  LayoutDashboard,
  LogOut,
  Package,
  ShieldCheck,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function AccountMenu({
  isAdmin,
  className,
  iconClass,
}: {
  isAdmin: boolean;
  className?: string;
  iconClass?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Account menu"
        aria-expanded={open}
        aria-haspopup="menu"
        className={cn("-m-2 p-2 transition-colors", iconClass)}
      >
        <User size={19} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-3 w-56 border border-line bg-onyx-soft py-2 shadow-xl"
        >
          <MenuLink href="/account" icon={LayoutDashboard} onClick={() => setOpen(false)}>
            My Account
          </MenuLink>
          <MenuLink href="/account/orders" icon={Package} onClick={() => setOpen(false)}>
            Orders
          </MenuLink>
          <MenuLink href="/account/wishlist" icon={Heart} onClick={() => setOpen(false)}>
            Wishlist
          </MenuLink>
          <MenuLink href="/account/profile" icon={User} onClick={() => setOpen(false)}>
            Profile
          </MenuLink>

          {isAdmin && (
            <>
              <div className="my-2 h-px bg-line" />
              <MenuLink
                href="/admin"
                icon={ShieldCheck}
                onClick={() => setOpen(false)}
                className="text-gold hover:text-gold-soft"
              >
                Admin Panel
              </MenuLink>
            </>
          )}

          <div className="my-2 h-px bg-line" />
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              role="menuitem"
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-ivory-dim transition-colors hover:bg-onyx-raised hover:text-rose"
            >
              <LogOut size={15} />
              Sign Out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function MenuLink({
  href,
  icon: Icon,
  children,
  onClick,
  className,
}: {
  href: string;
  icon: React.ComponentType<{ size?: number }>;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-4 py-2.5 text-sm text-ivory-dim transition-colors hover:bg-onyx-raised hover:text-ivory",
        className,
      )}
    >
      <Icon size={15} />
      {children}
    </Link>
  );
}
