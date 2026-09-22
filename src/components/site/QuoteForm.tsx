import { useState } from "react";
import { CheckCircle2, Loader2, Paperclip, X } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useSiteData } from "@/hooks/useSiteData";
import {
  ALLOWED_DOCUMENT_TYPES,
  ALLOWED_IMAGE_TYPES,
  uploadQuoteFile,
  validateFile,
} from "@/lib/media";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

const schema = z.object({
  customer_name: z.string().trim().min(2, "Please enter your name").max(100),
  phone: z.string().trim().min(7, "Please enter a reachable phone number").max(30),
  email: z.union([z.string().trim().email("Enter a valid email").max(255), z.literal("")]),
  company_name: z.string().trim().max(120).optional(),
  service_id: z.string().optional(),
  project_description: z
    .string()
    .trim()
    .min(15, "Please describe the project in a little more detail")
    .max(2000),
  project_location: z.string().trim().max(200).optional(),
  property_type: z.string().trim().max(80).optional(),
  preferred_date: z.string().optional(),
  additional_requirements: z.string().trim().max(1500).optional(),
  preferred_contact: z.string().max(30).optional(),
  consent: z.literal(true, { errorMap: () => ({ message: "Please accept to continue" }) }),
});

const PROPERTY_TYPES = ["Residential", "Commercial", "Industrial", "Estate", "Other"];
const CONTACT_METHODS = ["Phone call", "WhatsApp", "Email"];

const ALLOWED = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES];
const SOLAR_RE = /(solar|inverter|battery|energy storage|backup power|pv|photovoltaic|maintenance|hybrid system)/i;

export function QuoteForm({ defaultServiceId }: { defaultServiceId?: string }) {
  const { company } = useSiteData();
  const maxMb = company?.max_upload_mb ?? 10;
  const { data: services } = useSupabaseData(
    () =>
      supabase
        .from("services")
        .select("id,title")
        .eq("published", true)
        .order("sort_order")
        .order("title"),
    [],
  );

  const solarServices = (services ?? []).filter((s) =>
    SOLAR_RE.test(`${s.title} ${(s as { short_description?: string | null }).short_description ?? ""}`),
  );

  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  function addFiles(list: FileList | null) {
    if (!list) return;
    const next: File[] = [];
    for (const file of Array.from(list)) {
      const problem = validateFile(file, { allowed: ALLOWED, maxMb });
      if (problem) toast.error(problem);
      else next.push(file);
    }
    setFiles((prev) => [...prev, ...next].slice(0, 6));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const raw = {
      customer_name: String(form.get("customer_name") ?? ""),
      phone: String(form.get("phone") ?? ""),
      email: String(form.get("email") ?? ""),
      company_name: String(form.get("company_name") ?? ""),
      service_id: String(form.get("service_id") ?? ""),
      project_description: String(form.get("project_description") ?? ""),
      project_location: String(form.get("project_location") ?? ""),
      property_type: String(form.get("property_type") ?? ""),
      preferred_date: String(form.get("preferred_date") ?? ""),
      additional_requirements: String(form.get("additional_requirements") ?? ""),
      preferred_contact: String(form.get("preferred_contact") ?? ""),
      consent: form.get("consent") === "on",
    };

    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      const map: Record<string, string> = {};
      for (const issue of parsed.error.issues) map[String(issue.path[0])] = issue.message;
      setErrors(map);
      toast.error("Please correct the highlighted fields.");
      return;
    }
    setErrors({});
    setSubmitting(true);

    try {
      const value = parsed.data;
      const serviceTitle = solarServices.find((s) => s.id === value.service_id)?.title ?? null;

      const { data: inserted, error } = await supabase
        .from("quote_requests")
        .insert({
          customer_name: value.customer_name,
          phone: value.phone,
          email: value.email || null,
          company_name: value.company_name || null,
          service_id: value.service_id || null,
          service_label: serviceTitle,
          project_description: value.project_description,
          project_location: value.project_location || null,
          property_type: value.property_type || null,
          preferred_date: value.preferred_date || null,
          additional_requirements: value.additional_requirements || null,
          preferred_contact: value.preferred_contact || null,
          consent: true,
        })
        .select("id")
        .single();

      if (error) throw error;

      for (const file of files) {
        try {
          const uploaded = await uploadQuoteFile(file, inserted.id);
          await supabase.from("quote_request_files").insert({
            quote_request_id: inserted.id,
            file_path: uploaded.path,
            file_name: uploaded.name,
            file_type: uploaded.type,
            file_size: uploaded.size,
          });
        } catch {
          toast.error(`We could not attach "${file.name}". Your request was still submitted.`);
        }
      }

      setDone(true);
      toast.success("Enquiry received. We will be in touch shortly.");
    } catch {
      toast.error("We could not submit your request. Please try again or call us.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="surface-panel flex flex-col items-center gap-3 px-6 py-14 text-center">
        <CheckCircle2 className="h-10 w-10 text-success" />
        <h3 className="font-display text-lg font-semibold">Request submitted</h3>
        <p className="max-w-md text-sm text-muted-foreground">
          Thank you. Our team will review your requirements and contact you using your preferred
          method.
        </p>
        <Button variant="outline" onClick={() => setDone(false)}>
          Submit another request
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="surface-panel space-y-6 p-5 sm:p-7" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full name" name="customer_name" error={errors.customer_name} required>
          <Input id="customer_name" name="customer_name" placeholder="e.g. Adaeze Okonkwo" />
        </Field>
        <Field label="Phone number" name="phone" error={errors.phone} required>
          <Input id="phone" name="phone" inputMode="tel" placeholder="e.g. 0801 234 5678" />
        </Field>
        <Field label="Email address" name="email" error={errors.email}>
          <Input id="email" name="email" type="email" placeholder="you@example.com" />
        </Field>
        <Field label="Company name (optional)" name="company_name" error={errors.company_name}>
          <Input id="company_name" name="company_name" placeholder="Organisation" />
        </Field>
        <Field label="Solar service required" name="service_id" error={errors.service_id}>
          <select
            id="service_id"
            name="service_id"
            defaultValue={defaultServiceId ?? ""}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">Select a solar service</option>
            {solarServices.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Property type" name="property_type" error={errors.property_type}>
          <select
            id="property_type"
            name="property_type"
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">Select</option>
            {PROPERTY_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </Field>
        <Field label="Project location" name="project_location" error={errors.project_location}>
          <Input id="project_location" name="project_location" placeholder="Area, city, state" />
        </Field>
        <Field label="Preferred start date" name="preferred_date" error={errors.preferred_date}>
          <Input id="preferred_date" name="preferred_date" type="date" />
        </Field>
        <Field
          label="Preferred contact method"
          name="preferred_contact"
          error={errors.preferred_contact}
        >
          <select
            id="preferred_contact"
            name="preferred_contact"
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            {CONTACT_METHODS.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>
      </div>

      <Field
        label="Project description"
        name="project_description"
        error={errors.project_description}
        required
      >
        <Textarea
          id="project_description"
          name="project_description"
          rows={5}
          placeholder="Tell us what you want to power, your location, major appliances or loads, and your backup expectations."
        />
      </Field>

      <Field
        label="Additional requirements (optional)"
        name="additional_requirements"
        error={errors.additional_requirements}
      >
        <Textarea
          id="additional_requirements"
          name="additional_requirements"
          rows={3}
          placeholder="Access constraints, preferred materials, anything else."
        />
      </Field>

      <div>
        <Label className="text-sm font-semibold">Site photos or documents (optional)</Label>
        <p className="mt-1 text-xs text-muted-foreground">
          Images, PDFs and office documents up to {maxMb}MB each. Maximum 6 files.
        </p>
        <label className="mt-3 flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-input px-4 py-3 text-sm text-muted-foreground hover:border-accent">
          <Paperclip className="h-4 w-4" />
          Choose files
          <input
            type="file"
            multiple
            className="sr-only"
            accept={ALLOWED.join(",")}
            onChange={(e) => addFiles(e.target.files)}
          />
        </label>
        {files.length ? (
          <ul className="mt-3 space-y-2">
            {files.map((file, i) => (
              <li
                key={`${file.name}-${i}`}
                className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2 text-sm"
              >
                <span className="truncate">{file.name}</span>
                <button
                  type="button"
                  aria-label={`Remove ${file.name}`}
                  onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="flex items-start gap-3 rounded-md bg-muted/60 p-4">
        <Checkbox id="consent" name="consent" className="mt-0.5" />
        <div>
          <Label htmlFor="consent" className="text-sm font-medium leading-relaxed">
            I consent to being contacted about this request and to my details being stored for that
            purpose.
          </Label>
          {errors.consent ? (
            <p className="mt-1 text-xs text-destructive">{errors.consent}</p>
          ) : null}
        </div>
      </div>

      <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={submitting}>
        {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Submit request
      </Button>
    </form>
  );
}

function Field({
  label,
  name,
  error,
  required,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name} className="text-sm font-semibold">
        {label}
        {required ? <span className="ml-0.5 text-destructive">*</span> : null}
      </Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
