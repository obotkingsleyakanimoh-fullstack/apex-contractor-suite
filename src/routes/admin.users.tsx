import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Shield, UserRound } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { AppRole, Profile } from "@/types/db";

export const Route = createFileRoute("/admin/users")({ component: AdminUsers });

type AdminUser = Profile & { roles: AppRole[] };

function AdminUsers() {
  const { user, isAdmin, isSuperAdmin, refreshRoles } = useAuth();
  const [rows, setRows] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data: profiles, error } = await supabase.from("profiles").select("*").order("created_at");
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }
    const ids = (profiles ?? []).map((p) => p.id);
    const { data: roles } = await supabase.from("user_roles").select("user_id,role").in("user_id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]);
    const grouped = new Map<string, AppRole[]>();
    for (const row of roles ?? []) grouped.set(row.user_id, [...(grouped.get(row.user_id) ?? []), row.role as AppRole]);
    setRows((profiles ?? []).map((p) => ({ ...p, roles: grouped.get(p.id) ?? [] })));
    setLoading(false);
  }

  useEffect(() => { void load(); }, []);

  async function changeRole(target: AdminUser, role: AppRole | null) {
    if (!isAdmin) return;
    setSaving(target.id);
    const { error } = await supabase.rpc("set_user_role", { target_user: target.id, new_role: role });
    setSaving(null);
    if (error) return toast.error(error.message);
    toast.success("Role updated.");
    await load();
    if (target.id === user?.id) await refreshRoles();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl">Admin users & roles</h1>
        <p className="mt-1 text-sm text-muted-foreground">Review registered accounts and control staff permissions. New accounts can register through the normal sign-in page, then an administrator can assign a role here.</p>
      </div>
      {!isAdmin ? (
        <div className="surface-panel p-5 text-sm text-muted-foreground">Only administrators can change roles.</div>
      ) : loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-secondary text-left"><tr><th className="px-4 py-3">User</th><th className="px-4 py-3">Current role</th><th className="px-4 py-3">Change role</th></tr></thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-border">
                  <td className="px-4 py-3"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-full bg-secondary"><UserRound className="h-4 w-4" /></span><div><p className="font-medium">{row.full_name || "Unnamed user"}</p><p className="text-xs text-muted-foreground">{row.email}</p></div></div></td>
                  <td className="px-4 py-3"><span className="inline-flex items-center gap-1.5 rounded bg-secondary px-2 py-1 text-xs font-medium"><Shield className="h-3 w-3" />{row.roles.length ? row.roles.join(", ") : "No role"}</span></td>
                  <td className="px-4 py-3">
                    <select value={row.roles[0] ?? ""} disabled={saving === row.id} onChange={(e) => void changeRole(row, e.target.value ? (e.target.value as AppRole) : null)} className="h-9 rounded-md border border-input bg-background px-3 text-sm">
                      <option value="">No role</option>
                      <option value="editor">Editor</option>
                      <option value="admin">Admin</option>
                      {isSuperAdmin ? <option value="super_admin">Super admin</option> : null}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Button variant="outline" onClick={() => void load()}>Refresh users</Button>
    </div>
  );
}
