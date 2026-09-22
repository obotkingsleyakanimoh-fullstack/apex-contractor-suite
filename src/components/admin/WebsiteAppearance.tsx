import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { Check, Eye, Palette, RotateCcw, Save, Type } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  APPEARANCE_PRESETS,
  BODY_SIZE_OPTIONS,
  DEFAULT_APPEARANCE,
  FONT_OPTIONS,
  H1_SIZE_OPTIONS,
  H2_SIZE_OPTIONS,
  H3_SIZE_OPTIONS,
  H4_SIZE_OPTIONS,
  WEIGHT_OPTIONS,
  applyAppearance,
  useAppearance,
} from "@/hooks/useAppearance";
import type { WebsiteSettings } from "@/types/db";

const COLOR_FIELDS: Array<{ key: keyof WebsiteSettings; label: string; description: string }> = [
  { key: "primary_color", label: "Primary Color", description: "Buttons, links, active navigation and important UI." },
  { key: "secondary_color", label: "Secondary Color", description: "Supporting buttons, cards and accent sections." },
  { key: "accent_color", label: "Accent Color", description: "Highlights, icons and small visual accents." },
  { key: "background_color", label: "Background Color", description: "Global page background." },
  { key: "surface_color", label: "Surface / Card Color", description: "Cards, forms and panels." },
  { key: "text_color", label: "Text Color", description: "Main body copy." },
  { key: "heading_color", label: "Heading Color", description: "Headings and page titles." },
  { key: "muted_text_color", label: "Muted Text Color", description: "Secondary descriptions and supporting text." },
  { key: "border_color", label: "Border Color", description: "Cards, inputs, dividers and outlines." },
  { key: "navbar_background", label: "Header / Navbar", description: "Public navigation background." },
  { key: "footer_background", label: "Footer Background", description: "Footer and deep brand sections." },
  { key: "hero_overlay_color", label: "Hero Overlay", description: "Color used over cinematic hero photography." },
];

function isHex(value: string) {
  return /^#[0-9a-f]{6}$/i.test(value);
}

function numberValue(value: string, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function FieldGroup({ children }: { children: ReactNode }) {
  return <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">{children}</div>;
}

function ColorField({
  field,
  value,
  onChange,
}: {
  field: (typeof COLOR_FIELDS)[number];
  value: string;
  onChange: (value: string) => void;
}) {
  const safe = isHex(value) ? value : "#17634e";
  return (
    <div className="space-y-2">
      <div>
        <Label>{field.label}</Label>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">{field.description}</p>
      </div>
      <div className="flex items-center gap-2">
        <input
          aria-label={`${field.label} picker`}
          type="color"
          value={safe}
          onChange={(event) => onChange(event.target.value)}
          className="h-10 w-12 cursor-pointer rounded-lg border border-border bg-card p-1"
        />
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={() => {
            if (!isHex(value)) onChange(safe);
          }}
          className="font-mono uppercase"
          maxLength={7}
          placeholder="#17634E"
        />
      </div>
    </div>
  );
}

function SizeControl({
  label,
  value,
  options,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  options: number[];
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <select
          value={options.includes(value) ? String(value) : "custom"}
          onChange={(event) => {
            if (event.target.value !== "custom") onChange(Number(event.target.value));
          }}
          className="h-10 flex-1 rounded-md border border-input bg-background px-3 text-sm"
        >
          {options.map((option) => <option key={option} value={option}>{option}px</option>)}
          <option value="custom">Custom</option>
        </select>
        <Input
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={(event) => onChange(numberValue(event.target.value, value))}
          className="w-24"
        />
      </div>
    </div>
  );
}

function FontSelect({
  label,
  value,
  onChange,
  allowEmpty = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  allowEmpty?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
      >
        {allowEmpty ? <option value="">Use heading font</option> : null}
        {FONT_OPTIONS.map((font) => <option key={font} value={font}>{font}</option>)}
      </select>
      <p className="text-xs text-muted-foreground" style={{ fontFamily: `"${value || "inherit"}"` }}>
        {value || "Heading font"} preview
      </p>
    </div>
  );
}

function WeightSelect({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <select
        value={String(value)}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
      >
        {WEIGHT_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
      </select>
    </div>
  );
}

export function WebsiteAppearance() {
  const { settings, setSettings } = useAppearance();
  const [draft, setDraft] = useState<WebsiteSettings>(settings);
  const [saving, setSaving] = useState(false);
  const [activePreset, setActivePreset] = useState("Zitso Default");
  useEffect(() => {
    if (settings.updated_at !== draft.updated_at || settings.id !== draft.id) {
      setDraft(settings);
    }
  }, [settings.id, settings.updated_at, draft.id, draft.updated_at, settings]);

  const update = <K extends keyof WebsiteSettings>(key: K, value: WebsiteSettings[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const applyPreset = (name: string) => {
    const preset = APPEARANCE_PRESETS[name];
    if (!preset) return;
    setActivePreset(name);
    setDraft((current) => ({ ...current, ...preset }));
  };

  const previewStyle = useMemo(() => ({
    "--preview-primary": draft.primary_color,
    "--preview-secondary": draft.secondary_color,
    "--preview-accent": draft.accent_color,
    "--preview-bg": draft.background_color,
    "--preview-surface": draft.surface_color,
    "--preview-text": draft.text_color,
    "--preview-heading": draft.heading_color,
    "--preview-muted": draft.muted_text_color,
    "--preview-border": draft.border_color,
    "--preview-navbar": draft.navbar_background,
    "--preview-footer": draft.footer_background,
    "--preview-body-font": `"${draft.body_font}", ui-sans-serif, system-ui, sans-serif`,
    "--preview-heading-font": `"${draft.heading_font}", ui-sans-serif, system-ui, sans-serif`,
    "--preview-body-size": `${draft.body_font_size}px`,
    "--preview-h1-size": `${Math.min(draft.h1_font_size, 64)}px`,
    "--preview-button-size": `${draft.button_font_size}px`,
  } as CSSProperties), [draft]);

  async function save() {
    setSaving(true);
    const { id: _id, updated_at: _updatedAt, ...payload } = draft;
    const { data, error } = await supabase
      .from("website_settings")
      .upsert({ ...payload, singleton: true }, { onConflict: "singleton" })
      .select("*")
      .single();
    setSaving(false);

    if (error || !data) {
      toast.error(error?.message ?? "Could not save website appearance.");
      return;
    }

    const next = { ...DEFAULT_APPEARANCE, ...data } as WebsiteSettings;
    setSettings(next);
    applyAppearance(next);
    setDraft(next);
    toast.success("Website appearance saved.");
  }

  function reset() {
    const next = { ...DEFAULT_APPEARANCE, id: settings.id, updated_at: settings.updated_at };
    setDraft(next);
    setActivePreset("Zitso Default");
    toast.success("Appearance reset to the Zitso default draft. Save to publish it.");
  }

  return (
    <section id="appearance" className="space-y-6 scroll-mt-6">
      <div>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow text-[var(--color-primary)]">Website Appearance</p>
            <h2 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">
              Control the visual system from Admin
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              Change typography, colors and brand tokens here without editing the source code. Changes are only published when you press Save Changes.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={reset} disabled={saving}>
              <RotateCcw className="mr-2 h-4 w-4" /> Reset to Default
            </Button>
            <Button onClick={() => void save()} disabled={saving}>
              <Save className="mr-2 h-4 w-4" /> {saving ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {[
            ["general", "General"],
            ["typography", "Typography"],
            ["colors", "Colors"],
            ["presets", "Presets"],
            ["preview", "Preview"],
          ].map(([id, label]) => (
            <a key={id} href={`#appearance-${id}`} className="rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground">
              {label}
            </a>
          ))}
        </div>
      </div>

      <FieldGroup>
        <div id="appearance-general" className="scroll-mt-6">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-[var(--color-accent)]" />
            <h3 className="font-display font-semibold">General</h3>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Site name</Label>
              <Input value={draft.site_name} onChange={(event) => update("site_name", event.target.value)} />
              <p className="text-xs text-muted-foreground">Used as the appearance system's brand name and future-proofed for other global settings.</p>
            </div>
            <div className="rounded-xl border border-dashed border-border bg-secondary/40 p-4 text-sm text-muted-foreground">
              <p className="font-semibold text-foreground">Current Zitso design is preserved</p>
              <p className="mt-1 leading-6">The existing logo, layouts, imagery, hero transitions, navigation, footer and content remain intact. Appearance controls only change global visual tokens.</p>
            </div>
          </div>
        </div>
      </FieldGroup>

      <FieldGroup>
        <div id="appearance-typography" className="scroll-mt-6">
          <div className="flex items-center gap-2">
            <Type className="h-4 w-4 text-[var(--color-accent)]" />
            <h3 className="font-display font-semibold">Typography</h3>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <FontSelect label="Body Font" value={draft.body_font} onChange={(value) => update("body_font", value)} />
            <FontSelect label="Heading Font" value={draft.heading_font} onChange={(value) => update("heading_font", value)} />
            <FontSelect label="Accent Font" value={draft.accent_font} onChange={(value) => update("accent_font", value)} allowEmpty />
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SizeControl label="Body Size" value={draft.body_font_size} options={BODY_SIZE_OPTIONS} min={12} max={24} onChange={(value) => update("body_font_size", value)} />
            <SizeControl label="H1 Size" value={draft.h1_font_size} options={H1_SIZE_OPTIONS} min={28} max={96} onChange={(value) => update("h1_font_size", value)} />
            <SizeControl label="H2 Size" value={draft.h2_font_size} options={H2_SIZE_OPTIONS} min={22} max={64} onChange={(value) => update("h2_font_size", value)} />
            <SizeControl label="H3 Size" value={draft.h3_font_size} options={H3_SIZE_OPTIONS} min={18} max={48} onChange={(value) => update("h3_font_size", value)} />
            <SizeControl label="H4 Size" value={draft.h4_font_size} options={H4_SIZE_OPTIONS} min={16} max={40} onChange={(value) => update("h4_font_size", value)} />
            <SizeControl label="Navigation Size" value={draft.nav_font_size} options={[12, 13, 14, 15, 16]} min={11} max={20} onChange={(value) => update("nav_font_size", value)} />
            <SizeControl label="Button Size" value={draft.button_font_size} options={[12, 13, 14, 15, 16]} min={11} max={20} onChange={(value) => update("button_font_size", value)} />
            <SizeControl label="Small Text Size" value={draft.small_text_size} options={[10, 11, 12, 13, 14]} min={9} max={18} onChange={(value) => update("small_text_size", value)} />
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <WeightSelect label="Heading Weight" value={draft.heading_font_weight} onChange={(value) => update("heading_font_weight", value)} />
            <WeightSelect label="Body Weight" value={draft.body_font_weight} onChange={(value) => update("body_font_weight", value)} />
            <WeightSelect label="Navigation Weight" value={draft.nav_font_weight} onChange={(value) => update("nav_font_weight", value)} />
            <WeightSelect label="Button Weight" value={draft.button_font_weight} onChange={(value) => update("button_font_weight", value)} />
          </div>
        </div>
      </FieldGroup>

      <FieldGroup>
        <div id="appearance-colors" className="scroll-mt-6">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-[var(--color-accent)]" />
            <h3 className="font-display font-semibold">Colors / Brand Theme</h3>
          </div>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {COLOR_FIELDS.map((field) => (
              <ColorField
                key={String(field.key)}
                field={field}
                value={String(draft[field.key])}
                onChange={(value) => update(field.key, value as never)}
              />
            ))}
          </div>
          <div className="mt-6 rounded-xl border border-border bg-secondary/40 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label>Hero Overlay Opacity</Label>
                <p className="mt-1 text-xs text-muted-foreground">Controls how strongly the brand overlay sits over hero photography.</p>
              </div>
              <span className="rounded-full bg-card px-3 py-1 text-xs font-bold">{Math.round(draft.hero_overlay_opacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={draft.hero_overlay_opacity}
              onChange={(event) => update("hero_overlay_opacity", Number(event.target.value))}
              className="mt-4 w-full accent-[var(--color-primary)]"
            />
          </div>
        </div>
      </FieldGroup>

      <FieldGroup>
        <div id="appearance-presets" className="scroll-mt-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-display font-semibold">Preset Themes</h3>
              <p className="mt-1 text-sm text-muted-foreground">Presets only change the draft until you press Save Changes.</p>
            </div>
            <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold">{activePreset}</span>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {Object.entries(APPEARANCE_PRESETS).map(([name, preset]) => (
              <button
                key={name}
                type="button"
                onClick={() => applyPreset(name)}
                className={`rounded-2xl border p-4 text-left transition-all ${activePreset === name ? "border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20" : "border-border hover:border-[var(--color-primary)]"}`}
              >
                <div className="flex gap-1.5">
                  {[preset.primary_color, preset.secondary_color, preset.accent_color, preset.footer_background].map((color) => (
                    <span key={color} className="h-7 flex-1 rounded-md border border-black/5" style={{ backgroundColor: color }} />
                  ))}
                </div>
                <p className="mt-3 text-sm font-semibold">{name}</p>
              </button>
            ))}
          </div>
        </div>
      </FieldGroup>

      <FieldGroup>
        <div id="appearance-preview" className="scroll-mt-6">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-[var(--color-accent)]" />
            <h3 className="font-display font-semibold">Live Preview</h3>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">This preview updates immediately while you edit. It does not publish anything until Save Changes.</p>

          <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-border shadow-card" style={previewStyle}>
            <div style={{ background: "var(--preview-navbar)", color: "var(--preview-heading)", fontFamily: "var(--preview-body-font)", fontSize: "var(--preview-body-size)" }} className="flex items-center justify-between gap-4 border-b px-5 py-4">
              <strong style={{ fontFamily: "var(--preview-heading-font)" }}>Zitso Energy</strong>
              <div className="hidden gap-5 text-xs font-semibold sm:flex">
                <span>Home</span><span>Services</span><span>Projects</span><span>About</span><span>Contact</span>
              </div>
              <span className="rounded-full px-4 py-2 text-xs font-bold text-white" style={{ background: "var(--preview-primary)", fontSize: "var(--preview-button-size)" }}>Request a quote</span>
            </div>

            <div className="grid gap-6 p-6 sm:p-8 md:grid-cols-[1.2fr_.8fr]" style={{ background: "linear-gradient(120deg, var(--preview-footer), var(--preview-primary))", color: "white", fontFamily: "var(--preview-body-font)" }}>
              <div className="self-center">
                <span className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: "var(--preview-accent)" }}>Solar energy</span>
                <h4 className="mt-3 text-3xl font-bold sm:text-4xl" style={{ fontFamily: "var(--preview-heading-font)", color: "white", fontSize: "var(--preview-h1-size)" }}>Power your home with dependable solar.</h4>
                <p className="mt-3 max-w-xl text-sm leading-6" style={{ color: "rgba(255,255,255,.78)" }}>A realistic preview of the visual system, including type, buttons, cards and form controls.</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="rounded-full px-4 py-2 text-sm font-semibold" style={{ background: "var(--preview-accent)", color: "var(--preview-heading)", fontSize: "var(--preview-button-size)" }}>Primary action</span>
                  <span className="rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold">Secondary</span>
                </div>
              </div>
              <div className="rounded-2xl p-5" style={{ background: "var(--preview-surface)", color: "var(--preview-text)" }}>
                <h5 className="font-bold" style={{ fontFamily: "var(--preview-heading-font)", color: "var(--preview-heading)" }}>Solar assessment</h5>
                <p className="mt-1 text-sm" style={{ color: "var(--preview-muted)" }}>Tell us what you want to power.</p>
                <div className="mt-4 space-y-3">
                  <div className="rounded-lg border bg-transparent px-3 py-2 text-sm" style={{ borderColor: "var(--preview-border)", color: "var(--preview-muted)" }}>Your name</div>
                  <div className="rounded-lg border bg-transparent px-3 py-2 text-sm" style={{ borderColor: "var(--preview-border)", color: "var(--preview-muted)" }}>Email address</div>
                  <span className="inline-flex rounded-full px-4 py-2 text-xs font-bold text-white" style={{ background: "var(--preview-primary)" }}>Send enquiry</span>
                </div>
              </div>
            </div>

            <div className="px-5 py-4 text-xs" style={{ background: "var(--preview-footer)", color: "rgba(255,255,255,.72)", fontFamily: "var(--preview-body-font)" }}>
              Footer preview • Zitso Energy • Solar PV • Inverter • Battery storage
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-border bg-secondary/30 p-4">
            <div className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-[var(--color-primary)]" />
              <span>Changes are local to this draft until saved.</span>
            </div>
            <Button onClick={() => void save()} disabled={saving}>
              <Save className="mr-2 h-4 w-4" /> {saving ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </div>
      </FieldGroup>
    </section>
  );
}
