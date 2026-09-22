export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content_html: string;
  cover_image_url: string | null;
  author_name: string | null;
  category: string | null;
  tags: string[];
  seo_title: string | null;
  seo_description: string | null;
  og_image_url: string | null;
  published: boolean;
  featured: boolean;
  published_at: string | null;
  reading_time_minutes: number | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

/**
 * Keeps the article renderer deliberately small and predictable. The admin editor
 * accepts HTML, but executable content and event handlers are removed before it is
 * rendered publicly or previewed.
 */
export function sanitizeBlogHtml(value: string): string {
  return String(value ?? "")
    .replace(/<\/?(?:script|style|iframe|object|embed|form|textarea|select|button|link|meta)[^>]*>/gi, "")
    .replace(/\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/(?:href|src|action|formaction)\s*=\s*(?:"|')?\s*javascript:[^"'\s>]+(?:"|')?/gi, "")
    .replace(/data:text\/html/gi, "")
    .replace(/<a\s+([^>]*target\s*=\s*["']?_blank["']?[^>]*)>/gi, '<a $1 rel="noopener noreferrer">');
}

export function readingTimeFromHtml(html: string): number {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const words = text ? text.split(" ").length : 0;
  return Math.max(1, Math.ceil(words / 220));
}

export function blogDate(value: string | null): string {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-NG", { dateStyle: "medium" }).format(new Date(value));
}
