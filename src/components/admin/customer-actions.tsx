"use client";

import { useState, useTransition } from "react";
import { Loader2, Save, ShieldCheck, ShieldOff, Ban } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label } from "@/components/ui/input";
import {
  adjustCustomerLoyalty,
  toggleBlockCustomer,
  setCustomerRole,
  saveCustomerNote,
} from "@/lib/actions/admin/customers";

export function CustomerActions({
  userId,
  role,
  isBlocked,
  notes,
}: {
  userId: string;
  role: string;
  isBlocked: boolean;
  notes: string;
}) {
  const [points, setPoints] = useState("");
  const [reason, setReason] = useState("");
  const [noteText, setNoteText] = useState(notes);
  const [pending, start] = useTransition();

  return (
    <div className="space-y-6">
      <div>
        <Label>Adjust Loyalty Points</Label>
        <div className="flex gap-2">
          <Input type="number" value={points} onChange={(e) => setPoints(e.target.value)} placeholder="+/- points" />
          <Button
            variant="outline"
            disabled={pending || !points}
            onClick={() =>
              start(async () => {
                await adjustCustomerLoyalty(userId, Number(points), reason);
                toast.success("Loyalty updated");
                setPoints("");
                setReason("");
              })
            }
          >
            Apply
          </Button>
        </div>
        <Input className="mt-2" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason (optional)" />
      </div>

      <div>
        <Label>Internal Note</Label>
        <Textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="CRM note…" />
        <Button
          variant="ghost"
          className="mt-2"
          disabled={pending}
          onClick={() => start(async () => { await saveCustomerNote(userId, noteText); toast.success("Note saved"); })}
        >
          <Save size={14} /> Save Note
        </Button>
      </div>

      <div className="space-y-2 border-t border-line pt-4">
        <Button
          variant="outline"
          className="w-full"
          disabled={pending}
          onClick={() =>
            start(async () => {
              await setCustomerRole(userId, role === "admin" ? "customer" : "admin");
              toast.success("Role updated");
            })
          }
        >
          {role === "admin" ? <ShieldOff size={14} /> : <ShieldCheck size={14} />}
          {role === "admin" ? "Revoke Admin" : "Grant Admin"}
        </Button>
        <Button
          variant="danger"
          className="w-full"
          disabled={pending}
          onClick={() =>
            start(async () => {
              await toggleBlockCustomer(userId);
              toast.success(isBlocked ? "Customer unblocked" : "Customer blocked");
            })
          }
        >
          {pending ? <Loader2 size={14} className="animate-spin" /> : <Ban size={14} />}
          {isBlocked ? "Unblock Customer" : "Block Customer"}
        </Button>
      </div>
    </div>
  );
}
