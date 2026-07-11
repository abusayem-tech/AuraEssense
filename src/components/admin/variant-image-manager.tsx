"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, Loader2, ImagePlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ProductImage } from "@/components/product/product-image";
import { Table, Th, Td } from "@/components/admin/admin-ui";
import { saveVariant, deleteVariant, addImage, deleteImage } from "@/lib/actions/admin/catalog";
import { formatBDT } from "@/lib/format";
import type { ProductVariant, ProductImage as PImage } from "@/types";

export function VariantManager({
  productId,
  variants,
}: {
  productId: string;
  variants: ProductVariant[];
}) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  async function onSave(fd: FormData) {
    fd.set("product_id", productId);
    const res = await saveVariant(fd);
    if (res.ok) {
      toast.success("Variant saved");
      setOpen(false);
    } else toast.error(res.error ?? "Could not save.");
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-xl text-ivory">Variants</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline"><Plus size={14} /> Add Variant</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto">
            <DialogTitle className="font-display text-2xl text-ivory">Add Variant</DialogTitle>
            <form action={onSave} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div><Label htmlFor="size_ml">Size (ml)</Label><Input id="size_ml" name="size_ml" type="number" required /></div>
                <div><Label htmlFor="sku">SKU</Label><Input id="sku" name="sku" required /></div>
                <div><Label htmlFor="price_bdt">Price (BDT)</Label><Input id="price_bdt" name="price_bdt" type="number" required /></div>
                <div><Label htmlFor="sale_price_bdt">Sale Price</Label><Input id="sale_price_bdt" name="sale_price_bdt" type="number" /></div>
                <div><Label htmlFor="stock">Stock</Label><Input id="stock" name="stock" type="number" required /></div>
                <label className="flex items-center gap-2 text-sm text-ivory-dim sm:col-span-2">
                  <input type="checkbox" name="is_sample" className="accent-[var(--gold)]" /> Sample size
                </label>
              </div>
              <Button type="submit" className="w-full">Save Variant</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <thead>
          <tr><Th>Size</Th><Th>SKU</Th><Th>Price</Th><Th>Stock</Th><Th></Th></tr>
        </thead>
        <tbody>
          {variants.length === 0 ? (
            <tr><Td className="text-center text-muted">No variants. Add at least one size.</Td></tr>
          ) : (
            variants.map((v) => (
              <tr key={v.id}>
                <Td className="text-ivory">{`${v.size_ml}ml`}</Td>
                <Td>{v.sku}</Td>
                <Td className="tnum">
                  {formatBDT(v.sale_price_bdt ?? v.price_bdt)}
                  {v.sale_price_bdt && <span className="ml-1 text-muted line-through">{formatBDT(v.price_bdt)}</span>}
                </Td>
                <Td className={v.stock <= 5 ? "text-rose" : ""}>{v.stock}</Td>
                <Td className="text-right">
                  <button
                    onClick={() => {
                      if (!confirm("Remove this variant?")) return;
                      start(async () => { await deleteVariant(v.id, productId); toast.success("Variant removed"); });
                    }}
                    disabled={pending}
                    className="text-muted hover:text-rose"
                  >
                    <Trash2 size={15} />
                  </button>
                </Td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </div>
  );
}

export function ImageManager({
  productId,
  images,
}: {
  productId: string;
  images: PImage[];
}) {
  const [url, setUrl] = useState("");
  const [pending, start] = useTransition();

  return (
    <div>
      <h2 className="mb-4 font-display text-xl text-ivory">Images</h2>
      <div className="mb-4 flex gap-2">
        <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Image URL (https://…)" />
        <Button
          variant="outline"
          disabled={pending || !url}
          onClick={() => start(async () => { await addImage(productId, url); setUrl(""); toast.success("Image added"); })}
        >
          <ImagePlus size={14} /> Add
        </Button>
      </div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {images.map((img) => (
          <div key={img.id} className="group relative aspect-[3/4] overflow-hidden bg-onyx-raised">
            <ProductImage src={img.url} alt={img.alt || "Image"} sizes="120px" />
            <button
              onClick={() => {
                if (!confirm("Remove this image?")) return;
                start(async () => { await deleteImage(img.id, productId); toast.success("Image removed"); });
              }}
              className="absolute right-2 top-2 bg-onyx/80 p-1.5 text-ivory-dim opacity-0 transition-opacity hover:text-rose group-hover:opacity-100"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        {images.length === 0 && (
          <p className="col-span-full py-6 text-center text-xs text-muted">No images yet.</p>
        )}
      </div>
      {pending && <Loader2 size={14} className="mt-3 animate-spin text-muted" />}
    </div>
  );
}
