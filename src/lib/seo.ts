/** Shared canonical metadata for Zitso Energy's public pages. */
export const SITE_ORIGIN = "https://zitsoenergy.com";
export const DEFAULT_SOCIAL_IMAGE = `${SITE_ORIGIN}/images/solar-installation.webp`;

export interface PageSeoOptions {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  type?: "website" | "article";
  noIndex?: boolean;
}

function absoluteUrl(value: string | null | undefined): string {
  if (!value) return DEFAULT_SOCIAL_IMAGE;
  try {
    return new URL(value, SITE_ORIGIN).toString();
  } catch {
    return DEFAULT_SOCIAL_IMAGE;
  }
}

export function createPageHead({
  title,
  description,
  path,
  image,
  type = "website",
  noIndex = false,
}: PageSeoOptions) {
  const canonical = `${SITE_ORIGIN}${path === "/" ? "/" : path.replace(/\/$/, "")}`;
  const socialImage = absoluteUrl(image);
  const summary = description.trim().replace(/\s+/g, " ").slice(0, 300);

  return {
    meta: [
      { title },
      { name: "description", content: summary },
      { name: "robots", content: noIndex ? "noindex,nofollow" : "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" },
      { property: "og:type", content: type },
      { property: "og:site_name", content: "Zitso Energy" },
      { property: "og:title", content: title },
      { property: "og:description", content: summary },
      { property: "og:url", content: canonical },
      { property: "og:image", content: socialImage },
      { property: "og:image:alt", content: "Zitso Energy solar power and energy storage solutions" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: summary },
      { name: "twitter:image", content: socialImage },
    ],
    links: noIndex ? [] : [{ rel: "canonical", href: canonical }],
  };
}

export function safeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export const ORGANIZATION_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_ORIGIN}/#organization`,
      name: "Zitso Energy",
      url: SITE_ORIGIN,
      logo: `${SITE_ORIGIN}/images/zitso-energy-mark.svg`,
      image: DEFAULT_SOCIAL_IMAGE,
      description:
        "Zitso Energy provides solar power systems, hybrid inverter installations, battery storage and solar maintenance for homes and businesses in Nigeria.",
      areaServed: { "@type": "Country", name: "Nigeria" },
      knowsAbout: [
        "Solar power systems",
        "Solar panel installation",
        "Hybrid inverter systems",
        "Battery energy storage",
        "Solar system maintenance",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_ORIGIN}/#website`,
      url: SITE_ORIGIN,
      name: "Zitso Energy",
      inLanguage: "en-NG",
      publisher: { "@id": `${SITE_ORIGIN}/#organization` },
    },
  ],
};
