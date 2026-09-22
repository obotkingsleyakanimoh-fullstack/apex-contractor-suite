import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, Phone, X } from "lucide-react";
import { useSiteData } from "@/hooks/useSiteData";
import { telHref } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Solar solutions", url: "/services" },
  { label: "Our projects", url: "/projects" },
  { label: "Blog", url: "/blog" },
  { label: "About us", url: "/about" },
  { label: "Contact", url: "/contact" },
];

export function Navbar() {
  const { company } = useSiteData();
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="site-navbar sticky top-0 z-50 w-full border-b border-black/5 bg-white/95 backdrop-blur-xl">
      <div className="container-page flex h-[74px] items-center justify-between gap-4">
        <Link to="/" className="flex min-w-0 items-center gap-3" onClick={() => setOpen(false)}>
          {company?.logo_url ? (
            <img src={company.logo_url} alt={company.company_name} className="h-10 w-auto max-w-[10rem] object-contain" width={160} height={40} />
          ) : (
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--color-primary)] font-display text-sm font-bold text-white">ZE</span>
          )}
          <span className="hidden truncate font-display text-lg font-bold tracking-tight text-[var(--heading-color)] sm:block">
            {company?.company_name ?? "Zitso Energy"}
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.url}
              to={item.url}
              className={cn(
                "rounded-full px-4 py-2.5 text-sm font-semibold transition-colors",
                pathname === item.url || pathname.startsWith(`${item.url}/`)
                  ? "bg-secondary text-[var(--color-primary)]"
                  : "text-muted-foreground hover:bg-muted hover:text-[var(--heading-color)]",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {company?.phone ? (
            <a href={telHref(company.phone)} className="hidden items-center gap-2 text-sm font-semibold text-[var(--heading-color)] xl:flex">
              <Phone className="h-4 w-4 text-[var(--color-primary)]" />
              {company.phone}
            </a>
          ) : null}
          <Button asChild size="sm" className="hidden rounded-full bg-[var(--color-primary)] px-5 hover:bg-primary/90 sm:inline-flex">
            <Link to="/request-quote">Get a solar assessment</Link>
          </Button>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-xl border border-black/10 text-[var(--heading-color)] lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-black/5 bg-white lg:hidden">
          <nav className="container-page flex flex-col py-3">
            {NAV.map((item) => (
              <Link
                key={item.url}
                to={item.url}
                className="border-b border-black/5 py-4 text-sm font-semibold text-[var(--heading-color)]"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Button asChild className="mt-4 w-full rounded-full bg-[var(--color-primary)]" onClick={() => setOpen(false)}>
              <Link to="/request-quote">Get a solar assessment</Link>
            </Button>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
