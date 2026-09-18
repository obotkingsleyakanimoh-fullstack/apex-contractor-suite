import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ProjectCard } from "@/routes/index";
import {
  Breadcrumbs,
  CardGridSkeleton,
  EmptyState,
  SectionHeading,
} from "@/components/site/shared";
import type { Project, ServiceCategory } from "@/types/db";

export const Route = createFileRoute("/projects/")({
  head: () => ({
    meta: [
      { title: "Projects — Completed Solar, Painting & Flooring Work" },
      {
        name: "description",
        content:
          "A portfolio of completed solar installations, epoxy flooring, painting and electrical projects across Nigeria.",
      },
      { property: "og:title", content: "Our Projects" },
      {
        property: "og:description",
        content: "Completed solar, epoxy flooring, painting and electrical projects.",
      },
    ],
  }),
  component: ProjectsPage,
});

function ProjectsPage() {
  const [category, setCategory] = useState("all");
  const [year, setYear] = useState("all");
  const [city, setCity] = useState("all");

  const { data: categories } = useSupabaseData<ServiceCategory[]>(
    () => supabase.from("service_categories").select("*").eq("published", true).order("sort_order"),
    [],
  );

  const { data: projects, loading } = useSupabaseData<Project[]>(
    () =>
      supabase
        .from("projects")
        .select("*")
        .eq("published", true)
        .order("featured", { ascending: false })
        .order("sort_order"),
    [],
  );

  const years = useMemo(() => {
    const set = new Set<string>();
    for (const p of projects ?? []) {
      const d = p.completion_date ?? p.project_date;
      if (d) set.add(String(new Date(d).getFullYear()));
    }
    return Array.from(set).sort().reverse();
  }, [projects]);

  const cities = useMemo(() => {
    const set = new Set<string>();
    for (const p of projects ?? []) if (p.city) set.add(p.city);
    return Array.from(set).sort();
  }, [projects]);

  const filtered = (projects ?? []).filter((p) => {
    if (category !== "all" && p.category_id !== category) return false;
    if (city !== "all" && p.city !== city) return false;
    if (year !== "all") {
      const d = p.completion_date ?? p.project_date;
      if (!d || String(new Date(d).getFullYear()) !== year) return false;
    }
    return true;
  });

  const selectClass =
    "h-10 w-full rounded-md border border-input bg-background px-3 text-sm sm:w-auto";

  return (
    <SiteLayout>
      <section className="border-b border-border bg-secondary">
        <div className="container-page py-10">
          <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Projects" }]} />
          <SectionHeading
            eyebrow="Portfolio"
            title="Completed projects"
            description="Selected work delivered for residential, commercial and industrial clients."
          />
        </div>
      </section>

      <section className="section-y">
        <div className="container-page">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <select
              aria-label="Filter by category"
              className={selectClass}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="all">All categories</option>
              {(categories ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              aria-label="Filter by city"
              className={selectClass}
              value={city}
              onChange={(e) => setCity(e.target.value)}
            >
              <option value="all">All locations</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select
              aria-label="Filter by year"
              className={selectClass}
              value={year}
              onChange={(e) => setYear(e.target.value)}
            >
              <option value="all">All years</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-8">
            {loading ? (
              <CardGridSkeleton count={6} />
            ) : filtered.length ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((p) => (
                  <ProjectCard key={p.id} project={p} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No projects found"
                description="Try clearing the filters to see all published projects."
              />
            )}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
