import { createFileRoute } from "@tanstack/react-router";
import { BoolBadge, CrudManager } from "@/components/admin/CrudManager";

export const Route = createFileRoute("/admin/categories")({ component: AdminCategories });

function AdminCategories() {
  return (
    <CrudManager
      table="service_categories"
      entityLabel="category"
      title="Service categories"
      description="Manage the categories used by services and projects. Categories are fully editable and are not hard-coded."
      orderBy={{ column: "sort_order" }}
      searchKeys={["name", "slug", "description"]}
      columns={[
        { key: "name", label: "Category" },
        { key: "slug", label: "Slug" },
        { key: "sort_order", label: "Order" },
        { key: "published", label: "Status", render: (r) => <BoolBadge value={!!r.published} yes="Published" no="Draft" /> },
      ]}
      defaults={{ name: "", slug: "", description: "", icon: "", sort_order: 0, published: true }}
      fields={[
        { name: "name", label: "Name", type: "text", required: true },
        { name: "slug", label: "URL slug", type: "text", required: true, slugFrom: "name" },
        { name: "description", label: "Description", type: "textarea" },
        { name: "icon", label: "Icon name", type: "text", help: "Optional Lucide icon name for future UI use." },
        { name: "sort_order", label: "Sort order", type: "number" },
        { name: "published", label: "Published", type: "checkbox" },
      ]}
    />
  );
}
