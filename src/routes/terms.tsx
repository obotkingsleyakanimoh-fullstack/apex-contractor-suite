import { createPageHead } from "@/lib/seo";
import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Breadcrumbs } from "@/components/site/shared";

export const Route = createFileRoute("/terms")({
  head: () => createPageHead({ title: 'Terms of Use | Zitso Energy', description: 'Terms governing use of the Zitso Energy website, enquiries, quotations and service arrangements.', path: '/terms' }),
  component: TermsPage,
});

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="font-display text-xl font-bold tracking-tight text-foreground">{title}</h2>
      <div className="space-y-3 text-sm leading-7 text-muted-foreground">{children}</div>
    </section>
  );
}

function TermsPage() {
  return (
    <SiteLayout>
      <section className="border-b border-border bg-secondary">
        <div className="container-page py-10">
          <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Terms of Use" }]} />
          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Terms of Use
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">Last updated: 12 November 2026</p>
        </div>
      </section>
      <section className="section-y">
        <div className="container-page max-w-3xl space-y-9">
          <p className="text-base leading-7 text-muted-foreground">
            These Terms of Use ("Terms") apply to your use of <a className="underline" href="https://zitsoenergy.com">zitsoenergy.com</a>
            (the "Website"), operated under the Zitso Energy name ("Zitso Energy", "we", "us" or
            "our"). By using the Website, you agree to these Terms. Do not use the Website if you do
            not agree with them.
          </p>

          <Section title="1. What the Website provides">
            <p>
              The Website provides information about solar power systems, inverters, battery storage,
              electrical works, maintenance and related services, together with ways to contact us or
              request a project assessment. Website content is general information. It is not a
              site-specific engineering assessment, final design, safety certification or binding offer.
            </p>
          </Section>

          <Section title="2. Enquiries and quotations">
            <p>
              Submitting a contact form, requesting a quotation, clicking a telephone link or starting
              a WhatsApp conversation is an enquiry only. It does not by itself create a contract,
              reserve equipment, guarantee availability or require either party to proceed.
            </p>
            <p>
              Any estimate or proposal is subject to confirmation of the project requirements, site
              conditions, equipment availability, measurements and other relevant information. Unless
              a written proposal states otherwise, a quotation is not final until we confirm its scope,
              price, validity period and applicable assumptions in writing.
            </p>
          </Section>

          <Section title="3. Service agreements and payment">
            <p>
              A service arrangement becomes binding only when the parties accept a written proposal,
              work order or other agreement that identifies the agreed scope and commercial terms.
              That document will govern the project if it conflicts with these general Website Terms.
            </p>
            <p>
              Prices, deposits, payment milestones, taxes, delivery or mobilisation charges, and any
              applicable late-payment terms will be set out in the relevant written proposal or
              invoice. Do not treat website text or an informal message as confirmation that a price
              or payment schedule has been accepted.
            </p>
          </Section>

          <Section title="4. Site access and customer responsibilities">
            <p>
              For a project assessment or agreed work, you must provide accurate information about
              the property and intended use, arrange safe and reasonable access, disclose known site
              hazards or restrictions, and obtain permissions that are your responsibility as
              property owner or occupier. You must not ask our personnel to work in unsafe or unlawful
              conditions.
            </p>
            <p>
              Solar generation, battery performance and backup duration depend on factors such as
              weather, shading, equipment configuration, battery condition, load profile, installation
              conditions and user behaviour. Actual performance can differ from illustrative examples
              or estimates on the Website.
            </p>
          </Section>

          <Section title="5. Changes, delays and cancellation">
            <p>
              Changes to a project's scope, materials, site conditions or schedule may affect its price
              and completion date. Any agreed variation should be recorded in writing. Delivery and
              installation dates are estimates unless the applicable written agreement expressly says
              they are guaranteed. Cancellation, suspension, refunds and charges will be governed by
              the accepted proposal or service agreement and applicable law.
            </p>
          </Section>

          <Section title="6. Warranties and after-sales support">
            <p>
              Any product, workmanship, installation, maintenance or performance warranty must be
              expressly stated in the applicable written proposal, manufacturer documentation or
              service agreement. Manufacturer warranties may be subject to the manufacturer's terms,
              registration requirements, maintenance conditions and exclusions. Nothing in these
              Terms removes rights or remedies that cannot lawfully be excluded.
            </p>
          </Section>

          <Section title="7. Acceptable use of the Website">
            <p>You agree not to:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Use the Website for unlawful, fraudulent, abusive or misleading activity.</li>
              <li>Submit information or files that you do not have the right to provide, or that contain malicious code.</li>
              <li>Attempt to gain unauthorised access to the Website, its systems, accounts or data.</li>
              <li>Interfere with the Website, overload it, scrape it in a harmful manner or bypass security controls.</li>
              <li>Copy, republish or commercially exploit Website content except as permitted by law or with our written permission.</li>
            </ul>
          </Section>

          <Section title="8. Website content and intellectual property">
            <p>
              Unless otherwise stated, the Website's text, branding, graphics, photographs, layout and
              other materials are owned by or licensed to Zitso Energy. You may view and print pages
              for personal, non-commercial reference. You may not reproduce or adapt material for
              commercial use without permission from the relevant rights holder.
            </p>
          </Section>

          <Section title="9. Third-party services and links">
            <p>
              The Website may provide links to WhatsApp, email, mapping, hosting, social media or other
              third-party services. Those services are operated independently and are subject to their
              own terms, availability and privacy practices. We do not control and are not responsible
              for third-party services, except to the extent responsibility cannot be excluded by law.
            </p>
          </Section>

          <Section title="10. Liability">
            <p>
              We take reasonable steps to keep Website information useful and the Website available,
              but we do not promise uninterrupted, error-free or always up-to-date operation. To the
              extent permitted by applicable law, we are not responsible for loss arising solely from
              reliance on general Website information without obtaining an appropriate project
              assessment or written proposal. Nothing in these Terms excludes liability that cannot
              lawfully be excluded, including liability for fraud or deliberate misconduct.
            </p>
          </Section>

          <Section title="11. Privacy">
            <p>
              Our handling of personal information is explained in the <Link to="/privacy" className="underline text-foreground">Privacy Policy</Link>.
              Please read it before submitting personal information or requesting a service.
            </p>
          </Section>

          <Section title="12. Changes to these Terms">
            <p>
              We may update these Terms to reflect changes to the Website, our services or applicable
              requirements. The revised version will be published on this page with a new updated date.
              Your continued use of the Website after publication means you accept the revised Terms
              to the extent permitted by applicable law.
            </p>
          </Section>

          <Section title="13. Governing law and contact">
            <p>
              These Terms are governed by the laws of the Federal Republic of Nigeria. The parties
              should first try in good faith to resolve a dispute through direct discussion. If it
              cannot be resolved, either party may refer it to a court with competent jurisdiction
              under applicable law.
            </p>
            <p>
              Questions about these Terms may be sent through our <Link to="/contact" className="underline text-foreground">Contact page</Link>.
              Website: https://zitsoenergy.com
            </p>
          </Section>

          <p className="border-t border-border pt-5 text-xs leading-6 text-muted-foreground">
            These are general website terms and should be reviewed against the final business
            registration details, written customer contracts, warranties and operating practices of
            Zitso Energy before publication. They are not a substitute for advice from a qualified lawyer.
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}
