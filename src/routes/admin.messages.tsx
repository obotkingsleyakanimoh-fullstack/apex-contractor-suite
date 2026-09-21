import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Mail, Phone, Search } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { logActivity } from "@/lib/activity";
import { EmptyState } from "@/components/site/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatDateTime, mailtoHref, telHref } from "@/lib/format";
import { MESSAGE_STATUSES, type ContactMessage, type MessageStatus } from "@/types/db";

export const Route = createFileRoute("/admin/messages")({
  component: AdminMessages,
});

function AdminMessages() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState<ContactMessage | null>(null);

  const { data, loading, refetch } = useSupabaseData<ContactMessage[]>(
    () => supabase.from("contact_messages").select("*").order("created_at", { ascending: false }),
    [],
  );

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data ?? []).filter((row) => {
      if (status !== "all" && row.status !== status) return false;
      if (!q) return true;
      return [row.name, row.email, row.subject, row.message]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [data, query, status]);

  async function open(row: ContactMessage) {
    setSelected(row);
    if (row.status === "unread") {
      await supabase.from("contact_messages").update({ status: "read" }).eq("id", row.id);
      refetch();
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          Contact messages
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Messages sent through the website contact form.
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
            placeholder="Search messages"
            aria-label="Search messages"
            className="pl-9"
          />
        </div>
        <select
          aria-label="Filter by status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm sm:w-48"
        >
          <option value="all">All statuses</option>
          {MESSAGE_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          title="No messages yet"
          description="Contact form submissions will appear here."
        />
      ) : (
        <ul className="space-y-3">
          {rows.map((row) => (
            <li key={row.id} className="surface-panel flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="font-semibold text-foreground">
                  {row.name}
                  {row.subject ? (
                    <span className="font-normal text-muted-foreground"> — {row.subject}</span>
                  ) : null}
                </p>
                <p className="truncate text-sm text-muted-foreground">{row.message}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {formatDateTime(row.created_at)} · {row.status}
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={() => open(row)}>
                Open
              </Button>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={selected !== null} onOpenChange={(o) => (o ? null : setSelected(null))}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Message</DialogTitle>
          </DialogHeader>
          {selected ? (
            <MessageDetail
              message={selected}
              onSaved={() => {
                refetch();
                setSelected(null);
              }}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MessageDetail({
  message,
  onSaved,
}: {
  message: ContactMessage;
  onSaved: () => void;
}) {
  const [status, setStatus] = useState<MessageStatus>(message.status);
  const [notes, setNotes] = useState(message.internal_notes ?? "");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const { error } = await supabase
      .from("contact_messages")
      .update({ status, internal_notes: notes || null })
      .eq("id", message.id);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    void logActivity({
      action: "updated message",
      entity: "contact_messages",
      entityId: message.id,
      details: `Status set to ${status}`,
    });
    toast.success("Message updated.");
    onSaved();
  }

  return (
    <div className="space-y-4 text-sm">
      <div className="space-y-1">
        <p className="font-semibold text-foreground">{message.name}</p>
        <p className="text-muted-foreground">{formatDateTime(message.created_at)}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button asChild size="sm" variant="outline">
          <a href={mailtoHref(message.email, message.subject ?? "Your message")}>
            <Mail className="mr-1.5 h-3.5 w-3.5" /> {message.email}
          </a>
        </Button>
        {message.phone ? (
          <Button asChild size="sm" variant="outline">
            <a href={telHref(message.phone)}>
              <Phone className="mr-1.5 h-3.5 w-3.5" /> {message.phone}
            </a>
          </Button>
        ) : null}
      </div>
      {message.subject ? (
        <p className="font-medium text-foreground">{message.subject}</p>
      ) : null}
      <p className="whitespace-pre-line text-foreground">{message.message}</p>

      <div>
        <Label htmlFor="msg-status">Status</Label>
        <select
          id="msg-status"
          value={status}
          onChange={(e) => setStatus(e.target.value as MessageStatus)}
          className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          {MESSAGE_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="msg-notes">Internal notes</Label>
        <Textarea
          id="msg-notes"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="mt-1.5"
        />
      </div>
      <Button onClick={save} disabled={saving} className="w-full sm:w-auto">
        {saving ? "Saving…" : "Save changes"}
      </Button>
    </div>
  );
}
