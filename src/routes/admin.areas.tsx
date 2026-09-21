import { createFileRoute } from "@tanstack/react-router";
import { BoolBadge, CrudManager } from "@/components/admin/CrudManager";

export const Route = createFileRoute("/admin/areas")({ component: AdminAreas });

function AdminAreas() {
  return (
    <CrudManager
      table="service_areas"
      entityLabel="service area"
      title="Service areas"
      description="Control the cities, states and neighbourhoods displayed as service coverage."
      orderBy={{ column: "priority" }}
      searchKeys={["city", "state", "area", "description"]}
      columns={[
        { key: "area", label: "Area" },
        { key: "city", label: "City" },
        { key: "state", label: "State" },
        { key: "priority", label: "Priority" },
        { key: "published", label: "Published", render: (r) => <BoolBadge value={!!r.published} yes="Yes" no="No" /> },
      ]}
      defaults={{ city: "", state: "", area: "", description: "", available: true, priority: 0, published: true }}
      fields={[
        { name: "city", label: "City", type: "text", required: true },
        { name: "state", label: "State", type: "text" },
        { name: "area", label: "Area / neighbourhood", type: "text" },
        { name: "description", label: "Description", type: "textarea" },
        { name: "priority", label: "Priority", type: "number" },
        { name: "available", label: "Currently available", type: "checkbox" },
        { name: "published", label: "Published", type: "checkbox" },
      ]}
    />
  );
}
