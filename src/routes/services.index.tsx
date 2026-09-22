import { createFileRoute } from "@tanstack/react-router";
import { BatteryCharging, Sun, Wrench, Zap, ArrowRight, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { PageHeroCarousel } from "@/components/site/PageHeroCarousel";
import { useSiteContent } from "@/hooks/useSiteContent";
import { Link } from "@tanstack/react-router";
import type { HeroContent, Service } from "@/types/db";

const SOLAR_RE = /(solar|inverter|battery|energy storage|backup power|pv|photovoltaic|maintenance|hybrid system)/i;

export const Route = createFileRoute("/services/")({
  head: () => ({
    meta: [
      { title: "Solar Solutions | Zitso Energy" },
      {
        name: "description",
        content: "Solar installation, hybrid inverter systems, battery storage, energy assessment and solar maintenance.",
      },
    ],
  }),
  component: ServicesPage,
});


const FALLBACK_HERO: HeroContent["slides"] = [
  { image_url: "/images/solar-installation.webp", eyebrow: "Solar solutions • Zitso Energy", headline: "Power your home and business with energy you can depend on.", subheadline: "From solar PV and hybrid inverters to battery storage and maintenance, we design practical energy systems around the way you use power." },
  { image_url: "/images/inverter-installation.webp", eyebrow: "Hybrid power • Battery storage", headline: "Keep essential power running when the grid cannot.", subheadline: "Intelligent inverter and battery systems designed around the loads that matter most to your home or business." },
  { image_url: "/images/commercial-project.webp", eyebrow: "Residential • Commercial • Industrial", headline: "A complete solar solution from assessment to after-sales care.", subheadline: "We assess your energy needs, size the system, install it carefully and support its performance over time." },
];

function ServicesPage() {
  const { get } = useSiteContent();
  const hero = get<HeroContent>("services_hero", get<HeroContent>("homepage_hero", {}));
  const { data: services } = useSupabaseData<Service[]>(
    () => supabase.from("services").select("*").eq("published", true).order("featured", { ascending: false }).order("sort_order"),
    [],
  );

  const databaseServices = (services ?? []).filter((s) =>
    SOLAR_RE.test(`${s.title} ${s.short_description ?? ""} ${s.full_description ?? ""}`),
  );

  const fallbackSolutions = [
    { icon: Sun, title: "Solar PV installation", body: "Complete solar panel systems, professionally designed and installed for residential and commercial applications.", image: "/images/solar-installation.webp" },
    { icon: Zap, title: "Hybrid inverter systems", body: "Intelligent power management combining solar, battery storage and grid or generator input.", image: "/images/inverter-installation.webp" },
    { icon: BatteryCharging, title: "Battery energy storage", body: "Right-sized battery banks that store solar energy and provide dependable backup for essential loads.", image: "/images/inverter-installation.webp" },
    { icon: Wrench, title: "Solar maintenance", body: "System inspection, diagnostics, servicing and performance checks to keep your installation dependable.", image: "/images/solar-installation.webp" },
    { icon: ShieldCheck, title: "Energy assessment", body: "A practical review of your loads, usage patterns and backup requirements before system design.", image: "/images/commercial-project.webp" },
  ];
  const displayServices = databaseServices.length
    ? databaseServices.map((service) => ({ title: service.title, body: service.short_description || service.full_description || "Solar energy solution by Zitso Energy.", image: service.hero_image_url || "/images/solar-installation.webp", href: service.slug }))
    : fallbackSolutions;

  return (
    <SiteLayout>
      <PageHeroCarousel hero={hero} fallbackSlides={FALLBACK_HERO} primaryHref="/request-quote" secondaryHref="/contact" primaryLabel="Get a solar assessment" secondaryLabel="Talk to Zitso Energy" />

      <section className="section-y">
        <div className="container-page">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-primary)]">What we provide</p>
            <h2 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">Solar services built around reliability.</h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              From the first load assessment to installation and maintenance, every stage is focused on a system that works for your actual energy needs.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {displayServices.map((service, index) => {
              const fallback = fallbackSolutions[index % fallbackSolutions.length];
              const Icon = "icon" in service ? service.icon : fallback.icon;
              const title = service.title;
              const body = service.body;
              const image = service.image;
              const href = "href" in service ? `/services/${service.href}` : "/request-quote";
              return (
              <article key={title} className="group relative min-h-[390px] overflow-hidden rounded-[1.35rem] border border-border bg-[var(--footer-background)] shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
                <div className="absolute inset-0">
                  <img
                    src={image}
                    alt={title}
                    className="h-full w-full object-cover opacity-75 transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0" style={{ background: `linear-gradient(0deg, color-mix(in srgb, var(--hero-overlay) 82%, transparent), transparent 58%, color-mix(in srgb, var(--hero-overlay) 10%, transparent))` }} />
                </div>
                <div className="relative flex min-h-[390px] flex-col justify-end p-7 text-white">
                  <span className="mb-auto grid h-12 w-12 place-items-center rounded-xl border border-white/20 bg-white/10 text-[var(--color-accent)] backdrop-blur"><Icon className="h-5 w-5" /></span>
                  <h3 className="mt-10 font-display text-2xl font-bold">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/75">{body}</p>
                  <Link to={href as never} className="mt-6 inline-flex items-center text-sm font-bold text-[var(--color-accent)]">
                    Explore this solution <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </article>
            );
            })}
          </div>

        </div>
      </section>

      <section className="bg-[#f4f5ef]">
        <div className="container-page flex flex-col gap-7 py-16 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-primary)]">Next step</p>
            <h2 className="mt-2 font-display text-3xl font-bold">Not sure what size system you need?</h2>
            <p className="mt-2 text-muted-foreground">Start with an assessment. We&apos;ll work from your real loads and backup goals.</p>
          </div>
          <Button asChild size="lg" className="rounded-full bg-[var(--color-primary)] px-7 hover:bg-primary/90">
            <Link to="/request-quote">Start a solar assessment</Link>
          </Button>
        </div>
      </section>
    </SiteLayout>
  );
}
