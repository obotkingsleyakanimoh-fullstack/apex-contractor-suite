import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { BoolBadge, CrudManager } from "@/components/admin/CrudManager";
import type { ServiceCategory } from "@/types/db";

export const Route = createFileRoute("/admin/projects")({
  component: AdminProjects,
});

function AdminProjects() {
  const { data: categories } = useSupabaseData<ServiceCategory[]>(
    () => supabase.from("service_categories").select("*").order("sort_order"),
    [],
  );
  const options = (categories ?? []).map((c) => ({ value: c.id, label: c.name }));

  return (
    <CrudManager
      table="projects"
      entityLabel="project"
      title="Projects"
      description="Completed work shown in the public portfolio."
      orderBy={{ column: "sort_order" }}
      searchKeys={["title", "slug", "location", "city"]}
      columns={[
        { key: "title", label: "Title" },
        { key: "location", label: "Location" },
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
      ]}
      defaults={{
        title: "",
        slug: "",
        published: false,
        featured: false,
        sort_order: 0,
        gallery: [],
        services_provided: [],
      }}
      fields={[
        { name: "title", label: "Title", type: "text", required: true },
        { name: "slug", label: "URL slug", type: "text", required: true, slugFrom: "title" },
        { name: "category_id", label: "Category", type: "select", options },
        { name: "location", label: "Location", type: "text" },
        { name: "city", label: "City", type: "text" },
        { name: "state", label: "State", type: "text" },
        { name: "client_type", label: "Client type", type: "text" },
        { name: "description", label: "Overview", type: "textarea" },
        { name: "scope_of_work", label: "Scope of work", type: "textarea" },
        { name: "outcome", label: "Outcome", type: "textarea" },
        {
          name: "services_provided",
          label: "Services provided",
          type: "list",
          help: "One per line.",
        },
        { name: "hero_image_url", label: "Hero image", type: "image", full: true },
        { name: "gallery", label: "Gallery image URLs", type: "list", help: "One per line." },
        { name: "before_image_url", label: "Before image", type: "image" },
        { name: "after_image_url", label: "After image", type: "image" },
        { name: "project_date", label: "Project date", type: "date" },
        { name: "completion_date", label: "Completion date", type: "date" },
        { name: "seo_title", label: "SEO title", type: "text" },
        { name: "seo_description", label: "SEO description", type: "textarea" },
        { name: "og_image_url", label: "Social share image", type: "image", full: true },
        { name: "sort_order", label: "Sort order", type: "number" },
        { name: "featured", label: "Featured project", type: "checkbox" },
        { name: "published", label: "Published", type: "checkbox" },
      ]}
    />
  );
}
