import { MessageCircle } from "lucide-react";
import { useSiteData } from "@/hooks/useSiteData";
import { whatsappHref } from "@/lib/format";

export function WhatsAppFab({ context }: { context?: string }) {
  const { company } = useSiteData();
  if (!company?.whatsapp) return null;

  const base = company.whatsapp_default_message ?? "Hello, I would like to request a solar enquiry.";
  const message = context ? `${base.replace(/\.$/, "")} for ${context}.` : base;

  return (
    <a
      href={whatsappHref(company.whatsapp, message)}
      target="_blank"
      rel="noreferrer noopener"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-5 right-4 z-40 grid h-13 w-13 place-items-center rounded-full bg-success p-3.5 text-success-foreground shadow-raised transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <MessageCircle className="h-6 w-6" />
    </a>
  );
}
