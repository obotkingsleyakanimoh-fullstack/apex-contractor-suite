import { useMemo, useState } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { logActivity } from "@/lib/activity";
import { slugify } from "@/lib/format";
import { EmptyState } from "@/components/site/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export type Row = Record<string, any>;

export interface FieldSpec {
  name: string;
  label: string;
  type: "text" | "textarea" | "number" | "checkbox" | "select" | "date" | "list";
  options?: { value: string; label: string }[];
  placeholder?: string;
  help?: string;
  slugFrom?: string;
  required?: boolean;
  full?: boolean;
}

export interface ColumnSpec {
  key: string;
  label: string;
  render?: (row: Row) => React.ReactNode;
  hideOnMobile?: boolean;
}

interface Props {
  table: string;
  entityLabel: string;
  title: string;
  description?: string;
  columns: ColumnSpec[];
  fields: FieldSpec[];
  defaults: Row;
  searchKeys: string[];
  orderBy?: { column: string; ascending?: boolean };
}

function toFormValue(row: Row, field: FieldSpec): any {
  const raw = row[field.name];
  if (field.type === "list") return Array.isArray(raw) ? raw.join("\n") : "";
  if (field.type === "checkbox") return Boolean(raw);
  return raw ?? "";
}

function fromFormValue(value: any, field: FieldSpec): any {
  if (field.type === "list") {
    return String(value ?? "")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (field.type === "checkbox") return Boolean(value);
  if (field.type === "number") {
    if (value === "" || value === null) return null;
    const n = Number(value);
    return Number.isNaN(n) ? null : n;
  }
  if (value === "") return null;
  return value;
}

export function CrudManager({
  table,
  entityLabel,
  title,
  description,
  columns,
  fields,
  defaults,
  searchKeys,
  orderBy,
}: Props) {
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Row | null>(null);
  const [form, setForm] = useState<Row>({});
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Row | null>(null);

  const { data, loading, refetch } = useSupabaseData<Row[]>(() => {
    let q = (supabase.from(table as any) as any).select("*");
    if (orderBy) q = q.order(orderBy.column, { ascending: orderBy.ascending ?? true });
    return q;
  }, [table]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data ?? [];
    return (data ?? []).filter((row) =>
      searchKeys.some((k) => String(row[k] ?? "").toLowerCase().includes(q)),
    );
  }, [data, query, searchKeys]);

  function openCreate() {
    setForm({ ...defaults });
    setEditing({});
  }

  function openEdit(row: Row) {
    const next: Row = {};
    for (const field of fields) next[field.name] = toFormValue(row, field);
    setForm(next);
    setEditing(row);
  }

  function setField(field: FieldSpec, value: any) {
    setForm((prev) => {
      const next = { ...prev, [field.name]: value };
      const slugField = fields.find((f) => f.slugFrom === field.name);
      if (slugField && (!editing?.id || !prev[slugField.name])) {
        next[slugField.name] = slugify(String(value ?? ""));
      }
      return next;
    });
  }

  async function save() {
    for (const field of fields) {
      if (field.required && !String(form[field.name] ?? "").trim()) {
        toast.error(`${field.label} is required.`);
        return;
      }
    }
    setSaving(true);
    const payload: Row = {};
    for (const field of fields) payload[field.name] = fromFormValue(form[field.name], field);

    try {
      if (editing?.id) {
        const { error } = await (supabase.from(table as any) as any)
          .update(payload)
          .eq("id", editing.id);
        if (error) throw error;
        void logActivity({
          action: "updated",
          entity: table,
          entityId: editing.id,
          details: `Updated ${entityLabel}`,
        });
        toast.success(`${entityLabel} updated.`);
      } else {
        const { data: inserted, error } = await (supabase.from(table as any) as any)
          .insert(payload)
          .select("id")
          .single();
        if (error) throw error;
        void logActivity({
          action: "created",
          entity: table,
          entityId: inserted?.id,
          details: `Created ${entityLabel}`,
        });
        toast.success(`${entityLabel} created.`);
      }
      setEditing(null);
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget?.id) return;
    const { error } = await (supabase.from(table as any) as any).delete().eq("id", deleteTarget.id);
    if (error) {
      toast.error(error.message);
    } else {
      void logActivity({
        action: "deleted",
        entity: table,
        entityId: deleteTarget.id,
        details: `Deleted ${entityLabel}`,
      });
      toast.success(`${entityLabel} deleted.`);
      refetch();
    }
    setDeleteTarget(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" /> New {entityLabel}
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${entityLabel}s`}
          aria-label={`Search ${entityLabel}s`}
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          title={`No ${entityLabel}s yet`}
          description={`Create your first ${entityLabel} to see it on the website.`}
          action={
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" /> New {entityLabel}
            </Button>
          }
        />
      ) : (
        <>
          {/* Mobile cards */}
          <ul className="space-y-3 lg:hidden">
            {rows.map((row) => (
              <li key={row.id} className="surface-panel space-y-2 p-4">
                {columns.map((col) => (
                  <div key={col.key} className="flex justify-between gap-3 text-sm">
                    <span className="text-muted-foreground">{col.label}</span>
                    <span className="min-w-0 truncate text-right font-medium text-foreground">
                      {col.render ? col.render(row) : String(row[col.key] ?? "—")}
                    </span>
                  </div>
                ))}
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(row)}>
                    <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setDeleteTarget(row)}>
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>

          {/* Desktop table */}
          <div className="hidden overflow-x-auto rounded-lg border border-border lg:block">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-secondary text-left">
                <tr>
                  {columns.map((col) => (
                    <th key={col.key} className="px-4 py-3 font-semibold text-foreground">
                      {col.label}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-t border-border">
                    {columns.map((col) => (
                      <td key={col.key} className="max-w-[260px] truncate px-4 py-3 text-foreground">
                        {col.render ? col.render(row) : String(row[col.key] ?? "—")}
                      </td>
                    ))}
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <Button size="sm" variant="outline" onClick={() => openEdit(row)}>
                        <Pencil className="h-3.5 w-3.5" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="ml-2"
                        onClick={() => setDeleteTarget(row)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <Dialog open={editing !== null} onOpenChange={(open) => (open ? null : setEditing(null))}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editing?.id ? `Edit ${entityLabel}` : `New ${entityLabel}`}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map((field) => (
              <div
                key={field.name}
                className={
                  field.full || field.type === "textarea" || field.type === "list"
                    ? "sm:col-span-2"
                    : ""
                }
              >
                {field.type === "checkbox" ? (
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Checkbox
                      checked={Boolean(form[field.name])}
                      onCheckedChange={(v) => setField(field, v === true)}
                    />
                    {field.label}
                  </label>
                ) : (
                  <>
                    <Label htmlFor={field.name} className="text-sm">
                      {field.label}
                      {field.required ? <span className="text-destructive"> *</span> : null}
                    </Label>
                    <div className="mt-1.5">
                      {field.type === "textarea" ? (
                        <Textarea
                          id={field.name}
                          rows={4}
                          value={form[field.name] ?? ""}
                          placeholder={field.placeholder}
                          onChange={(e) => setField(field, e.target.value)}
                        />
                      ) : field.type === "list" ? (
                        <Textarea
                          id={field.name}
                          rows={4}
                          value={form[field.name] ?? ""}
                          placeholder={field.placeholder ?? "One item per line"}
                          onChange={(e) => setField(field, e.target.value)}
                        />
                      ) : field.type === "select" ? (
                        <select
                          id={field.name}
                          value={form[field.name] ?? ""}
                          onChange={(e) => setField(field, e.target.value)}
                          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                        >
                          <option value="">Select</option>
                          {(field.options ?? []).map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <Input
                          id={field.name}
                          type={
                            field.type === "number" ? "number" : field.type === "date" ? "date" : "text"
                          }
                          value={form[field.name] ?? ""}
                          placeholder={field.placeholder}
                          onChange={(e) => setField(field, e.target.value)}
                        />
                      )}
                    </div>
                  </>
                )}
                {field.help ? (
                  <p className="mt-1 text-xs text-muted-foreground">{field.help}</p>
                ) : null}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => (open ? null : setDeleteTarget(null))}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this {entityLabel}?</AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone and it will be removed from the public website.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export function BoolBadge({ value, yes, no }: { value: boolean; yes: string; no: string }) {
  return (
    <span
      className={
        value
          ? "rounded bg-success/15 px-2 py-0.5 text-xs font-medium text-success"
          : "rounded bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
      }
    >
      {value ? yes : no}
    </span>
  );
}
