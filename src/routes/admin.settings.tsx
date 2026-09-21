import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/admin/settings")({ component: AdminSettings });

function AdminSettings() {
  const { user, signOut, refreshRoles } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(String(user?.user_metadata?.full_name ?? ""));
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);

  async function saveProfile() {
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ data: { full_name: name.trim() } });
    if (!error && user) await supabase.from("profiles").update({ full_name: name.trim() }).eq("id", user.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Profile updated.");
    await refreshRoles();
  }

  async function changePassword() {
    if (password.length < 8) return toast.error("Use a password of at least 8 characters.");
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSaving(false);
    if (error) return toast.error(error.message);
    setPassword("");
    toast.success("Password updated.");
  }

  async function logout() {
    await signOut();
    void navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="space-y-6">
      <div><h1 className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl">Settings</h1><p className="mt-1 text-sm text-muted-foreground">Manage the signed-in administrator account and security basics.</p></div>
      <section className="surface-panel max-w-2xl p-5 sm:p-7">
        <h2 className="font-display text-base font-semibold">Account profile</h2>
        <div className="mt-5 space-y-4">
          <div><Label>Email</Label><Input value={user?.email ?? ""} disabled className="mt-1.5" /></div>
          <div><Label>Display name</Label><Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5" /></div>
          <Button onClick={() => void saveProfile()} disabled={saving}>{saving ? "Saving…" : "Save profile"}</Button>
        </div>
      </section>
      <section className="surface-panel max-w-2xl p-5 sm:p-7">
        <h2 className="font-display text-base font-semibold">Password</h2>
        <p className="mt-1 text-sm text-muted-foreground">Use a strong password and keep administrator credentials private.</p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row"><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password" minLength={8} /><Button variant="outline" onClick={() => void changePassword()} disabled={saving}>Update password</Button></div>
      </section>
      <section className="surface-panel max-w-2xl p-5 sm:p-7">
        <h2 className="font-display text-base font-semibold">Session</h2>
        <p className="mt-1 text-sm text-muted-foreground">Sign out from this browser when you are finished managing the website.</p>
        <Button variant="outline" className="mt-4" onClick={() => void logout()}>Sign out</Button>
      </section>
    </div>
  );
}
