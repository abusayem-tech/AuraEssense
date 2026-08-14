import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/admin/admin-ui";
import { CollectionForm } from "@/components/admin/collection-form";
import { getCatalogPicks } from "@/lib/queries";

export default async function NewCollectionPage() {
  const catalog = await getCatalogPicks();

  return (
    <div className="max-w-4xl">
      <Link
        href="/admin/collections"
        className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted hover:text-gold"
      >
        <ArrowLeft size={14} /> Back to Collections
      </Link>
      <h1 className="mb-6 mt-4 font-display text-3xl text-ivory">New Collection</h1>
      <Card>
        <CollectionForm catalog={catalog} />
      </Card>
    </div>
  );
}
