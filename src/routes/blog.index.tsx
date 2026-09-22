import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CalendarDays, Clock3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ImageBox } from "@/components/site/shared";
import { PageHeroCarousel } from "@/components/site/PageHeroCarousel";
import { useSiteContent } from "@/hooks/useSiteContent";
import type { HeroContent } from "@/types/db";
import { blogDate, type BlogPost } from "@/lib/blog";

export const Route = createFileRoute("/blog/")({
  head: () => ({ meta: [
    { title: "Solar Energy Insights | Zitso Energy" },
    { name: "description", content: "Solar energy guides, inverter and battery insights, maintenance advice and practical energy information from Zitso Energy." },
  ]}),
  component: BlogIndex,
});

const FALLBACK_HERO: HeroContent["slides"] = [
  { image_url: "/images/solar-installation.webp", eyebrow: "Zitso Energy Journal", headline: "Solar knowledge for better energy decisions.", subheadline: "Practical articles about solar PV, hybrid inverters, battery storage, maintenance and energy planning." },
  { image_url: "/images/inverter-installation.webp", eyebrow: "Inverter • Battery • Backup", headline: "Understand the systems behind dependable backup power.", subheadline: "Explore practical guidance on hybrid inverters, battery sizing, backup loads and everyday energy use." },
  { image_url: "/images/commercial-project.webp", eyebrow: "Solar • Commercial • Industrial", headline: "Ideas and insights for smarter energy planning.", subheadline: "Learn about solar installations, maintenance, energy assessments and solutions for homes and businesses." },
];

function BlogIndex() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const { get } = useSiteContent();
  const hero = get<HeroContent>("blog_hero", {});
  const { data: posts, loading } = useSupabaseData<BlogPost[]>(
    () => (supabase.from("blog_posts" as any) as any).select("*").eq("published", true).order("featured", { ascending: false }).order("published_at", { ascending: false }),
    [],
  );

  const categories = useMemo(() => Array.from(new Set((posts ?? []).map((p) => p.category).filter(Boolean) as string[])).sort(), [posts]);
  const filtered = (posts ?? []).filter((post) => {
    const matchesCategory = category === "all" || post.category === category;
    const haystack = `${post.title} ${post.excerpt ?? ""} ${post.tags?.join(" ") ?? ""}`.toLowerCase();
    return matchesCategory && (!query.trim() || haystack.includes(query.trim().toLowerCase()));
  });
  const featured = filtered.find((p) => p.featured) ?? filtered[0];
  const rest = featured ? filtered.filter((p) => p.id !== featured.id) : [];

  return <SiteLayout>
    <PageHeroCarousel
      hero={hero}
      fallbackSlides={FALLBACK_HERO}
      primaryHref="/request-quote"
      secondaryHref="#blog-articles"
      primaryLabel="Get a solar assessment"
      secondaryLabel="Explore articles"
    />

    <section id="blog-articles" className="section-y scroll-mt-20">
      <div className="container-page">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setCategory("all")} className={`rounded-full px-4 py-2 text-sm font-semibold ${category === "all" ? "bg-[var(--color-primary)] text-white" : "bg-secondary text-foreground"}`}>All</button>
            {categories.map((item) => <button key={item} type="button" onClick={() => setCategory(item)} className={`rounded-full px-4 py-2 text-sm font-semibold ${category === item ? "bg-[var(--color-primary)] text-white" : "bg-secondary text-foreground"}`}>{item}</button>)}
          </div>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search articles…" className="h-11 w-full rounded-full border border-input bg-background px-5 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-ring lg:max-w-xs" />
        </div>

        {loading ? <div className="py-16 text-sm text-muted-foreground">Loading articles…</div> : !filtered.length ? <div className="py-20 text-center"><h2 className="font-display text-2xl font-bold">No published articles yet</h2><p className="mt-2 text-sm text-muted-foreground">New solar guides and insights will appear here.</p></div> : <>
          {featured ? <Link to="/blog/$slug" params={{ slug: featured.slug }} className="group mt-10 grid overflow-hidden rounded-[1.75rem] border border-border bg-white shadow-sm lg:grid-cols-[1.15fr_.85fr]">
            <ImageBox src={featured.cover_image_url} fallbackSrc="/images/solar-installation.webp" alt={featured.title} className="aspect-[16/10] h-full w-full transition-transform duration-700 group-hover:scale-105" />
            <div className="flex flex-col justify-center p-7 sm:p-10"><div className="flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-[0.14em] text-[var(--color-primary)]"><span>{featured.category || "Solar energy"}</span>{featured.published_at ? <span className="flex items-center gap-1 text-muted-foreground"><CalendarDays className="h-3.5 w-3.5" />{blogDate(featured.published_at)}</span> : null}</div><h2 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">{featured.title}</h2><p className="mt-4 text-sm leading-7 text-muted-foreground">{featured.excerpt || "Practical solar energy information from Zitso Energy."}</p><span className="mt-7 inline-flex items-center text-sm font-bold text-[var(--color-primary)]">Read article <ArrowRight className="ml-1 h-4 w-4" /></span></div>
          </Link> : null}

          {rest.length ? <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{rest.map((post) => <Link key={post.id} to="/blog/$slug" params={{ slug: post.slug }} className="group overflow-hidden rounded-[1.4rem] border border-border bg-white transition-all duration-500 hover:-translate-y-1 hover:shadow-xl"><ImageBox src={post.cover_image_url} fallbackSrc="/images/solar-installation.webp" alt={post.title} className="aspect-[4/3] w-full transition-transform duration-700 group-hover:scale-105" /><div className="p-6"><p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--color-primary)]">{post.category || "Solar energy"}</p><h2 className="mt-2 font-display text-xl font-bold">{post.title}</h2><p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">{post.excerpt || "Read the latest solar energy insight from Zitso Energy."}</p><div className="mt-5 flex items-center gap-4 text-xs text-muted-foreground">{post.published_at ? <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />{blogDate(post.published_at)}</span> : null}<span className="flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" />{post.reading_time_minutes || 1} min</span></div></div></Link>)}</div> : null}
        </>}
      </div>
    </section>
  </SiteLayout>;
}
