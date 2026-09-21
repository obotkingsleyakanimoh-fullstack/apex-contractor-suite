import { createFileRoute } from "@tanstack/react-router";
import { BoolBadge, CrudManager } from "@/components/admin/CrudManager";

export const Route = createFileRoute("/admin/navigation")({ component: AdminNavigation });

function AdminNavigation() {
  return (
    <div className="space-y-10">
      <CrudManager
        table="navigation_items"
        entityLabel="navigation item"
        title="Navigation"
        description="Manage the public header navigation without editing source code."
        orderBy={{ column: "sort_order" }}
        searchKeys={["label", "url"]}
        columns={[
          { key: "label", label: "Label" },
          { key: "url", label: "URL" },
          { key: "sort_order", label: "Order" },
          { key: "visible", label: "Visible", render: (r) => <BoolBadge value={!!r.visible} yes="Yes" no="Hidden" /> },
        ]}
        defaults={{ label: "", url: "/", visible: true, protected: false, is_external: false, sort_order: 0 }}
        fields={[
          { name: "label", label: "Label", type: "text", required: true },
          { name: "url", label: "URL", type: "text", required: true },
          { name: "sort_order", label: "Sort order", type: "number" },
          { name: "visible", label: "Visible", type: "checkbox" },
          { name: "protected", label: "Protected/default item", type: "checkbox" },
          { name: "is_external", label: "External link", type: "checkbox" },
        ]}
      />
      <CrudManager
        table="footer_links"
        entityLabel="footer link"
        title="Footer links"
        description="Manage footer link groups and ordering."
        orderBy={{ column: "sort_order" }}
        searchKeys={["section", "label", "url"]}
        columns={[
          { key: "section", label: "Section" },
          { key: "label", label: "Label" },
          { key: "url", label: "URL" },
          { key: "visible", label: "Visible", render: (r) => <BoolBadge value={!!r.visible} yes="Yes" no="Hidden" /> },
        ]}
        defaults={{ section: "Quick Links", label: "", url: "/", visible: true, is_external: false, sort_order: 0 }}
        fields={[
          { name: "section", label: "Section", type: "text", required: true },
          { name: "label", label: "Label", type: "text", required: true },
          { name: "url", label: "URL", type: "text", required: true },
          { name: "sort_order", label: "Sort order", type: "number" },
          { name: "visible", label: "Visible", type: "checkbox" },
          { name: "is_external", label: "External link", type: "checkbox" },
        ]}
      />
      <CrudManager
        table="social_links"
        entityLabel="social link"
        title="Social links"
        description="Control the social profiles shown in the public footer."
        orderBy={{ column: "sort_order" }}
        searchKeys={["platform", "url"]}
        columns={[
          { key: "platform", label: "Platform" },
          { key: "url", label: "URL" },
          { key: "visible", label: "Visible", render: (r) => <BoolBadge value={!!r.visible} yes="Yes" no="Hidden" /> },
        ]}
        defaults={{ platform: "", url: "", visible: true, sort_order: 0 }}
        fields={[
          { name: "platform", label: "Platform", type: "text", required: true },
          { name: "url", label: "Profile URL", type: "text", required: true },
          { name: "sort_order", label: "Sort order", type: "number" },
          { name: "visible", label: "Visible", type: "checkbox" },
        ]}
      />
    </div>
  );
}
