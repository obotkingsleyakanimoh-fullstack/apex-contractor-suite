import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CalendarDays, Clock3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site/SiteLayout";
import { EmptyState, ImageBox } from "@/components/site/shared";
import { blogDate, sanitizeBlogHtml, type BlogPost } from "@/lib/blog";
import { createPageHead, safeJsonLd, SITE_ORIGIN } from "@/lib/seo";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    try {
      const { data } = await (supabase.from("blog_posts" as any) as any)
        .select("*")
        .eq("slug", params.slug)
        .eq("published", true)
        .maybeSingle();
      return { post: data as BlogPost | null, seoLookupFailed: false };
    } catch {
      return { post: null as BlogPost | null, seoLookupFailed: true };
    }
  },
  head: ({ loaderData, params }) => {
    const post = loaderData?.post as BlogPost | null | undefined;
    const title = post?.seo_title || post?.title || "Solar Energy Article | Zitso Energy";
    const description = post?.seo_description || post?.excerpt || "Solar energy article from Zitso Energy.";
    return createPageHead({
      title,
      description,
      path: `/blog/${encodeURIComponent(params.slug)}`,
      image: post?.og_image_url || post?.cover_image_url,
      type: "article",
      noIndex: !post && !loaderData?.seoLookupFailed,
    });
  },
  component: BlogArticle,
});

function BlogArticle() {
  const { post, seoLookupFailed } = Route.useLoaderData();
  if (!post) return <SiteLayout><div className="container-page section-y"><EmptyState title={seoLookupFailed ? "Article temporarily unavailable" : "Article not found"} description={seoLookupFailed ? "Please try again shortly or return to the Zitso Energy journal." : "This article may have been unpublished or moved."} action={<Link to="/blog" className="font-semibold text-[var(--color-primary)]">Back to blog</Link>} /></div></SiteLayout>;

  const html = sanitizeBlogHtml(post.content_html);
  const description = post.seo_description || post.excerpt || "Solar energy insight from Zitso Energy.";
  const image = post.og_image_url || post.cover_image_url || "/images/solar-installation.webp";

  const blogPostingSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_ORIGIN}/blog/${encodeURIComponent(post.slug)}` },
    headline: post.title,
    description,
    image: [image.startsWith("http") ? image : `${SITE_ORIGIN}${image.startsWith("/") ? "" : "/"}${image}`],
    ...(post.published_at ? { datePublished: post.published_at } : {}),
    ...(post.updated_at ? { dateModified: post.updated_at } : {}),
    author: post.author_name ? { "@type": "Person", name: post.author_name } : { "@type": "Organization", name: "Zitso Energy" },
    publisher: { "@type": "Organization", name: "Zitso Energy", logo: { "@type": "ImageObject", url: `${SITE_ORIGIN}/images/zitso-energy-mark.svg` } },
  };

  return <SiteLayout>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(blogPostingSchema) }} />
    <article>
      <header className="border-b border-border bg-[#f4f5ef]">
        <div className="container-page py-12 sm:py-16">
          <Link to="/blog" className="inline-flex items-center text-sm font-semibold text-[var(--color-primary)]"><ArrowLeft className="mr-2 h-4 w-4" />Back to blog</Link>
          <div className="mt-7 max-w-4xl"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-primary)]">{post.category || "Solar energy"}</p><h1 className="mt-3 font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">{post.title}</h1><p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">{description}</p><div className="mt-6 flex flex-wrap items-center gap-5 text-sm text-muted-foreground">{post.author_name ? <span>By {post.author_name}</span> : null}{post.published_at ? <span className="flex items-center gap-1.5"><CalendarDays className="h-4 w-4" />{blogDate(post.published_at)}</span> : null}<span className="flex items-center gap-1.5"><Clock3 className="h-4 w-4" />{post.reading_time_minutes || 1} min read</span></div></div>
        </div>
      </header>
      <div className="container-page section-y">
        <ImageBox src={post.cover_image_url} fallbackSrc={image} alt={post.title} eager className="aspect-[16/8] w-full rounded-[1.75rem]" />
        <div className="mx-auto mt-12 max-w-3xl">
          <div className="blog-content" dangerouslySetInnerHTML={{ __html: html }} />
          {post.tags?.length ? <div className="mt-12 flex flex-wrap gap-2 border-t border-border pt-6">{post.tags.map((tag) => <span key={tag} className="rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold">#{tag}</span>)}</div> : null}
        </div>
      </div>
    </article>
  </SiteLayout>;
}
