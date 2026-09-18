import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, MapPin, Phone, Quote, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useSiteContent } from "@/hooks/useSiteContent";
import { useSiteData } from "@/hooks/useSiteData";
import { SiteLayout } from "@/components/site/SiteLayout";
import {
  CardGridSkeleton,
  ImageBox,
  SectionHeading,
  EmptyState,
} from "@/components/site/shared";
import { Button } from "@/components/ui/button";
import { telHref } from "@/lib/format";
import type {
  HeroContent,
  Project,
  SectionContent,
  Service,
  ServiceArea,
  StatsContent,
  Testimonial,
} from "@/types/db";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Solar, Painting, Epoxy Flooring & Electrical Contractors" },
      {
        name: "description",
        content:
          "Engineering-led solar installation, electrical works, contract painting and industrial epoxy flooring for homes, offices and industrial facilities.",
      },
      {
        property: "og:title",
        content: "Solar, Painting, Epoxy Flooring & Electrical Contractors",
      },
      {
        property: "og:description",
        content:
          "Supervised crews delivering solar energy, electrical works, painting and epoxy flooring to a documented standard.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { company } = useSiteData();
  const { get, loading: contentLoading } = useSiteContent();

  const hero = get<HeroContent>("homepage_hero", {});
  const stats = get<StatsContent>("homepage_stats", {});
  const why = get<SectionContent>("homepage_why", {});
  const process = get<SectionContent>("homepage_process", {});
  const cta = get<SectionContent>("homepage_cta", {});

  const { data: services, loading: servicesLoading } = useSupabaseData<Service[]>(
    () =>
      supabase
        .from("services")
        .select("*")
        .eq("published", true)
        .order("featured", { ascending: false })
        .order("sort_order")
        .limit(6),
    [],
  );

  const { data: projects, loading: projectsLoading } = useSupabaseData<Project[]>(
    () =>
      supabase
        .from("projects")
        .select("*")
        .eq("published", true)
        .order("featured", { ascending: false })
        .order("sort_order")
        .limit(3),
    [],
  );

  const { data: testimonials } = useSupabaseData<Testimonial[]>(
    () =>
      supabase
        .from("testimonials")
        .select("*")
        .eq("published", true)
        .order("sort_order")
        .limit(3),
    [],
  );

  const { data: areas } = useSupabaseData<ServiceArea[]>(
    () =>
      supabase
        .from("service_areas")
        .select("*")
        .eq("published", true)
        .order("priority")
        .limit(12),
    [],
  );

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="border-b border-border bg-primary text-primary-foreground">
        <div className="container-page grid gap-10 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-20">
          <div className="min-w-0">
            {hero.eyebrow ? (
              <p className="eyebrow text-accent">{hero.eyebrow}</p>
            ) : null}
            <h1 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              {contentLoading ? "" : (hero.headline ?? "")}
            </h1>
            {hero.subheadline ? (
              <p className="mt-5 max-w-xl text-base leading-relaxed text-primary-foreground/80">
                {hero.subheadline}
              </p>
            ) : null}
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to={hero.primary_cta_url ?? "/request-quote"}>
                  {hero.primary_cta ?? "Request a Quote"}
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Link to={hero.secondary_cta_url ?? "/services"}>
                  {hero.secondary_cta ?? "Explore Our Services"}
                </Link>
              </Button>
            </div>
            {hero.trust_points?.length ? (
              <ul className="mt-8 grid gap-2 sm:grid-cols-2">
                {hero.trust_points.map((point) => (
                  <li
                    key={point}
                    className="flex items-start gap-2 text-sm text-primary-foreground/85"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
                    {point}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="min-w-0">
            {hero.image_url ? (
              <ImageBox
                src={hero.image_url}
                alt={hero.headline ?? "Project work"}
                eager
                className="aspect-[4/3] w-full rounded-lg border border-primary-foreground/15"
              />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {(stats.items ?? []).slice(0, 4).map((item) => (
                  <div
                    key={item.label}
                    className="rounded-lg border border-primary-foreground/15 bg-primary-foreground/5 px-5 py-6"
                  >
                    <p className="font-display text-2xl font-bold text-accent">{item.value}</p>
                    <p className="mt-1 text-sm text-primary-foreground/75">{item.label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Stats strip */}
      {hero.image_url && stats.items?.length ? (
        <section className="border-b border-border bg-secondary">
          <div className="container-page grid gap-6 py-8 sm:grid-cols-2 lg:grid-cols-4">
            {stats.items.map((item) => (
              <div key={item.label}>
                <p className="font-display text-2xl font-bold text-foreground">{item.value}</p>
                <p className="text-sm text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Services */}
      <section className="section-y">
        <div className="container-page">
          <SectionHeading
            eyebrow="What we do"
            title="Our services"
            description="Specialist teams across solar energy, electrical works, painting, flooring and general property improvement."
            action={
              <Button asChild variant="outline">
                <Link to="/services">View all services</Link>
              </Button>
            }
          />
          <div className="mt-8">
            {servicesLoading ? (
              <CardGridSkeleton count={6} />
            ) : services?.length ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {services.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No services published yet"
                description="Services added from the admin dashboard will appear here."
              />
            )}
          </div>
        </div>
      </section>

      {/* Why us */}
      {why.items?.length ? (
        <section className="section-y border-y border-border bg-secondary">
          <div className="container-page">
            <SectionHeading eyebrow="Why us" title={why.title ?? "Why clients choose us"} />
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

      {/* Projects */}
      <section className="section-y">
        <div className="container-page">
          <SectionHeading
            eyebrow="Recent work"
            title="Featured projects"
            action={
              <Button asChild variant="outline">
                <Link to="/projects">View all projects</Link>
              </Button>
            }
          />
          <div className="mt-8">
            {projectsLoading ? (
              <CardGridSkeleton count={3} />
            ) : projects?.length ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No projects published yet"
                description="Completed projects added from the admin dashboard will appear here."
              />
            )}
          </div>
        </div>
      </section>

      {/* Process */}
      {process.items?.length ? (
        <section className="section-y border-y border-border bg-secondary">
          <div className="container-page">
            <SectionHeading eyebrow="Process" title={process.title ?? "How we work"} />
            <ol className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
              {process.items.map((item, i) => (
                <li key={item.title} className="surface-panel p-5">
                  <span className="font-display text-sm font-bold text-accent">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-2 font-display text-sm font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {item.body}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      ) : null}

      {/* Testimonials */}
      {testimonials?.length ? (
        <section className="section-y">
          <div className="container-page">
            <SectionHeading eyebrow="Client feedback" title="What clients say" />
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((t) => (
                <figure key={t.id} className="surface-panel flex h-full flex-col gap-4 p-6">
                  <Quote className="h-5 w-5 text-accent" aria-hidden />
                  <blockquote className="flex-1 text-sm leading-relaxed text-foreground">
                    {t.content}
                  </blockquote>
                  {t.rating ? (
                    <div className="flex gap-0.5" aria-label={`${t.rating} out of 5`}>
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-accent text-accent" />
                      ))}
                    </div>
                  ) : null}
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

      {/* Service areas */}
      {areas?.length ? (
        <section className="section-y border-t border-border bg-secondary">
          <div className="container-page">
            <SectionHeading
              eyebrow="Coverage"
              title="Where we work"
              action={
                <Button asChild variant="outline">
                  <Link to="/locations">Check your area</Link>
                </Button>
              }
            />
            <ul className="mt-6 flex flex-wrap gap-2">
              {areas.map((area) => (
                <li
                  key={area.id}
                  className="flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-sm text-foreground"
                >
                  <MapPin className="h-3.5 w-3.5 text-accent" aria-hidden />
                  {[area.area, area.city].filter(Boolean).join(", ")}
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* Closing CTA */}
      <section className="bg-primary text-primary-foreground">
        <div className="container-page flex flex-col gap-6 py-14 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
              {cta.title ?? "Ready to start your project?"}
            </h2>
            {cta.body ? (
              <p className="mt-3 text-primary-foreground/80">{cta.body}</p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to={cta.cta_url ?? "/request-quote"}>{cta.cta ?? "Request a Quote"}</Link>
            </Button>
            {company?.phone ? (
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
              >
                <a href={telHref(company.phone)}>
                  <Phone className="mr-2 h-4 w-4" /> Call us
                </a>
              </Button>
            ) : null}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

export function ServiceCard({ service }: { service: Service }) {
  return (
    <Link
      to="/services/$slug"
      params={{ slug: service.slug }}
      className="surface-panel group flex h-full flex-col overflow-hidden transition-shadow hover:shadow-raised"
    >
      <ImageBox
        src={service.hero_image_url}
        alt={service.title}
        className="aspect-[16/10] w-full"
      />
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-base font-semibold text-foreground">{service.title}</h3>
        {service.short_description ? (
          <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
            {service.short_description}
          </p>
        ) : null}
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-accent">
          Learn more
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
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
      className="surface-panel group flex h-full flex-col overflow-hidden transition-shadow hover:shadow-raised"
    >
      <ImageBox
        src={project.hero_image_url}
        alt={project.title}
        className="aspect-[16/10] w-full"
      />
      <div className="flex flex-1 flex-col p-5">
        {project.location ? <p className="eyebrow">{project.location}</p> : null}
        <h3 className="mt-1.5 font-display text-base font-semibold text-foreground">
          {project.title}
        </h3>
        {project.description ? (
          <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-muted-foreground">
            {project.description}
          </p>
        ) : null}
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-accent">
          View project
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
