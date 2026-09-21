import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { BoolBadge, CrudManager } from "@/components/admin/CrudManager";
import type { ServiceCategory } from "@/types/db";

export const Route = createFileRoute("/admin/services")({
  component: AdminServices,
});

function AdminServices() {
  const { data: categories } = useSupabaseData<ServiceCategory[]>(
    () => supabase.from("service_categories").select("*").order("sort_order"),
    [],
  );

  const options = (categories ?? []).map((c) => ({ value: c.id, label: c.name }));

  return (
    <CrudManager
      table="services"
      entityLabel="service"
      title="Services"
      description="Everything published here appears on the public services pages."
      orderBy={{ column: "sort_order" }}
      searchKeys={["title", "slug", "short_description"]}
      columns={[
        { key: "title", label: "Title" },
        {
          key: "published",
          label: "Status",
          render: (r) => <BoolBadge value={!!r.published} yes="Published" no="Draft" />,
        },
        {
          key: "featured",
          label: "Featured",
          render: (r) => <BoolBadge value={!!r.featured} yes="Featured" no="—" />,
        },
        { key: "sort_order", label: "Order" },
      ]}
      defaults={{
        title: "",
        slug: "",
        published: false,
        featured: false,
        show_price: false,
        sort_order: 0,
        gallery: [],
        features: [],
        benefits: [],
      }}
      fields={[
        { name: "title", label: "Title", type: "text", required: true },
        { name: "slug", label: "URL slug", type: "text", required: true, slugFrom: "title" },
        { name: "category_id", label: "Category", type: "select", options },
        { name: "short_description", label: "Short description", type: "textarea" },
        { name: "full_description", label: "Full description", type: "textarea" },
        { name: "hero_image_url", label: "Hero image URL", type: "text", full: true },
        {
          name: "gallery",
          label: "Gallery image URLs",
          type: "list",
          help: "One image URL per line.",
        },
        { name: "features", label: "What's included", type: "list", help: "One item per line." },
        { name: "benefits", label: "Key benefits", type: "list", help: "One item per line." },
        { name: "starting_price", label: "Starting price", type: "number" },
        { name: "show_price", label: "Show price publicly", type: "checkbox" },
        { name: "cta_text", label: "CTA button text", type: "text" },
        { name: "seo_title", label: "SEO title", type: "text" },
        { name: "seo_description", label: "SEO description", type: "textarea" },
        { name: "og_image_url", label: "Social share image URL", type: "text", full: true },
        { name: "sort_order", label: "Sort order", type: "number" },
        { name: "featured", label: "Featured service", type: "checkbox" },
        { name: "published", label: "Published", type: "checkbox" },
      ]}
    />
  );
}
