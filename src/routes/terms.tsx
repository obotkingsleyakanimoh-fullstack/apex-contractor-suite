import { createFileRoute } from "@tanstack/react-router";
import { useSiteContent } from "@/hooks/useSiteContent";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Breadcrumbs } from "@/components/site/shared";
import { Skeleton } from "@/components/ui/skeleton";
import type { SectionContent } from "@/types/db";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions" },
      {
        name: "description",
        content:
          "Terms covering quotations, project scope, payment terms, warranties, site access and liability.",
      },
      { property: "og:title", content: "Terms & Conditions" },
      {
        property: "og:description",
        content: "Quotation, scope, payment, warranty and liability terms.",
      },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  const { get, loading } = useSiteContent();
  const page = get<SectionContent>("page_terms", {});

  return (
    <SiteLayout>
      <section className="border-b border-border bg-secondary">
        <div className="container-page py-10">
          <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Terms" }]} />
          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground">
            {page.title ?? "Terms & Conditions"}
          </h1>
        </div>
      </section>
      <section className="section-y">
        <div className="container-page max-w-3xl">
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-11/12" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          ) : (
            <div className="prose-block whitespace-pre-line text-base leading-relaxed text-muted-foreground">
              {page.body ?? ""}
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
