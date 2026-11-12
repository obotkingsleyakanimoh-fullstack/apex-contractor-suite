import { createPageHead } from "@/lib/seo";
import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Breadcrumbs } from "@/components/site/shared";
import { openAnalyticsPreferences } from "@/lib/analytics";

export const Route = createFileRoute("/privacy")({
  head: () => createPageHead({ title: 'Privacy Policy | Zitso Energy', description: 'Read how Zitso Energy collects, uses, protects and shares enquiry information and consent-based website analytics.', path: '/privacy' }),
  component: PrivacyPage,
});

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="font-display text-xl font-bold tracking-tight text-foreground">{title}</h2>
      <div className="space-y-3 text-sm leading-7 text-muted-foreground">{children}</div>
    </section>
  );
}

function PrivacyPage() {
  return (
    <SiteLayout>
      <section className="border-b border-border bg-secondary">
        <div className="container-page py-10">
          <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: "Privacy Policy" }]} />
          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">Last updated: 12 November 2026</p>
        </div>
      </section>
      <section className="section-y">
        <div className="container-page max-w-3xl space-y-9">
          <p className="text-base leading-7 text-muted-foreground">
            This Privacy Policy explains how Zitso Energy ("Zitso Energy", "we", "us" or "our")
            handles information when you visit <a className="underline" href="https://zitsoenergy.com">zitsoenergy.com</a>,
            ask about our solar and energy services, or contact our team. We aim to handle personal
            information fairly, transparently and with appropriate safeguards, including under
            applicable Nigerian data-protection law.
          </p>

          <Section title="1. Information we collect">
            <p>Information you choose to submit through our website may include:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Name, email address, telephone number and company or organisation name.</li>
              <li>The subject and contents of a contact message or service enquiry.</li>
              <li>Project details such as the service requested, property type, project location, preferred dates, requirements and preferred contact method.</li>
              <li>Photographs, plans or documents you choose to attach to a quotation request.</li>
            </ul>
            <p>
              When you visit the website, our hosting and security providers may also process basic
              technical information needed to deliver, secure and troubleshoot the website, such as
              browser, device, request and server-log information.
            </p>
          </Section>

          <Section title="2. Website analytics and your choice">
            <p>
              We offer optional, first-party analytics to understand how people use the website and
              which enquiry routes are useful. Only after you select <strong>Accept analytics</strong>
              do we store a random visitor identifier and a session identifier in your browser and
              record events such as page views, contact-form starts and submissions, quote-form
              starts and submissions, and clicks on WhatsApp, telephone or email links.
            </p>
            <p>
              Analytics records may include the page path, page title, referring website domain,
              campaign source and the label of the link you used. We do not put your name, email,
              telephone number, form message, uploaded files or IP address into the analytics event
              records. Analytics identifiers are used to count returning browsers and browsing
              sessions; they are not intended to identify you by name.
            </p>
            <p>
              You can reject optional analytics, or change your choice later using the Cookie / Analytics
              settings link in the website footer. Rejecting analytics does not prevent you from
              browsing the website, calling us, using WhatsApp or submitting an enquiry. When you
              reject analytics, optional visitor and session identifiers are removed from browser
              storage. Some technical logs may still be processed by hosting and security providers
              for essential operations.
            </p>
            <button
              type="button"
              onClick={openAnalyticsPreferences}
              className="inline-flex rounded-full border border-border px-4 py-2 font-semibold text-foreground hover:bg-secondary"
            >
              Open analytics preferences
            </button>
          </Section>

          <Section title="3. Google sign-in and account information">
            <p>
              Where Google sign-in is enabled for an authorised account, Google may provide basic
              profile information such as your name, email address and profile image to authenticate
              your identity. We use that information for sign-in, account identification and access
              control. We do not use Google account data for advertising, sell it, or request access
              to Gmail, Google Drive or other Google content as part of ordinary sign-in. Google
              sign-in is subject to Google's own privacy terms and the permissions shown during sign-in.
            </p>
            <p>
              We do not receive your Google password. You can manage or revoke an app connection in
              your Google Account security settings. Access to staff-only areas is separately
              controlled by the roles assigned within our website.
            </p>
          </Section>

          <Section title="4. How we use information">
            <ul className="list-disc space-y-1 pl-5">
              <li>Respond to questions, contact messages and requests for quotations.</li>
              <li>Understand project requirements, assess service suitability and prepare proposals.</li>
              <li>Arrange site visits, installations, delivery, maintenance and after-sales support where agreed.</li>
              <li>Maintain website accounts, authenticate authorised staff and protect administrative areas.</li>
              <li>Operate, secure, troubleshoot and improve the website and, with your permission, measure aggregate visitor and enquiry activity.</li>
              <li>Meet applicable legal, regulatory, accounting and record-keeping obligations.</li>
            </ul>
          </Section>

          <Section title="5. Legal basis and your choices">
            <p>
              Depending on the circumstances, we process information because it is needed to respond
              to a request or take steps before a possible service arrangement, to meet a legal
              obligation, to protect the website and our legitimate business interests, or because you
              have given consent. Optional analytics is based on your affirmative choice. You may
              withdraw that choice at any time through the analytics preferences control; withdrawal
              does not affect processing that took place before withdrawal.
            </p>
          </Section>

          <Section title="6. When information may be shared">
            <p>
              We do not sell personal information. We may share information with service providers
              that host, secure or support the website and its database, and with personnel or
              contractors who need it to respond to your enquiry or deliver a service you request.
              We may also disclose information where required by law, court order or a lawful request,
              or where reasonably necessary to protect rights, safety and security.
            </p>
            <p>
              If you choose to open WhatsApp, make a telephone call or send an email, you interact with
              the relevant telecommunications or third-party service. Their own terms and privacy
              notices apply to information they collect through those services.
            </p>
          </Section>

          <Section title="7. Storage, security and international processing">
            <p>
              Enquiry records and uploaded files are stored using the website's configured hosting
              and database services. We use access controls and reasonable technical and organisational
              safeguards intended to protect information against unauthorised access, loss, alteration
              or disclosure. No online service can guarantee absolute security.
            </p>
            <p>
              Our service providers may process or store information in countries other than the
              country in which you are located. Where this occurs, we take steps intended to ensure
              that the transfer and processing are handled with appropriate safeguards under applicable law.
            </p>
          </Section>

          <Section title="8. How long we keep information">
            <p>
              We keep enquiry, project and account records for as long as reasonably necessary to
              respond to you, manage a potential or active service relationship, maintain business
              records, resolve disputes and meet legal obligations. Optional analytics events are
              retained for operational reporting and may be deleted when no longer required. Retention
              periods can vary by record type and legal requirements.
            </p>
          </Section>

          <Section title="9. Your privacy rights">
            <p>
              Subject to applicable law and any lawful exceptions, you may ask to access or correct
              personal information we hold about you, request deletion or restriction, object to
              certain processing, withdraw consent, or request a portable copy where applicable. You
              may also raise a concern with the relevant data-protection authority. We may need to
              verify your identity before acting on a request.
            </p>
          </Section>

          <Section title="10. Children and external websites">
            <p>
              Our services and website are intended for adults making residential, commercial or
              business enquiries. We do not knowingly seek personal information directly from children.
              The website may link to third-party websites; we are not responsible for their content,
              security or privacy practices.
            </p>
          </Section>

          <Section title="11. Changes and contact">
            <p>
              We may update this Policy when our services, technology or legal obligations change.
              The latest version will be published on this page with its updated date. For a privacy
              question or request, use the contact details shown on our <Link to="/contact" className="underline text-foreground">Contact page</Link>
              and identify it as a privacy request.
            </p>
            <p>Website: https://zitsoenergy.com</p>
          </Section>

          <p className="border-t border-border pt-5 text-xs leading-6 text-muted-foreground">
            This page describes the website's intended information practices. Zitso Energy should
            review it against its final hosting, retention, vendor and Google sign-in configuration
            before launch. It is not a substitute for advice from a qualified data-protection or legal professional.
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}
