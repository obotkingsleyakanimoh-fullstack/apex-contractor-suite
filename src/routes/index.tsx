import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BatteryCharging,
  CheckCircle2,
  CircleDollarSign,
  Gauge,
  Phone,
  ShieldCheck,
  Sun,
  Wrench,
  Zap,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useSiteContent } from "@/hooks/useSiteContent";
import { useSiteData } from "@/hooks/useSiteData";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ImageBox, SectionHeading } from "@/components/site/shared";
import { Button } from "@/components/ui/button";
import { telHref } from "@/lib/format";
import type { HeroContent, Project, Service } from "@/types/db";

const SOLAR_RE =
  /(solar|inverter|battery|energy storage|backup power|pv|photovoltaic|maintenance|hybrid system)/i;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Zitso Energy | Solar Power & Energy Storage" },
      {
        name: "description",
        content:
          "Reliable solar power, hybrid inverter systems, battery storage and solar maintenance for homes and businesses across Nigeria.",
      },
      { property: "og:title", content: "Zitso Energy | Solar Power & Energy Storage" },
      {
        property: "og:description",
        content:
          "Designed solar energy systems, quality installation and dependable after-sales maintenance.",
      },
    ],
  }),
  component: HomePage,
});

function HeroCarousel({ hero }: { hero: HeroContent }) {
  const slides = useMemo(() => {
    const configured = Array.isArray(hero.slides) ? hero.slides.filter((s) => s?.image_url) : [];
    if (configured.length) return configured;
    return [
      { image_url: hero.image_url || "/images/solar-installation.webp", eyebrow: hero.eyebrow || "Solar energy • Battery storage • Inverter systems", headline: hero.headline || "Power your home with energy you can depend on.", subheadline: hero.subheadline || "We design and install dependable solar power systems that reduce generator dependence, protect your essential loads and give you greater control over your energy." },
      { image_url: "/images/inverter-installation.webp", eyebrow: "Smart power • Hybrid inverters • Backup", headline: "Keep essential power running when the grid cannot.", subheadline: "Hybrid inverter and battery systems designed around the appliances and loads that matter most to you." },
      { image_url: "/images/commercial-project.webp", eyebrow: "Residential • Commercial • Industrial", headline: "Build an energy system around the way you operate.", subheadline: "From assessment and sizing to installation and maintenance, Zitso Energy delivers complete solar solutions." },
    ];
  }, [hero]);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [dragStart, setDragStart] = useState<number | null>(null);

  useEffect(() => { if (slides.length < 2 || paused) return; const id = window.setInterval(() => setActive((v) => (v + 1) % slides.length), 4500); return () => window.clearInterval(id); }, [slides.length, paused]);
  useEffect(() => { if (active >= slides.length) setActive(0); }, [active, slides.length]);
  const slide = slides[active] ?? slides[0];
  const go = (delta: number) => setActive((v) => (v + delta + slides.length) % slides.length);
  if (!slide) return null;

  return <section className="relative min-h-[720px] overflow-hidden bg-[var(--hero-overlay)] text-white sm:min-h-[780px] lg:min-h-[820px]" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onTouchStart={(e) => setDragStart(e.touches[0].clientX)} onTouchEnd={(e) => { if (dragStart === null) return; const delta = e.changedTouches[0].clientX - dragStart; if (Math.abs(delta) > 50) go(delta < 0 ? 1 : -1); setDragStart(null); }}>
    {slides.map((s, i) => <div key={`${s.image_url}-${i}`} className={`absolute inset-0 transition-all duration-[1400ms] ease-out ${i === active ? "opacity-100 scale-100" : "pointer-events-none opacity-0 scale-[1.035]"}`} aria-hidden={i !== active}><img src={s.image_url} alt="" className="h-full w-full object-cover" /><div className="absolute inset-0" style={{ background: `linear-gradient(90deg, color-mix(in srgb, var(--hero-overlay) 96%, transparent), color-mix(in srgb, var(--hero-overlay) 70%, transparent), color-mix(in srgb, var(--hero-overlay) 25%, transparent))`, opacity: "var(--hero-overlay-opacity)" }} /><div className="absolute inset-0" style={{ background: `linear-gradient(0deg, color-mix(in srgb, var(--hero-overlay) 82%, transparent), transparent 60%, color-mix(in srgb, var(--hero-overlay) 10%, transparent))` }} /></div>)}
    <div className="container-page relative flex min-h-[720px] items-end py-20 sm:min-h-[780px] lg:min-h-[820px] lg:items-center lg:py-24">
      <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-700">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--color-accent)] sm:text-sm">{slide.eyebrow || "Solar energy • Battery storage • Inverter systems"}</p>
        <h1 className="mt-5 max-w-4xl font-display text-5xl font-bold leading-[0.98] tracking-[-0.045em] sm:text-6xl lg:text-[6.4rem]">{slide.headline || hero.headline || "Power your home with energy you can depend on."}</h1>
        <p className="mt-7 max-w-2xl text-base leading-7 text-white/78 sm:text-xl sm:leading-8">{slide.subheadline || hero.subheadline}</p>
        <div className="mt-9 flex flex-wrap gap-3"><Button asChild size="lg" className="h-13 rounded-full bg-[var(--color-accent)] px-7 text-[var(--heading-color)] shadow-xl hover:bg-accent/90"><Link to="/request-quote">Get a solar assessment <ArrowRight className="ml-2 h-4 w-4" /></Link></Button><Button asChild size="lg" variant="outline" className="h-13 rounded-full border-white/30 bg-white/10 px-7 text-white backdrop-blur hover:bg-white/15"><Link to="/services">Explore solar solutions</Link></Button></div>
        <div className="mt-10 flex items-center gap-4"><div className="flex gap-2">{slides.map((_, i) => <button key={i} type="button" onClick={() => setActive(i)} className={`h-1.5 rounded-full transition-all ${i === active ? "w-10 bg-[var(--color-accent)]" : "w-5 bg-white/40 hover:bg-white/70"}`} aria-label={`Show slide ${i + 1}`} />)}</div><span className="text-xs text-white/55">Swipe to explore</span></div>
      </div>
    </div>
  </section>;
}

function HomePage() {
  const { company } = useSiteData();
  const { get } = useSiteContent();
  const hero = get<HeroContent>("homepage_hero", {});

  const { data: services } = useSupabaseData<Service[]>(
    () =>
      supabase
        .from("services")
        .select("*")
        .eq("published", true)
        .order("featured", { ascending: false })
        .order("sort_order")
        .limit(12),
    [],
  );

  const { data: projects } = useSupabaseData<Project[]>(
    () =>
      supabase
        .from("projects")
        .select("*")
        .eq("published", true)
        .order("featured", { ascending: false })
        .order("sort_order")
        .limit(12),
    [],
  );

  const solarServices = (services ?? []).filter((s) =>
    SOLAR_RE.test(`${s.title} ${s.short_description ?? ""} ${s.full_description ?? ""}`),
  ).slice(0, 4);

  const solarProjects = (projects ?? []).filter((p) =>
    SOLAR_RE.test(`${p.title} ${p.description ?? ""} ${p.slug}`),
  ).slice(0, 3);

  const fallbackServices = [
    {
      title: "Solar Power Systems",
      body: "Complete solar PV systems designed around your home, office or commercial energy needs.",
      icon: Sun,
    },
    {
      title: "Hybrid Inverter Systems",
      body: "Intelligent inverter solutions that combine solar generation, battery storage and grid power.",
      icon: Zap,
    },
    {
      title: "Battery Energy Storage",
      body: "Store daytime solar energy and keep essential loads running when grid power is unavailable.",
      icon: BatteryCharging,
    },
    {
      title: "Solar Maintenance",
      body: "Inspection, troubleshooting and preventive maintenance to keep your system performing reliably.",
      icon: Wrench,
    },
  ];

  return (
    <SiteLayout>
      <HeroCarousel hero={hero} />

      <section className="border-b border-border bg-white">
        <div className="container-page grid gap-0 divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {[
            { Icon: ShieldCheck, title: "Engineered for reliability", body: "Proper sizing, quality components and careful installation." },
            { Icon: Gauge, title: "Built around your usage", body: "We design around your appliances, operating hours and backup priorities." },
            { Icon: CircleDollarSign, title: "Lower energy waste", body: "Use more of the energy your solar system generates and stores." },
          ].map(({ Icon, title, body }) => (
            <div key={title} className="flex gap-4 py-7 sm:px-7 lg:py-9">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-secondary text-[var(--color-primary)]">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-display text-base font-bold">{title}</h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section-y">
        <div className="container-page">
          <SectionHeading
            eyebrow="Solar solutions"
            title="A complete energy system, not just solar panels."
            description="From first assessment to installation and maintenance, Zitso Energy helps you build a dependable solar setup for the way you actually use electricity."
          />
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {(solarServices.length ? solarServices : fallbackServices).map((service, index) => {
              const fallback = fallbackServices[index % fallbackServices.length];
              const Icon = "icon" in service ? service.icon : fallback.icon;
              const title = "title" in service ? service.title : fallback.title;
              const body = "short_description" in service ? (service.short_description || fallback.body) : service.body;
              const image = "hero_image_url" in service ? service.hero_image_url : null;
              return (
                <Link key={"id" in service ? service.id : title} to={"slug" in service ? "/services/$slug" : "/request-quote"} params={"slug" in service ? { slug: service.slug } : undefined} className="group relative overflow-hidden rounded-[1.35rem] border border-border bg-[var(--footer-background)] shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
                  <div className="absolute inset-0">
                    <ImageBox src={image} fallbackSrc={fallbackService(slugOf(service))} alt={title} className="h-full min-h-[310px] w-full object-cover opacity-70 transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0" style={{ background: `linear-gradient(0deg, color-mix(in srgb, var(--hero-overlay) 74%, transparent), transparent)` }} />
                  </div>
                  <div className="relative flex min-h-[310px] flex-col justify-end p-6 text-white">
                    <span className="mb-auto grid h-11 w-11 place-items-center rounded-xl border border-white/20 bg-white/10 text-[var(--color-accent)] backdrop-blur">{Icon ? <Icon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}</span>
                    <h3 className="mt-10 font-display text-2xl font-bold">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-white/75">{body}</p>
                    <span className="mt-5 inline-flex items-center text-sm font-bold text-[var(--color-accent)]">Explore solution <ArrowRight className="ml-1 h-4 w-4" /></span>
                  </div>
                </Link>
              );
            })}
          </div>
          {solarServices.length ? (
            <div className="mt-8 flex justify-center">
              <Button asChild variant="outline" className="rounded-full">
                <Link to="/services">See all solar services</Link>
              </Button>
            </div>
          ) : null}
        </div>
      </section>

      <section className="bg-[#f4f5ef]">
        <div className="container-page grid gap-12 py-16 lg:grid-cols-[.9fr_1.1fr] lg:items-center lg:py-24">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--color-primary)]">Designed around you</p>
            <h2 className="mt-4 font-display text-4xl font-bold leading-tight tracking-[-0.03em] sm:text-5xl">
              Start with your energy needs. We&apos;ll design the system around them.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">
              A good solar system starts with understanding your real loads. We assess what you need to power, when you need it and how much backup you expect before recommending a configuration.
            </p>
            <ul className="mt-7 space-y-3">
              {["Load assessment and system sizing", "Solar panel and inverter configuration", "Battery capacity planning", "Installation, commissioning and handover"].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm font-medium">
                  <CheckCircle2 className="h-5 w-5 text-[var(--color-primary)]" />
                  {item}
                </li>
              ))}
            </ul>
            <Button asChild className="mt-8 rounded-full bg-[var(--color-primary)] px-6 hover:bg-primary/90">
              <Link to="/request-quote">Request a site assessment</Link>
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="overflow-hidden rounded-[1.75rem] sm:translate-y-8">
              <img src="/images/inverter-installation.webp" alt="Hybrid inverter installation" className="aspect-[4/5] w-full object-cover" loading="lazy" />
            </div>
            <div className="rounded-[1.75rem] bg-[var(--color-primary)] p-7 text-white">
              <Sun className="h-8 w-8 text-[var(--color-accent)]" />
              <p className="mt-16 font-display text-3xl font-bold">Solar + storage</p>
              <p className="mt-4 text-sm leading-6 text-white/70">
                Capture solar energy during the day and use stored power when you need it most.
              </p>
              <div className="mt-8 border-t border-white/15 pt-5 text-sm text-white/80">
                Residential • Commercial • Essential-load backup
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-y">
        <div className="container-page">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <SectionHeading
              eyebrow="Solar installations"
              title="Work designed to perform in the real world."
              description="Explore selected solar installations and energy projects."
            />
            <Button asChild variant="outline" className="shrink-0 rounded-full">
              <Link to="/projects">View solar projects</Link>
            </Button>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {solarProjects.length ? solarProjects.map((project) => (
              <Link key={project.id} to="/projects/$slug" params={{ slug: project.slug }} className="group overflow-hidden rounded-2xl border border-border bg-white">
                <ImageBox src={project.hero_image_url} fallbackSrc="/images/solar-installation.webp" alt={project.title} className="aspect-[4/3] w-full transition-transform duration-500 group-hover:scale-105" />
                <div className="p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--color-primary)]">{project.location ?? "Nigeria"}</p>
                  <h3 className="mt-2 font-display text-lg font-bold">{project.title}</h3>
                </div>
              </Link>
            )) : (
              <div className="md:col-span-3 rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
                Solar project case studies will appear here as they are published.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="bg-[var(--footer-background)] text-white">
        <div className="container-page grid gap-10 py-16 lg:grid-cols-[1fr_auto] lg:items-center lg:py-20">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--color-accent)]">Ready to take control of your power?</p>
            <h2 className="mt-3 max-w-3xl font-display text-4xl font-bold tracking-[-0.03em] sm:text-5xl">
              Tell us what you want to power. We&apos;ll help you plan the system.
            </h2>
            <p className="mt-4 max-w-2xl text-white/70">
              Get a clear starting point for solar, inverter and battery storage requirements.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-full bg-[var(--color-accent)] px-7 text-[var(--heading-color)] hover:bg-accent/90">
              <Link to="/request-quote">Get a solar assessment</Link>
            </Button>
            {company?.phone ? (
              <Button asChild size="lg" variant="outline" className="rounded-full border-white/25 bg-transparent text-white hover:bg-white/10">
                <a href={telHref(company.phone)}><Phone className="mr-2 h-4 w-4" /> Call us</a>
              </Button>
            ) : null}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function slugOf(value: any) { return typeof value?.slug === "string" ? value.slug : ""; }
function fallbackService(slug?: string | null) { return serviceFallback(slug); }

export function serviceFallback(slug?: string | null) {
  if (!slug) return "/images/solar-installation.webp";
  if (slug.includes("inverter")) return "/images/inverter-installation.webp";
  if (slug.includes("battery")) return "/images/inverter-installation.webp";
  return "/images/solar-installation.webp";
}

export function projectFallback(_slug?: string | null) {
  return "/images/solar-installation.webp";
}

export function ServiceCard({ service }: { service: Service }) {
  return (
    <Link
      to="/services/$slug"
      params={{ slug: service.slug }}
      className="group overflow-hidden rounded-2xl border border-border bg-white"
    >
      <ImageBox
        src={service.hero_image_url}
        fallbackSrc={serviceFallback(service.slug)}
        alt={service.title}
        className="aspect-[16/10] w-full transition-transform duration-500 group-hover:scale-105"
      />
      <div className="p-5">
        <h3 className="font-display text-lg font-bold">{service.title}</h3>
        {service.short_description ? (
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">{service.short_description}</p>
        ) : null}
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-[var(--color-primary)]">
          Learn more <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      to="/projects/$slug"
      params={{ slug: project.slug }}
      className="group overflow-hidden rounded-2xl border border-border bg-white"
    >
      <ImageBox
        src={project.hero_image_url}
        fallbackSrc={projectFallback(project.slug)}
        alt={project.title}
        className="aspect-[16/10] w-full transition-transform duration-500 group-hover:scale-105"
      />
      <div className="p-5">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--color-primary)]">{project.location ?? "Nigeria"}</p>
        <h3 className="mt-2 font-display text-lg font-bold">{project.title}</h3>
      </div>
    </Link>
  );
}
