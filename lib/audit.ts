import { db } from "@/lib/supabase/data";

// Best-effort audit trail. Never let an audit write failure break a user action.
export async function logAudit(entry: {
  actorEmail?: string | null;
  action: string;
  objectType?: string;
  objectId?: string;
  detail?: Record<string, unknown>;
}): Promise<void> {
  try {
    await db()
      .from("audit_logs")
      .insert({
        actor_email: entry.actorEmail ?? null,
        action: entry.action,
        object_type: entry.objectType ?? null,
        object_id: entry.objectId ?? null,
        detail: entry.detail ?? null,
      });
  } catch {
    // swallow — audit is non-critical
  }
}
