import { createFileRoute } from "@tanstack/react-router";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { useSiteData } from "@/hooks/useSiteData";
import { useSiteContent } from "@/hooks/useSiteContent";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ContactForm } from "@/components/site/ContactForm";
import { DistanceChecker } from "@/components/site/DistanceChecker";
import { PageHeroCarousel } from "@/components/site/PageHeroCarousel";
import { Button } from "@/components/ui/button";
import { mailtoHref, telHref, whatsappHref } from "@/lib/format";
import { directionsUrl, mapEmbedUrl } from "@/lib/geo";
import type { HeroContent } from "@/types/db";

export const Route = createFileRoute("/contact")({ head: () => ({ meta: [
  { title: "Contact Zitso Energy — Solar Support & Enquiries" },
  { name: "description", content: "Speak with Zitso Energy about solar installation, inverter systems, battery storage, maintenance or an existing solar system." },
]}), component: ContactPage });

const FALLBACK_HERO: HeroContent["slides"] = [
  { image_url: "/images/solar-installation.webp", eyebrow: "Talk to Zitso Energy", headline: "Let's plan the right solar system for your needs.", subheadline: "Tell us what you want to power, where you are located and what kind of backup you need." },
  { image_url: "/images/inverter-installation.webp", eyebrow: "Solar • Inverter • Battery", headline: "Have a question about an existing system?", subheadline: "Speak with our team about installation, diagnostics, maintenance or battery and inverter upgrades." },
  { image_url: "/images/commercial-project.webp", eyebrow: "Homes • Businesses • Facilities", headline: "Start with a conversation about your energy use.", subheadline: "We can help you understand the next practical step before you commit to a system." },
];

function ContactPage() {
  const { company, office, hours, socials } = useSiteData();
  const { get } = useSiteContent();
  const hero = get<HeroContent>("contact_hero", {});
  const address = office?.address ?? [company?.address, company?.city, company?.state].filter(Boolean).join(", ");
  const embed = office ? mapEmbedUrl(office) : null;

  return <SiteLayout>
    <PageHeroCarousel hero={hero} fallbackSlides={FALLBACK_HERO} primaryHref="/request-quote" secondaryHref="#contact-form" primaryLabel="Request a solar assessment" secondaryLabel="Send us a message" />
    <section id="contact-form" className="section-y scroll-mt-20">
      <div className="container-page grid gap-10 lg:grid-cols-[1fr_360px] lg:items-start">
        <div className="min-w-0"><h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{hero.secondary_cta || "Send a message"}</h2><p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">Use the enquiry form and our team can follow up about your solar, inverter, battery or maintenance needs.</p><div className="mt-6"><ContactForm /></div></div>
        <aside className="space-y-5">
          <div className="surface-panel space-y-4 p-6">
            {company?.company_name ? <p className="font-display text-base font-semibold text-foreground">{company.company_name}</p> : null}
            {address ? <p className="flex items-start gap-2 text-sm text-muted-foreground"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />{address}</p> : null}
            {company?.phone ? <a href={telHref(company.phone)} className="flex items-center gap-2 text-sm font-medium text-foreground"><Phone className="h-4 w-4 text-accent" />{company.phone}</a> : null}
            {company?.email ? <a href={mailtoHref(company.email)} className="flex items-center gap-2 break-all text-sm font-medium text-foreground"><Mail className="h-4 w-4 text-accent" />{company.email}</a> : null}
            {company?.whatsapp ? <Button asChild variant="outline" className="w-full"><a href={whatsappHref(company.whatsapp, company.whatsapp_default_message ?? "")} target="_blank" rel="noreferrer noopener"><MessageCircle className="mr-2 h-4 w-4" />WhatsApp us</a></Button> : null}
            {office ? <Button asChild className="w-full"><a href={directionsUrl(office)} target="_blank" rel="noreferrer noopener">Get directions</a></Button> : null}
          </div>
          {hours.length ? <div className="surface-panel p-6"><h2 className="flex items-center gap-2 text-sm font-semibold"><Clock className="h-4 w-4 text-accent" />Business hours</h2><ul className="mt-3 space-y-1.5 text-sm">{hours.map((h) => <li key={h.id} className="flex justify-between gap-4"><span className="text-muted-foreground">{h.label}</span><span className="font-medium">{h.is_closed ? "Closed" : `${h.open_time ?? ""} – ${h.close_time ?? ""}`}</span></li>)}</ul></div> : null}
          {socials.length ? <div className="surface-panel p-6"><h2 className="text-sm font-semibold">Follow us</h2><ul className="mt-3 space-y-1.5 text-sm">{socials.map((s) => <li key={s.id}><a href={s.url} target="_blank" rel="noreferrer noopener" className="text-muted-foreground hover:text-foreground">{s.platform}</a></li>)}</ul></div> : null}
          {office ? <DistanceChecker office={office} /> : null}
        </aside>
      </div>
    </section>
    {embed ? <section className="border-t border-border"><iframe title="Office location map" src={embed} loading="lazy" className="h-[360px] w-full border-0" referrerPolicy="no-referrer-when-downgrade" /></section> : null}
  </SiteLayout>;
}
