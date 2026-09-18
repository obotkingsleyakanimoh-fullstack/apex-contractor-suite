import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type {
  BusinessHour,
  CompanySettings,
  FooterLink,
  NavigationItem,
  OfficeLocation,
  SocialLink,
} from "@/types/db";

export interface SiteData {
  company: CompanySettings | null;
  navigation: NavigationItem[];
  footerLinks: FooterLink[];
  socials: SocialLink[];
  office: OfficeLocation | null;
  hours: BusinessHour[];
  loading: boolean;
  reload: () => void;
}

const SiteDataContext = createContext<SiteData | null>(null);

export function SiteDataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Omit<SiteData, "reload">>({
    company: null,
    navigation: [],
    footerLinks: [],
    socials: [],
    office: null,
    hours: [],
    loading: true,
  });

  const load = useCallback(async () => {
    const [company, nav, footer, socials, office, hours] = await Promise.all([
      supabase.from("company_settings").select("*").limit(1).maybeSingle(),
      supabase.from("navigation_items").select("*").eq("visible", true).order("sort_order"),
      supabase.from("footer_links").select("*").eq("visible", true).order("sort_order"),
      supabase.from("social_links").select("*").eq("visible", true).order("sort_order"),
      supabase
        .from("office_locations")
        .select("*")
        .eq("published", true)
        .order("is_primary", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase.from("business_hours").select("*").order("sort_order"),
    ]);

    setState({
      company: company.data ?? null,
      navigation: nav.data ?? [],
      footerLinks: footer.data ?? [],
      socials: socials.data ?? [],
      office: office.data ?? null,
      hours: hours.data ?? [],
      loading: false,
    });
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <SiteDataContext.Provider value={{ ...state, reload: () => void load() }}>
      {children}
    </SiteDataContext.Provider>
  );
}

export function useSiteData(): SiteData {
  const ctx = useContext(SiteDataContext);
  if (!ctx) throw new Error("useSiteData must be used inside SiteDataProvider");
  return ctx;
}
