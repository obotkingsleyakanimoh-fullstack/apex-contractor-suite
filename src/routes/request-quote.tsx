import { createFileRoute } from "@tanstack/react-router";
import { Clock, Phone, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useSiteData } from "@/hooks/useSiteData";
import { SiteLayout } from "@/components/site/SiteLayout";
import { QuoteForm } from "@/components/site/QuoteForm";
import { Breadcrumbs } from "@/components/site/shared";
import { telHref } from "@/lib/format";

export const Route = createFileRoute("/request-quote")({
  validateSearch: (search: Record<string, unknown>): { service?: string } =>
    typeof search.service === "string" ? { service: search.service } : {},
  head: () => ({
    meta: [
      { title: "Request a Quote — Tell Us About Your Project" },
      {
        name: "description",
        content:
          "Request a free quotation for solar installation, electrical works, painting or epoxy flooring. Share site photos and documents with your request.",
      },
      { property: "og:title", content: "Request a Quote" },
      {
        property: "og:description",
        content: "Send us your project details and receive a clear scope and price.",
      },
    ],
  }),
  component: RequestQuotePage,
});

function RequestQuotePage() {
  const { service: serviceSlug } = Route.useSearch();
  const { company } = useSiteData();

  const { data: service } = useSupabaseData<{ id: string; title: string }>(
    () =>
      serviceSlug
        ? supabase
            .from("services")
            .select("id,title")
            .eq("slug", serviceSlug)
            .eq("published", true)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
    [serviceSlug],
  );

  return (
    <SiteLayout whatsappContext={service?.title}>
      <section className="border-b border-border bg-secondary">
        <div className="container-page py-10">
          <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Request a Quote" }]} />
          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Request a quotation
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
            No account needed. Share your requirements and any site photos or drawings, and our team
            will respond with next steps.
          </p>
          {service ? (
            <p className="mt-4 inline-block rounded-md border border-accent/40 bg-accent/10 px-3 py-1.5 text-sm font-medium text-foreground">
              Service: {service.title}
            </p>
          ) : null}
        </div>
      </section>

      <section className="section-y">
        <div className="container-page grid gap-8 lg:grid-cols-[1fr_300px] lg:items-start">
          <div className="min-w-0">
            <QuoteForm defaultServiceId={service?.id} />
          </div>
          <aside className="space-y-4">
            <div className="surface-panel space-y-3 p-6 text-sm text-muted-foreground">
              <p className="flex items-start gap-2">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
                We review every request and respond during business hours.
              </p>
              <p className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
                Your details and uploads are stored securely and seen only by our team.
              </p>
              {company?.phone ? (
                <p className="flex items-start gap-2">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
                  <a className="font-medium text-foreground" href={telHref(company.phone)}>
                    {company.phone}
                  </a>
                </p>
              ) : null}
            </div>
          </aside>
        </div>
      </section>
    </SiteLayout>
  );
}
