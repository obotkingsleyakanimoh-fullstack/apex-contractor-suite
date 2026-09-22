import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Breadcrumbs, EmptyState } from "@/components/site/shared";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Faq } from "@/types/db";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "Frequently Asked Questions" },
      {
        name: "description",
        content:
          "Answers to common questions about solar systems, inverter and battery storage, proposals, maintenance and project timelines.",
      },
      { property: "og:title", content: "Frequently Asked Questions" },
      {
        property: "og:description",
        content: "Common questions about solar systems, proposals, maintenance, warranties and timelines.",
      },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  const [category, setCategory] = useState("all");
  const { data: faqs, loading } = useSupabaseData<Faq[]>(
    () =>
      supabase
        .from("faqs")
        .select("*")
        .eq("published", true)
        .is("service_id", null)
        .is("project_id", null)
        .order("sort_order"),
    [],
  );

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const f of faqs ?? []) if (f.category) set.add(f.category);
    return Array.from(set).sort();
  }, [faqs]);

  const filtered = (faqs ?? []).filter(
    (f) => category === "all" || f.category === category,
  );

  return (
    <SiteLayout>
      <section className="border-b border-border bg-secondary">
        <div className="container-page py-10">
          <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "FAQ" }]} />
          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Solar frequently asked questions
          </h1>
        </div>
      </section>

      <section className="section-y">
        <div className="container-page max-w-3xl">
          {categories.length ? (
            <div className="flex flex-wrap gap-2">
              {["all", ...categories].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                    category === c
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground hover:text-foreground",
                  )}
                >
                  {c === "all" ? "All" : c}
                </button>
              ))}
            </div>
          ) : null}

          <div className="mt-8">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : filtered.length ? (
              <Accordion type="single" collapsible>
                {filtered.map((f) => (
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
            ) : (
              <EmptyState
                title="No questions published yet"
                description="FAQs added from the admin dashboard will appear here."
              />
            )}
          </div>

          <div className="surface-panel mt-10 flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">Still have a question?</p>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline">
                <Link to="/contact">Contact us</Link>
              </Button>
              <Button asChild>
                <Link to="/request-quote">Start a solar enquiry</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
