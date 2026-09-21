import { supabase } from "@/integrations/supabase/client";

export const MEDIA_BUCKET = "media";
export const QUOTE_BUCKET = "quote-uploads";

const YEAR_SECONDS = 60 * 60 * 24 * 365;

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
];

export const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

export interface UploadResult {
  path: string;
  url: string;
  name: string;
  type: string;
  size: number;
}

function safeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]/g, "-")
    .replace(/-+/g, "-")
    .slice(-80);
}

export function validateFile(
  file: File,
  opts: { allowed: string[]; maxMb: number },
): string | null {
  if (!opts.allowed.includes(file.type)) {
    return `"${file.name}" is not an accepted file type.`;
  }
  if (file.size > opts.maxMb * 1024 * 1024) {
    return `"${file.name}" is larger than the ${opts.maxMb}MB limit.`;
  }
  if (file.size === 0) return `"${file.name}" appears to be empty.`;
  return null;
}

/** Uploads to the media bucket and returns a long-lived signed URL. */
export async function uploadMedia(file: File, folder = "library"): Promise<UploadResult> {
  const path = `${folder}/${Date.now()}-${safeName(file.name)}`;
  const { error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(path, file, { cacheControl: "31536000", upsert: false });
  if (error) throw error;

  const { data, error: signError } = await supabase.storage
    .from(MEDIA_BUCKET)
    .createSignedUrl(path, YEAR_SECONDS);
  if (signError || !data) throw signError ?? new Error("Could not create a link for this file.");

  return {
    path,
    url: data.signedUrl,
    name: file.name,
    type: file.type,
    size: file.size,
  };
}

/** Uploads a customer attachment to the private quote bucket. */
export async function uploadQuoteFile(
  file: File,
  reference: string,
): Promise<{ path: string; name: string; type: string; size: number }> {
  const path = `${reference}/${Date.now()}-${safeName(file.name)}`;
  const { error } = await supabase.storage.from(QUOTE_BUCKET).upload(path, file);
  if (error) throw error;
  return { path, name: file.name, type: file.type, size: file.size };
}

/** Staff-only: temporary link for a private customer attachment. */
export async function signQuoteFile(path: string, seconds = 300): Promise<string | null> {
  const { data } = await supabase.storage.from(QUOTE_BUCKET).createSignedUrl(path, seconds);
  return data?.signedUrl ?? null;
}

export async function deleteMedia(path: string): Promise<void> {
  const { error } = await supabase.storage.from(MEDIA_BUCKET).remove([path]);
  if (error) throw error;
}
