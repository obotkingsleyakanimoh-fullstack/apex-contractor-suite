import type { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { WhatsAppFab } from "./WhatsAppFab";
import { ORGANIZATION_JSON_LD, safeJsonLd } from "@/lib/seo";

export function SiteLayout({
  children,
  whatsappContext,
}: {
  children: ReactNode;
  whatsappContext?: string;
}) {
  return (
    <div className="site-shell flex min-h-screen w-full flex-col overflow-x-hidden">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(ORGANIZATION_JSON_LD) }} />
      <Navbar />
      <main className="site-main flex-1">{children}</main>
      <Footer />
      <WhatsAppFab context={whatsappContext} />
    </div>
  );
}
