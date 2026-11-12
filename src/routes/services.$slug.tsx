import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, MessageCircle, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useSiteData } from "@/hooks/useSiteData";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Breadcrumbs, EmptyState, ImageBox, SectionHeading } from "@/components/site/shared";
import { ServiceCard, serviceFallback } from "@/routes/index";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { formatCurrency, telHref, whatsappHref } from "@/lib/format";
import { asStringArray, type Faq, type Service, type TitledItem } from "@/types/db";
import { createPageHead, safeJsonLd, SITE_ORIGIN } from "@/lib/seo";

const SOLAR_RE = /(solar|inverter|battery|energy storage|backup power|pv|photovoltaic|maintenance|hybrid system)/i;

export const Route = createFileRoute("/services/$slug")({
  loader: async ({ params }) => {
    try {
      const { data } = await supabase.from("services").select("*").eq("slug", params.slug).eq("published", true).maybeSingle();
      return { seoLookupFailed: false, seoService: data as Service | null };
    } catch {
      return { seoLookupFailed: true, seoService: null as Service | null };
    }
  },
  head: ({ loaderData, params }) => {
    const service = loaderData?.seoService;
    return createPageHead({
      title: service?.seo_title || (service ? `${service.title} | Solar & Inverter Services | Zitso Energy` : "Solar Service | Zitso Energy"),
      description: service?.seo_description || service?.short_description || service?.full_description || "Explore solar installation, inverter, battery storage and maintenance services from Zitso Energy.",
      path: `/services/${encodeURIComponent(params.slug)}`,
      image: service?.og_image_url || service?.hero_image_url,
      noIndex: !service && !loaderData?.seoLookupFailed,
    });
  },
  component: ServiceDetail,
});

function ServiceDetail() {
  const { seoService: service, seoLookupFailed } = Route.useLoaderData();
  const { company } = useSiteData();

  const { data: faqs } = useSupabaseData<Faq[]>(
    () =>
      supabase
        .from("faqs")
        .select("*")
        .eq("published", true)
        .eq("service_id", service?.id ?? "00000000-0000-0000-0000-000000000000")
        .order("sort_order"),
    [service?.id],
  );

  const { data: related } = useSupabaseData<Service[]>(
    () =>
      supabase
        .from("services")
        .select("*")
        .eq("published", true)
        .neq("id", service?.id ?? "00000000-0000-0000-0000-000000000000")
        .order("sort_order")
        .limit(3),
    [service?.id],
  );

  if (seoLookupFailed) {
    return (
      <SiteLayout>
        <div className="container-page section-y">
          <EmptyState title="Service details are temporarily unavailable" description="Please try again shortly or contact Zitso Energy for information about this service." action={<Button asChild><Link to="/contact">Contact Zitso Energy</Link></Button>} />
        </div>
      </SiteLayout>
    );
  }

  if (!service) {
    return (
      <SiteLayout>
        <div className="container-page section-y">
          <EmptyState
            title="Service not found"
            description="This service may have been unpublished or moved."
            action={
              <Button asChild>
                <Link to="/services">Back to services</Link>
              </Button>
            }
          />
        </div>
      </SiteLayout>
    );
  }

  const relatedSolar = (related ?? []).filter((item) =>
    SOLAR_RE.test(`${item.title} ${item.short_description ?? ""} ${item.full_description ?? ""}`),
  );

  const features = asStringArray(service.features);
  const benefits = asStringArray(service.benefits);
  const gallery = asStringArray(service.gallery);
  const steps = Array.isArray(service.process_steps)
    ? (service.process_steps as unknown as TitledItem[])
    : [];

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.seo_description || service.short_description || service.full_description,
    url: `${SITE_ORIGIN}/services/${encodeURIComponent(service.slug)}`,
    ...(service.hero_image_url ? { image: service.hero_image_url } : {}),
    provider: { "@type": "Organization", name: "Zitso Energy", url: SITE_ORIGIN },
    areaServed: { "@type": "Country", name: "Nigeria" },
    serviceType: service.title,
  };

  return (
    <SiteLayout whatsappContext={service.title}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(serviceSchema) }} />
      <section className="border-b border-border bg-secondary">
        <div className="container-page py-10">
          <Breadcrumbs
            items={[
              { label: "Home", to: "/" },
              { label: "Services", to: "/services" },
              { label: service.title },
            ]}
          />
          <div className="mt-4 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="min-w-0">
              <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {service.title}
              </h1>
              {service.short_description ? (
                <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                  {service.short_description}
                </p>
              ) : null}
              {service.show_price && service.starting_price ? (
                <p className="mt-4 text-sm font-semibold text-foreground">
                  From{" "}
                  {formatCurrency(
                    Number(service.starting_price),
                    company?.currency ?? "NGN",
                    company?.currency_symbol ?? "₦",
                  )}
                </p>
              ) : null}
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link to="/request-quote" search={{ service: service.slug }}>
                    {service.cta_text ?? "Start a solar enquiry"}
                  </Link>
                </Button>
                {company?.whatsapp ? (
                  <Button asChild size="lg" variant="outline">
                    <a
                      href={whatsappHref(
                        company.whatsapp,
                        `${company.whatsapp_default_message ?? "Hello, I would like to request a solar enquiry"} for ${service.title}.`,
                      )}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp us
                    </a>
                  </Button>
                ) : null}
              </div>
            </div>
            <ImageBox
              src={service.hero_image_url}
              fallbackSrc={serviceFallback(service.slug)}
              alt={service.title}
              eager
              className="aspect-[4/3] w-full rounded-lg border border-border"
            />
          </div>
        </div>
      </section>

      <section className="section-y">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_320px] lg:items-start">
          <div className="min-w-0 space-y-12">
            {service.full_description ? (
              <div className="prose-block whitespace-pre-line text-base leading-relaxed text-muted-foreground">
                {service.full_description}
              </div>
            ) : null}

            {benefits.length ? (
              <div>
                <h2 className="font-display text-xl font-semibold text-foreground">Key benefits</h2>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {benefits.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm text-foreground">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {features.length ? (
              <div>
                <h2 className="font-display text-xl font-semibold text-foreground">
                  What&apos;s included
                </h2>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {features.map((f) => (
                    <li
                      key={f}
                      className="rounded-md border border-border bg-background px-4 py-3 text-sm text-foreground"
                    >
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {steps.length ? (
              <div>
                <h2 className="font-display text-xl font-semibold text-foreground">Our process</h2>
                <ol className="mt-4 grid gap-4 sm:grid-cols-2">
                  {steps.map((step, i) => (
                    <li key={step.title ?? i} className="surface-panel p-5">
                      <span className="font-display text-sm font-bold text-accent">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h3 className="mt-1.5 font-display text-sm font-semibold text-foreground">
                        {step.title}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        {step.body}
                      </p>
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}

            {gallery.length ? (
              <div>
                <h2 className="font-display text-xl font-semibold text-foreground">Gallery</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {gallery.map((src, i) => (
                    <ImageBox
                      key={src}
                      src={src}
                      alt={`${service.title} image ${i + 1}`}
                      className="aspect-[4/3] w-full rounded-lg border border-border"
                    />
                  ))}
                </div>
              </div>
            ) : null}

            {faqs?.length ? (
              <div>
                <h2 className="font-display text-xl font-semibold text-foreground">
                  Frequently asked questions
                </h2>
                <Accordion type="single" collapsible className="mt-4">
                  {faqs.map((f) => (
                    <AccordionItem key={f.id} value={f.id}>
                      <AccordionTrigger className="text-left text-sm font-semibold">
                        {f.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                        {f.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ) : null}
          </div>

          <aside className="lg:sticky lg:top-24">
            <div className="surface-panel space-y-4 p-6">
              <h2 className="font-display text-base font-semibold text-foreground">
                Start a solar enquiry
              </h2>
              <p className="text-sm text-muted-foreground">
                Tell us about your site and requirements. We respond with a clear scope and price.
              </p>
              <Button asChild className="w-full">
                <Link to="/request-quote" search={{ service: service.slug }}>
                  Start a solar enquiry
                </Link>
              </Button>
              {company?.phone ? (
                <Button asChild variant="outline" className="w-full">
                  <a href={telHref(company.phone)}>
                    <Phone className="mr-2 h-4 w-4" /> {company.phone}
                  </a>
                </Button>
              ) : null}
              <Button asChild variant="ghost" className="w-full">
                <Link to="/contact">Contact our team</Link>
              </Button>
            </div>
          </aside>
        </div>
      </section>

      {relatedSolar.length ? (
        <section className="section-y border-t border-border bg-secondary">
          <div className="container-page">
            <SectionHeading eyebrow="More" title="Related services" />
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {relatedSolar.map((s) => (
                <ServiceCard key={s.id} service={s} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </SiteLayout>
  );
}
