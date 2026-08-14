import Link from "next/link";
import { Plus } from "lucide-react";
import { AdminHeader, Table, Th, Td, EmptyRow, LinkButton } from "@/components/admin/admin-ui";
import { Badge } from "@/components/ui/badge";
import { CollectionRowActions } from "@/components/admin/collection-row-actions";
import { createClient } from "@/lib/supabase/server";
import type { Collection } from "@/types";

export default async function AdminCollectionsPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("collections").select("*").order("position");
  const collections = (data as unknown as Collection[]) ?? [];

  return (
    <div>
      <AdminHeader
        title="Collections"
        description="Curated sets shown on the storefront. Add perfumes on each collection."
        action={
          <LinkButton href="/admin/collections/new">
            <Plus size={14} /> New Collection
          </LinkButton>
        }
      />
      <Table>
        <thead>
          <tr>
            <Th>Name</Th>
            <Th>Subtitle</Th>
            <Th>Featured</Th>
            <Th className="text-right">Actions</Th>
          </tr>
        </thead>
        <tbody>
          {collections.length === 0 ? (
            <EmptyRow colSpan={4} label="No collections yet." />
          ) : (
            collections.map((c) => (
              <tr key={c.id}>
                <Td>
                  <Link href={`/admin/collections/${c.id}`} className="text-ivory hover:text-gold">
                    {c.name}
                  </Link>
                </Td>
                <Td>{c.subtitle ?? "—"}</Td>
                <Td>
                  {c.is_featured ? (
                    <Badge variant="gold">Featured</Badge>
                  ) : (
                    "—"
                  )}
                </Td>
                <Td className="text-right">
                  <CollectionRowActions collectionId={c.id} />
                </Td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </div>
  );
}
