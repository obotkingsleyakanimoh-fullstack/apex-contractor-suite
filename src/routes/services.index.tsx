import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ServiceCard } from "@/routes/index";
import {
  Breadcrumbs,
  CardGridSkeleton,
  EmptyState,
  ErrorNotice,
  SectionHeading,
} from "@/components/site/shared";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Service, ServiceCategory } from "@/types/db";

export const Route = createFileRoute("/services/")({
  head: () => ({
    meta: [
      { title: "Our Services — Solar, Electrical, Painting & Epoxy Flooring" },
      {
        name: "description",
        content:
          "Browse our full range of services: solar installation and maintenance, inverters, electrical works, contract painting, and industrial epoxy flooring.",
      },
      { property: "og:title", content: "Our Services" },
      {
        property: "og:description",
        content:
          "Solar installation and maintenance, inverters, electrical works, contract painting and industrial epoxy flooring.",
      },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");

  const { data: categories } = useSupabaseData<ServiceCategory[]>(
    () =>
      supabase.from("service_categories").select("*").eq("published", true).order("sort_order"),
    [],
  );

  const { data: services, loading, error } = useSupabaseData<Service[]>(
    () =>
      supabase
        .from("services")
        .select("*")
        .eq("published", true)
        .order("featured", { ascending: false })
        .order("sort_order"),
    [],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (services ?? []).filter((s) => {
      if (category !== "all" && s.category_id !== category) return false;
      if (!q) return true;
      return (
        s.title.toLowerCase().includes(q) ||
        (s.short_description ?? "").toLowerCase().includes(q) ||
        (s.full_description ?? "").toLowerCase().includes(q)
      );
    });
  }, [services, query, category]);

  return (
    <SiteLayout>
      <section className="border-b border-border bg-secondary">
        <div className="container-page py-10">
          <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Services" }]} />
          <SectionHeading
            eyebrow="Capabilities"
            title="Our services"
            description="Specialist crews across energy, electrical, finishing and property improvement work."
          />
        </div>
      </section>

      <section className="section-y">
        <div className="container-page">
          <div className="flex flex-col gap-4">
            <div className="relative max-w-md">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search services"
                aria-label="Search services"
                className="pl-9"
              />
            </div>
            <div className="-mx-1 flex flex-wrap gap-2 px-1">
              <CategoryChip
                active={category === "all"}
                onClick={() => setCategory("all")}
                label="All"
              />
              {(categories ?? []).map((c) => (
                <CategoryChip
                  key={c.id}
                  active={category === c.id}
                  onClick={() => setCategory(c.id)}
                  label={c.name}
                />
              ))}
            </div>
          </div>

          <div className="mt-8">
            {error ? <ErrorNotice message="We could not load services. Please refresh." /> : null}
            {loading ? (
              <CardGridSkeleton count={6} />
            ) : filtered.length ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((s) => (
                  <ServiceCard key={s.id} service={s} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No services found"
                description="Try a different search term or category."
              />
            )}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function CategoryChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}
