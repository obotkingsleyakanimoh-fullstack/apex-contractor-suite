import { supabase } from "@/integrations/supabase/client";

export type AnalyticsEventName =
  | "page_view"
  | "contact_form_start"
  | "contact_form_submit"
  | "quote_form_start"
  | "quote_form_submit"
  | "whatsapp_click"
  | "phone_click"
  | "email_click"
  | "contact_cta_click"
  | "quote_cta_click";

const CONSENT_KEY = "zitso.analytics.consent.v1";
const VISITOR_KEY = "zitso.analytics.visitor.v1";
const SESSION_KEY = "zitso.analytics.session.v1";
const SOURCE_KEY = "zitso.analytics.source.v1";

function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (character) => {
    const random = Math.floor(Math.random() * 16);
    return (character === "x" ? random : (random & 0x3) | 0x8).toString(16);
  });
}

export function getAnalyticsConsent(): "granted" | "denied" | null {
  if (typeof window === "undefined") return null;
  try {
    const choice = window.localStorage.getItem(CONSENT_KEY);
    return choice === "granted" || choice === "denied" ? choice : null;
  } catch {
    return null;
  }
}

export function setAnalyticsConsent(choice: "granted" | "denied"): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CONSENT_KEY, choice);
    if (choice === "denied") {
      window.localStorage.removeItem(VISITOR_KEY);
      window.sessionStorage.removeItem(SESSION_KEY);
      window.sessionStorage.removeItem(SOURCE_KEY);
    }
  } catch {
    // If browser storage is disabled, optional analytics remains disabled.
  }
}

function getOrCreateId(storage: Storage, key: string): string {
  let value = storage.getItem(key);
  if (!value) {
    value = makeId();
    storage.setItem(key, value);
  }
  return value;
}

function getAttribution(): { traffic_source: string; campaign: string | null; referrer_origin: string | null } {
  const cached = window.sessionStorage.getItem(SOURCE_KEY);
  if (cached) {
    try {
      return JSON.parse(cached) as ReturnType<typeof getAttribution>;
    } catch {
      window.sessionStorage.removeItem(SOURCE_KEY);
    }
  }

  const params = new URLSearchParams(window.location.search);
  const utmSource = params.get("utm_source")?.trim().slice(0, 120);
  const utmCampaign = params.get("utm_campaign")?.trim().slice(0, 120) || null;
  let referrerOrigin: string | null = null;
  try {
    const referrer = document.referrer ? new URL(document.referrer) : null;
    if (referrer && referrer.origin !== window.location.origin) referrerOrigin = referrer.origin;
  } catch {
    referrerOrigin = null;
  }

  const result = {
    traffic_source: utmSource || (referrerOrigin ? new URL(referrerOrigin).hostname : "direct"),
    campaign: utmCampaign,
    referrer_origin: referrerOrigin,
  };
  window.sessionStorage.setItem(SOURCE_KEY, JSON.stringify(result));
  return result;
}

export async function trackAnalyticsEvent(
  eventName: AnalyticsEventName,
  options: { pagePath?: string; targetLabel?: string } = {},
): Promise<void> {
  if (typeof window === "undefined" || getAnalyticsConsent() !== "granted") return;

  try {
    const visitorId = getOrCreateId(window.localStorage, VISITOR_KEY);
    const sessionId = getOrCreateId(window.sessionStorage, SESSION_KEY);
    const attribution = getAttribution();
    const pagePath = options.pagePath ?? window.location.pathname;
    await supabase.from("website_analytics_events").insert({
      visitor_id: visitorId,
      session_id: sessionId,
      event_name: eventName,
      page_path: pagePath.slice(0, 500),
      page_title: document.title.slice(0, 200) || null,
      traffic_source: attribution.traffic_source.slice(0, 120),
      campaign: attribution.campaign,
      referrer_origin: attribution.referrer_origin,
      target_label: options.targetLabel?.trim().slice(0, 100) || null,
    });
  } catch {
    // Analytics is strictly best-effort and must never interrupt the website.
  }
}

export function openAnalyticsPreferences(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("zitso:open-analytics-preferences"));
  }
}
