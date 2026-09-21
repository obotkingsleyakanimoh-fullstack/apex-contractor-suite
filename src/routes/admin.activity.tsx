import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { EmptyState } from "@/components/site/shared";
import { formatDateTime } from "@/lib/format";
import type { ActivityLog } from "@/types/db";

export const Route = createFileRoute("/admin/activity")({ component: AdminActivity });

function AdminActivity() {
  const { data, loading } = useSupabaseData<ActivityLog[]>(
    () => supabase.from("admin_activity_logs").select("*").order("created_at", { ascending: false }).limit(200),
    [],
  );
  return (
    <div className="space-y-6">
      <div><h1 className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl">Activity log</h1><p className="mt-1 text-sm text-muted-foreground">Recent administrative changes for audit and troubleshooting.</p></div>
      {loading ? <div className="surface-panel p-6 text-sm text-muted-foreground">Loading activity…</div> : data?.length ? (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-secondary text-left"><tr><th className="px-4 py-3">Time</th><th className="px-4 py-3">User</th><th className="px-4 py-3">Action</th><th className="px-4 py-3">Entity</th><th className="px-4 py-3">Details</th></tr></thead>
            <tbody>{data.map((row) => <tr key={row.id} className="border-t border-border"><td className="px-4 py-3 whitespace-nowrap">{formatDateTime(row.created_at)}</td><td className="px-4 py-3">{row.user_email ?? "—"}</td><td className="px-4 py-3 font-medium">{row.action}</td><td className="px-4 py-3">{row.entity ?? "—"}</td><td className="max-w-md px-4 py-3 text-muted-foreground">{row.details ?? "—"}</td></tr>)}</tbody>
          </table>
        </div>
      ) : <EmptyState title="No activity yet" description="Administrative changes will appear here." />}
    </div>
  );
}
