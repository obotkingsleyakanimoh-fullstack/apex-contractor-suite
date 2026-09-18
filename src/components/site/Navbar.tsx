import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, Phone, X } from "lucide-react";
import { useSiteData } from "@/hooks/useSiteData";
import { telHref } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { company, navigation, loading } = useSiteData();
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const items = navigation.length
    ? navigation
    : [
        { id: "s", label: "Services", url: "/services", is_external: false },
        { id: "c", label: "Contact", url: "/contact", is_external: false },
      ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container-page flex h-16 items-center justify-between gap-4 md:h-18">
        <Link to="/" className="flex min-w-0 items-center gap-2.5" onClick={() => setOpen(false)}>
          {company?.logo_url ? (
            <img
              src={company.logo_url}
              alt={company.company_name}
              className="h-9 w-auto max-w-[9rem] object-contain"
              width={144}
              height={36}
            />
          ) : (
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-primary font-display text-sm font-bold text-primary-foreground">
              {(company?.company_name ?? "C").slice(0, 2).toUpperCase()}
            </span>
          )}
          <span className="truncate font-display text-base font-bold tracking-tight text-foreground sm:text-lg">
            {loading ? "" : (company?.company_name ?? "")}
          </span>
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex">
          {items.map((item) =>
            item.is_external ? (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noreferrer noopener"
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </a>
            ) : (
              <Link
                key={item.id}
                to={item.url}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-foreground",
                  pathname === item.url ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>

        <div className="flex items-center gap-2">
          {company?.phone ? (
            <a
              href={telHref(company.phone)}
              className="hidden items-center gap-2 text-sm font-semibold text-foreground xl:flex"
            >
              <Phone className="h-4 w-4 text-accent" aria-hidden />
              {company.phone}
            </a>
          ) : null}
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link to="/request-quote">Request a Quote</Link>
          </Button>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-md border border-border text-foreground lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-border bg-background lg:hidden">
          <nav className="container-page flex flex-col py-3">
            {items.map((item) =>
              item.is_external ? (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="border-b border-border/60 py-3 text-sm font-medium text-foreground last:border-0"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.id}
                  to={item.url}
                  className="border-b border-border/60 py-3 text-sm font-medium text-foreground last:border-0"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ),
            )}
            <Button asChild className="mt-4 w-full" onClick={() => setOpen(false)}>
              <Link to="/request-quote">Request a Quote</Link>
            </Button>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
