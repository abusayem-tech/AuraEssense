"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label } from "@/components/ui/input";
import { ProductMultiSelect } from "@/components/admin/product-relations";
import { saveCollection } from "@/lib/actions/admin/catalog";
import type { CatalogPick, Collection } from "@/types";

export function CollectionForm({
  collection,
  catalog,
  productIds = [],
}: {
  collection?: Collection;
  catalog: CatalogPick[];
  productIds?: string[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [featured, setFeatured] = useState(collection?.is_featured ?? false);
  const [products, setProducts] = useState(productIds);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (collection) fd.set("id", collection.id);
    if (featured) fd.set("is_featured", "on");
    for (const id of products) fd.append("product_ids", id);
    start(async () => {
      const res = await saveCollection(fd);
      if (res.ok) {
        toast.success("Collection saved");
        if (!collection) router.push("/admin/collections");
        else router.refresh();
      } else toast.error(res.error ?? "Could not save.");
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" defaultValue={collection?.name} required />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" name="slug" defaultValue={collection?.slug} placeholder="auto" />
        </div>
        <div>
          <Label htmlFor="position">Display order</Label>
          <Input
            id="position"
            name="position"
            type="number"
            min={0}
            defaultValue={collection?.position ?? 0}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="subtitle">Subtitle</Label>
        <Input id="subtitle" name="subtitle" defaultValue={collection?.subtitle ?? ""} />
      </div>
      <div>
        <Label htmlFor="cover_image">Cover image URL</Label>
        <Input id="cover_image" name="cover_image" defaultValue={collection?.cover_image ?? ""} />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" defaultValue={collection?.description ?? ""} />
      </div>
      <label className="flex items-center gap-2 text-sm text-ivory-dim">
        <input
          type="checkbox"
          checked={featured}
          onChange={(e) => setFeatured(e.target.checked)}
          className="accent-[var(--gold)]"
        />
        Feature on homepage
      </label>
      <ProductMultiSelect
        label="Perfumes in this collection"
        hint="Shown on the collection page and used by the scent quiz"
        catalog={catalog}
        selectedIds={products}
        onChange={setProducts}
      />
      <Button type="submit" disabled={pending}>
        {pending && <Loader2 size={15} className="animate-spin" />}
        Save Collection
      </Button>
    </form>
  );
}
