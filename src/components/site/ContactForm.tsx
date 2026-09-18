import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100),
  email: z.string().trim().email("Enter a valid email address").max(255),
  phone: z.string().trim().max(30).optional(),
  subject: z.string().trim().max(150).optional(),
  message: z.string().trim().min(10, "Please add a little more detail").max(2000),
});

export function ContactForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const parsed = schema.safeParse({
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      phone: String(form.get("phone") ?? ""),
      subject: String(form.get("subject") ?? ""),
      message: String(form.get("message") ?? ""),
    });

    if (!parsed.success) {
      const map: Record<string, string> = {};
      for (const issue of parsed.error.issues) map[String(issue.path[0])] = issue.message;
      setErrors(map);
      return;
    }

    setErrors({});
    setBusy(true);
    const { error } = await supabase.from("contact_messages").insert({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      subject: parsed.data.subject || null,
      message: parsed.data.message,
    });
    setBusy(false);

    if (error) {
      toast.error("Your message could not be sent. Please try again or call us.");
      return;
    }
    setSent(true);
    toast.success("Message sent. We will respond shortly.");
  }

  if (sent) {
    return (
      <div className="surface-panel flex flex-col items-center gap-3 px-6 py-12 text-center">
        <CheckCircle2 className="h-9 w-9 text-success" />
        <h3 className="font-display text-base font-semibold">Message sent</h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          Thank you for reaching out. A member of our team will respond as soon as possible.
        </p>
        <Button variant="outline" onClick={() => setSent(false)}>
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="surface-panel space-y-5 p-5 sm:p-7" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-sm font-semibold">
            Name <span className="text-destructive">*</span>
          </Label>
          <Input id="name" name="name" placeholder="Your full name" />
          {errors.name ? <p className="text-xs text-destructive">{errors.name}</p> : null}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm font-semibold">
            Email <span className="text-destructive">*</span>
          </Label>
          <Input id="email" name="email" type="email" placeholder="you@example.com" />
          {errors.email ? <p className="text-xs text-destructive">{errors.email}</p> : null}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone" className="text-sm font-semibold">
            Phone
          </Label>
          <Input id="phone" name="phone" inputMode="tel" placeholder="0801 234 5678" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="subject" className="text-sm font-semibold">
            Subject
          </Label>
          <Input id="subject" name="subject" placeholder="What is this about?" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="message" className="text-sm font-semibold">
          Message <span className="text-destructive">*</span>
        </Label>
        <Textarea id="message" name="message" rows={5} placeholder="How can we help?" />
        {errors.message ? <p className="text-xs text-destructive">{errors.message}</p> : null}
      </div>
      <Button type="submit" size="lg" disabled={busy} className="w-full sm:w-auto">
        {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Send message
      </Button>
    </form>
  );
}
