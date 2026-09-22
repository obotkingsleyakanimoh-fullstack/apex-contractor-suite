import { Link } from "@tanstack/react-router";
import { Clock, Facebook, Globe, Instagram, Linkedin, Mail, MapPin, Phone, Twitter, Youtube } from "lucide-react";
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
  const { company, socials, office, hours } = useSiteData();
  const openDays = hours.filter((h) => !h.is_closed);

  return (
    <footer className="site-footer bg-[var(--footer-background)] text-white">
      <div className="container-page border-b border-white/10 py-14">
        <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-accent)]">Solar made practical</p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Ready for more reliable power?
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/65">
              Tell us what you need to power and we&apos;ll help you plan a solar, inverter and battery system around it.
            </p>
          </div>
          <Button asChild size="lg" className="rounded-full bg-[var(--color-accent)] px-7 text-[var(--heading-color)] hover:bg-accent/90">
            <Link to="/request-quote">Get a solar assessment</Link>
          </Button>
        </div>
      </div>

      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <Link to="/" className="inline-flex items-center gap-3">
            {company?.logo_url ? (
              <img src={company.logo_url} alt={company.company_name} className="h-10 w-auto max-w-[10rem] object-contain" loading="lazy" />
            ) : null}
            <span className="font-display text-xl font-bold">{company?.company_name ?? "Zitso Energy"}</span>
          </Link>
          <p className="mt-5 max-w-md text-sm leading-7 text-white/60">
            {company?.footer_description ??
              "Solar power systems, hybrid inverters, battery storage and maintenance for homes and businesses."}
          </p>
          {socials.length ? (
            <div className="mt-6 flex gap-2">
              {socials.map((s) => {
                const Icon = SOCIAL_ICONS[s.platform.toLowerCase()] ?? Globe;
                return (
                  <a key={s.id} href={s.url} target="_blank" rel="noreferrer noopener" aria-label={s.platform} className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-white/70 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]">
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          ) : null}
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--color-accent)]">Solar</h3>
          <ul className="mt-4 space-y-3 text-sm text-white/65">
            <li><Link to="/services" className="hover:text-white">Solar solutions</Link></li>
            <li><Link to="/projects" className="hover:text-white">Solar projects</Link></li>
            <li><Link to="/request-quote" className="hover:text-white">Get a quote</Link></li>
            <li><Link to="/faq" className="hover:text-white">FAQs</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--color-accent)]">Contact</h3>
          <ul className="mt-4 space-y-3 text-sm text-white/65">
            {office?.address || company?.address ? (
              <li className="flex gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-accent)]" />
                <span>{office?.address ?? company?.address}{office?.city ? `, ${office.city}` : ""}{office?.state ? `, ${office.state}` : ""}</span>
              </li>
            ) : null}
            {company?.phone ? (
              <li className="flex gap-2.5"><Phone className="mt-0.5 h-4 w-4 text-[var(--color-accent)]" /><a href={telHref(company.phone)}>{company.phone}</a></li>
            ) : null}
            {company?.email ? (
              <li className="flex gap-2.5"><Mail className="mt-0.5 h-4 w-4 text-[var(--color-accent)]" /><a href={mailtoHref(company.email)} className="break-all">{company.email}</a></li>
            ) : null}
            {openDays.length ? (
              <li className="flex gap-2.5"><Clock className="mt-0.5 h-4 w-4 text-[var(--color-accent)]" /><span>{openDays[0].label} – {openDays[openDays.length - 1].label}, {openDays[0].open_time}–{openDays[0].close_time}</span></li>
            ) : null}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-3 py-5 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>{company?.copyright_text ?? `© ${company?.company_name ?? "Zitso Energy"}`}</p>
          <div className="flex gap-5">
            <Link to="/privacy" className="hover:text-white">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
