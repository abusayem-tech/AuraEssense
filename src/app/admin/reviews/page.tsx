import { AdminHeader, Table, Th, Td, EmptyRow } from "@/components/admin/admin-ui";
import { Badge } from "@/components/ui/badge";
import { Rating } from "@/components/ui/rating";
import { ReviewModeration } from "@/components/admin/review-moderation";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/format";

interface ReviewRow {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  status: string;
  is_verified_purchase: boolean;
  created_at: string;
  product: { name: string } | null;
  profile: { full_name: string | null } | null;
}

export default async function AdminReviewsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reviews")
    .select("*, product:products(name), profile:profiles(full_name)")
    .order("created_at", { ascending: false });
  const reviews = (data as unknown as ReviewRow[]) ?? [];

  return (
    <div>
      <AdminHeader
        title="Reviews"
        description={`${reviews.filter((r) => r.status === "pending").length} awaiting moderation.`}
      />
      <Table>
        <thead>
          <tr>
            <Th>Product</Th>
            <Th>Review</Th>
            <Th>Author</Th>
            <Th>Status</Th>
            <Th className="text-right">Actions</Th>
          </tr>
        </thead>
        <tbody>
          {reviews.length === 0 ? (
            <EmptyRow colSpan={5} label="No reviews yet." />
          ) : (
            reviews.map((r) => (
              <tr key={r.id}>
                <Td className="text-ivory">{r.product?.name}</Td>
                <Td>
                  <Rating value={r.rating} showCount={false} size={12} />
                  {r.title && <p className="mt-1 text-ivory">{r.title}</p>}
                  {r.body && <p className="mt-0.5 max-w-md text-xs text-muted line-clamp-2">{r.body}</p>}
                </Td>
                <Td>
                  {r.profile?.full_name ?? "User"}
                  {r.is_verified_purchase && <Badge variant="emerald" className="ml-2">Verified</Badge>}
                  <p className="text-xs text-muted">{formatDate(r.created_at)}</p>
                </Td>
                <Td>
                  {r.status === "approved" ? (
                    <Badge variant="emerald">Approved</Badge>
                  ) : r.status === "rejected" ? (
                    <Badge variant="rose">Rejected</Badge>
                  ) : (
                    <Badge variant="gold">Pending</Badge>
                  )}
                </Td>
                <Td className="text-right"><div className="flex justify-end"><ReviewModeration id={r.id} status={r.status} /></div></Td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </div>
  );
}
