# Zitso Energy — Analytics, lead attribution and Google OAuth setup

Production domain: `https://zitsoenergy.com`

This update adds first-party website analytics, lead-intent reporting, public privacy and terms pages, and an optional Google sign-in path for authorised staff.

## 1. What is measured

The public website asks visitors to choose whether to allow optional analytics. Events are recorded only after **Accept analytics**. Visitors can reject or change the choice from the footer's **Cookie / Analytics settings** link or from the Privacy Policy page.

The event tracker records:

- Page views, anonymous browser visitors and browsing sessions.
- The page from which a contact or quote action was started.
- Contact-form and quote-form starts and successful submissions.
- WhatsApp, telephone and email link clicks.
- Contact and quote call-to-action clicks.
- First traffic source, campaign tag and referring website domain.

The analytics event table does not store names, email addresses, telephone numbers, project messages, uploaded files or visitor IP addresses. It uses random visitor and session IDs after consent. The contact and quote forms continue to store the information a visitor intentionally submits, whether or not they accept analytics.

## 2. Apply the Supabase database migration

Before the dashboard can display event data:

1. Open the Supabase project connected to this website.
2. Open **SQL Editor** and create a new query.
3. Copy the complete contents of `drizzle/migrations/0007_website_conversion_analytics.sql` into the editor.
4. Run the query once and confirm it completes successfully.
5. Deploy the updated website.
6. Sign in using an account that already has an authorised staff role, then open **Admin → Visitor & conversions**.

The migration creates the event table, indexes, Row Level Security policies, server-generated event timestamps and a staff-only summary function. Do not place a Supabase `service_role` or secret key in browser code or public hosting variables.

## 3. Deploy the website

Use the same Supabase project URL and publishable key already used by the website. The `.env.example` file shows the variable names expected by the project:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
VITE_ENABLE_GOOGLE_OAUTH=false
```

Keep real environment values in the hosting provider's environment-variable settings and out of source control. Deploy to `zitsoenergy.com` with HTTPS enabled.

## 4. Enable Google OAuth for authorised staff

Google OAuth is an optional sign-in method for the existing staff login page (`/auth`). It does not create a public customer account system and does not grant staff permissions automatically.

1. In Google Cloud Console, create or select a project and configure the OAuth consent/branding screen.
2. Create an OAuth client with application type **Web application**.
3. In Supabase → **Authentication → Providers → Google**, enable Google and enter that OAuth Client ID and Client Secret.
4. In the Supabase provider settings, copy the exact callback URL Supabase displays. Add it to the Google OAuth client's **Authorised redirect URIs**. It normally resembles `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`.
5. In Supabase → **Authentication → URL Configuration**, set the production Site URL to `https://zitsoenergy.com` and add `https://zitsoenergy.com/auth` to the allowed redirect URLs. Add the `www` variant only if it is genuinely used by the deployed website.
6. Verify domain ownership for `zitsoenergy.com` in Google Search Console.
7. In Google OAuth branding, use:
   - Home page: `https://zitsoenergy.com`
   - Privacy policy: `https://zitsoenergy.com/privacy`
   - Terms of service: `https://zitsoenergy.com/terms`
8. Set `VITE_ENABLE_GOOGLE_OAUTH=true` in the production hosting environment and redeploy.
9. Assign the `admin` or `super_admin` role to each authorised staff account using the existing role-management process. Google sign-in alone must never be treated as permission to enter the admin dashboard.

The homepage, privacy page and terms page must be publicly reachable over HTTPS. Review the published policy against the real business identity, data-retention practices, hosting vendors and Google sign-in configuration before submitting the OAuth branding for verification.

## 5. Test the tracking after deployment

Use a new private/incognito browser session so that the consent prompt appears:

1. Open the homepage and select **Accept analytics**.
2. Navigate between the homepage, Services, Contact and Request a Quote pages.
3. Click the floating WhatsApp button, the WhatsApp link on the Contact page, and a phone link. Test the email link as well.
4. Start and submit the contact form and quote form using test information, then remove the test records from the admin area if appropriate.
5. Sign in as staff and open **Admin → Visitor & conversions**. Refresh the dashboard and check page views, visitors, sessions, traffic sources, action clicks, form activity and actual enquiry records.
6. Repeat in another private session and choose **Reject**. Page and click events should not be written for that browser, but a contact or quote form the visitor deliberately submits will still be received and counted in the actual enquiry totals.
7. Use the footer's **Cookie / Analytics settings** link to reopen the choice and change it.

The dashboard has 7-day, 30-day and 90-day views. It presents raw click counts and distinct sessions for important contact methods to help distinguish repeat clicks from separate browsing sessions.

## 6. How to interpret conversions and calculate a fair referral share

Use the figures in separate categories:

| Measure | What it proves | Suggested treatment |
| --- | --- | --- |
| Page view / visitor / session | Someone visited the site (for consented analytics only) | Traffic reporting, not a buyer |
| Contact or quote CTA click | Someone opened or selected an enquiry route | Interest signal |
| WhatsApp click | Someone clicked a link intended to open WhatsApp | Lead-intent signal; it does not prove a message was sent |
| Phone click | Someone tapped a telephone link | Lead-intent signal; it does not prove a call connected |
| Contact or quote form record | A visitor successfully submitted an enquiry to the website | A recorded website lead |
| Approved quote / completed job | A staff member updated the website's workflow status | A stronger business outcome, but not independent payment confirmation |
| Paid invoice / money received | The business can show that it received the agreed payment | Use this, with an agreed attribution rule, for calculating a money-based revenue share |

For a transparent commercial arrangement, agree in writing before launch what qualifies as an attributable lead, how repeat enquiries and existing customers are handled, how long after the first enquiry a sale remains attributable to the website, what happens with partial payments/refunds, and which records prove the amount received. Reconcile monthly website leads against the business's quotations, invoices and payment evidence. A click counter alone is not an audited sales ledger.

## 7. Privacy and legal review

The public routes are `/privacy` and `/terms`, and the footer links to both. The analytics preference is also available from the footer and Privacy Policy. The current text is a detailed operational starting point, not a legal opinion. Confirm the correct registered legal entity, contact details, data controllers/processors, retention periods, cross-border processing arrangements and service terms with the business before publishing the final version.
