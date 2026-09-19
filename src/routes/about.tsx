import { createFileRoute, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useSiteContent } from "@/hooks/useSiteContent";
import { useSiteData } from "@/hooks/useSiteData";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Breadcrumbs, SectionHeading } from "@/components/site/shared";
import { Button } from "@/components/ui/button";
import type { SectionContent, StatsContent, Testimonial } from "@/types/db";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — Nigerian Engineering & Property Services Contractor" },
      {
        name: "description",
        content:
          "Who we are: an engineering-led contractor delivering solar energy, electrical works, contract painting and epoxy flooring with supervised crews.",
      },
      { property: "og:title", content: "About Us" },
      {
        property: "og:description",
        content: "An engineering-led Nigerian contractor for solar, electrical, painting and flooring.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { company } = useSiteData();
  const { get } = useSiteContent();
  const about = get<SectionContent>("page_about", {});
  const why = get<SectionContent>("homepage_why", {});
  const stats = get<StatsContent>("homepage_stats", {});

  const { data: testimonials } = useSupabaseData<Testimonial[]>(
    () => supabase.from("testimonials").select("*").eq("published", true).order("sort_order"),
    [],
  );

  return (
    <SiteLayout>
      <section className="border-b border-border bg-secondary">
        <div className="container-page py-10">
          <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "About" }]} />
          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {about.title ?? "About the company"}
          </h1>
          {company?.tagline ? (
            <p className="mt-3 max-w-2xl text-base text-muted-foreground">{company.tagline}</p>
          ) : null}
        </div>
      </section>

      <section className="section-y">
        <div className="container-page grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="min-w-0 whitespace-pre-line text-base leading-relaxed text-muted-foreground">
            {about.body ?? company?.description ?? ""}
          </div>
          {stats.items?.length ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {stats.items.map((item) => (
                <div key={item.label} className="surface-panel p-5">
                  <p className="font-display text-2xl font-bold text-foreground">{item.value}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{item.label}</p>
                </div>
              ))}
              {stats.note ? (
                <p className="text-xs text-muted-foreground sm:col-span-2">{stats.note}</p>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>

      {why.items?.length ? (
        <section className="section-y border-y border-border bg-secondary">
          <div className="container-page">
            <SectionHeading eyebrow="Our approach" title={why.title ?? "How we work"} />
            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              {why.items.map((item) => (
                <div key={item.title} className="surface-panel p-6">
                  <h3 className="font-display text-base font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {testimonials?.length ? (
        <section className="section-y">
          <div className="container-page">
            <SectionHeading eyebrow="Client feedback" title="What clients say" />
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((t) => (
                <figure key={t.id} className="surface-panel flex h-full flex-col gap-4 p-6">
                  <blockquote className="flex-1 text-sm leading-relaxed text-foreground">
                    {t.content}
                  </blockquote>
                  <figcaption className="text-sm">
                    <span className="font-semibold text-foreground">{t.customer_name}</span>
                    {t.customer_company || t.customer_location ? (
                      <span className="block text-muted-foreground">
                        {[t.customer_company, t.customer_location].filter(Boolean).join(" · ")}
                      </span>
                    ) : null}
                    {t.is_demo ? (
                      <span className="mt-2 inline-block rounded bg-muted px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        Demo placeholder
                      </span>
                    ) : null}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="bg-primary text-primary-foreground">
        <div className="container-page flex flex-col gap-5 py-12 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-display text-2xl font-bold">Let&apos;s discuss your project</h2>
          <Button asChild size="lg">
            <Link to="/request-quote">Request a Quote</Link>
          </Button>
        </div>
      </section>
    </SiteLayout>
  );
}
