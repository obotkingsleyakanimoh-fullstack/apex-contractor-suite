import type { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { WhatsAppFab } from "./WhatsAppFab";

export function SiteLayout({
  children,
  whatsappContext,
}: {
  children: ReactNode;
  whatsappContext?: string;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col overflow-x-hidden">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppFab context={whatsappContext} />
    </div>
  );
}
