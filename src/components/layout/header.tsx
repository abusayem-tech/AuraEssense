"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { MAIN_NAV, SITE } from "@/lib/constants";
import { useCart } from "@/lib/store/cart";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetTitle,
} from "@/components/ui/sheet";
import { CommandSearch } from "@/components/search/command-search";
import { ThemeToggle } from "@/components/theme-toggle";
import { AccountMenu } from "@/components/account/account-menu";

export function Header({
  isAuthed,
  isAdmin,
}: {
  isAuthed: boolean;
  isAdmin: boolean;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { count, open } = useCart();
  const itemCount = count();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const isHome = pathname === "/";
  const solid = scrolled || !isHome;
  const overHero = isHome && !scrolled;
  const ink = overHero ? "text-[var(--photo-text)]" : "text-ivory";
  const inkDim = overHero
    ? "text-[var(--photo-text-dim)] hover:text-[var(--photo-text)]"
    : "text-ivory-dim hover:text-ivory";
  const icon = overHero
    ? "text-[var(--photo-text-dim)] hover:text-photo-gold"
    : "text-ivory-dim hover:text-gold";

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-40 transition-all duration-500",
          solid
            ? "bg-onyx/90 backdrop-blur-md border-b border-line"
            : "bg-transparent border-b border-transparent",
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8 xl:h-20">
          {/* Left: mobile menu + logo + desktop nav */}
          <div className="flex items-center gap-4 sm:gap-6 xl:gap-10">
            {/* Mobile menu */}
            <div className="flex items-center xl:hidden">
              <MobileNav isAuthed={isAuthed} isAdmin={isAdmin} iconClass={icon} />
            </div>

            {/* Logo */}
            <Link
              href="/"
              className="flex flex-col items-center leading-none"
            >
              <span className={cn("font-display text-2xl tracking-[0.15em] xl:text-[1.7rem]", ink)}>
                {SITE.name.toUpperCase()}
              </span>
              <span className="mt-0.5 text-[0.5rem] uppercase tracking-[0.45em] text-gold">
                Maison de Parfum
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden items-center gap-6 xl:flex 2xl:gap-8">
              {MAIN_NAV.map((item) => {
                const active = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "link-underline whitespace-nowrap text-xs uppercase tracking-[0.2em] transition-colors",
                      inkDim,
                      active && (overHero ? "is-active text-[var(--photo-text)]" : "is-active text-ivory"),
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Actions */}
          <div className="flex flex-1 items-center justify-end gap-3 sm:gap-5">
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              className={cn("-m-2 p-2 transition-colors", icon)}
            >
              <Search size={19} />
            </button>
            <ThemeToggle className={icon} />
            <Link
              href="/account/wishlist"
              aria-label="Wishlist"
              className={cn("hidden transition-colors sm:block", icon)}
            >
              <Heart size={19} />
            </Link>
            {isAuthed ? (
              <AccountMenu isAdmin={isAdmin} iconClass={icon} />
            ) : (
              <Link
                href="/login"
                aria-label="Account"
                className={cn("-m-2 p-2 transition-colors", icon)}
              >
                <User size={19} />
              </Link>
            )}
            <button
              onClick={open}
              aria-label="Open bag"
              className={cn("relative transition-colors", icon)}
            >
              <ShoppingBag size={19} />
              {mounted && itemCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center bg-gold px-1 text-[0.6rem] font-medium text-on-gold tnum">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>
      <CommandSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}

function MobileNav({
  isAuthed,
  isAdmin,
  iconClass,
}: {
  isAuthed: boolean;
  isAdmin: boolean;
  iconClass?: string;
}) {
  return (
    <Sheet>
      <SheetTrigger aria-label="Open menu" className={cn("-m-2 p-2", iconClass ?? "text-ivory")}>
        <Menu size={22} />
      </SheetTrigger>
      <SheetContent side="left" showClose={false} className="sm:max-w-xs">
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <SheetTitle className="font-display text-xl text-ivory">
            Menu
          </SheetTitle>
          <SheetClose className="-m-2 p-2 text-muted hover:text-ivory">
            <X size={20} />
          </SheetClose>
        </div>
        <nav className="flex flex-col px-6 py-4">
          {MAIN_NAV.map((item) => (
            <SheetClose asChild key={item.href}>
              <Link
                href={item.href}
                className="border-b border-line py-4 font-display text-2xl text-ivory transition-colors hover:text-gold"
              >
                {item.label}
              </Link>
            </SheetClose>
          ))}
        </nav>
        <div className="mt-auto border-t border-line px-6 py-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-ivory-dim">
              Theme
            </span>
            <ThemeToggle />
          </div>
          <SheetClose asChild>
            <Link
              href={isAuthed ? "/account" : "/login"}
              className="block text-xs uppercase tracking-widest text-ivory-dim hover:text-gold"
            >
              {isAuthed ? "My Account" : "Sign In"}
            </Link>
          </SheetClose>
          {isAdmin && (
            <SheetClose asChild>
              <Link
                href="/admin"
                className="block text-xs uppercase tracking-widest text-gold"
              >
                Admin Panel
              </Link>
            </SheetClose>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
