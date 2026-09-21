import { createFileRoute, Link } from "@tanstack/react-router";
import {
  FileQuestion,
  FolderKanban,
  Mail,
  MapPin,
  MessageSquareQuote,
  Quote,
  Wrench,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import type { QuoteRequest } from "@/types/db";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

interface Counts {
  quotesTotal: number;
  quotesNew: number;
  quotesPending: number;
  quotesCompleted: number;
  quotesThisMonth: number;
  services: number;
  projects: number;
  messagesUnread: number;
  testimonials: number;
  areas: number;
}

function AdminDashboard() {
  const { data: counts, loading } = useSupabaseData<Counts>(async () => {
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const head = { count: "exact" as const, head: true };
    const [
      quotesTotal,
      quotesNew,
      quotesPending,
      quotesCompleted,
      quotesThisMonth,
      services,
      projects,
      messagesUnread,
      testimonials,
      areas,
    ] = await Promise.all([
      supabase.from("quote_requests").select("id", head),
      supabase.from("quote_requests").select("id", head).eq("status", "new"),
      supabase
        .from("quote_requests")
        .select("id", head)
        .in("status", ["contacted", "inspection_required", "quote_prepared", "negotiation"]),
      supabase.from("quote_requests").select("id", head).eq("status", "completed"),
      supabase
        .from("quote_requests")
        .select("id", head)
        .gte("created_at", monthStart.toISOString()),
      supabase.from("services").select("id", head).eq("published", true),
      supabase.from("projects").select("id", head).eq("published", true),
      supabase.from("contact_messages").select("id", head).eq("status", "unread"),
      supabase.from("testimonials").select("id", head).eq("published", true),
      supabase.from("service_areas").select("id", head).eq("published", true),
    ]);

    return {
      data: {
        quotesTotal: quotesTotal.count ?? 0,
        quotesNew: quotesNew.count ?? 0,
        quotesPending: quotesPending.count ?? 0,
        quotesCompleted: quotesCompleted.count ?? 0,
        quotesThisMonth: quotesThisMonth.count ?? 0,
        services: services.count ?? 0,
        projects: projects.count ?? 0,
        messagesUnread: messagesUnread.count ?? 0,
        testimonials: testimonials.count ?? 0,
        areas: areas.count ?? 0,
      },
      error: null,
    };
  }, []);

  const { data: recent } = useSupabaseData<QuoteRequest[]>(
    () =>
      supabase
        .from("quote_requests")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(6),
    [],
  );

  const cards = [
    { label: "Quote requests", value: counts?.quotesTotal, icon: Quote },
    { label: "New leads", value: counts?.quotesNew, icon: Quote },
    { label: "In progress", value: counts?.quotesPending, icon: Quote },
    { label: "Completed", value: counts?.quotesCompleted, icon: Quote },
    { label: "This month", value: counts?.quotesThisMonth, icon: Quote },
    { label: "Published services", value: counts?.services, icon: Wrench },
    { label: "Published projects", value: counts?.projects, icon: FolderKanban },
    { label: "Unread messages", value: counts?.messagesUnread, icon: Mail },
    { label: "Testimonials", value: counts?.testimonials, icon: MessageSquareQuote },
    { label: "Service areas", value: counts?.areas, icon: MapPin },
  ];

  const maxBar = Math.max(
    1,
    counts?.quotesNew ?? 0,
    counts?.quotesPending ?? 0,
    counts?.quotesCompleted ?? 0,
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          A summary of leads, published content and messages.
        </p>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <div key={card.label} className="surface-panel p-5">
              <card.icon className="h-4 w-4 text-accent" aria-hidden />
              <p className="mt-3 font-display text-2xl font-bold text-foreground">
                {card.value ?? 0}
              </p>
              <p className="text-sm text-muted-foreground">{card.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
        <div className="surface-panel p-5">
          <h2 className="font-display text-base font-semibold text-foreground">
            Latest quote requests
          </h2>
          <ul className="mt-4 divide-y divide-border">
            {(recent ?? []).map((q) => (
              <li key={q.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">{q.customer_name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {q.service_label ?? "General enquiry"} · {formatDate(q.created_at)}
                  </p>
                </div>
                <span className="shrink-0 rounded bg-secondary px-2 py-0.5 text-xs font-medium text-foreground">
                  {q.status}
                </span>
              </li>
            ))}
            {recent && recent.length === 0 ? (
              <li className="py-6 text-sm text-muted-foreground">No quotation requests yet.</li>
            ) : null}
          </ul>
          <Button asChild variant="outline" className="mt-4">
            <Link to="/admin/quotes">Open quote requests</Link>
          </Button>
        </div>

        <div className="surface-panel p-5">
          <h2 className="font-display text-base font-semibold text-foreground">Lead pipeline</h2>
          <div className="mt-4 space-y-3">
            {[
              { label: "New", value: counts?.quotesNew ?? 0 },
              { label: "In progress", value: counts?.quotesPending ?? 0 },
              { label: "Completed", value: counts?.quotesCompleted ?? 0 },
            ].map((bar) => (
              <div key={bar.label}>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{bar.label}</span>
                  <span>{bar.value}</span>
                </div>
                <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${(bar.value / maxBar) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button asChild size="sm" variant="outline">
              <Link to="/admin/services">Services</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link to="/admin/projects">Projects</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link to="/admin/faqs">FAQs</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <QuickLink to="/admin/testimonials" icon={MessageSquareQuote} label="Testimonials" />
        <QuickLink to="/admin/faqs" icon={FileQuestion} label="FAQs" />
        <QuickLink to="/admin/content" icon={Wrench} label="Content & business" />
      </div>
    </div>
  );
}

function QuickLink({
  to,
  icon: Icon,
  label,
}: {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <Link
      to={to as "/admin"}
      className="surface-panel flex items-center gap-3 p-4 text-sm font-medium text-foreground transition-shadow hover:shadow-raised"
    >
      <Icon className="h-4 w-4 text-accent" />
      {label}
    </Link>
  );
}
