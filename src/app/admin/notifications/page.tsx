import Link from "next/link";
import { Bell } from "lucide-react";
import { AdminHeader, Card } from "@/components/admin/admin-ui";
import { MarkReadButton } from "@/components/admin/mark-read-button";
import { EmptyState } from "@/components/ui/misc";
import { createClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/format";
import type { AdminNotification } from "@/types";

export default async function NotificationsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("admin_notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  const items = (data as unknown as AdminNotification[]) ?? [];

  return (
    <div>
      <AdminHeader title="Notifications" description="System alerts and activity." action={<MarkReadButton />} />
      {items.length === 0 ? (
        <EmptyState icon={<Bell size={32} />} title="No notifications" />
      ) : (
        <div className="space-y-3">
          {items.map((n) => {
            const inner = (
              <Card className={n.read_at ? "opacity-60" : "border-gold/30"}>
                <div className="flex items-start gap-3">
                  <Bell size={16} className={n.read_at ? "text-muted" : "text-gold"} />
                  <div className="flex-1">
                    <p className="text-sm text-ivory">{n.title}</p>
                    {n.body && <p className="text-xs text-muted">{n.body}</p>}
                    <p className="mt-1 text-[0.65rem] text-muted">{formatDateTime(n.created_at)}</p>
                  </div>
                  {!n.read_at && <span className="h-2 w-2 rounded-full bg-gold" />}
                </div>
              </Card>
            );
            return n.link ? (
              <Link key={n.id} href={n.link}>{inner}</Link>
            ) : (
              <div key={n.id}>{inner}</div>
            );
          })}
        </div>
      )}
    </div>
  );
}
