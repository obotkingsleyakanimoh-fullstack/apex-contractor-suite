import { useEffect, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSiteData } from "@/hooks/useSiteData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Staff Sign In" },
      { name: "description", content: "Sign in to the staff dashboard." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { user, loading } = useAuth();
  const { company } = useSiteData();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) void navigate({ to: "/admin", replace: true });
  }, [user, loading, navigate]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    if (!email || !password) {
      toast.error("Enter your email and password.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      toast.error("We could not sign you in. Check your details and try again.");
      return;
    }
    void navigate({ to: "/admin", replace: true });
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-secondary px-4 py-12">
      <div className="w-full max-w-sm">
        <Link to="/" className="mb-6 block text-center font-display text-lg font-bold">
          {company?.company_name ?? "Staff area"}
        </Link>
        <form onSubmit={onSubmit} className="surface-panel space-y-4 p-6">
          <div>
            <h1 className="font-display text-lg font-semibold text-foreground">Staff sign in</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              This area is for authorised team members only.
            </p>
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" autoComplete="email" className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              className="mt-1.5"
            />
          </div>
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Sign in
          </Button>
        </form>
      </div>
    </div>
  );
}
