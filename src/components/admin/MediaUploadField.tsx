import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { uploadMedia, validateFile, ALLOWED_IMAGE_TYPES } from "@/lib/media";

export function MediaUploadField({ value, onChange, multiple = false }: { value: string; onChange: (value: string) => void; multiple?: boolean }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const values = multiple ? value.split("\n").map((v) => v.trim()).filter(Boolean) : value ? [value] : [];

  async function choose(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const problem = validateFile(file, { allowed: ALLOWED_IMAGE_TYPES, maxMb: 10 });
        if (problem) { toast.error(problem); continue; }
        const result = await uploadMedia(file, "website");
        uploaded.push(result.url);
      }
      if (uploaded.length) onChange(multiple ? [...values, ...uploaded].join("\n") : uploaded[0]);
      if (uploaded.length) toast.success(`${uploaded.length} image${uploaded.length > 1 ? "s" : ""} uploaded to the media bucket.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not upload image.");
    } finally { setBusy(false); if (input.current) input.current.value = ""; }
  }

  function remove(url: string) { onChange(values.filter((v) => v !== url).join("\n")); }

  return <div className="space-y-2">
    <input ref={input} type="file" accept={ALLOWED_IMAGE_TYPES.join(",")} multiple={multiple} className="sr-only" onChange={(e) => void choose(e.target.files)} />
    <div className="flex flex-wrap gap-2">
      <Button type="button" variant="outline" size="sm" onClick={() => input.current?.click()} disabled={busy}>
        {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ImagePlus className="mr-2 h-4 w-4" />}
        {busy ? "Uploading…" : multiple ? "Choose images" : "Choose image"}
      </Button>
      {values.map((url) => <div key={url} className="relative h-20 w-28 overflow-hidden rounded-lg border bg-muted">
        <img src={url} alt="Selected" className="h-full w-full object-cover" />
        <button type="button" onClick={() => remove(url)} className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/70 text-white" aria-label="Remove image"><X className="h-3.5 w-3.5" /></button>
      </div>)}
    </div>
    <p className="text-xs text-muted-foreground">Choose a file from your computer. It is uploaded directly to the Supabase media bucket; no image URL is required.</p>
  </div>;
}
