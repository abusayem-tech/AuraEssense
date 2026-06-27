import { createAdminClient } from "@/lib/supabase/admin";
import type { AdminContext } from "@/lib/admin-guard";

/** Append an entry to the audit log. */
export async function logAudit(
  ctx: AdminContext,
  action: string,
  entity: string,
  entityId: string | null,
  diff?: Record<string, unknown>,
) {
  const supabase = createAdminClient();
  await supabase.from("audit_log").insert({
    actor_id: ctx.userId,
    actor_name: ctx.name,
    action,
    entity,
    entity_id: entityId,
    diff: diff ?? null,
  });
}
