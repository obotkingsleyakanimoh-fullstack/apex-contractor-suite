import { supabase } from "@/integrations/supabase/client";

export const MEDIA_BUCKET = "media";
export const QUOTE_BUCKET = "quote-uploads";

const YEAR_SECONDS = 60 * 60 * 24 * 365;
const WEBP_QUALITY = 0.82;
const MAX_IMAGE_EDGE = 2048;

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

/**
 * Re-encodes visitor and administrator image uploads as WebP in the browser.
 * Documents pass through unchanged. Animated GIFs are deliberately preserved
 * because drawing a GIF to canvas would flatten it to a single frame.
 */
async function loadImageElement(file: File): Promise<{
  source: HTMLImageElement;
  width: number;
  height: number;
  cleanup: () => void;
}> {
  const objectUrl = URL.createObjectURL(file);
  const image = new Image();
  image.decoding = "async";

  const loaded = new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("This image could not be opened in your browser."));
  });

  image.src = objectUrl;
  try {
    if (typeof image.decode === "function") await image.decode();
    else await loaded;
  } catch {
    URL.revokeObjectURL(objectUrl);
    throw new Error(`We could not process "${file.name}". Please try another image format.`);
  }

  return {
    source: image,
    width: image.naturalWidth,
    height: image.naturalHeight,
    cleanup: () => URL.revokeObjectURL(objectUrl),
  };
}

/**
 * Re-encodes visitor and administrator image uploads as WebP in the browser.
 * Documents pass through unchanged. Animated GIFs are deliberately preserved
 * because drawing a GIF to canvas would flatten it to a single frame.
 */
export async function optimizeImageForUpload(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  if (file.type === "image/webp" || file.type === "image/gif") return file;

  let source: CanvasImageSource;
  let sourceWidth = 0;
  let sourceHeight = 0;
  let releaseSource: () => void = () => {};

  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file);
      source = bitmap;
      sourceWidth = bitmap.width;
      sourceHeight = bitmap.height;
      releaseSource = () => bitmap.close();
    } catch {
      const loaded = await loadImageElement(file);
      source = loaded.source;
      sourceWidth = loaded.width;
      sourceHeight = loaded.height;
      releaseSource = loaded.cleanup;
    }
  } else {
    const loaded = await loadImageElement(file);
    source = loaded.source;
    sourceWidth = loaded.width;
    sourceHeight = loaded.height;
    releaseSource = loaded.cleanup;
  }

  try {
    if (!sourceWidth || !sourceHeight) {
      throw new Error(`We could not read the dimensions of "${file.name}".`);
    }

    const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(sourceWidth, sourceHeight));
    const width = Math.max(1, Math.round(sourceWidth * scale));
    const height = Math.max(1, Math.round(sourceHeight * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) throw new Error("Your browser could not prepare this image for upload.");
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(source, 0, 0, width, height);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) => {
          if (!result) {
            reject(new Error(`We could not optimise "${file.name}". Please try another image.`));
            return;
          }
          resolve(result);
        },
        "image/webp",
        WEBP_QUALITY,
      );
    });

    if (blob.type !== "image/webp") {
      throw new Error(
        "WebP image conversion is not supported by this browser. Please use a recent browser or upload a WebP image.",
      );
    }

    const baseName = file.name.replace(/\.[^.]+$/, "") || "image";
    return new File([blob], `${baseName}.webp`, {
      type: "image/webp",
      lastModified: file.lastModified,
    });
  } finally {
    releaseSource();
  }
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

/** Uploads a website image to the media bucket and returns a long-lived signed URL. */
export async function uploadMedia(file: File, folder = "library"): Promise<UploadResult> {
  const optimizedFile = await optimizeImageForUpload(file);
  const path = `${folder}/${Date.now()}-${safeName(optimizedFile.name)}`;
  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, optimizedFile, {
    cacheControl: "31536000",
    contentType: optimizedFile.type,
    upsert: false,
  });
  if (error) throw error;

  const { data, error: signError } = await supabase.storage
    .from(MEDIA_BUCKET)
    .createSignedUrl(path, YEAR_SECONDS);
  if (signError || !data) throw signError ?? new Error("Could not create a link for this file.");

  return {
    path,
    url: data.signedUrl,
    name: optimizedFile.name,
    type: optimizedFile.type,
    size: optimizedFile.size,
  };
}

/** Uploads a customer attachment to the private quote bucket. Image attachments are WebP. */
export async function uploadQuoteFile(
  file: File,
  reference: string,
): Promise<{ path: string; name: string; type: string; size: number }> {
  const optimizedFile = await optimizeImageForUpload(file);
  const path = `${reference}/${Date.now()}-${safeName(optimizedFile.name)}`;
  const { error } = await supabase.storage.from(QUOTE_BUCKET).upload(path, optimizedFile, {
    cacheControl: "3600",
    contentType: optimizedFile.type,
    upsert: false,
  });
  if (error) throw error;
  return {
    path,
    name: optimizedFile.name,
    type: optimizedFile.type,
    size: optimizedFile.size,
  };
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
