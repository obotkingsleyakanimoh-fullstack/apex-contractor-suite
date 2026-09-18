import type { Database } from "@/integrations/supabase/types";

type T = Database["public"]["Tables"];

export type CompanySettings = T["company_settings"]["Row"];
export type BusinessHour = T["business_hours"]["Row"];
export type OfficeLocation = T["office_locations"]["Row"];
export type ServiceCategory = T["service_categories"]["Row"];
export type Service = T["services"]["Row"];
export type Project = T["projects"]["Row"];
export type Testimonial = T["testimonials"]["Row"];
export type Faq = T["faqs"]["Row"];
export type ServiceArea = T["service_areas"]["Row"];
export type QuoteRequest = T["quote_requests"]["Row"];
export type QuoteRequestFile = T["quote_request_files"]["Row"];
export type ContactMessage = T["contact_messages"]["Row"];
export type NavigationItem = T["navigation_items"]["Row"];
export type FooterLink = T["footer_links"]["Row"];
export type SocialLink = T["social_links"]["Row"];
export type SiteContent = T["site_content"]["Row"];
export type MediaItem = T["media_library"]["Row"];
export type ActivityLog = T["admin_activity_logs"]["Row"];
export type Profile = T["profiles"]["Row"];
export type UserRole = T["user_roles"]["Row"];

export type AppRole = Database["public"]["Enums"]["app_role"];
export type QuoteStatus = Database["public"]["Enums"]["quote_status"];
export type MessageStatus = Database["public"]["Enums"]["message_status"];

export const QUOTE_STATUSES: { value: QuoteStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "inspection_required", label: "Inspection Required" },
  { value: "quote_prepared", label: "Quote Prepared" },
  { value: "negotiation", label: "Negotiation" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export const MESSAGE_STATUSES: { value: MessageStatus; label: string }[] = [
  { value: "unread", label: "Unread" },
  { value: "read", label: "Read" },
  { value: "responded", label: "Responded" },
  { value: "closed", label: "Closed" },
];

/** Homepage / page content shapes stored in site_content.value */
export interface HeroContent {
  eyebrow?: string;
  headline?: string;
  subheadline?: string;
  primary_cta?: string;
  primary_cta_url?: string;
  secondary_cta?: string;
  secondary_cta_url?: string;
  image_url?: string;
  trust_points?: string[];
}

export interface StatItem {
  label: string;
  value: string;
}

export interface TitledItem {
  title: string;
  body: string;
}

export interface SectionContent {
  title?: string;
  body?: string;
  cta?: string;
  cta_url?: string;
  note?: string;
  items?: TitledItem[];
}

export interface StatsContent {
  items?: StatItem[];
  note?: string;
}

/** Safely reads a jsonb string[] column. */
export function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string");
}
