import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, ShieldCheck, Sun, Wrench, Zap } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { useSiteData } from "@/hooks/useSiteData";
import { useSiteContent } from "@/hooks/useSiteContent";
import { PageHeroCarousel } from "@/components/site/PageHeroCarousel";
import type { HeroContent, PageContent } from "@/types/db";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [
    { title: "About Zitso Energy | Solar Energy Company" },
    { name: "description", content: "Learn about Zitso Energy and our approach to reliable solar power, battery storage and inverter systems." },
  ]}),
  component: AboutPage,
});

const FALLBACK_HERO: HeroContent["slides"] = [
  { image_url: "/images/solar-installation.webp", eyebrow: "About Zitso Energy", headline: "Building a more dependable way to power everyday life.", subheadline: "We focus on practical solar energy systems that give households and businesses greater control over their electricity." },
  { image_url: "/images/inverter-installation.webp", eyebrow: "Designed around real usage", headline: "Solar systems sized for the loads that matter most.", subheadline: "From assessment and sizing to installation and maintenance, we build around how you actually use power." },
  { image_url: "/images/commercial-project.webp", eyebrow: "Residential • Commercial • Industrial", headline: "Energy infrastructure built for long-term performance.", subheadline: "Quality components, careful installation and ongoing support for dependable solar power." },
];

function AboutPage() {
  const { company } = useSiteData();
  const { get } = useSiteContent();
  const hero = get<HeroContent>("about_hero", {});
  const content = get<PageContent>("page_about", {});
  const approachTitle = content.headline || "Solar should be designed around the customer, not the other way around.";
  const approachBody = content.body || "We start by understanding your real energy usage, then size the generation, inverter and storage components around the loads that matter most to you.";

  return (
    <SiteLayout>
      <PageHeroCarousel hero={hero} fallbackSlides={FALLBACK_HERO} primaryHref="/request-quote" secondaryHref="/services" />

      <section className="section-y">
        <div className="container-page grid gap-12 lg:grid-cols-[1fr_.8fr] lg:items-start">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-primary)]">{content.eyebrow || "Our approach"}</p>
            <h2 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">{approachTitle}</h2>
            <div className="mt-6 space-y-4 text-base leading-7 text-muted-foreground">
              <p>{company?.description || "Zitso Energy provides solar installation, hybrid inverter systems, battery storage and ongoing maintenance for homes and businesses."}</p>
              <p>{approachBody}</p>
            </div>
          </div>
          <div className="rounded-3xl bg-[#f4f5ef] p-7">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--color-primary)]">What we stand for</p>
            <ul className="mt-6 space-y-5">
              {[
                { title: "Reliability", body: "Systems designed for consistent everyday performance.", Icon: ShieldCheck },
                { title: "Clarity", body: "Straightforward recommendations based on your actual needs.", Icon: Sun },
                { title: "Care", body: "Installation, commissioning and maintenance with long-term performance in mind.", Icon: Wrench },
              ].map(({ title, body, Icon }) => (
                <li key={title} className="flex gap-4"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-[var(--color-primary)]"><Icon className="h-4 w-4" /></span><div><h3 className="font-display font-bold">{title}</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">{body}</p></div></li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-white">
        <div className="container-page grid gap-0 md:grid-cols-3">
          {[
            { title: "Solar generation", body: "Capture clean energy from the sun and reduce dependence on grid and generator power.", Icon: Sun },
            { title: "Smart power management", body: "Use hybrid inverters to coordinate solar, battery, grid and essential loads.", Icon: Zap },
            { title: "Long-term support", body: "Keep your system healthy with inspections, troubleshooting and maintenance.", Icon: CheckCircle2 },
          ].map(({ title, body, Icon }) => (
            <div key={title} className="border-b border-border p-7 md:border-b-0 md:border-r last:md:border-r-0 lg:p-9"><Icon className="h-6 w-6 text-[var(--color-primary)]" /><h3 className="mt-6 font-display text-xl font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p></div>
          ))}
        </div>
      </section>

      <section className="bg-[var(--footer-background)] text-white">
        <div className="container-page flex flex-col gap-6 py-14 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="font-display text-3xl font-bold">{content.cta || "Let's plan your solar system."}</h2><p className="mt-2 text-white/65">{content.subheadline || "Tell us what you need to power and where you are located."}</p></div>
          <Button asChild size="lg" className="rounded-full bg-[var(--color-accent)] px-7 text-[var(--heading-color)] hover:bg-accent/90"><Link to={content.primary_cta_url || "/request-quote"}>{content.primary_cta || "Get a solar assessment"}</Link></Button>
        </div>
      </section>
    </SiteLayout>
  );
}
