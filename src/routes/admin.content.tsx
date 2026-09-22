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
import { MediaUploadField } from "@/components/admin/MediaUploadField";
import type { CompanySettings, OfficeLocation, BusinessHour, HeroContent, HeroSlide, PageContent } from "@/types/db";
import { logActivity } from "@/lib/activity";
import { PageHeroCarousel } from "@/components/site/PageHeroCarousel";

export const Route = createFileRoute("/admin/content")({ component: AdminContent });
const dayOrder = [1, 2, 3, 4, 5, 6, 0];

type HeroEditorProps = { title: string; description: string; value: HeroContent; onChange: (value: HeroContent) => void };
function HeroEditor({ title, description, value, onChange }: HeroEditorProps) {
  const slides = Array.isArray(value.slides) ? value.slides : [];
  const updateSlide = (index: number, patch: Partial<HeroSlide>) => onChange({ ...value, slides: slides.map((slide, i) => i === index ? { ...slide, ...patch } : slide) });
  return <section className="surface-panel p-5 sm:p-7">
    <SectionTitle title={title} description={description} />
    <div className="mt-6 grid gap-4 sm:grid-cols-2">
      <Field label="Eyebrow"><Input value={value.eyebrow ?? ""} onChange={(e) => onChange({ ...value, eyebrow: e.target.value })} /></Field>
      <Field label="Autoplay seconds"><Input type="number" min="2.5" step="0.5" value={value.autoplay_seconds ?? 4.5} onChange={(e) => onChange({ ...value, autoplay_seconds: Number(e.target.value) || 4.5 })} /></Field>
      <div className="sm:col-span-2"><Field label="Default headline"><Input value={value.headline ?? ""} onChange={(e) => onChange({ ...value, headline: e.target.value })} /></Field></div>
      <div className="sm:col-span-2"><Field label="Default subheadline"><Textarea rows={3} value={value.subheadline ?? ""} onChange={(e) => onChange({ ...value, subheadline: e.target.value })} /></Field></div>
      <Field label="Primary button"><Input value={value.primary_cta ?? ""} onChange={(e) => onChange({ ...value, primary_cta: e.target.value })} /></Field>
      <Field label="Primary button URL"><Input value={value.primary_cta_url ?? ""} onChange={(e) => onChange({ ...value, primary_cta_url: e.target.value })} /></Field>
      <Field label="Secondary button"><Input value={value.secondary_cta ?? ""} onChange={(e) => onChange({ ...value, secondary_cta: e.target.value })} /></Field>
      <Field label="Secondary button URL"><Input value={value.secondary_cta_url ?? ""} onChange={(e) => onChange({ ...value, secondary_cta_url: e.target.value })} /></Field>
    </div>
    <div className="mt-7 rounded-2xl border border-border bg-background p-3 sm:p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-semibold">Current live hero preview</h3>
          <p className="text-xs text-muted-foreground">This uses the same wide cinematic hero component, image treatment, fade/zoom transition and responsive layout used by the current public site.</p>
        </div>
        <span className="hidden rounded-full bg-secondary px-3 py-1 text-[11px] font-semibold text-muted-foreground sm:inline-flex">Live design</span>
      </div>
      <div className="overflow-hidden rounded-xl border border-border">
        <PageHeroCarousel
          hero={value}
          fallbackSlides={[
            { image_url: "/images/solar-installation.webp", eyebrow: "Solar energy • Zitso Energy", headline: "Power your home with energy you can depend on.", subheadline: "We design practical solar power systems around the way you use electricity." },
            { image_url: "/images/inverter-installation.webp", eyebrow: "Hybrid power • Battery storage", headline: "Keep essential power running when the grid cannot.", subheadline: "Hybrid inverter and battery systems designed around the loads that matter most." },
            { image_url: "/images/commercial-project.webp", eyebrow: "Residential • Commercial • Industrial", headline: "A complete solar solution from assessment to after-sales care.", subheadline: "Assessment, sizing, installation and maintenance for dependable energy." },
          ]}
          primaryHref="/request-quote"
          secondaryHref="/services"
          primaryLabel="Get a solar assessment"
          secondaryLabel="Explore solar solutions"
          minHeight="min-h-[430px] sm:min-h-[500px] lg:min-h-[560px]"
        />
      </div>
    </div>
    <div className="mt-7 space-y-4">
      <div className="flex items-center justify-between"><div><h3 className="font-display text-base font-semibold">Carousel slides</h3><p className="text-sm text-muted-foreground">Each slide uses an image chosen from your computer and uploaded to the Supabase media bucket.</p></div><Button type="button" variant="outline" onClick={() => onChange({ ...value, slides: [...slides, { image_url: "", eyebrow: "Solar energy", headline: "Power your home with energy you can depend on.", subheadline: "Tell us what you need to power and we will design the right solar system around your needs." }] })}>Add slide</Button></div>
      {slides.map((slide, index) => <div key={index} className="rounded-2xl border border-border bg-secondary/30 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3"><p className="font-semibold">Slide {index + 1}</p><Button type="button" variant="ghost" size="sm" onClick={() => onChange({ ...value, slides: slides.filter((_, i) => i !== index) })}>Remove</Button></div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2"><Field label="Slide image"><MediaUploadField value={slide.image_url} onChange={(v) => updateSlide(index, { image_url: v })} /></Field></div>
          <Field label="Eyebrow"><Input value={slide.eyebrow ?? ""} onChange={(e) => updateSlide(index, { eyebrow: e.target.value })} /></Field>
          <Field label="Headline"><Input value={slide.headline ?? ""} onChange={(e) => updateSlide(index, { headline: e.target.value })} /></Field>
          <div className="sm:col-span-2"><Field label="Subheadline"><Textarea rows={3} value={slide.subheadline ?? ""} onChange={(e) => updateSlide(index, { subheadline: e.target.value })} /></Field></div>
        </div>
      </div>)}
      {!slides.length ? <p className="rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground">No custom slides yet. The public page will use its built-in solar defaults until you add slides.</p> : null}
    </div>
  </section>;
}

function AdminContent() {
  const { company, office, hours, reload } = useSiteData();
  const { get, rows, refetch } = useSiteContent();
  const [companyForm, setCompanyForm] = useState<Partial<CompanySettings>>({});
  const [officeForm, setOfficeForm] = useState<Partial<OfficeLocation>>({});
  const [heroes, setHeroes] = useState<Record<string, HeroContent>>({});
  const [aboutContent, setAboutContent] = useState<PageContent>({});
  const [legal, setLegal] = useState({ privacy: "{}", terms: "{}" });
  const [savingCompany, setSavingCompany] = useState(false);
  const [savingContent, setSavingContent] = useState(false);

  useEffect(() => { if (company) setCompanyForm(company); }, [company]);
  useEffect(() => { if (office) setOfficeForm(office); }, [office]);
  useEffect(() => {
    const heroKeys = ["homepage_hero", "services_hero", "projects_hero", "about_hero", "contact_hero", "blog_hero", "request_quote_hero"];
    const next: Record<string, HeroContent> = {};
    for (const key of heroKeys) next[key] = get<HeroContent>(key, {});
    setHeroes(next);
    setAboutContent(get<PageContent>("page_about", {}));
    setLegal({ privacy: JSON.stringify(get("page_privacy", {}), null, 2), terms: JSON.stringify(get("page_terms", {}), null, 2) });
  }, [rows]);

  const orderedHours = useMemo(() => dayOrder.map((day) => hours.find((h) => h.day_of_week === day)).filter(Boolean) as BusinessHour[], [hours]);
  const updateHero = (key: string, value: HeroContent) => setHeroes((current) => ({ ...current, [key]: { ...value, autoplay_seconds: value.autoplay_seconds || 4.5 } }));

  async function saveCompany() {
    if (!companyForm.company_name?.trim()) return toast.error("Company name is required.");
    setSavingCompany(true);
    const payload = { ...companyForm };
    delete (payload as any).id; delete (payload as any).created_at; delete (payload as any).updated_at;
    const { error } = company?.id ? await supabase.from("company_settings").update(payload).eq("id", company.id) : await supabase.from("company_settings").insert(payload as any);
    setSavingCompany(false);
    if (error) return toast.error(error.message);
    await logActivity({ action: "updated", entity: "company_settings", details: "Updated company and SEO settings" });
    toast.success("Company settings saved."); reload();
  }

  async function saveOffice() {
    if (!officeForm.name?.trim()) return toast.error("Office name is required.");
    const payload = { ...officeForm };
    delete (payload as any).id; delete (payload as any).created_at; delete (payload as any).updated_at;
    const { error } = office?.id ? await supabase.from("office_locations").update(payload).eq("id", office.id) : await supabase.from("office_locations").insert({ ...payload, is_primary: true, published: true } as any);
    if (error) return toast.error(error.message);
    toast.success("Office settings saved."); reload();
  }

  async function saveHours() {
    const results = await Promise.all(orderedHours.map((h) => supabase.from("business_hours").update({ label: h.label, open_time: h.open_time || null, close_time: h.close_time || null, is_closed: h.is_closed, sort_order: h.sort_order }).eq("id", h.id)));
    const failed = results.find((r) => r.error); if (failed?.error) return toast.error(failed.error.message);
    toast.success("Business hours saved."); reload();
  }

  async function saveContent() {
    setSavingContent(true);
    const payloads: [string, unknown][] = Object.entries(heroes).map(([key, value]) => [key, { ...value, autoplay_seconds: Number(value.autoplay_seconds) || 4.5, slides: (value.slides ?? []).filter((slide) => slide.image_url?.trim()) }]);
    payloads.push(["page_about", aboutContent]);
    try { payloads.push(["page_privacy", JSON.parse(legal.privacy)], ["page_terms", JSON.parse(legal.terms)]); }
    catch { setSavingContent(false); return toast.error("Privacy or terms content is not valid JSON."); }
    const results = await Promise.all(payloads.map(([key, value]) => supabase.from("site_content").upsert({ key, value: value as any }, { onConflict: "key" })));
    const failed = results.find((r) => r.error); setSavingContent(false);
    if (failed?.error) return toast.error(failed.error.message);
    await logActivity({ action: "updated", entity: "site_content", details: "Updated page heroes and website content" });
    toast.success("Website content saved."); refetch();
  }

  return <div className="space-y-8">
    <PageIntro title="Business & website content" description="Control the public solar website from one place. Page heroes, images, messaging, company details, contact details, SEO and legal content are stored in Supabase." />

    <section className="surface-panel p-5 sm:p-7"><SectionTitle title="Company information" description="These values power the public header, footer, contact details, enquiry pages and SEO." /><div className="mt-6 grid gap-4 sm:grid-cols-2">
      <Field label="Company name"><Input value={companyForm.company_name ?? ""} onChange={(e) => setCompanyForm((v) => ({ ...v, company_name: e.target.value }))} /></Field><Field label="Tagline"><Input value={companyForm.tagline ?? ""} onChange={(e) => setCompanyForm((v) => ({ ...v, tagline: e.target.value }))} /></Field><Field label="Phone"><Input value={companyForm.phone ?? ""} onChange={(e) => setCompanyForm((v) => ({ ...v, phone: e.target.value }))} /></Field><Field label="Secondary phone"><Input value={companyForm.phone_secondary ?? ""} onChange={(e) => setCompanyForm((v) => ({ ...v, phone_secondary: e.target.value }))} /></Field><Field label="WhatsApp number"><Input value={companyForm.whatsapp ?? ""} onChange={(e) => setCompanyForm((v) => ({ ...v, whatsapp: e.target.value }))} /></Field><Field label="Email"><Input type="email" value={companyForm.email ?? ""} onChange={(e) => setCompanyForm((v) => ({ ...v, email: e.target.value }))} /></Field><Field label="Address"><Input value={companyForm.address ?? ""} onChange={(e) => setCompanyForm((v) => ({ ...v, address: e.target.value }))} /></Field><Field label="City"><Input value={companyForm.city ?? ""} onChange={(e) => setCompanyForm((v) => ({ ...v, city: e.target.value }))} /></Field><Field label="State"><Input value={companyForm.state ?? ""} onChange={(e) => setCompanyForm((v) => ({ ...v, state: e.target.value }))} /></Field><Field label="RC / registration number"><Input value={companyForm.rc_number ?? ""} onChange={(e) => setCompanyForm((v) => ({ ...v, rc_number: e.target.value }))} /></Field><Field label="Logo"><MediaUploadField value={companyForm.logo_url ?? ""} onChange={(v) => setCompanyForm((x) => ({ ...x, logo_url: v }))} /></Field><Field label="Favicon"><MediaUploadField value={companyForm.favicon_url ?? ""} onChange={(v) => setCompanyForm((x) => ({ ...x, favicon_url: v }))} /></Field><div className="sm:col-span-2"><Field label="Company description"><Textarea rows={4} value={companyForm.description ?? ""} onChange={(e) => setCompanyForm((v) => ({ ...v, description: e.target.value }))} /></Field></div><div className="sm:col-span-2"><Field label="Footer description"><Textarea rows={3} value={companyForm.footer_description ?? ""} onChange={(e) => setCompanyForm((v) => ({ ...v, footer_description: e.target.value }))} /></Field></div></div><div className="mt-5 flex justify-end"><Button onClick={saveCompany} disabled={savingCompany}>{savingCompany ? "Saving…" : "Save company settings"}</Button></div></section>

    <section className="surface-panel p-5 sm:p-7"><SectionTitle title="SEO & social sharing" description="Set the browser title, search description and default social image." /><div className="mt-6 grid gap-4 sm:grid-cols-2"><Field label="Site title"><Input value={companyForm.site_title ?? ""} onChange={(e) => setCompanyForm((v) => ({ ...v, site_title: e.target.value }))} /></Field><Field label="Default social image"><MediaUploadField value={companyForm.default_og_image ?? ""} onChange={(v) => setCompanyForm((v) => ({ ...v, default_og_image: v }))} /></Field><div className="sm:col-span-2"><Field label="Site description"><Textarea rows={3} value={companyForm.site_description ?? ""} onChange={(e) => setCompanyForm((v) => ({ ...v, site_description: e.target.value }))} /></Field></div></div><div className="mt-5 flex justify-end"><Button onClick={saveCompany} disabled={savingCompany}>{savingCompany ? "Saving…" : "Save SEO settings"}</Button></div></section>

    <section className="surface-panel p-5 sm:p-7"><SectionTitle title="Primary office & service radius" description="Controls the public contact details, map and distance checker." /><div className="mt-6 grid gap-4 sm:grid-cols-2"><Field label="Office name"><Input value={officeForm.name ?? ""} onChange={(e) => setOfficeForm((v) => ({ ...v, name: e.target.value }))} /></Field><Field label="Office address"><Input value={officeForm.address ?? ""} onChange={(e) => setOfficeForm((v) => ({ ...v, address: e.target.value }))} /></Field><Field label="City"><Input value={officeForm.city ?? ""} onChange={(e) => setOfficeForm((v) => ({ ...v, city: e.target.value }))} /></Field><Field label="State"><Input value={officeForm.state ?? ""} onChange={(e) => setOfficeForm((v) => ({ ...v, state: e.target.value }))} /></Field><Field label="Latitude"><Input type="number" step="any" value={officeForm.latitude ?? ""} onChange={(e) => setOfficeForm((v) => ({ ...v, latitude: e.target.value === "" ? null : Number(e.target.value) }))} /></Field><Field label="Longitude"><Input type="number" step="any" value={officeForm.longitude ?? ""} onChange={(e) => setOfficeForm((v) => ({ ...v, longitude: e.target.value === "" ? null : Number(e.target.value) }))} /></Field><Field label="Google Maps URL"><Input value={officeForm.google_maps_url ?? ""} onChange={(e) => setOfficeForm((v) => ({ ...v, google_maps_url: e.target.value }))} /></Field><Field label="Service radius (km)"><Input type="number" step="0.1" value={officeForm.service_radius_km ?? 50} onChange={(e) => setOfficeForm((v) => ({ ...v, service_radius_km: Number(e.target.value) }))} /></Field></div><div className="mt-5 flex justify-end"><Button onClick={saveOffice}>Save office settings</Button></div></section>

    <section className="surface-panel p-5 sm:p-7"><SectionTitle title="Business hours" description="Edit the public opening hours shown on the website." /><div className="mt-5 space-y-3">{orderedHours.map((h) => <div key={h.id} className="grid gap-3 rounded-lg border border-border p-3 sm:grid-cols-[1fr_150px_150px_auto] sm:items-center"><Input value={h.label} onChange={(e) => { h.label = e.target.value; }} /><Input type="time" value={h.open_time ?? ""} disabled={h.is_closed} onChange={(e) => { h.open_time = e.target.value; }} /><Input type="time" value={h.close_time ?? ""} disabled={h.is_closed} onChange={(e) => { h.close_time = e.target.value; }} /><label className="flex items-center gap-2 text-sm"><Checkbox checked={h.is_closed} onCheckedChange={(v) => { h.is_closed = v === true; }} /> Closed</label></div>)}</div><div className="mt-5 flex justify-end"><Button onClick={saveHours}>Save business hours</Button></div></section>

    <HeroEditor title="Homepage hero carousel" description="The main homepage hero. Images, messaging, buttons and the 4.5-second transition are configurable." value={heroes.homepage_hero ?? { autoplay_seconds: 4.5 }} onChange={(v) => updateHero("homepage_hero", v)} />
    <HeroEditor title="Services page hero" description="Controls the wide animated hero at /services." value={heroes.services_hero ?? { autoplay_seconds: 4.5 }} onChange={(v) => updateHero("services_hero", v)} />
    <HeroEditor title="Projects page hero" description="Controls the wide animated hero at /projects." value={heroes.projects_hero ?? { autoplay_seconds: 4.5 }} onChange={(v) => updateHero("projects_hero", v)} />
    <HeroEditor title="About page hero" description="Controls the wide animated hero at /about." value={heroes.about_hero ?? { autoplay_seconds: 4.5 }} onChange={(v) => updateHero("about_hero", v)} />
    <HeroEditor title="Contact page hero" description="Controls the wide animated hero at /contact." value={heroes.contact_hero ?? { autoplay_seconds: 4.5 }} onChange={(v) => updateHero("contact_hero", v)} />
    <HeroEditor title="Blog page hero" description="Controls the wide animated hero at /blog. Add your solar imagery, messaging and transition speed just like the other main pages." value={heroes.blog_hero ?? { autoplay_seconds: 4.5 }} onChange={(v) => updateHero("blog_hero", v)} />
    <HeroEditor title="Request Quote page hero" description="Controls the wide cinematic hero at /request-quote and keeps it visually consistent with the other main pages." value={heroes.request_quote_hero ?? { autoplay_seconds: 4.5 }} onChange={(v) => updateHero("request_quote_hero", v)} />

    <section className="surface-panel p-5 sm:p-7"><SectionTitle title="About page content" description="Edit the supporting copy and closing call-to-action used on the About page." /><div className="mt-6 grid gap-4 sm:grid-cols-2"><Field label="Eyebrow"><Input value={aboutContent.eyebrow ?? ""} onChange={(e) => setAboutContent((v) => ({ ...v, eyebrow: e.target.value }))} /></Field><Field label="Section headline"><Input value={aboutContent.headline ?? ""} onChange={(e) => setAboutContent((v) => ({ ...v, headline: e.target.value }))} /></Field><div className="sm:col-span-2"><Field label="Section body"><Textarea rows={5} value={aboutContent.body ?? ""} onChange={(e) => setAboutContent((v) => ({ ...v, body: e.target.value }))} /></Field></div><Field label="Closing CTA heading"><Input value={aboutContent.cta ?? ""} onChange={(e) => setAboutContent((v) => ({ ...v, cta: e.target.value }))} /></Field><Field label="CTA description"><Input value={aboutContent.subheadline ?? ""} onChange={(e) => setAboutContent((v) => ({ ...v, subheadline: e.target.value }))} /></Field><Field label="CTA button"><Input value={aboutContent.primary_cta ?? ""} onChange={(e) => setAboutContent((v) => ({ ...v, primary_cta: e.target.value }))} /></Field><Field label="CTA URL"><Input value={aboutContent.primary_cta_url ?? ""} onChange={(e) => setAboutContent((v) => ({ ...v, primary_cta_url: e.target.value }))} /></Field></div></section>

    <section className="surface-panel p-5 sm:p-7"><SectionTitle title="Legal content" description="Advanced JSON editors for privacy and terms. Keep the JSON valid." /><div className="mt-6 grid gap-5 lg:grid-cols-2"><Field label="Privacy policy"><Textarea rows={12} value={legal.privacy} onChange={(e) => setLegal((v) => ({ ...v, privacy: e.target.value }))} className="font-mono text-xs" /></Field><Field label="Terms & conditions"><Textarea rows={12} value={legal.terms} onChange={(e) => setLegal((v) => ({ ...v, terms: e.target.value }))} className="font-mono text-xs" /></Field></div><div className="mt-5 flex justify-end"><Button onClick={saveContent} disabled={savingContent}>{savingContent ? "Saving…" : "Save all website content"}</Button></div></section>

    <div className="sticky bottom-4 z-10 flex justify-end"><Button size="lg" onClick={saveContent} disabled={savingContent} className="rounded-full shadow-xl">{savingContent ? "Saving website…" : "Save all page content"}</Button></div>
  </div>;
}

function PageIntro({ title, description }: { title: string; description: string }) { return <div><h1 className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl">{title}</h1><p className="mt-1 text-sm text-muted-foreground">{description}</p></div>; }
function SectionTitle({ title, description }: { title: string; description: string }) { return <div><h2 className="font-display text-base font-semibold text-foreground">{title}</h2><p className="mt-1 text-sm text-muted-foreground">{description}</p></div>; }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div><Label>{label}</Label><div className="mt-1.5">{children}</div></div>; }
