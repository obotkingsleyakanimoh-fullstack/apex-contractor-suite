import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { BoolBadge, CrudManager } from "@/components/admin/CrudManager";

export const Route = createFileRoute("/admin/faqs")({
  component: AdminFaqs,
});

function AdminFaqs() {
  const { data: services } = useSupabaseData<{ id: string; title: string }[]>(
    () => supabase.from("services").select("id,title").order("title"),
    [],
  );
  const { data: projects } = useSupabaseData<{ id: string; title: string }[]>(
    () => supabase.from("projects").select("id,title").order("title"),
    [],
  );

  return (
    <CrudManager
      table="faqs"
      entityLabel="FAQ"
      title="FAQs"
      description="Global questions show on the FAQ page. Linking to a service or project shows them on that page instead."
      orderBy={{ column: "sort_order" }}
      searchKeys={["question", "answer", "category"]}
      columns={[
        { key: "question", label: "Question" },
        { key: "category", label: "Category" },
        {
          key: "published",
          label: "Status",
          render: (r) => <BoolBadge value={!!r.published} yes="Published" no="Draft" />,
        },
      ]}
      defaults={{ question: "", answer: "", published: false, sort_order: 0 }}
      fields={[
        { name: "question", label: "Question", type: "text", required: true, full: true },
        { name: "answer", label: "Answer", type: "textarea", required: true },
        { name: "category", label: "Category", type: "text" },
        {
          name: "service_id",
          label: "Linked service",
          type: "select",
          options: (services ?? []).map((s) => ({ value: s.id, label: s.title })),
        },
        {
          name: "project_id",
          label: "Linked project",
          type: "select",
          options: (projects ?? []).map((p) => ({ value: p.id, label: p.title })),
        },
        { name: "sort_order", label: "Sort order", type: "number" },
        { name: "published", label: "Published", type: "checkbox" },
      ]}
    />
  );
}
