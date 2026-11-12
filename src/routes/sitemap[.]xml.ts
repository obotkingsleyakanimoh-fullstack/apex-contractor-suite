import { createFileRoute } from "@tanstack/react-router";

import { SITE_ORIGIN } from "@/lib/seo";

type PublishedRecord = {
  slug?: string;
  updated_at?: string | null;
  published_at?: string | null;
  hero_image_url?: string | null;
  cover_image_url?: string | null;
  og_image_url?: string | null;
  title?: string | null;
};

type SitemapEntry = {
  loc: string;
  lastmod?: string;
  images?: Array<{ loc: string; title?: string }>;
};

const STATIC_PATHS = [
  "/",
  "/about",
  "/services",
  "/projects",
  "/blog",
  "/locations",
  "/faq",
  "/contact",
  "/request-quote",
  "/privacy",
  "/terms",
];

function xmlEscape(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

function absoluteImage(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  try {
    return new URL(value, SITE_ORIGIN).toString();
  } catch {
    return undefined;
  }
}

function envValue(name: string): string | undefined {
  try {
    const processValue = process.env[name];
    const buildName = name === "SUPABASE_URL" ? "VITE_SUPABASE_URL" : "VITE_SUPABASE_PUBLISHABLE_KEY";
    const buildValue = import.meta.env[buildName];
    const value = processValue || buildValue;
    return typeof value === "string" && value.trim() ? value.trim() : undefined;
  } catch {
    return undefined;
  }
}

function isPublicSupabaseKey(value: string): boolean {
  if (value.startsWith("sb_publishable_")) return true;
  if (value.startsWith("sb_secret_")) return false;
  // Older Supabase anon keys are JWTs. Never use service_role JWTs for a public sitemap.
  try {
    const payload = value.split(".")[1];
    if (!payload) return false;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const claims = JSON.parse(atob(padded)) as { role?: string };
    return claims.role === "anon";
  } catch {
    return false;
  }
}

async function publishedRows(table: string, select: string): Promise<PublishedRecord[]> {
  const projectUrl = envValue("SUPABASE_URL");
  const publishableKey = envValue("SUPABASE_PUBLISHABLE_KEY");
  if (!projectUrl || !publishableKey || !isPublicSupabaseKey(publishableKey)) return [];

  const endpoint = new URL(`/rest/v1/${table}`, projectUrl);
  endpoint.searchParams.set("select", select);
  endpoint.searchParams.set("published", "eq.true");
  endpoint.searchParams.set("order", "updated_at.desc");
  endpoint.searchParams.set("limit", "5000");

  try {
    const headers = new Headers({ apikey: publishableKey, accept: "application/json" });
    // Legacy anon JWT keys need Authorization for PostgREST role selection. New
    // sb_publishable_ keys are API keys and must only be sent as `apikey`.
    if (!publishableKey.startsWith("sb_publishable_") && !publishableKey.startsWith("sb_secret_")) {
      headers.set("Authorization", `Bearer ${publishableKey}`);
    }
    const response = await fetch(endpoint, { headers, signal: AbortSignal.timeout(8000) });
    if (!response.ok) return [];
    const rows = (await response.json()) as unknown;
    return Array.isArray(rows) ? (rows as PublishedRecord[]) : [];
  } catch (error) {
    console.warn(`[SEO] Could not load published ${table} for sitemap`, error);
    return [];
  }
}

function recordEntry(pathPrefix: string, row: PublishedRecord): SitemapEntry | null {
  if (!row.slug || typeof row.slug !== "string") return null;
  const slug = encodeURIComponent(row.slug.trim());
  const image = absoluteImage(row.og_image_url || row.hero_image_url || row.cover_image_url);
  const date = row.updated_at || row.published_at;
  const lastmod = date && !Number.isNaN(Date.parse(date)) ? new Date(date).toISOString() : undefined;
  return {
    loc: `${SITE_ORIGIN}${pathPrefix}/${slug}`,
    ...(lastmod ? { lastmod } : {}),
    ...(image ? { images: [{ loc: image, ...(row.title ? { title: row.title } : {}) }] } : {}),
  };
}

async function buildSitemap(): Promise<string> {
  const staticEntries: SitemapEntry[] = STATIC_PATHS.map((path) => ({
    loc: `${SITE_ORIGIN}${path === "/" ? "/" : path}`,
  }));

  const [services, projects, posts] = await Promise.all([
    publishedRows("services", "slug,updated_at,title,hero_image_url,og_image_url"),
    publishedRows("projects", "slug,updated_at,title,hero_image_url,og_image_url"),
    publishedRows("blog_posts", "slug,updated_at,published_at,title,cover_image_url,og_image_url"),
  ]);

  const dynamicEntries = [
    ...services.map((row) => recordEntry("/services", row)),
    ...projects.map((row) => recordEntry("/projects", row)),
    ...posts.map((row) => recordEntry("/blog", row)),
  ].filter((entry): entry is SitemapEntry => entry !== null);

  const entries = [...staticEntries, ...dynamicEntries];
  const body = entries.map((entry) => {
    const images = (entry.images ?? []).map((image) =>
      `<image:image><image:loc>${xmlEscape(image.loc)}</image:loc>${image.title ? `<image:title>${xmlEscape(image.title)}</image:title>` : ""}</image:image>`,
    ).join("");
    return `<url><loc>${xmlEscape(entry.loc)}</loc>${entry.lastmod ? `<lastmod>${entry.lastmod}</lastmod>` : ""}${images}</url>`;
  }).join("");

  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${body}</urlset>`;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => new Response(await buildSitemap(), {
        status: 200,
        headers: {
          "Content-Type": "application/xml; charset=utf-8",
          "Cache-Control": "public, max-age=900, s-maxage=3600",
          "X-Content-Type-Options": "nosniff",
        },
      }),
    },
  },
});
