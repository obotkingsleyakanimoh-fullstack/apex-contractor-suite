import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Breadcrumbs, EmptyState, ImageBox, SectionHeading } from "@/components/site/shared";
import { BeforeAfterSlider } from "@/components/site/BeforeAfterSlider";
import { ProjectCard } from "@/routes/index";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/format";
import { asStringArray, type Faq, type Project } from "@/types/db";

export const Route = createFileRoute("/projects/$slug")({
  head: () => ({
    meta: [
      { title: "Project details" },
      { name: "description", content: "Project scope, gallery and outcome." },
      { property: "og:title", content: "Project details" },
      { property: "og:description", content: "Project scope, gallery and outcome." },
    ],
  }),
  component: ProjectDetail,
});

function ProjectDetail() {
  const { slug } = Route.useParams();

  const { data: project, loading } = useSupabaseData<Project>(
    () => supabase.from("projects").select("*").eq("slug", slug).eq("published", true).maybeSingle(),
    [slug],
  );

  const { data: related } = useSupabaseData<Project[]>(
    () =>
      supabase
        .from("projects")
        .select("*")
        .eq("published", true)
        .neq("id", project?.id ?? "00000000-0000-0000-0000-000000000000")
        .order("sort_order")
        .limit(3),
    [project?.id],
  );

  const { data: faqs } = useSupabaseData<Faq[]>(
    () =>
      supabase
        .from("faqs")
        .select("*")
        .eq("published", true)
        .eq("project_id", project?.id ?? "00000000-0000-0000-0000-000000000000")
        .order("sort_order"),
    [project?.id],
  );

  if (loading) {
    return (
      <SiteLayout>
        <div className="container-page section-y space-y-5">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-72 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      </SiteLayout>
    );
  }

  if (!project) {
    return (
      <SiteLayout>
        <div className="container-page section-y">
          <EmptyState
            title="Project not found"
            description="This project may have been unpublished or moved."
            action={
              <Button asChild>
                <Link to="/projects">Back to projects</Link>
              </Button>
            }
          />
        </div>
      </SiteLayout>
    );
  }

  const gallery = asStringArray(project.gallery);
  const provided = asStringArray(project.services_provided);

  return (
    <SiteLayout>
      <section className="border-b border-border bg-secondary">
        <div className="container-page py-10">
          <Breadcrumbs
            items={[
              { label: "Home", to: "/" },
              { label: "Projects", to: "/projects" },
              { label: project.title },
            ]}
          />
          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {project.title}
          </h1>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
            {project.location ? (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-accent" aria-hidden /> {project.location}
              </span>
            ) : null}
            {project.completion_date ?? project.project_date ? (
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4 text-accent" aria-hidden />
                {formatDate(project.completion_date ?? project.project_date)}
              </span>
            ) : null}
            {project.client_type ? <span>{project.client_type}</span> : null}
          </div>
        </div>
      </section>

      <section className="section-y">
        <div className="container-page space-y-12">
          <ImageBox
            src={project.hero_image_url}
            alt={project.title}
            eager
            className="aspect-[16/9] w-full rounded-lg border border-border"
          />

          <div className="grid gap-10 lg:grid-cols-[1fr_300px] lg:items-start">
            <div className="min-w-0 space-y-10">
              {project.description ? (
                <div>
                  <h2 className="font-display text-xl font-semibold text-foreground">Overview</h2>
                  <p className="mt-3 whitespace-pre-line text-base leading-relaxed text-muted-foreground">
                    {project.description}
                  </p>
                </div>
              ) : null}

              {project.scope_of_work ? (
                <div>
                  <h2 className="font-display text-xl font-semibold text-foreground">
                    Scope of work
                  </h2>
                  <p className="mt-3 whitespace-pre-line text-base leading-relaxed text-muted-foreground">
                    {project.scope_of_work}
                  </p>
                </div>
              ) : null}

              {project.before_image_url && project.after_image_url ? (
                <div>
                  <h2 className="font-display text-xl font-semibold text-foreground">
                    Before &amp; after
                  </h2>
                  <div className="mt-4">
                    <BeforeAfterSlider
                      before={project.before_image_url}
                      after={project.after_image_url}
                      label={project.title}
                    />
                  </div>
                </div>
              ) : null}

              {project.outcome ? (
                <div>
                  <h2 className="font-display text-xl font-semibold text-foreground">Outcome</h2>
                  <p className="mt-3 whitespace-pre-line text-base leading-relaxed text-muted-foreground">
                    {project.outcome}
                  </p>
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
                        alt={`${project.title} image ${i + 1}`}
                        className="aspect-[4/3] w-full rounded-lg border border-border"
                      />
                    ))}
                  </div>
                </div>
              ) : null}

              {faqs?.length ? (
                <div>
                  <h2 className="font-display text-xl font-semibold text-foreground">
                    Project FAQs
                  </h2>
                  <dl className="mt-4 space-y-4">
                    {faqs.map((f) => (
                      <div key={f.id} className="surface-panel p-5">
                        <dt className="text-sm font-semibold text-foreground">{f.question}</dt>
                        <dd className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                          {f.answer}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ) : null}
            </div>

            <aside className="surface-panel space-y-4 p-6 lg:sticky lg:top-24">
              {provided.length ? (
                <div>
                  <h2 className="text-sm font-semibold text-foreground">Services provided</h2>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    {provided.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              <p className="text-sm text-muted-foreground">
                Planning something similar? Send us the details for a quotation.
              </p>
              <Button asChild className="w-full">
                <Link to="/request-quote">Request a Quote</Link>
              </Button>
            </aside>
          </div>
        </div>
      </section>

      {related?.length ? (
        <section className="section-y border-t border-border bg-secondary">
          <div className="container-page">
            <SectionHeading eyebrow="More work" title="Related projects" />
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </SiteLayout>
  );
}
