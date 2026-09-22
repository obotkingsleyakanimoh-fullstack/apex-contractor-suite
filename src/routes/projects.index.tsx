import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useSiteContent } from "@/hooks/useSiteContent";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ImageBox } from "@/components/site/shared";
import { PageHeroCarousel } from "@/components/site/PageHeroCarousel";
import type { HeroContent, Project } from "@/types/db";

const SOLAR_RE = /(solar|inverter|battery|energy storage|backup power|pv|photovoltaic|hybrid system|maintenance)/i;

export const Route = createFileRoute("/projects/")({ head: () => ({ meta: [
  { title: "Solar Projects | Zitso Energy" },
  { name: "description", content: "Selected solar, inverter and battery installations by Zitso Energy." },
]}), component: ProjectsPage });

const FALLBACK_HERO: HeroContent["slides"] = [
  { image_url: "/images/solar-installation.webp", eyebrow: "Our solar work", headline: "Solar projects that put power to work.", subheadline: "Explore selected installations, inverter systems and energy-storage projects." },
  { image_url: "/images/commercial-project.webp", eyebrow: "Commercial • Industrial", headline: "Energy systems designed around real operating demands.", subheadline: "From load assessment to installation and maintenance, every project starts with the way power is actually used." },
  { image_url: "/images/inverter-installation.webp", eyebrow: "Inverter • Battery • Backup", headline: "Practical systems for dependable everyday power.", subheadline: "See how solar generation, battery storage and hybrid inverters work together in completed projects." },
];

function ProjectsPage() {
  const { data: projects, loading } = useSupabaseData<Project[]>(() => supabase.from("projects").select("*").eq("published", true).order("featured", { ascending: false }).order("sort_order"), []);
  const { get } = useSiteContent();
  const hero = get<HeroContent>("projects_hero", {});
  const solarProjects = (projects ?? []).filter((p) => SOLAR_RE.test(`${p.title} ${p.description ?? ""} ${p.slug} ${p.services_provided ?? ""}`));

  return <SiteLayout>
    <PageHeroCarousel hero={hero} fallbackSlides={FALLBACK_HERO} primaryHref="/request-quote" secondaryHref="/services" primaryLabel="Start a solar project" secondaryLabel="Explore solar solutions" />
    <section className="section-y">
      <div className="container-page">
        <div className="mb-10 max-w-3xl"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-primary)]">{hero.eyebrow || "Selected installations"}</p><h2 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">{hero.headline ? "Work designed to perform in the real world." : "Solar installations and energy projects."}</h2><p className="mt-4 text-base leading-7 text-muted-foreground">{hero.subheadline || "Explore selected solar installations, inverter systems and battery-storage projects."}</p></div>
        {loading ? <p className="text-sm text-muted-foreground">Loading projects…</p> : solarProjects.length ? <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{solarProjects.map((project) => <Link key={project.id} to="/projects/$slug" params={{ slug: project.slug }} className="group overflow-hidden rounded-[1.5rem] border border-border bg-white shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-xl"><ImageBox src={project.hero_image_url} fallbackSrc="/images/solar-installation.webp" alt={project.title} className="aspect-[4/3] w-full transition-transform duration-700 group-hover:scale-105" /><div className="p-6"><p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--color-primary)]">{project.location ?? "Nigeria"}</p><h2 className="mt-2 font-display text-xl font-bold">{project.title}</h2>{project.description ? <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">{project.description}</p> : null}<span className="mt-5 inline-flex items-center text-sm font-bold text-[var(--color-primary)]">View project <ArrowRight className="ml-1 h-4 w-4" /></span></div></Link>)}</div> : <div className="rounded-2xl border border-dashed border-border p-14 text-center"><h2 className="font-display text-2xl font-bold">Solar case studies coming soon</h2><p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-muted-foreground">Published solar projects will appear here.</p></div>}
      </div>
    </section>
  </SiteLayout>;
}
