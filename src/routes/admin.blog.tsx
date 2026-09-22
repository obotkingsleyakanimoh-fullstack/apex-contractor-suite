import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Eye, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { logActivity } from "@/lib/activity";
import { slugify } from "@/lib/format";
import { blogDate, readingTimeFromHtml, sanitizeBlogHtml, type BlogPost } from "@/lib/blog";
import { MediaUploadField } from "@/components/admin/MediaUploadField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { EmptyState } from "@/components/site/shared";

export const Route = createFileRoute("/admin/blog")({
  ssr: false,
  component: AdminBlog,
});

type Form = Omit<BlogPost, "id" | "created_at" | "updated_at">;
const EMPTY: Form = {
  title: "", slug: "", excerpt: "", content_html: "<h2>Write your article</h2><p>Start your solar energy article here.</p>", cover_image_url: null, author_name: "Zitso Energy", category: "Solar energy", tags: [], seo_title: "", seo_description: "", og_image_url: null, published: false, featured: false, published_at: null, reading_time_minutes: 1, sort_order: 0,
};

function AdminBlog() {
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [form, setForm] = useState<Form>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<BlogPost | null>(null);
  const [inlineImage, setInlineImage] = useState("");
  const { data, loading, refetch } = useSupabaseData<BlogPost[]>(() => (supabase.from("blog_posts" as any) as any).select("*").order("featured", { ascending: false }).order("updated_at", { ascending: false }), []);
  const rows = useMemo(() => { const q = query.trim().toLowerCase(); return (data ?? []).filter((p) => !q || `${p.title} ${p.slug} ${p.category ?? ""} ${p.tags?.join(" ") ?? ""}`.toLowerCase().includes(q)); }, [data, query]);

  const [editorOpen, setEditorOpen] = useState(false);
  function openCreate() { setEditing(null); setForm({ ...EMPTY, tags: [] }); setInlineImage(""); setEditorOpen(true); }
  function openEdit(post: BlogPost) { setEditing(post); setForm({ ...post, tags: Array.isArray(post.tags) ? post.tags : [] }); setInlineImage(""); setEditorOpen(true); }
  function setField<K extends keyof Form>(key: K, value: Form[K]) { setForm((v) => ({ ...v, [key]: value })); }

  async function save() {
    if (!form.title.trim() || !form.slug.trim() || !form.content_html.trim()) { toast.error("Title, slug and article HTML are required."); return; }
    setSaving(true);
    const payload = { ...form, tags: form.tags.map((x) => x.trim()).filter(Boolean), reading_time_minutes: readingTimeFromHtml(form.content_html), published_at: form.published ? (form.published_at || new Date().toISOString()) : null };
    try {
      if (editing?.id) { const { error } = await (supabase.from("blog_posts" as any) as any).update(payload).eq("id", editing.id); if (error) throw error; void logActivity({ action: "updated", entity: "blog_posts", entityId: editing.id, details: `Updated blog article: ${form.title}` }); toast.success("Article updated."); }
      else { const { data: inserted, error } = await (supabase.from("blog_posts" as any) as any).insert(payload).select("id").single(); if (error) throw error; void logActivity({ action: "created", entity: "blog_posts", entityId: inserted?.id, details: `Created blog article: ${form.title}` }); toast.success("Article created."); }
      refetch(); setEditing(null); setEditorOpen(false);
    } catch (error) { toast.error(error instanceof Error ? error.message : "Could not save article."); }
    finally { setSaving(false); }
  }

  async function remove() { if (!deleteTarget) return; const { error } = await (supabase.from("blog_posts" as any) as any).delete().eq("id", deleteTarget.id); if (error) toast.error(error.message); else { void logActivity({ action: "deleted", entity: "blog_posts", entityId: deleteTarget.id, details: `Deleted blog article: ${deleteTarget.title}` }); toast.success("Article deleted."); refetch(); } setDeleteTarget(null); }

  return <div className="space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="font-display text-xl font-bold sm:text-2xl">Blog &amp; Articles</h1><p className="mt-1 text-sm text-muted-foreground">Create, edit, preview, publish and remove solar articles. Changes appear on the public blog immediately.</p></div><Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />New article</Button></div>
    <div className="relative max-w-sm"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search articles" className="pl-9" /></div>
    {loading ? <p className="text-sm text-muted-foreground">Loading articles…</p> : !rows.length ? <EmptyState title="No articles yet" description="Create your first solar article." action={<Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />New article</Button>} /> : <div className="overflow-x-auto rounded-lg border border-border"><table className="w-full min-w-[820px] text-sm"><thead className="bg-secondary"><tr><th className="px-4 py-3 text-left">Article</th><th className="px-4 py-3 text-left">Category</th><th className="px-4 py-3 text-left">Status</th><th className="px-4 py-3 text-left">Published</th><th className="px-4 py-3 text-right">Actions</th></tr></thead><tbody>{rows.map((post) => <tr key={post.id} className="border-t border-border"><td className="px-4 py-3 font-medium">{post.title}</td><td className="px-4 py-3">{post.category || "—"}</td><td className="px-4 py-3">{post.published ? <span className="rounded bg-success/15 px-2 py-0.5 text-xs text-success">Published</span> : <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">Draft</span>}</td><td className="px-4 py-3 text-muted-foreground">{blogDate(post.published_at)}</td><td className="px-4 py-3 text-right"><Button size="sm" variant="outline" onClick={() => openEdit(post)}><Pencil className="mr-1.5 h-3.5 w-3.5" />Edit</Button><Button size="sm" variant="ghost" className="ml-2" onClick={() => setDeleteTarget(post)}><Trash2 className="mr-1.5 h-3.5 w-3.5" />Delete</Button></td></tr>)}</tbody></table></div>}

    <Dialog open={editorOpen} onOpenChange={(open) => { if (!open) { setEditing(null); setEditorOpen(false); } }}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-6xl">
        <DialogHeader><DialogTitle>{editing?.id ? "Edit article" : "New article"}</DialogTitle></DialogHeader>
        <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2"><Field label="Article title"><Input value={form.title} onChange={(e) => { const title = e.target.value; setForm((v) => ({ ...v, title, slug: editing?.id ? v.slug : slugify(title) })); }} /></Field><Field label="URL slug"><Input value={form.slug} onChange={(e) => setField("slug", slugify(e.target.value))} /></Field><Field label="Category"><Input value={form.category ?? ""} onChange={(e) => setField("category", e.target.value)} placeholder="Solar energy" /></Field><Field label="Author"><Input value={form.author_name ?? ""} onChange={(e) => setField("author_name", e.target.value)} /></Field></div>
            <Field label="Excerpt"><Textarea rows={3} value={form.excerpt ?? ""} onChange={(e) => setField("excerpt", e.target.value)} placeholder="Short summary shown on the blog listing and search/social previews." /></Field>
            <Field label="Cover image"><MediaUploadField value={form.cover_image_url ?? ""} onChange={(v) => setField("cover_image_url", v || null)} /></Field>
            <Field label="Article HTML"><Textarea rows={18} value={form.content_html} onChange={(e) => setField("content_html", e.target.value)} className="font-mono text-xs leading-5" placeholder="<h2>...</h2><p>...</p>" /></Field>
            <div className="rounded-xl border border-border bg-secondary/30 p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-end"><div className="min-w-0 flex-1"><Field label="Insert inline image"><MediaUploadField value={inlineImage} onChange={setInlineImage} /></Field></div><Button type="button" variant="outline" disabled={!inlineImage} onClick={() => { setField("content_html", `${form.content_html}\n<p><img src="${inlineImage}" alt="" /></p>`); setInlineImage(""); }}>Insert image</Button></div><p className="mt-2 text-xs text-muted-foreground">Upload an image and insert it directly into the article HTML. The image is stored in the Supabase media bucket.</p></div>
            <p className="text-xs text-muted-foreground">Use semantic HTML such as &lt;h2&gt;, &lt;h3&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;, &lt;a&gt; and &lt;img&gt;. Scripts, forms, iframes and event handlers are removed before public rendering.</p>
            <Field label="Tags"><Input value={form.tags.join(", ")} onChange={(e) => setField("tags", e.target.value.split(",").map((x) => x.trim()).filter(Boolean))} placeholder="solar, inverter, batteries, Nigeria" /></Field>
            <div className="grid gap-4 sm:grid-cols-2"><Field label="SEO title"><Input value={form.seo_title ?? ""} onChange={(e) => setField("seo_title", e.target.value)} /></Field><Field label="SEO description"><Textarea rows={3} value={form.seo_description ?? ""} onChange={(e) => setField("seo_description", e.target.value)} /></Field><Field label="Social share image"><MediaUploadField value={form.og_image_url ?? ""} onChange={(v) => setField("og_image_url", v || null)} /></Field><Field label="Sort order"><Input type="number" value={form.sort_order} onChange={(e) => setField("sort_order", Number(e.target.value) || 0)} /></Field></div>
            <div className="flex flex-wrap gap-5"><label className="flex items-center gap-2 text-sm"><Checkbox checked={form.published} onCheckedChange={(v) => setField("published", v === true)} />Published</label><label className="flex items-center gap-2 text-sm"><Checkbox checked={form.featured} onCheckedChange={(v) => setField("featured", v === true)} />Featured</label></div>
          </div>
          <div className="min-w-0 rounded-2xl border border-border bg-secondary/40 p-4"><div className="flex items-center justify-between gap-3"><div><p className="font-semibold">HTML preview</p><p className="text-xs text-muted-foreground">Live preview of the article body.</p></div><span className="inline-flex items-center text-xs font-medium text-muted-foreground"><Eye className="mr-2 h-4 w-4" />Live preview</span></div><div className="mt-4 overflow-hidden rounded-xl border border-border bg-white"><div className="border-b border-border px-5 py-4"><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#17634e]">{form.category || "Solar energy"}</p><h2 className="mt-2 font-display text-2xl font-bold">{form.title || "Article title"}</h2><p className="mt-2 text-sm text-muted-foreground">{form.excerpt || "Article excerpt"}</p></div><div className="blog-content max-h-[620px] overflow-y-auto p-5" dangerouslySetInnerHTML={{ __html: sanitizeBlogHtml(form.content_html) }} /></div></div>
        </div>
        <DialogFooter><Button variant="outline" onClick={() => { setEditing(null); setEditorOpen(false); }}>Cancel</Button><Button onClick={save} disabled={saving}>{saving ? "Saving…" : form.published ? "Save & publish" : "Save draft"}</Button></DialogFooter>
      </DialogContent>
    </Dialog>

    <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete this article?</AlertDialogTitle><AlertDialogDescription>This permanently removes the article from the admin and public blog.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => void remove()}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div><Label>{label}</Label><div className="mt-1.5">{children}</div></div>; }
