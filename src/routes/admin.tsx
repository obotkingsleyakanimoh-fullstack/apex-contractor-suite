import { useEffect, useState } from "react";
import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  Building2,
  BookOpen,
  FileQuestion,
  FolderKanban,
  Image,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  MessageSquareQuote,
  MapPin,
  Quote,
  Settings,
  ShieldCheck,
  Tags,
  Wrench,
  X,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSiteData } from "@/hooks/useSiteData";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin Dashboard" },
      { name: "description", content: "Manage website content, leads and business information." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLayout,
});

const NAV: { to: string; label: string; icon: any; exact?: boolean }[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/services", label: "Services", icon: Wrench },
  { to: "/admin/categories", label: "Categories", icon: Tags },
  { to: "/admin/projects", label: "Projects", icon: FolderKanban },
  { to: "/admin/blog", label: "Blog & articles", icon: BookOpen },
  { to: "/admin/testimonials", label: "Testimonials", icon: MessageSquareQuote },
  { to: "/admin/faqs", label: "FAQs", icon: FileQuestion },
  { to: "/admin/areas", label: "Service areas", icon: MapPin },
  { to: "/admin/quotes", label: "Quote requests", icon: Quote },
  { to: "/admin/messages", label: "Contact messages", icon: Mail },
  { to: "/admin/content", label: "Business & content", icon: Building2 },
  { to: "/admin/navigation", label: "Navigation & footer", icon: Menu },
  { to: "/admin/media", label: "Media library", icon: Image },
  { to: "/admin/users", label: "Admin users", icon: ShieldCheck },
  { to: "/admin/activity", label: "Activity log", icon: Activity },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

function AdminLayout() {
  const { user, loading, isStaff, signOut } = useAuth();
  const { company } = useSiteData();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) void navigate({ to: "/auth", replace: true });
  }, [user, loading, navigate]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (loading || !user) {
    return (
      <div className="container-page space-y-4 py-16">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!isStaff) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="surface-panel max-w-md space-y-3 p-8 text-center">
          <h1 className="font-display text-lg font-semibold text-foreground">
            You do not have access
          </h1>
          <p className="text-sm text-muted-foreground">
            Your account is signed in but has not been granted a staff role. Ask an administrator to
            grant you access.
          </p>
          <div className="flex justify-center gap-2 pt-2">
            <Button variant="outline" asChild>
              <Link to="/">Back to website</Link>
            </Button>
            <Button
              onClick={async () => {
                await signOut();
                void navigate({ to: "/auth", replace: true });
              }}
            >
              Sign out
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const sidebar = (
    <nav className="flex h-full flex-col gap-1 p-3">
      {NAV.map((item) => {
        const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
        return (
          <Link
            key={item.to}
            to={item.to as "/admin"}
            className={cn(
              "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            <item.icon className="h-4 w-4" aria-hidden />
            {item.label}
          </Link>
        );
      })}
      <div className="mt-auto space-y-1 pt-4">
        <Link
          to="/"
          className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          View website
        </Link>
        <button
          type="button"
          onClick={async () => {
            await signOut();
            void navigate({ to: "/auth", replace: true });
          }}
          className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-4 w-4" aria-hidden /> Sign out
        </button>
      </div>
    </nav>
  );

  return (
    <div className="flex min-h-screen w-full overflow-x-hidden bg-background">
      <aside className="hidden w-60 shrink-0 border-r border-border bg-card lg:flex lg:flex-col">
        <div className="border-b border-border px-5 py-4">
          <p className="truncate font-display text-sm font-bold text-foreground">
            {company?.company_name ?? "Admin"}
          </p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </div>
        {sidebar}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between gap-3 border-b border-border px-4 lg:hidden">
          <span className="truncate font-display text-sm font-bold">Admin</span>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            className="grid h-9 w-9 place-items-center rounded-md border border-border"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </header>
        {open ? (
          <div className="border-b border-border bg-card lg:hidden">{sidebar}</div>
        ) : null}

        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
