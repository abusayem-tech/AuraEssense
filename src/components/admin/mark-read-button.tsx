"use client";

import { useTransition } from "react";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { markNotificationsRead } from "@/lib/actions/admin/settings";

export function MarkReadButton() {
  const [pending, start] = useTransition();
  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() => start(async () => { await markNotificationsRead(); toast.success("Marked all as read"); })}
    >
      {pending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
      Mark all read
    </Button>
  );
}
