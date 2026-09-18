import { supabase } from "@/integrations/supabase/client";

/** Best-effort admin audit trail. Never blocks the action it records. */
export async function logActivity(params: {
  action: string;
  entity?: string;
  entityId?: string;
  details?: string;
}): Promise<void> {
  try {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return;
    await supabase.from("admin_activity_logs").insert({
      user_id: data.user.id,
      user_email: data.user.email ?? null,
      action: params.action,
      entity: params.entity ?? null,
      entity_id: params.entityId ?? null,
      details: params.details ?? null,
    });
  } catch {
    /* audit logging must never break the user action */
  }
}
