import { Link } from "@tanstack/react-router";
import {
  Clock,
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Twitter,
  Youtube,
  Globe,
} from "lucide-react";
import { useSiteData } from "@/hooks/useSiteData";
import { mailtoHref, telHref } from "@/lib/format";
import { Button } from "@/components/ui/button";

const SOCIAL_ICONS: Record<string, typeof Facebook> = {
  facebook: Facebook,
  instagram: Instagram,
  linkedin: Linkedin,
  twitter: Twitter,
  x: Twitter,
  youtube: Youtube,
};

export function Footer() {
  const { company, footerLinks, socials, office, hours } = useSiteData();

  const sections = footerLinks.reduce<Record<string, typeof footerLinks>>((acc, link) => {
    (acc[link.section] ??= []).push(link);
    return acc;
  }, {});

  const openDays = hours.filter((h) => !h.is_closed);

  return (
    <footer className="mt-auto bg-primary text-primary-foreground">
      <div className="container-page border-b border-primary-foreground/15 py-10">
        <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-xl font-bold sm:text-2xl">
              Planning a project? Let's scope it properly.
            </h2>
            <p className="mt-1 text-sm text-primary-foreground/70">
              Send your requirements and we will respond with clear next steps.
            </p>
          </div>
          <Button asChild variant="secondary" size="lg" className="w-full sm:w-auto">
            <Link to="/request-quote">Request a Quote</Link>
          </Button>
        </div>
      </div>

      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2.5">
            {company?.logo_url ? (
              <img
                src={company.logo_url}
                alt={company.company_name}
                className="h-9 w-auto max-w-[9rem] object-contain"
                loading="lazy"
              />
            ) : null}
            <span className="font-display text-lg font-bold">{company?.company_name}</span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-primary-foreground/70">
            {company?.footer_description ?? company?.description}
          </p>
          {socials.length ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {socials.map((s) => {
                const Icon = SOCIAL_ICONS[s.platform.toLowerCase()] ?? Globe;
                return (
                  <a
                    key={s.id}
                    href={s.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={s.platform}
                    className="grid h-10 w-10 place-items-center rounded-md border border-primary-foreground/20 transition-colors hover:border-accent hover:text-accent"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          ) : null}
        </div>

        {Object.entries(sections).map(([title, links]) => (
          <div key={title}>
            <h3 className="font-display text-xs font-bold uppercase tracking-[0.14em] text-accent">
              {title}
            </h3>
            <ul className="mt-4 space-y-2.5">
              {links.map((link) => (
                <li key={link.id}>
                  {link.is_external ? (
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-sm text-primary-foreground/75 transition-colors hover:text-primary-foreground"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      to={link.url}
                      className="text-sm text-primary-foreground/75 transition-colors hover:text-primary-foreground"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h3 className="font-display text-xs font-bold uppercase tracking-[0.14em] text-accent">
            Get in touch
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-primary-foreground/75">
            {office?.address || company?.address ? (
              <li className="flex gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
                <span>
                  {office?.address ?? company?.address}
                  {office?.city ? `, ${office.city}` : ""}
                  {office?.state ? `, ${office.state}` : ""}
                </span>
              </li>
            ) : null}
            {company?.phone ? (
              <li className="flex gap-2.5">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
                <a href={telHref(company.phone)} className="hover:text-primary-foreground">
                  {company.phone}
                </a>
              </li>
            ) : null}
            {company?.email ? (
              <li className="flex gap-2.5">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
                <a
                  href={mailtoHref(company.email)}
                  className="break-all hover:text-primary-foreground"
                >
                  {company.email}
                </a>
              </li>
            ) : null}
            {openDays.length ? (
              <li className="flex gap-2.5">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
                <span>
                  {openDays[0].label} – {openDays[openDays.length - 1].label},{" "}
                  {openDays[0].open_time}–{openDays[0].close_time}
                </span>
              </li>
            ) : null}
          </ul>
        </div>
      </div>

      <div className="border-t border-primary-foreground/15">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-5 text-xs text-primary-foreground/60 sm:flex-row">
          <p>{company?.copyright_text ?? `© ${company?.company_name ?? ""}`}</p>
          <div className="flex gap-5">
            <Link to="/privacy" className="hover:text-primary-foreground">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-primary-foreground">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
