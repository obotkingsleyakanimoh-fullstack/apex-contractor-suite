import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { trackAnalyticsEvent, setAnalyticsConsent, getAnalyticsConsent } from "@/lib/analytics";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "@tanstack/react-router";

function AnalyticsRouteTracker() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { isStaff } = useAuth();

  useEffect(() => {
    if (isStaff || pathname.startsWith("/admin") || pathname === "/auth") return;
    void trackAnalyticsEvent("page_view", { pagePath: pathname });
  }, [pathname, isStaff]);

  useEffect(() => {
    function onDocumentClick(event: MouseEvent) {
      if (window.location.pathname.startsWith("/admin") || window.location.pathname === "/auth") return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;

      const href = anchor.getAttribute("href") ?? "";
      const label = (anchor.getAttribute("aria-label") || anchor.textContent || "Link")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 100);

      if (href.startsWith("tel:")) void trackAnalyticsEvent("phone_click", { targetLabel: label });
      else if (/wa\.me|whatsapp\.com|api\.whatsapp/i.test(href)) {
        void trackAnalyticsEvent("whatsapp_click", { targetLabel: label });
      } else if (href.startsWith("mailto:")) {
        void trackAnalyticsEvent("email_click", { targetLabel: label });
      } else if (href.startsWith("/request-quote") || href.includes("#quote-form")) {
        void trackAnalyticsEvent("quote_cta_click", { targetLabel: label });
      } else if (href.startsWith("/contact") || href.includes("#contact-form")) {
        void trackAnalyticsEvent("contact_cta_click", { targetLabel: label });
      }
    }

    document.addEventListener("click", onDocumentClick, true);
    return () => document.removeEventListener("click", onDocumentClick, true);
  }, []);

  return null;
}

export function WebsiteAnalytics() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (pathname.startsWith("/admin") || pathname === "/auth") {
      setShow(false);
      return;
    }
    const current = getAnalyticsConsent();
    setShow(current === null);
  }, [pathname]);

  useEffect(() => {
    function reopen() {
      setShow(true);
    }
    window.addEventListener("zitso:open-analytics-preferences", reopen);
    return () => window.removeEventListener("zitso:open-analytics-preferences", reopen);
  }, []);

  function choose(next: "granted" | "denied") {
    setAnalyticsConsent(next);
    setShow(false);
    if (next === "granted" && !pathname.startsWith("/admin") && pathname !== "/auth") {
      void trackAnalyticsEvent("page_view", { pagePath: pathname });
    }
  }

  return (
    <>
      <AnalyticsRouteTracker />
      {show ? (
        <aside
          aria-label="Analytics preferences"
          className="fixed inset-x-3 bottom-3 z-[80] mx-auto max-w-3xl rounded-2xl border border-border bg-card p-4 shadow-2xl sm:inset-x-6 sm:p-5"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-2xl">
              <p className="font-semibold text-foreground">Help us understand how visitors find Zitso Energy</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                With your permission, we use first-party analytics to count visits and actions such as
                WhatsApp, phone and enquiry-form clicks. We do not use advertising trackers or record
                your name, contact details or message in analytics. You can reject or change this choice at any time.
                Read our <Link to="/privacy" className="font-medium text-foreground underline">Privacy Policy</Link>.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <button type="button" onClick={() => choose("denied")} className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-secondary">
                Reject
              </button>
              <button type="button" onClick={() => choose("granted")} className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                Accept analytics
              </button>
            </div>
          </div>
        </aside>
      ) : null}
    </>
  );
}
