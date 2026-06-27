import type { Metadata } from "next";
import { CheckoutClient } from "@/components/checkout/checkout-client";
import { getSettings } from "@/lib/settings";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Address } from "@/types";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const [settings, profile] = await Promise.all([getSettings(), getProfile()]);

  let defaultAddress: Address | null = null;
  if (profile) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", profile.id)
      .order("is_default", { ascending: false })
      .limit(1)
      .maybeSingle();
    defaultAddress = (data as unknown as Address) ?? null;
  }

  return (
    <div className="pt-28 lg:pt-32">
      <CheckoutClient
        settings={{
          deliveryFeeDhaka: settings.deliveryFeeDhaka,
          deliveryFeeOutside: settings.deliveryFeeOutside,
          freeShipThreshold: settings.freeShipThreshold,
          giftWrapFee: settings.giftWrapFee,
        }}
        loyaltyPoints={profile?.loyalty_points ?? 0}
        defaultEmail={profile?.email ?? ""}
        defaultAddress={defaultAddress}
      />
    </div>
  );
}
