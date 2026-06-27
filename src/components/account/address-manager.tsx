"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, Star, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { saveAddress, deleteAddress, setDefaultAddress } from "@/lib/actions/account";
import type { Address } from "@/types";

export function AddressManager({ addresses }: { addresses: Address[] }) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  async function onSave(formData: FormData) {
    const res = await saveAddress(formData);
    if (res.ok) {
      toast.success(res.message);
      setOpen(false);
    } else toast.error(res.message);
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-display text-2xl text-ivory">Saved Addresses</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus size={14} /> Add Address
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle className="font-display text-2xl text-ivory">
              Add Address
            </DialogTitle>
            <form action={onSave} className="mt-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="recipient">Recipient</Label>
                  <Input id="recipient" name="recipient" required />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" name="phone" required />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="line">Address</Label>
                  <Input id="line" name="line" required />
                </div>
                <div>
                  <Label htmlFor="area">Area</Label>
                  <Input id="area" name="area" required />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input id="city" name="city" defaultValue="Dhaka" required />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="zone">Zone</Label>
                  <select id="zone" name="zone" className="h-11 w-full border border-line-strong bg-onyx-soft px-3 text-sm text-ivory focus:border-gold focus:outline-none">
                    <option value="dhaka">Inside Dhaka</option>
                    <option value="outside">Outside Dhaka</option>
                  </select>
                </div>
                <label className="col-span-2 flex items-center gap-2 text-sm text-ivory-dim">
                  <input type="checkbox" name="is_default" className="accent-[var(--gold)]" />
                  Set as default address
                </label>
              </div>
              <Button type="submit" className="w-full">Save Address</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {addresses.length === 0 ? (
        <p className="border border-line p-10 text-center text-muted">
          No saved addresses yet.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((a) => (
            <div key={a.id} className="relative border border-line bg-onyx-soft p-5">
              {a.is_default && (
                <span className="absolute right-4 top-4 flex items-center gap-1 text-[0.6rem] uppercase tracking-widest text-gold">
                  <Check size={11} /> Default
                </span>
              )}
              <p className="text-ivory">{a.recipient}</p>
              <p className="text-sm text-muted">{a.phone}</p>
              <p className="mt-2 text-sm text-ivory-dim">
                {a.line}, {a.area}, {a.city}
              </p>
              <p className="mt-1 text-xs capitalize text-muted">
                {a.zone === "dhaka" ? "Inside Dhaka" : "Outside Dhaka"}
              </p>
              <div className="mt-4 flex gap-4 border-t border-line pt-3">
                {!a.is_default && (
                  <button
                    onClick={() => start(async () => { await setDefaultAddress(a.id); toast.success("Default updated"); })}
                    disabled={pending}
                    className="flex items-center gap-1 text-xs text-muted hover:text-gold"
                  >
                    <Star size={12} /> Make default
                  </button>
                )}
                <button
                  onClick={() => start(async () => { await deleteAddress(a.id); toast.success("Address removed"); })}
                  disabled={pending}
                  className="flex items-center gap-1 text-xs text-muted hover:text-rose"
                >
                  <Trash2 size={12} /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
