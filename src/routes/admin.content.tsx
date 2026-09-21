import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSiteData } from "@/hooks/useSiteData";
import { useSiteContent } from "@/hooks/useSiteContent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { logActivity } from "@/lib/activity";
import type { CompanySettings, OfficeLocation, BusinessHour } from "@/types/db";

export const Route = createFileRoute("/admin/content")({ component: AdminContent });

const dayOrder = [1, 2, 3, 4, 5, 6, 0];

function AdminContent() {
  const { company, office, hours, reload } = useSiteData();
  const { get, rows, refetch } = useSiteContent();
  const [companyForm, setCompanyForm] = useState<Partial<CompanySettings>>({});
  const [officeForm, setOfficeForm] = useState<Partial<OfficeLocation>>({});
  const [hero, setHero] = useState("");
  const [stats, setStats] = useState("");
  const [why, setWhy] = useState("");
  const [process, setProcess] = useState("");
  const [cta, setCta] = useState("");
  const [about, setAbout] = useState("");
  const [privacy, setPrivacy] = useState("");
  const [terms, setTerms] = useState("");
  const [savingCompany, setSavingCompany] = useState(false);
  const [savingOffice, setSavingOffice] = useState(false);
  const [savingContent, setSavingContent] = useState(false);

  useEffect(() => {
    if (company) setCompanyForm(company);
  }, [company]);
  useEffect(() => {
    if (office) setOfficeForm(office);
  }, [office]);
  useEffect(() => {
    const json = (key: string) => JSON.stringify(get(key, {}), null, 2);
    setHero(json("homepage_hero"));
    setStats(json("homepage_stats"));
    setWhy(json("homepage_why"));
    setProcess(json("homepage_process"));
    setCta(json("homepage_cta"));
    setAbout(json("page_about"));
    setPrivacy(json("page_privacy"));
    setTerms(json("page_terms"));
  }, [rows]);

  const orderedHours = useMemo(
    () => dayOrder.map((day) => hours.find((h) => h.day_of_week === day)).filter(Boolean) as BusinessHour[],
    [hours],
  );

  async function saveCompany() {
    if (!companyForm.company_name?.trim()) return toast.error("Company name is required.");
    setSavingCompany(true);
    const payload = { ...companyForm };
    delete (payload as any).id;
    delete (payload as any).created_at;
    delete (payload as any).updated_at;
    const { error } = company?.id
      ? await supabase.from("company_settings").update(payload).eq("id", company.id)
      : await supabase.from("company_settings").insert(payload as any);
    setSavingCompany(false);
    if (error) return toast.error(error.message);
    await logActivity({ action: "updated", entity: "company_settings", details: "Updated company and SEO settings" });
    toast.success("Company settings saved.");
    reload();
  }

  async function saveOffice() {
    if (!officeForm.name?.trim()) return toast.error("Office name is required.");
    setSavingOffice(true);
    const payload = { ...officeForm };
    delete (payload as any).id;
    delete (payload as any).created_at;
    delete (payload as any).updated_at;
    const { error } = office?.id
      ? await supabase.from("office_locations").update(payload).eq("id", office.id)
      : await supabase.from("office_locations").insert({ ...payload, is_primary: true, published: true } as any);
    setSavingOffice(false);
    if (error) return toast.error(error.message);
    await logActivity({ action: "updated", entity: "office_locations", entityId: office?.id, details: "Updated primary office location" });
    toast.success("Office settings saved.");
    reload();
  }

  async function saveHours() {
    const updates = orderedHours.map((h) =>
      supabase.from("business_hours").update({
        label: h.label,
        open_time: h.open_time || null,
        close_time: h.close_time || null,
        is_closed: h.is_closed,
        sort_order: h.sort_order,
      }).eq("id", h.id),
    );
    const results = await Promise.all(updates);
    const failed = results.find((r) => r.error);
    if (failed?.error) return toast.error(failed.error.message);
    toast.success("Business hours saved.");
    reload();
  }

  async function saveContent() {
    const items = [
      ["homepage_hero", hero], ["homepage_stats", stats], ["homepage_why", why],
      ["homepage_process", process], ["homepage_cta", cta], ["page_about", about],
      ["page_privacy", privacy], ["page_terms", terms],
    ];
    const parsed: [string, unknown][] = [];
    try {
      for (const [key, value] of items) parsed.push([key, JSON.parse(value)]);
    } catch {
      return toast.error("One of the content JSON fields is not valid JSON.");
    }
    setSavingContent(true);
    const results = await Promise.all(
      parsed.map(([key, value]) =>
        supabase.from("site_content").upsert({ key, value: value as any }, { onConflict: "key" }),
      ),
    );
    const failed = results.find((r) => r.error);
    setSavingContent(false);
    if (failed?.error) return toast.error(failed.error.message);
    await logActivity({ action: "updated", entity: "site_content", details: "Updated website content and homepage settings" });
    toast.success("Website content saved.");
    refetch();
  }

  return (
    <div className="space-y-8">
      <PageIntro title="Business & website content" description="One place to manage company identity, office details, opening hours, SEO defaults and editable website content." />

      <section className="surface-panel p-5 sm:p-7">
        <SectionTitle title="Company information" description="These values power the public header, footer, contact details, quotation pages and SEO." />
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Company name"><Input value={companyForm.company_name ?? ""} onChange={(e) => setCompanyForm((v) => ({ ...v, company_name: e.target.value }))} /></Field>
          <Field label="Tagline"><Input value={companyForm.tagline ?? ""} onChange={(e) => setCompanyForm((v) => ({ ...v, tagline: e.target.value }))} /></Field>
          <Field label="Phone"><Input value={companyForm.phone ?? ""} onChange={(e) => setCompanyForm((v) => ({ ...v, phone: e.target.value }))} /></Field>
          <Field label="Secondary phone"><Input value={companyForm.phone_secondary ?? ""} onChange={(e) => setCompanyForm((v) => ({ ...v, phone_secondary: e.target.value }))} /></Field>
          <Field label="WhatsApp number"><Input value={companyForm.whatsapp ?? ""} onChange={(e) => setCompanyForm((v) => ({ ...v, whatsapp: e.target.value }))} /></Field>
          <Field label="Email"><Input type="email" value={companyForm.email ?? ""} onChange={(e) => setCompanyForm((v) => ({ ...v, email: e.target.value }))} /></Field>
          <Field label="Address"><Input value={companyForm.address ?? ""} onChange={(e) => setCompanyForm((v) => ({ ...v, address: e.target.value }))} /></Field>
          <Field label="City"><Input value={companyForm.city ?? ""} onChange={(e) => setCompanyForm((v) => ({ ...v, city: e.target.value }))} /></Field>
          <Field label="State"><Input value={companyForm.state ?? ""} onChange={(e) => setCompanyForm((v) => ({ ...v, state: e.target.value }))} /></Field>
          <Field label="RC / registration number"><Input value={companyForm.rc_number ?? ""} onChange={(e) => setCompanyForm((v) => ({ ...v, rc_number: e.target.value }))} /></Field>
          <Field label="Logo URL"><Input value={companyForm.logo_url ?? ""} onChange={(e) => setCompanyForm((v) => ({ ...v, logo_url: e.target.value }))} /></Field>
          <Field label="Favicon URL"><Input value={companyForm.favicon_url ?? ""} onChange={(e) => setCompanyForm((v) => ({ ...v, favicon_url: e.target.value }))} /></Field>
          <div className="sm:col-span-2"><Field label="Company description"><Textarea rows={4} value={companyForm.description ?? ""} onChange={(e) => setCompanyForm((v) => ({ ...v, description: e.target.value }))} /></Field></div>
          <div className="sm:col-span-2"><Field label="Footer description"><Textarea rows={3} value={companyForm.footer_description ?? ""} onChange={(e) => setCompanyForm((v) => ({ ...v, footer_description: e.target.value }))} /></Field></div>
          <Field label="Copyright text"><Input value={companyForm.copyright_text ?? ""} onChange={(e) => setCompanyForm((v) => ({ ...v, copyright_text: e.target.value }))} /></Field>
          <Field label="Maximum upload size (MB)"><Input type="number" value={companyForm.max_upload_mb ?? 10} onChange={(e) => setCompanyForm((v) => ({ ...v, max_upload_mb: Number(e.target.value) }))} /></Field>
        </div>
        <div className="mt-5 flex justify-end"><Button onClick={saveCompany} disabled={savingCompany}>{savingCompany ? "Saving…" : "Save company settings"}</Button></div>
      </section>

      <section className="surface-panel p-5 sm:p-7">
        <SectionTitle title="SEO & social sharing" description="Set the browser title, search description and default Open Graph image used when individual pages do not define one." />
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Site title"><Input value={companyForm.site_title ?? ""} onChange={(e) => setCompanyForm((v) => ({ ...v, site_title: e.target.value }))} /></Field>
          <Field label="Default OG image URL"><Input value={companyForm.default_og_image ?? ""} onChange={(e) => setCompanyForm((v) => ({ ...v, default_og_image: e.target.value }))} /></Field>
          <div className="sm:col-span-2"><Field label="Site description"><Textarea rows={3} value={companyForm.site_description ?? ""} onChange={(e) => setCompanyForm((v) => ({ ...v, site_description: e.target.value }))} /></Field></div>
        </div>
        <div className="mt-5 flex justify-end"><Button onClick={saveCompany} disabled={savingCompany}>{savingCompany ? "Saving…" : "Save SEO settings"}</Button></div>
      </section>

      <section className="surface-panel p-5 sm:p-7">
        <SectionTitle title="Primary office & service radius" description="The public distance checker uses this location only after a visitor explicitly requests their distance." />
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Office name"><Input value={officeForm.name ?? ""} onChange={(e) => setOfficeForm((v) => ({ ...v, name: e.target.value }))} /></Field>
          <Field label="Office address"><Input value={officeForm.address ?? ""} onChange={(e) => setOfficeForm((v) => ({ ...v, address: e.target.value }))} /></Field>
          <Field label="City"><Input value={officeForm.city ?? ""} onChange={(e) => setOfficeForm((v) => ({ ...v, city: e.target.value }))} /></Field>
          <Field label="State"><Input value={officeForm.state ?? ""} onChange={(e) => setOfficeForm((v) => ({ ...v, state: e.target.value }))} /></Field>
          <Field label="Latitude"><Input type="number" step="any" value={officeForm.latitude ?? ""} onChange={(e) => setOfficeForm((v) => ({ ...v, latitude: e.target.value === "" ? null : Number(e.target.value) }))} /></Field>
          <Field label="Longitude"><Input type="number" step="any" value={officeForm.longitude ?? ""} onChange={(e) => setOfficeForm((v) => ({ ...v, longitude: e.target.value === "" ? null : Number(e.target.value) }))} /></Field>
          <Field label="Google Maps URL"><Input value={officeForm.google_maps_url ?? ""} onChange={(e) => setOfficeForm((v) => ({ ...v, google_maps_url: e.target.value }))} /></Field>
          <Field label="Service radius (km)"><Input type="number" step="0.1" value={officeForm.service_radius_km ?? 50} onChange={(e) => setOfficeForm((v) => ({ ...v, service_radius_km: Number(e.target.value) }))} /></Field>
        </div>
        <div className="mt-5 flex justify-end"><Button onClick={saveOffice} disabled={savingOffice}>{savingOffice ? "Saving…" : "Save office settings"}</Button></div>
      </section>

      <section className="surface-panel p-5 sm:p-7">
        <SectionTitle title="Business hours" description="Edit the public opening hours shown on the website." />
        <div className="mt-5 space-y-3">
          {orderedHours.map((h) => (
            <div key={h.id} className="grid gap-3 rounded-lg border border-border p-3 sm:grid-cols-[1fr_150px_150px_auto] sm:items-center">
              <Input value={h.label} onChange={(e) => { h.label = e.target.value; }} />
              <Input type="time" value={h.open_time ?? ""} disabled={h.is_closed} onChange={(e) => { h.open_time = e.target.value; }} />
              <Input type="time" value={h.close_time ?? ""} disabled={h.is_closed} onChange={(e) => { h.close_time = e.target.value; }} />
              <label className="flex items-center gap-2 text-sm"><Checkbox checked={h.is_closed} onCheckedChange={(v) => { h.is_closed = v === true; }} /> Closed</label>
            </div>
          ))}
        </div>
        <div className="mt-5 flex justify-end"><Button onClick={saveHours}>Save business hours</Button></div>
      </section>

      <section className="surface-panel p-5 sm:p-7">
        <SectionTitle title="Homepage & legal content" description="Advanced editors for the small JSON content store. Keep the JSON valid; the starter values are already formatted correctly." />
        <div className="mt-6 space-y-5">
          {[
            ["Homepage hero", hero, setHero],
            ["Homepage stats", stats, setStats],
            ["Why choose us", why, setWhy],
            ["Process", process, setProcess],
            ["Closing CTA", cta, setCta],
            ["About page", about, setAbout],
            ["Privacy policy", privacy, setPrivacy],
            ["Terms & conditions", terms, setTerms],
          ].map(([label, value, setter]) => (
            <div key={String(label)}>
              <Label>{String(label)}</Label>
              <Textarea rows={String(label).includes("page") || String(label).includes("policy") || String(label).includes("Terms") ? 7 : 6} value={String(value)} onChange={(e) => (setter as (v: string) => void)(e.target.value)} className="mt-1.5 font-mono text-xs" />
            </div>
          ))}
        </div>
        <div className="mt-5 flex justify-end"><Button onClick={saveContent} disabled={savingContent}>{savingContent ? "Saving…" : "Save website content"}</Button></div>
      </section>
    </div>
  );
}

function PageIntro({ title, description }: { title: string; description: string }) {
  return <div><h1 className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl">{title}</h1><p className="mt-1 text-sm text-muted-foreground">{description}</p></div>;
}
function SectionTitle({ title, description }: { title: string; description: string }) {
  return <div><h2 className="font-display text-base font-semibold text-foreground">{title}</h2><p className="mt-1 text-sm text-muted-foreground">{description}</p></div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><Label>{label}</Label><div className="mt-1.5">{children}</div></div>;
}
