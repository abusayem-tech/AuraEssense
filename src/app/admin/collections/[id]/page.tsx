import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Card } from "@/components/admin/admin-ui";
import { CollectionForm } from "@/components/admin/collection-form";
import { createClient } from "@/lib/supabase/server";
import { getCatalogPicks, getCollectionProductIds } from "@/lib/queries";
import type { Collection } from "@/types";

export default async function EditCollectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data }, catalog, productIds] = await Promise.all([
    supabase.from("collections").select("*").eq("id", id).maybeSingle(),
    getCatalogPicks(),
    getCollectionProductIds(id),
  ]);
  const collection = data as unknown as Collection | null;
  if (!collection) notFound();

  return (
    <div className="max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin/collections"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted hover:text-gold"
        >
          <ArrowLeft size={14} /> Back to Collections
        </Link>
        <Link
          href={`/collections/${collection.slug}`}
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-ivory-dim hover:text-gold"
        >
          <ExternalLink size={13} /> View Live
        </Link>
      </div>
      <h1 className="mb-6 mt-4 font-display text-3xl text-ivory">{collection.name}</h1>
      <Card>
        <CollectionForm collection={collection} catalog={catalog} productIds={productIds} />
      </Card>
    </div>
  );
}
