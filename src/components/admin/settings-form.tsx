"use client";

import { useTransition } from "react";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { saveSettings, saveShippingZone } from "@/lib/actions/admin/settings";

interface Settings {
  store_name: string;
  contact_email: string;
  contact_phone: string;
  free_ship_threshold: number;
  gift_wrap_fee: number;
  loyalty_earn_rate: number;
  tax_rate: number;
  low_stock_threshold: number;
  payment_provider: string;
  logistics_provider: string;
}

interface Zone {
  id: string;
  name: string;
  zone: string;
  fee_bdt: number;
  free_ship_min: number;
  est_days: string;
}

export function SettingsForm({ settings, zones }: { settings: Settings; zones: Zone[] }) {
  const [pending, start] = useTransition();

  function onSave(fd: FormData) {
    start(async () => {
      await saveSettings(fd);
      toast.success("Settings saved");
    });
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card>
        <h2 className="mb-4 font-display text-xl text-ivory">Store Profile</h2>
        <form action={onSave} className="space-y-4">
          <div><Label htmlFor="store_name">Store Name</Label><Input id="store_name" name="store_name" defaultValue={settings.store_name} /></div>
          <div><Label htmlFor="contact_email">Contact Email</Label><Input id="contact_email" name="contact_email" defaultValue={settings.contact_email} /></div>
          <div><Label htmlFor="contact_phone">Contact Phone</Label><Input id="contact_phone" name="contact_phone" defaultValue={settings.contact_phone} /></div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div><Label htmlFor="free_ship_threshold">Free Ship Threshold</Label><Input id="free_ship_threshold" name="free_ship_threshold" type="number" defaultValue={settings.free_ship_threshold} /></div>
            <div><Label htmlFor="gift_wrap_fee">Gift Wrap Fee</Label><Input id="gift_wrap_fee" name="gift_wrap_fee" type="number" defaultValue={settings.gift_wrap_fee} /></div>
            <div><Label htmlFor="loyalty_earn_rate">Loyalty Rate (e.g. 0.02)</Label><Input id="loyalty_earn_rate" name="loyalty_earn_rate" type="number" step="0.001" defaultValue={settings.loyalty_earn_rate} /></div>
            <div><Label htmlFor="tax_rate">Tax Rate</Label><Input id="tax_rate" name="tax_rate" type="number" step="0.001" defaultValue={settings.tax_rate} /></div>
            <div><Label htmlFor="low_stock_threshold">Low Stock Threshold</Label><Input id="low_stock_threshold" name="low_stock_threshold" type="number" defaultValue={settings.low_stock_threshold} /></div>
          </div>

          <div className="grid grid-cols-1 gap-4 border-t border-line pt-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="payment_provider">Payment Provider</Label>
              <select id="payment_provider" name="payment_provider" defaultValue={settings.payment_provider} className="h-11 w-full border border-line-strong bg-onyx-soft px-3 text-sm text-ivory focus:border-gold focus:outline-none">
                <option value="mock">Mock (SSL Commerze)</option>
                <option value="live">Live (SSL Commerze)</option>
              </select>
            </div>
            <div>
              <Label htmlFor="logistics_provider">Logistics Provider</Label>
              <select id="logistics_provider" name="logistics_provider" defaultValue={settings.logistics_provider} className="h-11 w-full border border-line-strong bg-onyx-soft px-3 text-sm text-ivory focus:border-gold focus:outline-none">
                <option value="mock">Mock (Paperfly)</option>
                <option value="live">Live (Paperfly)</option>
              </select>
            </div>
          </div>
          <p className="text-xs text-muted">
            Provider toggles select between mock and live integrations. Live mode requires
            the corresponding API credentials in environment variables.
          </p>

          <Button type="submit" disabled={pending}>
            {pending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Save Settings
          </Button>
        </form>
      </Card>

      <Card>
        <h2 className="mb-4 font-display text-xl text-ivory">Shipping Zones</h2>
        <div className="space-y-5">
          {zones.map((z) => (
            <form
              key={z.id}
              action={(fd) => start(async () => { fd.set("id", z.id); await saveShippingZone(fd); toast.success("Zone updated"); })}
              className="border border-line p-4"
            >
              <p className="mb-3 text-sm text-ivory">{z.name}</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div><Label htmlFor={`fee-${z.id}`}>Fee (BDT)</Label><Input id={`fee-${z.id}`} name="fee_bdt" type="number" defaultValue={z.fee_bdt} /></div>
                <div><Label htmlFor={`min-${z.id}`}>Free Ship Min</Label><Input id={`min-${z.id}`} name="free_ship_min" type="number" defaultValue={z.free_ship_min} /></div>
                <div><Label htmlFor={`days-${z.id}`}>Est. Days</Label><Input id={`days-${z.id}`} name="est_days" defaultValue={z.est_days} /></div>
              </div>
              <Button type="submit" variant="outline" size="sm" className="mt-3">Update Zone</Button>
            </form>
          ))}
        </div>
      </Card>
    </div>
  );
}
