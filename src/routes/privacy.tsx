import { createFileRoute } from "@tanstack/react-router";
import { useSiteContent } from "@/hooks/useSiteContent";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Breadcrumbs } from "@/components/site/shared";
import { Skeleton } from "@/components/ui/skeleton";
import type { SectionContent } from "@/types/db";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy" },
      {
        name: "description",
        content:
          "How we collect, use, store and protect customer information submitted through enquiry and contact forms.",
      },
      { property: "og:title", content: "Privacy Policy" },
      {
        property: "og:description",
        content: "How we handle customer information submitted through our forms.",
      },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  const { get, loading } = useSiteContent();
  const page = get<SectionContent>("page_privacy", {});

  return (
    <SiteLayout>
      <section className="border-b border-border bg-secondary">
        <div className="container-page py-10">
          <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Privacy Policy" }]} />
          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground">
            {page.title ?? "Privacy Policy"}
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
