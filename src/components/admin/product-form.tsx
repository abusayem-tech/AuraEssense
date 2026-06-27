"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label } from "@/components/ui/input";
import { saveProduct } from "@/lib/actions/admin/catalog";
import { GENDERS, CONCENTRATIONS } from "@/lib/constants";
import type { Brand, FragranceFamily, Product } from "@/types";

export function ProductForm({
  product,
  brands,
  families,
}: {
  product?: Product;
  brands: Brand[];
  families: FragranceFamily[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [active, setActive] = useState(product?.is_active ?? true);
  const [featured, setFeatured] = useState(product?.is_featured ?? false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (product) fd.set("id", product.id);
    if (active) fd.set("is_active", "on");
    if (featured) fd.set("is_featured", "on");
    start(async () => {
      const res = await saveProduct(fd);
      if (res.ok) {
        toast.success("Product saved");
        if (!product && res.id) router.push(`/admin/products/${res.id}`);
        else router.refresh();
      } else toast.error(res.error ?? "Could not save.");
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" defaultValue={product?.name} required />
        </div>
        <div>
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" name="slug" defaultValue={product?.slug} placeholder="auto" />
        </div>
        <div>
          <Label htmlFor="sku_base">SKU Base</Label>
          <Input id="sku_base" name="sku_base" defaultValue={product?.sku_base} placeholder="auto" />
        </div>
        <div>
          <Label htmlFor="brand_id">Brand</Label>
          <select id="brand_id" name="brand_id" defaultValue={product?.brand_id} className="h-11 w-full border border-line-strong bg-onyx-soft px-3 text-sm text-ivory focus:border-gold focus:outline-none">
            {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
        <div>
          <Label htmlFor="family_id">Family</Label>
          <select id="family_id" name="family_id" defaultValue={product?.family_id ?? ""} className="h-11 w-full border border-line-strong bg-onyx-soft px-3 text-sm text-ivory focus:border-gold focus:outline-none">
            <option value="">None</option>
            {families.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
        </div>
        <div>
          <Label htmlFor="gender">Gender</Label>
          <select id="gender" name="gender" defaultValue={product?.gender ?? "unisex"} className="h-11 w-full border border-line-strong bg-onyx-soft px-3 text-sm capitalize text-ivory focus:border-gold focus:outline-none">
            {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div>
          <Label htmlFor="concentration">Concentration</Label>
          <select id="concentration" name="concentration" defaultValue={product?.concentration ?? "EDP"} className="h-11 w-full border border-line-strong bg-onyx-soft px-3 text-sm text-ivory focus:border-gold focus:outline-none">
            {CONCENTRATIONS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" defaultValue={product?.description ?? ""} />
      </div>
      <div>
        <Label htmlFor="story">Story</Label>
        <Textarea id="story" name="story" defaultValue={product?.story ?? ""} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="top_notes">Top Notes (comma-separated)</Label>
          <Input id="top_notes" name="top_notes" defaultValue={product?.top_notes?.join(", ")} />
        </div>
        <div>
          <Label htmlFor="heart_notes">Heart Notes</Label>
          <Input id="heart_notes" name="heart_notes" defaultValue={product?.heart_notes?.join(", ")} />
        </div>
        <div>
          <Label htmlFor="base_notes">Base Notes</Label>
          <Input id="base_notes" name="base_notes" defaultValue={product?.base_notes?.join(", ")} />
        </div>
        <div>
          <Label htmlFor="season">Season</Label>
          <Input id="season" name="season" defaultValue={product?.season?.join(", ")} placeholder="Spring, Summer" />
        </div>
        <div>
          <Label htmlFor="occasion">Occasion</Label>
          <Input id="occasion" name="occasion" defaultValue={product?.occasion?.join(", ")} placeholder="Daily, Evening" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="longevity">Longevity (1-5)</Label>
          <Input id="longevity" name="longevity" type="number" min={1} max={5} defaultValue={product?.longevity ?? 3} />
        </div>
        <div>
          <Label htmlFor="sillage">Sillage (1-5)</Label>
          <Input id="sillage" name="sillage" type="number" min={1} max={5} defaultValue={product?.sillage ?? 3} />
        </div>
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm text-ivory-dim">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="accent-[var(--gold)]" /> Active
        </label>
        <label className="flex items-center gap-2 text-sm text-ivory-dim">
          <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="accent-[var(--gold)]" /> Featured
        </label>
      </div>

      <Button type="submit" disabled={pending}>
        {pending && <Loader2 size={15} className="animate-spin" />}
        Save Product
      </Button>
    </form>
  );
}
