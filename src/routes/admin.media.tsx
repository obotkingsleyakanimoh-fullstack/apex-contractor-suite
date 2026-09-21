import { useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check, Copy, Image, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { uploadMedia, validateFile, ALLOWED_IMAGE_TYPES } from "@/lib/media";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/site/shared";
import { Skeleton } from "@/components/ui/skeleton";
import type { MediaItem } from "@/types/db";

export const Route = createFileRoute("/admin/media")({ component: AdminMedia });

function AdminMedia() {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const { data, loading, refetch } = useSupabaseData<MediaItem[]>(
    () => supabase.from("media_library").select("*").order("created_at", { ascending: false }),
    [],
  );

  async function upload(file?: File) {
    if (!file) return;
    const problem = validateFile(file, { allowed: ALLOWED_IMAGE_TYPES, maxMb: 10 });
    if (problem) return toast.error(problem);
    setBusy(true);
    try {
      const result = await uploadMedia(file);
      const { error } = await supabase.from("media_library").insert({
        file_path: result.path,
        public_url: result.url,
        file_name: result.name,
        file_type: result.type,
        file_size: result.size,
      });
      if (error) throw error;
      toast.success("Image uploaded.");
      refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not upload the image.");
    } finally {
      setBusy(false);
    }
  }

  async function copyUrl(item: MediaItem) {
    try {
      await navigator.clipboard.writeText(item.public_url);
      setCopied(item.id);
      window.setTimeout(() => setCopied(null), 1500);
    } catch {
      toast.error("Could not copy the image URL.");
    }
  }

  async function remove(item: MediaItem) {
    if (!window.confirm(`Delete ${item.file_name}?`)) return;
    const { error } = await supabase.storage.from("media").remove([item.file_path]);
    if (error) return toast.error(error.message);
    const result = await supabase.from("media_library").delete().eq("id", item.id);
    if (result.error) return toast.error(result.error.message);
    toast.success("Image deleted.");
    refetch();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl">Media library</h1>
          <p className="mt-1 text-sm text-muted-foreground">Upload reusable WebP, AVIF, JPEG, PNG or GIF images for services, projects and social sharing.</p>
        </div>
        <div>
          <input ref={input} type="file" accept={ALLOWED_IMAGE_TYPES.join(",")} className="sr-only" onChange={(e) => { void upload(e.target.files?.[0]); e.currentTarget.value = ""; }} />
          <Button onClick={() => input.current?.click()} disabled={busy}><Upload className="mr-2 h-4 w-4" />{busy ? "Uploading…" : "Upload image"}</Button>
        </div>
      </div>
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-[4/3] w-full" />)}</div>
      ) : data?.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {data.map((item) => (
            <article key={item.id} className="surface-panel overflow-hidden">
              <img src={item.public_url} alt={item.file_name} className="aspect-[4/3] w-full object-cover" loading="lazy" />
              <div className="flex items-center justify-between gap-2 p-3">
                <div className="min-w-0"><p className="truncate text-sm font-medium">{item.file_name}</p><p className="text-xs text-muted-foreground">{item.file_type ?? "image"}</p></div>
                <div className="flex shrink-0"><Button size="icon" variant="ghost" onClick={() => void copyUrl(item)} aria-label={`Copy URL for ${item.file_name}`}>{copied === item.id ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}</Button><Button size="icon" variant="ghost" onClick={() => void remove(item)} aria-label={`Delete ${item.file_name}`}><Trash2 className="h-4 w-4" /></Button></div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState icon={Image} title="No media yet" description="Upload your first project or brand image." />
      )}
    </div>
  );
}
