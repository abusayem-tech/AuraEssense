import { redirect } from "next/navigation";
import Link from "next/link";
import { Bell, ExternalLink, Menu } from "lucide-react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Admin Console" };

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getProfile();
  if (!profile) redirect("/login?redirect=/admin");
  if (profile.role !== "admin") redirect("/");

  const supabase = await createClient();
  const { count } = await supabase
    .from("admin_notifications")
    .select("id", { count: "exact", head: true })
    .is("read_at", null);

  return (
    <div className="flex min-h-screen bg-onyx">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-line bg-onyx-soft lg:block">
        <AdminSidebar />
      </aside>

      <div className="flex flex-1 flex-col lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-onyx/90 px-5 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <Sheet>
              <SheetTrigger className="text-ivory lg:hidden" aria-label="Menu">
                <Menu size={22} />
              </SheetTrigger>
              <SheetContent side="left" className="bg-onyx-soft p-0">
                <AdminSidebar />
              </SheetContent>
            </Sheet>
            <span className="text-sm text-muted">
              Welcome, <span className="text-ivory">{profile.full_name ?? "Admin"}</span>
            </span>
          </div>
          <div className="flex items-center gap-5">
            <ThemeToggle />
            <Link
              href="/admin/notifications"
              className="relative text-ivory-dim hover:text-gold"
              aria-label="Notifications"
            >
              <Bell size={18} />
              {!!count && count > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center bg-gold px-1 text-[0.6rem] text-onyx tnum">
                  {count}
                </span>
              )}
            </Link>
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-ivory-dim hover:text-gold"
            >
              <ExternalLink size={14} /> View Store
            </Link>
          </div>
        </header>

        <main className="flex-1 p-5 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
