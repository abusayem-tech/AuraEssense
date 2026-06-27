"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Lock, Tag, Check, Gift } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { ProductImage } from "@/components/product/product-image";
import { EmptyState } from "@/components/ui/misc";
import { Container } from "@/components/ui/misc";
import { useCart } from "@/lib/store/cart";
import { formatBDT } from "@/lib/format";
import { computeTotals } from "@/lib/pricing";
import { placeOrder, previewDiscount } from "@/lib/actions/checkout";
import type { Address } from "@/types";

interface Settings {
  deliveryFeeDhaka: number;
  deliveryFeeOutside: number;
  freeShipThreshold: number;
  giftWrapFee: number;
}

export function CheckoutClient({
  settings,
  loyaltyPoints,
  defaultEmail,
  defaultAddress,
}: {
  settings: Settings;
  loyaltyPoints: number;
  defaultEmail: string;
  defaultAddress: Address | null;
}) {
  const router = useRouter();
  const { lines, subtotal } = useCart();
  const sub = subtotal();

  const [zone, setZone] = useState<"dhaka" | "outside">(
    defaultAddress?.zone ?? "dhaka",
  );
  const [giftWrap, setGiftWrap] = useState(false);
  const [redeemLoyalty, setRedeemLoyalty] = useState(false);
  const [code, setCode] = useState("");
  const [codeApplied, setCodeApplied] = useState<{
    type: string;
    amount: number;
  } | null>(null);
  const [codeMsg, setCodeMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const discount =
    codeApplied && codeApplied.type !== "free_ship" && codeApplied.type !== "gift_card"
      ? codeApplied.amount
      : 0;
  const freeShip = codeApplied?.type === "free_ship";

  const totals = useMemo(
    () =>
      computeTotals({
        subtotal: sub,
        zone,
        deliveryFeeDhaka: settings.deliveryFeeDhaka,
        deliveryFeeOutside: settings.deliveryFeeOutside,
        freeShipThreshold: settings.freeShipThreshold,
        discount,
        freeShip,
        giftWrap,
        giftWrapFee: settings.giftWrapFee,
        loyaltyRedeemed: 0,
      }),
    [sub, zone, settings, discount, freeShip, giftWrap],
  );

  const giftCardApplied =
    codeApplied?.type === "gift_card"
      ? Math.min(codeApplied.amount, totals.total)
      : 0;
  const afterGift = totals.total - giftCardApplied;
  const loyaltyApplied = redeemLoyalty ? Math.min(loyaltyPoints, afterGift) : 0;
  const grandTotal = Math.max(0, afterGift - loyaltyApplied);

  async function applyCode() {
    if (!code.trim()) return;
    const res = await previewDiscount(code.trim(), sub);
    if (res.ok) {
      setCodeApplied({ type: res.type!, amount: res.amount ?? 0 });
      setCodeMsg(res.message);
    } else {
      setCodeApplied(null);
      setCodeMsg(res.message);
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (lines.length === 0) return;
    setLoading(true);
    const fd = new FormData(e.currentTarget);

    const res = await placeOrder({
      recipient: String(fd.get("recipient")),
      phone: String(fd.get("phone")),
      email: String(fd.get("email")),
      addressLine: String(fd.get("addressLine")),
      area: String(fd.get("area")),
      city: String(fd.get("city")),
      zone,
      promoCode:
        codeApplied && codeApplied.type !== "gift_card" ? code.trim() : undefined,
      giftCardCode: codeApplied?.type === "gift_card" ? code.trim() : undefined,
      giftWrap,
      giftMessage: giftWrap ? String(fd.get("giftMessage") || "") : undefined,
      redeemLoyalty,
      lines: lines.map((l) => ({ variantId: l.variantId, qty: l.qty })),
    });

    if (!res.ok || !res.gatewayUrl) {
      setLoading(false);
      toast.error(res.error ?? "Could not place order.");
      return;
    }
    router.push(res.gatewayUrl);
  }

  if (lines.length === 0) {
    return (
      <Container className="py-20">
        <EmptyState
          title="Your bag is empty"
          description="Add a fragrance before proceeding to checkout."
          action={
            <Button asChild>
              <Link href="/fragrances">Explore Fragrances</Link>
            </Button>
          }
        />
      </Container>
    );
  }

  return (
    <Container className="py-12">
      <h1 className="mb-10 text-center font-display text-4xl text-ivory sm:text-5xl">
        Checkout
      </h1>
      <form onSubmit={onSubmit} className="grid gap-12 lg:grid-cols-12">
        {/* Left: details */}
        <div className="space-y-10 lg:col-span-7">
          <section>
            <h2 className="eyebrow !mb-5">Contact & Delivery</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="recipient">Full Name</Label>
                <Input id="recipient" name="recipient" required defaultValue={defaultAddress?.recipient ?? ""} />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" required defaultValue={defaultAddress?.phone ?? ""} placeholder="01XXXXXXXXX" />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required defaultValue={defaultEmail} />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="addressLine">Address</Label>
                <Input id="addressLine" name="addressLine" required defaultValue={defaultAddress?.line ?? ""} placeholder="House, road, block" />
              </div>
              <div>
                <Label htmlFor="area">Area</Label>
                <Input id="area" name="area" required defaultValue={defaultAddress?.area ?? ""} placeholder="e.g. Gulshan" />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input id="city" name="city" required defaultValue={defaultAddress?.city ?? "Dhaka"} />
              </div>
            </div>
          </section>

          <section>
            <h2 className="eyebrow !mb-5">Delivery Zone</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {(
                [
                  { z: "dhaka", label: "Inside Dhaka", fee: settings.deliveryFeeDhaka },
                  { z: "outside", label: "Outside Dhaka", fee: settings.deliveryFeeOutside },
                ] as const
              ).map((opt) => (
                <button
                  type="button"
                  key={opt.z}
                  onClick={() => setZone(opt.z)}
                  className={`flex items-center justify-between border p-4 text-left transition-colors ${
                    zone === opt.z ? "border-gold bg-gold/5" : "border-line-strong hover:border-ivory-dim"
                  }`}
                >
                  <span className="text-sm text-ivory">{opt.label}</span>
                  <span className="text-sm text-muted tnum">{formatBDT(opt.fee)}</span>
                </button>
              ))}
            </div>
          </section>

          <section>
            <h2 className="eyebrow !mb-5">Gift Options</h2>
            <label className="flex cursor-pointer items-start gap-3">
              <input type="checkbox" checked={giftWrap} onChange={(e) => setGiftWrap(e.target.checked)} className="mt-1 accent-[var(--gold)]" />
              <span>
                <span className="flex items-center gap-2 text-sm text-ivory">
                  <Gift size={15} className="text-gold" /> Add luxury gift wrapping
                  <span className="text-muted">(+{formatBDT(settings.giftWrapFee)})</span>
                </span>
                <span className="mt-1 block text-xs text-muted">
                  Hand-wrapped in signature packaging with a personal note.
                </span>
              </span>
            </label>
            {giftWrap && (
              <div className="mt-4">
                <Label htmlFor="giftMessage">Gift Message</Label>
                <Input id="giftMessage" name="giftMessage" placeholder="Your message to the recipient" />
              </div>
            )}
          </section>
        </div>

        {/* Right: summary */}
        <div className="lg:col-span-5">
          <div className="sticky top-28 border border-line bg-onyx-soft p-6">
            <h2 className="font-display text-2xl text-ivory">Order Summary</h2>

            <ul className="mt-6 space-y-4">
              {lines.map((l) => (
                <li key={l.variantId} className="flex gap-3">
                  <div className="relative h-16 w-12 shrink-0 overflow-hidden bg-onyx-raised">
                    <ProductImage src={l.image} alt={l.name} initial={l.name} sizes="48px" />
                  </div>
                  <div className="flex flex-1 justify-between">
                    <div>
                      <p className="text-sm text-ivory">{l.name}</p>
                      <p className="text-xs text-muted">
                        {l.isSample ? "Sample" : `${l.sizeMl}ml`} × {l.qty}
                      </p>
                    </div>
                    <span className="text-sm text-ivory-dim tnum">
                      {formatBDT(l.unitPrice * l.qty)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>

            {/* Promo / gift code */}
            <div className="mt-6 border-t border-line pt-6">
              <Label>Promo or Gift Card</Label>
              <div className="flex gap-2">
                <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Enter code" />
                <Button type="button" variant="outline" onClick={applyCode}>
                  <Tag size={14} /> Apply
                </Button>
              </div>
              {codeMsg && (
                <p className={`mt-2 text-xs ${codeApplied ? "text-emerald" : "text-rose"}`}>
                  {codeMsg}
                </p>
              )}
            </div>

            {/* Loyalty */}
            {loyaltyPoints > 0 && (
              <label className="mt-4 flex cursor-pointer items-center gap-3 text-sm text-ivory-dim">
                <input type="checkbox" checked={redeemLoyalty} onChange={(e) => setRedeemLoyalty(e.target.checked)} className="accent-[var(--gold)]" />
                Redeem {loyaltyPoints} loyalty points ({formatBDT(loyaltyPoints)})
              </label>
            )}

            {/* Totals */}
            <dl className="mt-6 space-y-2 border-t border-line pt-6 text-sm">
              <Row label="Subtotal" value={formatBDT(sub)} />
              <Row label="Delivery" value={totals.deliveryFee === 0 ? "Free" : formatBDT(totals.deliveryFee)} />
              {discount > 0 && <Row label="Discount" value={`− ${formatBDT(discount)}`} accent />}
              {giftWrap && <Row label="Gift wrap" value={formatBDT(totals.giftWrapFee)} />}
              {giftCardApplied > 0 && <Row label="Gift card" value={`− ${formatBDT(giftCardApplied)}`} accent />}
              {loyaltyApplied > 0 && <Row label="Loyalty" value={`− ${formatBDT(loyaltyApplied)}`} accent />}
            </dl>

            <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
              <span className="text-sm uppercase tracking-widest text-ivory-dim">Total</span>
              <span className="font-display text-3xl text-ivory tnum">{formatBDT(grandTotal)}</span>
            </div>

            <Button type="submit" size="lg" className="mt-6 w-full" disabled={loading}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Lock size={15} />}
              Pay {formatBDT(grandTotal)}
            </Button>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-muted">
              <Check size={12} className="text-emerald" /> Secured by SSL Commerze ·
              We never store card details
            </p>
          </div>
        </div>
      </form>
    </Container>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted">{label}</dt>
      <dd className={`tnum ${accent ? "text-emerald" : "text-ivory-dim"}`}>{value}</dd>
    </div>
  );
}
