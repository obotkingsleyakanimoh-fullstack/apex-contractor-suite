import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download, Mail, MapPin, MessageCircle, Phone, Search } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { logActivity } from "@/lib/activity";
import { signQuoteFile } from "@/lib/media";
import { EmptyState } from "@/components/site/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency, formatDateTime, mailtoHref, telHref, whatsappHref } from "@/lib/format";
import { QUOTE_STATUSES, type QuoteRequest, type QuoteRequestFile, type QuoteStatus } from "@/types/db";

export const Route = createFileRoute("/admin/quotes")({
  component: AdminQuotes,
});

function AdminQuotes() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [selected, setSelected] = useState<QuoteRequest | null>(null);

  const { data: quotes, loading, refetch } = useSupabaseData<QuoteRequest[]>(
    () => supabase.from("quote_requests").select("*").order("created_at", { ascending: false }),
    [],
  );

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (quotes ?? []).filter((row) => {
      if (status !== "all" && row.status !== status) return false;
      if (!q) return true;
      return [row.customer_name, row.phone, row.email, row.service_label, row.project_location]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [quotes, query, status]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Quote requests
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every quotation submitted from the website, with status and internal notes.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative sm:max-w-sm sm:flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, phone, email"
            aria-label="Search quote requests"
            className="pl-9"
          />
        </div>
        <select
          aria-label="Filter by status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm sm:w-56"
        >
          <option value="all">All statuses</option>
          {QUOTE_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          title="No quotation requests yet"
          description="Requests submitted from the website will appear here."
        />
      ) : (
        <>
          <ul className="space-y-3 lg:hidden">
            {rows.map((row) => (
              <li key={row.id} className="surface-panel space-y-1.5 p-4">
                <p className="font-semibold text-foreground">{row.customer_name}</p>
                <p className="text-sm text-muted-foreground">
                  {row.service_label ?? "General enquiry"}
                </p>
                <p className="text-xs text-muted-foreground">{formatDateTime(row.created_at)}</p>
                <div className="flex items-center justify-between pt-2">
                  <StatusPill status={row.status} />
                  <Button size="sm" variant="outline" onClick={() => setSelected(row)}>
                    Open
                  </Button>
                </div>
              </li>
            ))}
          </ul>

          <div className="hidden overflow-x-auto rounded-lg border border-border lg:block">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-secondary text-left">
                <tr>
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Service</th>
                  <th className="px-4 py-3 font-semibold">Location</th>
                  <th className="px-4 py-3 font-semibold">Received</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-t border-border">
                    <td className="px-4 py-3">
                      <span className="font-medium text-foreground">{row.customer_name}</span>
                      <span className="block text-xs text-muted-foreground">{row.phone}</span>
                    </td>
                    <td className="max-w-[180px] truncate px-4 py-3">
                      {row.service_label ?? "—"}
                    </td>
                    <td className="max-w-[160px] truncate px-4 py-3">
                      {row.project_location ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {formatDateTime(row.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill status={row.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button size="sm" variant="outline" onClick={() => setSelected(row)}>
                        Open
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <Dialog open={selected !== null} onOpenChange={(o) => (o ? null : setSelected(null))}>
        <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Quotation request</DialogTitle>
          </DialogHeader>
          {selected ? (
            <QuoteDetail
              quote={selected}
              onSaved={(updated) => {
                setSelected(updated);
                refetch();
              }}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const label = QUOTE_STATUSES.find((s) => s.value === status)?.label ?? status;
  return (
    <span className="rounded bg-secondary px-2 py-0.5 text-xs font-medium text-foreground">
      {label}
    </span>
  );
}

function QuoteDetail({
  quote,
  onSaved,
}: {
  quote: QuoteRequest;
  onSaved: (q: QuoteRequest) => void;
}) {
  const [status, setStatus] = useState<QuoteStatus>(quote.status);
  const [internal, setInternal] = useState(quote.internal_notes ?? "");
  const [customerNotes, setCustomerNotes] = useState(quote.customer_notes ?? "");
  const [value, setValue] = useState(quote.estimated_value?.toString() ?? "");
  const [followUp, setFollowUp] = useState(quote.follow_up_date ?? "");
  const [saving, setSaving] = useState(false);

  const { data: files } = useSupabaseData<QuoteRequestFile[]>(
    () => supabase.from("quote_request_files").select("*").eq("quote_request_id", quote.id),
    [quote.id],
  );

  async function save() {
    setSaving(true);
    const { data, error } = await supabase
      .from("quote_requests")
      .update({
        status,
        internal_notes: internal || null,
        customer_notes: customerNotes || null,
        estimated_value: value === "" ? null : Number(value),
        follow_up_date: followUp || null,
      })
      .eq("id", quote.id)
      .select("*")
      .single();
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    void logActivity({
      action: "updated quote status",
      entity: "quote_requests",
      entityId: quote.id,
      details: `Status set to ${status}`,
    });
    toast.success("Quote request updated.");
    onSaved(data as QuoteRequest);
  }

  async function openFile(file: QuoteRequestFile) {
    try {
      const url = await signQuoteFile(file.file_path);
      window.open(url, "_blank", "noopener");
    } catch {
      toast.error("We could not open that attachment.");
    }
  }

  return (
    <div className="space-y-5 text-sm">
      <div className="grid gap-3 sm:grid-cols-2">
        <Detail label="Customer" value={quote.customer_name} />
        <Detail label="Phone" value={quote.phone} />
        <Detail label="Email" value={quote.email ?? "—"} />
        <Detail label="Company" value={quote.company_name ?? "—"} />
        <Detail label="Service" value={quote.service_label ?? "—"} />
        <Detail label="Property type" value={quote.property_type ?? "—"} />
        <Detail label="Location" value={quote.project_location ?? "—"} />
        <Detail label="Preferred date" value={quote.preferred_date ?? "—"} />
        <Detail label="Budget" value={quote.budget_range ?? "—"} />
        <Detail label="Preferred contact" value={quote.preferred_contact ?? "—"} />
        <Detail label="Received" value={formatDateTime(quote.created_at)} />
        <Detail label="Last updated" value={formatDateTime(quote.updated_at)} />
      </div>

      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Project description
        </p>
        <p className="mt-1 whitespace-pre-line text-foreground">{quote.project_description}</p>
      </div>

      {quote.additional_requirements ? (
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Additional requirements
          </p>
          <p className="mt-1 whitespace-pre-line text-foreground">
            {quote.additional_requirements}
          </p>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button asChild size="sm" variant="outline">
          <a href={telHref(quote.phone)}>
            <Phone className="mr-1.5 h-3.5 w-3.5" /> Call
          </a>
        </Button>
        <Button asChild size="sm" variant="outline">
          <a href={whatsappHref(quote.phone)} target="_blank" rel="noreferrer noopener">
            <MessageCircle className="mr-1.5 h-3.5 w-3.5" /> WhatsApp
          </a>
        </Button>
        {quote.email ? (
          <Button asChild size="sm" variant="outline">
            <a href={mailtoHref(quote.email, "Your quotation request")}>
              <Mail className="mr-1.5 h-3.5 w-3.5" /> Email
            </a>
          </Button>
        ) : null}
        {quote.project_location ? (
          <Button asChild size="sm" variant="outline">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(quote.project_location)}`}
              target="_blank"
              rel="noreferrer noopener"
            >
              <MapPin className="mr-1.5 h-3.5 w-3.5" /> View location
            </a>
          </Button>
        ) : null}
      </div>

      {files?.length ? (
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Attachments
          </p>
          <ul className="mt-2 space-y-2">
            {files.map((f) => (
              <li key={f.id} className="flex items-center justify-between gap-3">
                <span className="min-w-0 truncate text-foreground">{f.file_name}</span>
                <Button size="sm" variant="ghost" onClick={() => openFile(f)}>
                  <Download className="mr-1.5 h-3.5 w-3.5" /> Open
                </Button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="grid gap-4 border-t border-border pt-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as QuoteStatus)}
            className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            {QUOTE_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="value">Estimated value</Label>
          <Input
            id="value"
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="mt-1.5"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Current: {formatCurrency(quote.estimated_value ? Number(quote.estimated_value) : null)}
          </p>
        </div>
        <div>
          <Label htmlFor="followup">Follow-up date</Label>
          <Input
            id="followup"
            type="date"
            value={followUp}
            onChange={(e) => setFollowUp(e.target.value)}
            className="mt-1.5"
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="internal">Internal notes</Label>
          <Textarea
            id="internal"
            rows={3}
            value={internal}
            onChange={(e) => setInternal(e.target.value)}
            className="mt-1.5"
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="customer">Notes shared with customer</Label>
          <Textarea
            id="customer"
            rows={3}
            value={customerNotes}
            onChange={(e) => setCustomerNotes(e.target.value)}
            className="mt-1.5"
          />
        </div>
      </div>

      <Button onClick={save} disabled={saving} className="w-full sm:w-auto">
        {saving ? "Saving…" : "Save changes"}
      </Button>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 break-words text-foreground">{value}</p>
    </div>
  );
}
