import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  BarChart3,
  Eye,
  FileText,
  MessageCircle,
  MousePointerClick,
  Phone,
  Send,
  Users,
  type LucideIcon,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/admin/analytics")({ component: AdminAnalytics });

interface DailyMetric {
  date: string;
  page_views: number;
  visitors: number;
}

interface RankedMetric {
  path?: string;
  views?: number;
  source?: string;
  sessions?: number;
}

interface AnalyticsSummary {
  page_views: number;
  unique_visitors: number;
  sessions: number;
  contact_page_views: number;
  quote_page_views: number;
  contact_cta_clicks: number;
  quote_cta_clicks: number;
  whatsapp_clicks: number;
  whatsapp_sessions: number;
  phone_clicks: number;
  phone_sessions: number;
  email_clicks: number;
  email_sessions: number;
  contact_form_starts: number;
  contact_form_sessions: number;
  quote_form_starts: number;
  quote_form_sessions: number;
  tracked_contact_submissions: number;
  tracked_quote_submissions: number;
  lead_intent_sessions: number;
  daily: DailyMetric[];
  top_pages: RankedMetric[];
  traffic_sources: RankedMetric[];
}

interface LeadCounts {
  contactMessages: number;
  quoteRequests: number;
  acceptedOrCompleted: number;
}

function MetricCard({
  label,
  value,
  helper,
  icon: Icon,
}: {
  label: string;
  value: number | string;
  helper?: string;
  icon: LucideIcon;
}) {
  return (
    <div className="surface-panel min-w-0 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="mt-2 font-display text-2xl font-bold tabular-nums text-foreground sm:text-3xl">
            {typeof value === "number" ? value.toLocaleString("en-NG") : value}
          </p>
          {helper ? <p className="mt-1 text-xs leading-5 text-muted-foreground">{helper}</p> : null}
        </div>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-secondary text-foreground">
          <Icon className="h-4 w-4" />
        </span>
      </div>
    </div>
  );
}

function AdminAnalytics() {
  const [days, setDays] = useState(30);
  const todayUtc = new Date();
  const sinceDate = new Date(Date.UTC(todayUtc.getUTCFullYear(), todayUtc.getUTCMonth(), todayUtc.getUTCDate() - (days - 1)));
  const since = sinceDate.toISOString();

  const {
    data: summary,
    loading,
    error,
    refetch,
  } = useSupabaseData<AnalyticsSummary>(async () => {
    const result = await supabase.rpc("get_website_analytics_summary", { p_days: days });
    return { data: result.data as unknown as AnalyticsSummary | null, error: result.error };
  }, [days]);

  const { data: leads, loading: leadsLoading } = useSupabaseData<LeadCounts>(async () => {
    const [messages, quotes, approved, completed] = await Promise.all([
      supabase.from("contact_messages").select("id", { count: "exact", head: true }).gte("created_at", since),
      supabase.from("quote_requests").select("id", { count: "exact", head: true }).gte("created_at", since),
      supabase.from("quote_requests").select("id", { count: "exact", head: true }).gte("created_at", since).eq("status", "approved"),
      supabase.from("quote_requests").select("id", { count: "exact", head: true }).gte("created_at", since).eq("status", "completed"),
    ]);
    const firstError = messages.error || quotes.error || approved.error || completed.error;
    return {
      data: {
        contactMessages: messages.count ?? 0,
        quoteRequests: quotes.count ?? 0,
        acceptedOrCompleted: (approved.count ?? 0) + (completed.count ?? 0),
      },
      error: firstError,
    };
  }, [days]);

  const conversionRate = summary?.sessions
    ? `${((summary.lead_intent_sessions / summary.sessions) * 100).toFixed(1)}%`
    : "0%";
  const totalEnquiries = (leads?.contactMessages ?? 0) + (leads?.quoteRequests ?? 0);
  const sourceTotal = (summary?.traffic_sources ?? []).reduce((sum, row) => sum + (row.sessions ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Website performance</p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Visitor & conversion analytics</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            See who is visiting, which pages attract attention and how often visitors take an action that could become a service enquiry.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {[7, 30, 90].map((option) => (
            <Button key={option} size="sm" variant={days === option ? "default" : "outline"} onClick={() => setDays(option)}>
              {option} days
            </Button>
          ))}
          <Button size="sm" variant="outline" onClick={refetch}>Refresh</Button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-secondary/60 p-4 text-sm leading-6 text-muted-foreground">
        <p className="font-semibold text-foreground">What these numbers mean</p>
        <p className="mt-1">
          Visitor and click statistics only include visitors who accepted optional analytics. WhatsApp and phone clicks are buying-intent signals—not proof that a conversation happened or money was paid. Contact messages and quote requests below are actual records submitted to this website. For revenue sharing, reconcile closed jobs and payments separately with the business owner.
        </p>
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          Analytics could not be loaded. Apply migration <code>0007_website_conversion_analytics.sql</code> to the connected Supabase project, then refresh this page. Details: {error}
        </div>
      ) : null}

      {loading || leadsLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-28 rounded-xl" />)}
        </div>
      ) : (
        <>
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <MetricCard label="Page views" value={summary?.page_views ?? 0} helper={`Last ${days} days · opt-in analytics`} icon={Eye} />
            <MetricCard label="Unique visitors" value={summary?.unique_visitors ?? 0} helper="Distinct anonymous browser IDs" icon={Users} />
            <MetricCard label="Measured sessions" value={summary?.sessions ?? 0} helper="Separate browsing sessions" icon={Activity} />
            <MetricCard label="Contact page visits" value={summary?.contact_page_views ?? 0} helper="Visitors who viewed /contact" icon={FileText} />
            <MetricCard label="Quote page visits" value={summary?.quote_page_views ?? 0} helper="Visitors who viewed /request-quote" icon={Send} />
            <MetricCard label="WhatsApp clicks" value={summary?.whatsapp_clicks ?? 0} helper={`${(summary?.whatsapp_sessions ?? 0).toLocaleString("en-NG")} distinct sessions · opt-in analytics`} icon={MessageCircle} />
            <MetricCard label="Phone clicks" value={summary?.phone_clicks ?? 0} helper={`${(summary?.phone_sessions ?? 0).toLocaleString("en-NG")} distinct sessions · opt-in analytics`} icon={Phone} />
            <MetricCard label="Enquiry-intent rate" value={conversionRate} helper={`${(summary?.lead_intent_sessions ?? 0).toLocaleString("en-NG")} sessions with at least one contact action`} icon={MousePointerClick} />
          </section>

          <section className="grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(280px,1fr)]">
            <div className="surface-panel p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="font-display text-base font-bold text-foreground">Visitor trend</h2>
                  <p className="mt-1 text-xs text-muted-foreground">Daily visitors and page views</p>
                </div>
                <BarChart3 className="h-5 w-5 text-muted-foreground" />
              </div>
              {summary?.daily?.length ? (
                <div className="mt-4 h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={summary.daily} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                      <defs>
                        <linearGradient id="viewsFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopOpacity={0.22} />
                          <stop offset="95%" stopOpacity={0.01} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" tickFormatter={(value: string) => value.slice(5)} minTickGap={24} tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip labelFormatter={(value) => formatDate(String(value))} />
                      <Area type="monotone" dataKey="page_views" name="Page views" stroke="currentColor" fill="url(#viewsFill)" strokeWidth={2} />
                      <Area type="monotone" dataKey="visitors" name="Visitors" stroke="#0d9488" fill="transparent" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : <p className="py-12 text-center text-sm text-muted-foreground">No opt-in visitor activity in this period yet.</p>}
            </div>

            <div className="surface-panel p-4 sm:p-5">
              <h2 className="font-display text-base font-bold text-foreground">Traffic sources</h2>
              <p className="mt-1 text-xs text-muted-foreground">Sessions attributed to their first source</p>
              <div className="mt-5 space-y-4">
                {(summary?.traffic_sources ?? []).length ? summary?.traffic_sources.map((source) => {
                  const count = source.sessions ?? 0;
                  const percent = sourceTotal ? (count / sourceTotal) * 100 : 0;
                  return (
                    <div key={source.source}>
                      <div className="mb-1.5 flex justify-between gap-3 text-sm">
                        <span className="truncate font-medium text-foreground">{source.source}</span>
                        <span className="shrink-0 tabular-nums text-muted-foreground">{count.toLocaleString("en-NG")}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} /></div>
                    </div>
                  );
                }) : <p className="text-sm text-muted-foreground">Sources appear after visitors accept analytics.</p>}
              </div>
            </div>
          </section>

          <section className="grid gap-5 xl:grid-cols-2">
            <div className="surface-panel p-4 sm:p-5">
              <h2 className="font-display text-base font-bold text-foreground">Lead funnel</h2>
              <p className="mt-1 text-xs text-muted-foreground">Actions recorded during the selected period</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-secondary/70 p-3"><p className="text-xs text-muted-foreground">Contact form starts</p><p className="mt-1 text-xl font-bold tabular-nums">{(summary?.contact_form_starts ?? 0).toLocaleString("en-NG")}</p><p className="mt-1 text-[11px] text-muted-foreground">{(summary?.contact_form_sessions ?? 0).toLocaleString("en-NG")} distinct sessions</p></div>
                <div className="rounded-lg bg-secondary/70 p-3"><p className="text-xs text-muted-foreground">Quote form starts</p><p className="mt-1 text-xl font-bold tabular-nums">{(summary?.quote_form_starts ?? 0).toLocaleString("en-NG")}</p><p className="mt-1 text-[11px] text-muted-foreground">{(summary?.quote_form_sessions ?? 0).toLocaleString("en-NG")} distinct sessions</p></div>
                <div className="rounded-lg bg-secondary/70 p-3"><p className="text-xs text-muted-foreground">Email clicks</p><p className="mt-1 text-xl font-bold tabular-nums">{(summary?.email_clicks ?? 0).toLocaleString("en-NG")}</p><p className="mt-1 text-[11px] text-muted-foreground">{(summary?.email_sessions ?? 0).toLocaleString("en-NG")} distinct sessions</p></div>
                <div className="rounded-lg bg-secondary/70 p-3"><p className="text-xs text-muted-foreground">Contact / quote CTA clicks</p><p className="mt-1 text-xl font-bold tabular-nums">{((summary?.contact_cta_clicks ?? 0) + (summary?.quote_cta_clicks ?? 0)).toLocaleString("en-NG")}</p></div>
                <div className="rounded-lg bg-secondary/70 p-3"><p className="text-xs text-muted-foreground">Tracked form submissions</p><p className="mt-1 text-xl font-bold tabular-nums">{((summary?.tracked_contact_submissions ?? 0) + (summary?.tracked_quote_submissions ?? 0)).toLocaleString("en-NG")}</p></div>
              </div>
              <p className="mt-3 text-xs leading-5 text-muted-foreground">Form-start and form-submit event counts only include people who opted into analytics. Actual received leads are counted separately.</p>
            </div>

            <div className="surface-panel p-4 sm:p-5">
              <h2 className="font-display text-base font-bold text-foreground">Enquiries received</h2>
              <p className="mt-1 text-xs text-muted-foreground">Actual form records stored in the admin system</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-secondary/70 p-3"><p className="text-xs text-muted-foreground">Contact messages</p><p className="mt-1 text-2xl font-bold tabular-nums">{(leads?.contactMessages ?? 0).toLocaleString("en-NG")}</p></div>
                <div className="rounded-lg bg-secondary/70 p-3"><p className="text-xs text-muted-foreground">Quote requests</p><p className="mt-1 text-2xl font-bold tabular-nums">{(leads?.quoteRequests ?? 0).toLocaleString("en-NG")}</p></div>
                <div className="rounded-lg bg-primary/10 p-3"><p className="text-xs text-muted-foreground">Total submitted enquiries</p><p className="mt-1 text-2xl font-bold tabular-nums">{totalEnquiries.toLocaleString("en-NG")}</p></div>
                <div className="rounded-lg bg-secondary/70 p-3"><p className="text-xs text-muted-foreground">Approved / completed quotes</p><p className="mt-1 text-2xl font-bold tabular-nums">{(leads?.acceptedOrCompleted ?? 0).toLocaleString("en-NG")}</p></div>
              </div>
              <p className="mt-3 text-xs leading-5 text-muted-foreground">Use the Quote Requests area to update lead stages. An approved/completed status is a business workflow status, not automatic payment verification.</p>
            </div>
          </section>

          <section className="grid gap-5 xl:grid-cols-2">
            <div className="surface-panel p-4 sm:p-5">
              <h2 className="font-display text-base font-bold text-foreground">Most visited pages</h2>
              <div className="mt-3 divide-y divide-border">
                {(summary?.top_pages ?? []).length ? summary?.top_pages.map((page) => (
                  <div key={page.path} className="flex items-center justify-between gap-4 py-3 text-sm">
                    <span className="min-w-0 truncate font-medium text-foreground">{page.path}</span>
                    <span className="shrink-0 tabular-nums text-muted-foreground">{(page.views ?? 0).toLocaleString("en-NG")} views</span>
                  </div>
                )) : <p className="py-4 text-sm text-muted-foreground">No page-view data yet.</p>}
              </div>
            </div>
            <div className="surface-panel p-4 sm:p-5">
              <h2 className="font-display text-base font-bold text-foreground">What counts as a conversion?</h2>
              <div className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
                <p className="flex gap-2"><MessageCircle className="mt-1 h-4 w-4 shrink-0 text-primary" /><span><strong className="text-foreground">WhatsApp click:</strong> visitor opens a WhatsApp conversation link.</span></p>
                <p className="flex gap-2"><Phone className="mt-1 h-4 w-4 shrink-0 text-primary" /><span><strong className="text-foreground">Phone click:</strong> visitor taps a call link.</span></p>
                <p className="flex gap-2"><Send className="mt-1 h-4 w-4 shrink-0 text-primary" /><span><strong className="text-foreground">Contact / quote submission:</strong> form record successfully reaches the website database.</span></p>
                <p className="flex gap-2"><FileText className="mt-1 h-4 w-4 shrink-0 text-primary" /><span><strong className="text-foreground">Closed business:</strong> confirm separately with the owner and record the agreed deal/payment outside this traffic counter.</span></p>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
