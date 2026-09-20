import { createFileRoute } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useSiteData } from "@/hooks/useSiteData";
import { SiteLayout } from "@/components/site/SiteLayout";
import { DistanceChecker } from "@/components/site/DistanceChecker";
import {
  Breadcrumbs,
  CardGridSkeleton,
  EmptyState,
  SectionHeading,
} from "@/components/site/shared";
import { Button } from "@/components/ui/button";
import { directionsUrl } from "@/lib/geo";
import type { ServiceArea } from "@/types/db";

export const Route = createFileRoute("/locations")({
  head: () => ({
    meta: [
      { title: "Service Areas & Office Location" },
      {
        name: "description",
        content:
          "See the cities and areas we serve, check how far you are from our office, and get directions.",
      },
      { property: "og:title", content: "Service Areas & Office Location" },
      {
        property: "og:description",
        content: "Cities and areas we serve, plus directions to our office.",
      },
    ],
  }),
  component: LocationsPage,
});

function LocationsPage() {
  const { office, company } = useSiteData();
  const { data: areas, loading } = useSupabaseData<ServiceArea[]>(
    () => supabase.from("service_areas").select("*").eq("published", true).order("priority"),
    [],
  );

  return (
    <SiteLayout>
      <section className="border-b border-border bg-secondary">
        <div className="container-page py-10">
          <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Locations" }]} />
          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Where we work
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
            We deliver projects across our service area. Check your distance from our office below.
          </p>
        </div>
      </section>

      <section className="section-y">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_340px] lg:items-start">
          <div className="min-w-0">
            <SectionHeading eyebrow="Coverage" title="Service areas" />
            <div className="mt-6">
              {loading ? (
                <CardGridSkeleton count={6} />
              ) : areas?.length ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {areas.map((area) => (
                    <div key={area.id} className="surface-panel p-5">
                      <p className="flex items-center gap-2 font-display text-base font-semibold text-foreground">
                        <MapPin className="h-4 w-4 text-accent" aria-hidden />
                        {[area.area, area.city].filter(Boolean).join(", ")}
                      </p>
                      {area.state ? (
                        <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
                          {area.state}
                        </p>
                      ) : null}
                      {area.description ? (
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                          {area.description}
                        </p>
                      ) : null}
                      <p className="mt-3 text-xs font-medium text-muted-foreground">
                        {area.available ? "Currently serving" : "Contact us to confirm availability"}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No service areas listed yet"
                  description="Service areas added from the admin dashboard will appear here."
                />
              )}
            </div>
          </div>

          <aside className="space-y-5">
            {office ? (
              <div className="surface-panel space-y-3 p-6">
                <h2 className="font-display text-base font-semibold text-foreground">
                  {office.name}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {[office.address, office.city, office.state, office.country]
                    .filter(Boolean)
                    .join(", ")}
                </p>
                <p className="text-sm text-muted-foreground">
                  Standard service radius: {office.service_radius_km} km
                </p>
                <Button asChild className="w-full">
                  <a href={directionsUrl(office)} target="_blank" rel="noreferrer noopener">
                    Get directions
                  </a>
                </Button>
              </div>
            ) : company?.address ? (
              <div className="surface-panel p-6 text-sm text-muted-foreground">
                {company.address}
              </div>
            ) : null}

            {office ? <DistanceChecker office={office} /> : null}
          </aside>
        </div>
      </section>
    </SiteLayout>
  );
}
