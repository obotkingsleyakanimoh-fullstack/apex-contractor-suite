import { createFileRoute } from "@tanstack/react-router";
import { BoolBadge, CrudManager } from "@/components/admin/CrudManager";

export const Route = createFileRoute("/admin/testimonials")({
  component: AdminTestimonials,
});

function AdminTestimonials() {
  return (
    <CrudManager
      table="testimonials"
      entityLabel="testimonial"
      title="Testimonials"
      description="Only publish feedback you have actually received. Placeholder entries are labelled internally and are not published by default."
      orderBy={{ column: "sort_order" }}
      searchKeys={["customer_name", "customer_company", "content"]}
      columns={[
        { key: "customer_name", label: "Customer" },
        { key: "customer_company", label: "Company" },
        {
          key: "published",
          label: "Status",
          render: (r) => <BoolBadge value={!!r.published} yes="Published" no="Draft" />,
        },
        {
          key: "is_demo",
          label: "Placeholder",
          render: (r) => <BoolBadge value={!!r.is_demo} yes="Placeholder" no="Real" />,
        },
      ]}
      defaults={{
        customer_name: "",
        content: "",
        published: false,
        featured: false,
        is_demo: false,
        sort_order: 0,
        rating: 5,
      }}
      fields={[
        { name: "customer_name", label: "Customer name", type: "text", required: true },
        { name: "customer_company", label: "Company", type: "text" },
        { name: "customer_location", label: "Location", type: "text" },
        { name: "customer_photo_url", label: "Photo URL", type: "text" },
        { name: "content", label: "Testimonial", type: "textarea", required: true },
        { name: "rating", label: "Rating (1–5)", type: "number" },
        { name: "sort_order", label: "Sort order", type: "number" },
        { name: "is_demo", label: "Placeholder", type: "checkbox" },
        { name: "featured", label: "Featured", type: "checkbox" },
        { name: "published", label: "Published", type: "checkbox" },
      ]}
    />
  );
}
