"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { updateProfile } from "@/lib/actions/account";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export function ProfileForm({
  fullName,
  phone,
  email,
}: {
  fullName: string;
  phone: string;
  email: string;
}) {
  const [state, action, pending] = useActionState(updateProfile, null);

  return (
    <form action={action} className="max-w-md space-y-5">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={email} disabled className="opacity-60" />
        <p className="mt-1 text-xs text-muted">
          Your email is managed by your sign-in method.
        </p>
      </div>
      <div>
        <Label htmlFor="full_name">Full Name</Label>
        <Input id="full_name" name="full_name" defaultValue={fullName} required />
      </div>
      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" name="phone" defaultValue={phone} placeholder="01XXXXXXXXX" />
      </div>
      {state && (
        <p className={`text-xs ${state.ok ? "text-emerald" : "text-rose"}`}>
          {state.message}
        </p>
      )}
      <Button type="submit" disabled={pending}>
        {pending && <Loader2 size={15} className="animate-spin" />}
        Save Changes
      </Button>
    </form>
  );
}
