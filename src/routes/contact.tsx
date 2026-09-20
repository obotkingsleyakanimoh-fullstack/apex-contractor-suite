import { createFileRoute } from "@tanstack/react-router";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { useSiteData } from "@/hooks/useSiteData";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ContactForm } from "@/components/site/ContactForm";
import { DistanceChecker } from "@/components/site/DistanceChecker";
import { Breadcrumbs } from "@/components/site/shared";
import { Button } from "@/components/ui/button";
import { mailtoHref, telHref, whatsappHref } from "@/lib/format";
import { directionsUrl, mapEmbedUrl } from "@/lib/geo";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — Office, Phone, WhatsApp & Email" },
      {
        name: "description",
        content:
          "Get in touch with our team: office address, phone, WhatsApp, email, business hours and a contact form.",
      },
      { property: "og:title", content: "Contact Us" },
      {
        property: "og:description",
        content: "Office address, phone, WhatsApp, email and business hours.",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { company, office, hours, socials } = useSiteData();
  const address =
    office?.address ??
    [company?.address, company?.city, company?.state].filter(Boolean).join(", ");
  const embed = office ? mapEmbedUrl(office) : null;

  return (
    <SiteLayout>
      <section className="border-b border-border bg-secondary">
        <div className="container-page py-10">
          <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Contact" }]} />
          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Contact us
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Speak to our team about a project, a site visit or an existing installation.
          </p>
        </div>
      </section>

      <section className="section-y">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_360px] lg:items-start">
          <div className="min-w-0">
            <h2 className="font-display text-xl font-semibold text-foreground">Send a message</h2>
            <div className="mt-4">
              <ContactForm />
            </div>
          </div>

          <aside className="space-y-5">
            <div className="surface-panel space-y-4 p-6">
              {company?.company_name ? (
                <p className="font-display text-base font-semibold text-foreground">
                  {company.company_name}
                </p>
              ) : null}
              {address ? (
                <p className="flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
                  {address}
                </p>
              ) : null}
              {company?.phone ? (
                <a
                  href={telHref(company.phone)}
                  className="flex items-center gap-2 text-sm font-medium text-foreground"
                >
                  <Phone className="h-4 w-4 text-accent" aria-hidden /> {company.phone}
                </a>
              ) : null}
              {company?.email ? (
                <a
                  href={mailtoHref(company.email)}
                  className="flex items-center gap-2 break-all text-sm font-medium text-foreground"
                >
                  <Mail className="h-4 w-4 text-accent" aria-hidden /> {company.email}
                </a>
              ) : null}
              {company?.whatsapp ? (
                <Button asChild variant="outline" className="w-full">
                  <a
                    href={whatsappHref(company.whatsapp, company.whatsapp_default_message ?? "")}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp us
                  </a>
                </Button>
              ) : null}
              {office ? (
                <Button asChild className="w-full">
                  <a href={directionsUrl(office)} target="_blank" rel="noreferrer noopener">
                    Get directions
                  </a>
                </Button>
              ) : null}
            </div>

            {hours.length ? (
              <div className="surface-panel p-6">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Clock className="h-4 w-4 text-accent" aria-hidden /> Business hours
                </h2>
                <ul className="mt-3 space-y-1.5 text-sm">
                  {hours.map((h) => (
                    <li key={h.id} className="flex justify-between gap-4">
                      <span className="text-muted-foreground">{h.label}</span>
                      <span className="font-medium text-foreground">
                        {h.is_closed ? "Closed" : `${h.open_time ?? ""} – ${h.close_time ?? ""}`}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {socials.length ? (
              <div className="surface-panel p-6">
                <h2 className="text-sm font-semibold text-foreground">Follow us</h2>
                <ul className="mt-3 space-y-1.5 text-sm">
                  {socials.map((s) => (
                    <li key={s.id}>
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {s.platform}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {office ? <DistanceChecker office={office} /> : null}
          </aside>
        </div>
      </section>

      {embed ? (
        <section className="border-t border-border">
          <iframe
            title="Office location map"
            src={embed}
            loading="lazy"
            className="h-[320px] w-full border-0"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </section>
      ) : null}
    </SiteLayout>
  );
}
