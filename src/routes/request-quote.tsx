import { createFileRoute } from "@tanstack/react-router";
import { BatteryCharging, CheckCircle2, Clock, ShieldCheck, Sun, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useSiteContent } from "@/hooks/useSiteContent";
import { useSiteData } from "@/hooks/useSiteData";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHeroCarousel } from "@/components/site/PageHeroCarousel";
import { QuoteForm } from "@/components/site/QuoteForm";
import type { HeroContent, Service } from "@/types/db";

const SOLAR_RE =
  /(solar|inverter|battery|energy storage|backup power|pv|photovoltaic|maintenance|hybrid system)/i;

const FALLBACK_HERO: HeroContent["slides"] = [
  {
    image_url: "/images/solar-installation.webp",
    eyebrow: "Free solar assessment",
    headline: "Request a Quote",
    subheadline:
      "Tell us what you want to power and we will help you plan the right solar, inverter and battery solution.",
  },
  {
    image_url: "/images/inverter-installation.webp",
    eyebrow: "Inverter • Battery • Backup",
    headline: "Request a Quote",
    subheadline:
      "Share your backup goals, essential loads and location so we can understand the system you need.",
  },
  {
    image_url: "/images/commercial-project.webp",
    eyebrow: "Residential • Commercial • Industrial",
    headline: "Request a Quote",
    subheadline:
      "Start with an assessment for a solar energy system designed around the way your home or business operates.",
  },
];

export const Route = createFileRoute("/request-quote")({
  validateSearch: (search: Record<string, unknown>): { service?: string } =>
    typeof search.service === "string" ? { service: search.service } : {},
  head: () => ({
    meta: [
      { title: "Request a Quote | Zitso Energy" },
      {
        name: "description",
        content:
          "Tell Zitso Energy what you need to power and request a solar, inverter or battery system assessment.",
      },
    ],
  }),
  component: RequestQuotePage,
});

function RequestQuotePage() {
  const { company } = useSiteData();
  const { service: serviceSlug } = Route.useSearch();
  const { get } = useSiteContent();
  const hero = get<HeroContent>("request_quote_hero", {});

  const { data: services } = useSupabaseData<Service[]>(
    () => supabase.from("services").select("*").eq("published", true).order("sort_order"),
    [],
  );

  const solarServices = (services ?? []).filter((s) =>
    SOLAR_RE.test(`${s.title} ${s.short_description ?? ""} ${s.full_description ?? ""}`),
  );
  const selected = solarServices.find((s) => s.slug === serviceSlug);

  return (
    <SiteLayout whatsappContext={selected?.title}>
      <PageHeroCarousel
        hero={hero}
        fallbackSlides={FALLBACK_HERO}
        primaryHref="/request-quote#quote-form"
        secondaryHref="/services"
        primaryLabel="Submit your enquiry"
        secondaryLabel="Explore solar solutions"
      />

      <section id="quote-form" className="section-y scroll-mt-20">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_310px] lg:items-start">
          <div>
            <div className="mb-7">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-primary)]">
                Solar enquiry
              </p>
              <h2 className="mt-2 font-display font-bold">
                Tell us what you want to power
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                The more useful information you provide, the easier it is for us to understand your requirements.
              </p>
            </div>
            <QuoteForm defaultServiceId={selected?.id} />
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24">
            {[
              { Icon: Sun, title: "Solar generation", body: "Panel sizing and generation planning." },
              { Icon: Zap, title: "Inverter systems", body: "Hybrid and backup power configuration." },
              { Icon: BatteryCharging, title: "Battery storage", body: "Storage sized around the loads you want backed up." },
            ].map(({ Icon, title, body }) => (
              <div key={title} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <Icon className="h-5 w-5 text-[var(--color-primary)]" />
                <h3 className="mt-4 font-display font-bold">{title}</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{body}</p>
              </div>
            ))}
            <div className="rounded-2xl bg-secondary p-5 text-sm">
              <p className="flex gap-2 font-semibold">
                <ShieldCheck className="h-4 w-4 text-[var(--color-primary)]" /> Your information
              </p>
              <p className="mt-2 leading-6 text-muted-foreground">
                Your enquiry details are used to respond to your request and plan the next step.
              </p>
            </div>
            {company?.phone ? (
              <div className="rounded-2xl bg-[var(--footer-background)] p-5 text-white">
                <p className="flex gap-2 text-sm font-semibold">
                  <Clock className="h-4 w-4 text-[var(--color-accent)]" /> Prefer to speak?
                </p>
                <p className="mt-2 text-sm text-white/65">
                  Call {company.phone} and tell us you&apos;re enquiring about solar.
                </p>
              </div>
            ) : null}
          </aside>
        </div>
      </section>
    </SiteLayout>
  );
}
