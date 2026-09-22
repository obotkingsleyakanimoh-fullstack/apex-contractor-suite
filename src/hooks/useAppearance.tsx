import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { WebsiteSettings } from "@/types/db";

export const DEFAULT_APPEARANCE: WebsiteSettings = {
  id: "default",
  site_name: "Zitso Energy",
  singleton: true,
  primary_color: "#17634e",
  secondary_color: "#edf7f2",
  accent_color: "#f6c453",
  background_color: "#f9faf5",
  surface_color: "#f4f5ef",
  text_color: "#33413b",
  heading_color: "#102019",
  muted_text_color: "#52605a",
  border_color: "#dfe5df",
  navbar_background: "#ffffff",
  footer_background: "#071a16",
  hero_overlay_color: "#06120f",
  hero_overlay_opacity: 0.78,
  body_font: "Source Sans 3",
  heading_font: "Archivo",
  accent_font: "Manrope",
  body_font_size: 16,
  h1_font_size: 64,
  h2_font_size: 40,
  h3_font_size: 30,
  h4_font_size: 24,
  nav_font_size: 14,
  button_font_size: 14,
  small_text_size: 12,
  heading_font_weight: 700,
  body_font_weight: 400,
  nav_font_weight: 600,
  button_font_weight: 600,
  updated_at: new Date(0).toISOString(),
};

export const FONT_OPTIONS = [
  "Inter",
  "Poppins",
  "Montserrat",
  "Roboto",
  "Open Sans",
  "Lato",
  "Nunito",
  "Nunito Sans",
  "Manrope",
  "DM Sans",
  "Plus Jakarta Sans",
  "Outfit",
  "Raleway",
  "Merriweather",
  "Playfair Display",
  "Source Sans 3",
  "Work Sans",
  "Oswald",
  "Archivo",
] as const;

export const WEIGHT_OPTIONS = [
  { value: 400, label: "Regular" },
  { value: 500, label: "Medium" },
  { value: 600, label: "Semi Bold" },
  { value: 700, label: "Bold" },
  { value: 800, label: "Extra Bold" },
] as const;

export const BODY_SIZE_OPTIONS = [14, 15, 16, 17, 18];
export const H1_SIZE_OPTIONS = [36, 40, 48, 56, 64];
export const H2_SIZE_OPTIONS = [28, 32, 36, 40, 48];
export const H3_SIZE_OPTIONS = [22, 24, 26, 30, 34];
export const H4_SIZE_OPTIONS = [18, 20, 22, 24, 28];

export const APPEARANCE_PRESETS: Record<string, Partial<WebsiteSettings>> = {
  "Zitso Default": { ...DEFAULT_APPEARANCE },
  "Corporate Blue": {
    primary_color: "#155e75",
    secondary_color: "#e6f4f8",
    accent_color: "#f0b429",
    background_color: "#f8fafc",
    surface_color: "#eef4f7",
    text_color: "#334155",
    heading_color: "#0f172a",
    muted_text_color: "#64748b",
    border_color: "#d7e0e7",
    navbar_background: "#ffffff",
    footer_background: "#0f2d3a",
    hero_overlay_color: "#082f49",
  },
  "Energy Green": {
    primary_color: "#16805b",
    secondary_color: "#e7f7ef",
    accent_color: "#e7b83e",
    background_color: "#f7fbf8",
    surface_color: "#edf6f0",
    text_color: "#29463a",
    heading_color: "#123529",
    muted_text_color: "#5f766a",
    border_color: "#d6e6db",
    navbar_background: "#ffffff",
    footer_background: "#0b3527",
    hero_overlay_color: "#06281d",
  },
  "Dark Energy": {
    primary_color: "#2fb982",
    secondary_color: "#19372e",
    accent_color: "#f6c453",
    background_color: "#0b1512",
    surface_color: "#12211d",
    text_color: "#dce9e4",
    heading_color: "#f4faf7",
    muted_text_color: "#9eb3aa",
    border_color: "#29423a",
    navbar_background: "#0c1815",
    footer_background: "#050c0a",
    hero_overlay_color: "#020907",
  },
  "Clean Light": {
    primary_color: "#17634e",
    secondary_color: "#f0f2f2",
    accent_color: "#d89d18",
    background_color: "#ffffff",
    surface_color: "#f7f8f8",
    text_color: "#3f4946",
    heading_color: "#17201d",
    muted_text_color: "#6b7471",
    border_color: "#e3e7e5",
    navbar_background: "#ffffff",
    footer_background: "#17201d",
    hero_overlay_color: "#08120f",
  },
};

function hexToRgb(hex: string) {
  const value = hex.replace("#", "");
  const normalized = value.length === 3 ? value.split("").map((c) => c + c).join("") : value;
  const number = Number.parseInt(normalized, 16);
  if (!Number.isFinite(number)) return { r: 23, g: 99, b: 78 };
  return { r: (number >> 16) & 255, g: (number >> 8) & 255, b: number & 255 };
}

function foregroundFor(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.62 ? "#102019" : "#ffffff";
}

function fontStack(name: string, fallback: string) {
  const escaped = name.replace(/"/g, '\\"');
  return `"${escaped}", ${fallback}`;
}

export function applyAppearance(settings: WebsiteSettings) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const bodyFallback = /Merriweather|Playfair Display/.test(settings.body_font)
    ? "Georgia, serif"
    : "ui-sans-serif, system-ui, sans-serif";
  const headingFallback = /Merriweather|Playfair Display/.test(settings.heading_font)
    ? "Georgia, serif"
    : "ui-sans-serif, system-ui, sans-serif";
  const accentFallback = /Merriweather|Playfair Display/.test(settings.accent_font)
    ? "Georgia, serif"
    : "ui-sans-serif, system-ui, sans-serif";

  const vars: Record<string, string> = {
    "--font-sans": fontStack(settings.body_font, bodyFallback),
    "--font-display": fontStack(settings.heading_font, headingFallback),
    "--font-accent": fontStack(settings.accent_font || settings.heading_font, accentFallback),
    "--background": settings.background_color,
    "--foreground": settings.text_color,
    "--surface": settings.surface_color,
    "--surface-foreground": settings.text_color,
    "--card": settings.surface_color,
    "--card-foreground": settings.text_color,
    "--popover": settings.surface_color,
    "--popover-foreground": settings.text_color,
    "--primary": settings.primary_color,
    "--primary-foreground": foregroundFor(settings.primary_color),
    "--secondary": settings.secondary_color,
    "--secondary-foreground": foregroundFor(settings.secondary_color),
    "--accent": settings.accent_color,
    "--accent-foreground": foregroundFor(settings.accent_color),
    "--muted": settings.secondary_color,
    "--muted-foreground": settings.muted_text_color,
    "--border": settings.border_color,
    "--input": settings.border_color,
    "--ring": settings.accent_color,
    "--heading-color": settings.heading_color,
    "--navbar-background": settings.navbar_background,
    "--footer-background": settings.footer_background,
    "--hero-overlay": settings.hero_overlay_color,
    "--hero-overlay-opacity": String(Math.min(1, Math.max(0, Number(settings.hero_overlay_opacity ?? 0.78)))),
    "--font-size-body": `${settings.body_font_size}px`,
    "--font-size-h1": `${settings.h1_font_size}px`,
    "--font-size-h2": `${settings.h2_font_size}px`,
    "--font-size-h3": `${settings.h3_font_size}px`,
    "--font-size-h4": `${settings.h4_font_size}px`,
    "--font-size-nav": `${settings.nav_font_size}px`,
    "--font-size-button": `${settings.button_font_size}px`,
    "--font-size-small": `${settings.small_text_size}px`,
    "--font-weight-heading": String(settings.heading_font_weight),
    "--font-weight-body": String(settings.body_font_weight),
    "--font-weight-nav": String(settings.nav_font_weight),
    "--font-weight-button": String(settings.button_font_weight),
  };

  for (const [key, value] of Object.entries(vars)) root.style.setProperty(key, value);
  root.dataset.appearance = "custom";
}

interface AppearanceContextValue {
  settings: WebsiteSettings;
  loading: boolean;
  refresh: () => Promise<void>;
  setSettings: (settings: WebsiteSettings) => void;
}

const AppearanceContext = createContext<AppearanceContextValue | null>(null);

export function AppearanceProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<WebsiteSettings>(DEFAULT_APPEARANCE);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("website_settings")
      .select("*")
      .eq("singleton", true)
      .maybeSingle();
    const next = { ...DEFAULT_APPEARANCE, ...(data ?? {}) } as WebsiteSettings;
    setSettings(next);
    applyAppearance(next);
    setLoading(false);
  }, []);

  useEffect(() => {
    applyAppearance(settings);
    void load();
  }, [load]);

  const value = useMemo(
    () => ({ settings, loading, refresh: load, setSettings }),
    [settings, loading, load],
  );

  return <AppearanceContext.Provider value={value}>{children}</AppearanceContext.Provider>;
}

export function useAppearance() {
  const context = useContext(AppearanceContext);
  if (!context) throw new Error("useAppearance must be used inside AppearanceProvider");
  return context;
}
