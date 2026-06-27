import { AdminHeader, Table, Th, Td, EmptyRow } from "@/components/admin/admin-ui";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/format";
import type { AuditEntry } from "@/types";

export default async function AuditPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("audit_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  const entries = (data as unknown as AuditEntry[]) ?? [];

  return (
    <div>
      <AdminHeader title="Audit Log" description="A record of administrative actions." />
      <Table>
        <thead>
          <tr>
            <Th>When</Th>
            <Th>Actor</Th>
            <Th>Action</Th>
            <Th>Entity</Th>
          </tr>
        </thead>
        <tbody>
          {entries.length === 0 ? (
            <EmptyRow colSpan={4} label="No audit entries yet." />
          ) : (
            entries.map((e) => (
              <tr key={e.id}>
                <Td className="text-xs">{formatDateTime(e.created_at)}</Td>
                <Td className="text-ivory">{e.actor_name ?? "System"}</Td>
                <Td><Badge variant="muted">{e.action}</Badge></Td>
                <Td className="capitalize">{e.entity}{e.entity_id ? ` · ${e.entity_id.slice(0, 8)}` : ""}</Td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </div>
  );
}
