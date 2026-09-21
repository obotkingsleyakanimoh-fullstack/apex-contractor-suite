# Zitso Energy Website & Service Management Platform

Build a complete, production-ready, professional service-business website/platform using:

React

TypeScript

Vite

Tailwind CSS

Supabase

React Router

Lucide React icons

Modern responsive CSS

Supabase Storage for images/files

DO NOT use TanStack Router, TanStack Query, or any TanStack library unless absolutely required by the platform. Prefer clean React state management, reusable hooks, Supabase client queries, and well-organized services.

The project must be structured cleanly and professionally so it can be expanded later into a larger business platform.

The business primarily provides:

Solar installation

Solar system maintenance

Inverter installation

Solar panel installation

Electrical works

Contract painting

Interior and exterior painting

Epoxy flooring

Industrial epoxy flooring

Residential/commercial flooring

General building/property improvement services

Other services that the administrator can add from the admin dashboard

The website should feel like a serious Nigerian professional contracting/service company—not a generic template.

The UI must be premium, modern, trustworthy, clean, spacious and conversion-focused.

==================================================

BRAND / DESIGN SYSTEM
==================================================

Create a professional visual identity that can be configured from the admin dashboard.

Do not hard-code the company's name, logo, phone number, email, address, social media accounts or business information throughout the application.

The administrator must be able to manage these details from the admin dashboard.

The design should communicate:

Trust

Professionalism

Technical expertise

Reliability

Quality workmanship

Modern construction/service company

Premium commercial contractor

Nigerian business presence

Use a sophisticated color system that works well for:

Solar/energy

Construction

Painting

Flooring

Contracting

Avoid excessive gradients, excessive animations, oversized cards, childish UI, or generic startup aesthetics.

Use subtle animations only where they improve the experience.

The design must work exceptionally well on:

Large desktop

Standard desktop

Laptop

Tablet

Mobile phone

There must be NO horizontal scrolling.

All content must fit naturally inside the viewport.

==================================================
2. MAIN PUBLIC WEBSITE

Create the following public pages:

/

Home

/services

Services listing

/services/[slug]

Individual service page

/projects

Projects/portfolio

/projects/[slug]

Individual project

/about

About company

/contact

Contact page

/request-quote

Request a quotation

/locations

Service areas / office location

/faq

Frequently asked questions

/privacy

Privacy policy

/terms

Terms and conditions

==================================================
3. HOMEPAGE

Build a high-quality homepage.

Hero section should contain:

Strong headline

Supporting description

Primary CTA: "Request a Quote"

Secondary CTA: "Explore Our Services"

Professional project/service imagery

Company trust indicators

Example positioning:

"Professional Solar, Painting & Flooring Solutions"

Supporting text should explain that the company provides professional installation, contracting and property improvement services.

The hero content must be editable from the admin dashboard.

Include:

Featured services

Why choose us

Company statistics

Featured projects

Service process

Testimonials

Service areas

CTA section

Contact information

Footer

All these sections should be manageable from the admin dashboard where appropriate.

==================================================
4. SERVICES SYSTEM

Create a dynamic services system.

The admin must be able to:

Create services

Edit services

Delete services

Publish/unpublish services

Reorder services

Upload service images

Set service title

Set slug

Set short description

Set full description

Set service category

Set starting price if desired

Set whether price should be displayed

Add features

Add benefits

Add FAQs

Add gallery images

Add SEO title

Add SEO description

Set featured service

Set CTA text

Service categories should be manageable by admin.

Example categories:

Solar & Energy
Painting
Epoxy Flooring
Electrical
Construction
Maintenance
Other Services

Do not hard-code these categories.

==================================================
5. SERVICE DETAIL PAGE

Each service page should contain:

Breadcrumb

Service title

Hero image

Description

Key benefits

What's included

Process

Gallery

Frequently asked questions

Related services

Request quotation CTA

Contact CTA

Display a sticky or easily accessible:

"Request a Quote"

button.

The quotation request should automatically know which service the user came from.

For example:

Service: Solar Installation

should automatically appear in the quotation form.

==================================================
6. REQUEST QUOTATION SYSTEM

Create a professional quotation/request system.

Customers should be able to request a quotation without creating an account.

Form fields:

Customer name
Phone number
Email
Company name (optional)
Service required
Project description
Project location
Property type
Preferred project date
Budget range (optional)
Additional requirements
Photo/document upload
Preferred contact method
Consent checkbox

Allow users to upload:

Site photos

Project drawings

Documents

Existing quotations

Relevant files

Store uploaded files securely using Supabase Storage.

The administrator must receive and manage quotation requests from the admin dashboard.

Quotation statuses:

New
Contacted
Inspection Required
Quote Prepared
Negotiation
Approved
Rejected
Completed
Cancelled

Admin must be able to change the status.

Admin should also be able to add:

Internal notes

Estimated project value

Assigned staff

Follow-up date

Customer notes

==================================================
7. CONTACT SYSTEM

Create a professional contact page.

Show:

Company name

Office address

Phone number

WhatsApp number

Email

Business hours

Social media

Map/location section

Contact form

Contact form should save submissions to Supabase.

Admin should be able to view:

Name

Email

Phone

Subject

Message

Date

Status

Statuses:

Unread
Read
Responded
Closed

==================================================
8. OFFICE LOCATION + DISTANCE FEATURE

Create a professional office-location system.

The administrator must be able to configure:

Office name
Office address
Latitude
Longitude
City
State
Country
Google Maps URL
Business hours
Service radius
Distance display threshold

IMPORTANT:

The website should NOT automatically access a user's location without permission.

When the user wants to calculate distance to the office, display a clear button such as:

"Find My Distance"

or

"Distance From Our Office"

When clicked, request browser geolocation permission.

If the user grants permission:

Get latitude and longitude

Calculate distance between user and company office

Display approximate distance

Display whether the user is within the company's configured service area

Show a link to open directions

Example:

"You are approximately 8.4 km from our office."

If within service radius:

"We currently serve your area."

If outside service radius:

"Your location is outside our standard service area. Contact us to confirm availability."

The service radius must be controlled from the admin dashboard.

Do not expose unnecessary technical location information to the customer.

Handle:

Permission denied

Location unavailable

Browser unsupported

Timeout

Approximate location

gracefully.

Do not store a user's precise location unless explicitly necessary and consented to.

==================================================
9. OPEN GRAPH / SOCIAL SHARING

Implement proper SEO and Open Graph metadata.

Each major page should support:

SEO title

Meta description

Open Graph title

Open Graph description

Open Graph image

Canonical URL

When a page is shared on:

WhatsApp
Facebook
LinkedIn
X
Telegram

it should display a professional preview.

Service pages should have their own Open Graph image where possible.

Projects should have their own Open Graph image.

The admin should be able to configure default:

Site title

Site description

Default OG image

Favicon

Business logo

Also generate appropriate structured metadata where practical for a local service business.

==================================================
10. PROJECT / PORTFOLIO SYSTEM

Create a dynamic project portfolio.

Admin can create:

Project title

Slug

Category

Location

Client type

Project description

Services provided

Project date

Completion date

Project images

Before/after images

Featured status

Published status

Example projects:

5kW Solar Installation – Lagos
Commercial Epoxy Floor – Ikeja
Residential Exterior Painting – Lekki
Office Solar Backup System – Abuja

Do not hard-code these examples.

Project pages should look premium and visual.

Include:

Large hero image

Project overview

Gallery

Scope of work

Results/outcome

Location

Related projects

CTA

==================================================
11. BEFORE / AFTER GALLERY

Create an optional before/after image component.

Admin should be able to upload:

Before image
After image

Allow the public to compare them with a modern slider.

This can be used for:

Painting
Epoxy flooring
Renovation
Solar installations
Property improvement

==================================================
12. TESTIMONIALS

Create a testimonial system.

Admin can:

Add testimonial

Edit testimonial

Delete testimonial

Publish/unpublish

Mark featured

Add customer name

Customer company

Customer location

Customer photo

Testimonial text

Do not manufacture testimonials.

Only display testimonials entered by admin.

==================================================
13. FAQ SYSTEM

Create a dynamic FAQ system.

Admin can:

Add FAQ

Edit FAQ

Delete FAQ

Categorize FAQ

Publish/unpublish

Reorder FAQs

FAQ can be associated with:

Global website

Specific service

Specific project

==================================================
14. SERVICE AREA SYSTEM

Create an admin-controlled service area system.

Admin can add:

City
State
Area
Description
Service availability
Priority
Published status

Example:

Lagos
Ikeja
Lekki
Ajah
Victoria Island
Surulere

But these should be editable rather than hard-coded.

Display service areas publicly.

==================================================
15. ADMIN DASHBOARD

This is extremely important.

Build a mature admin dashboard.

The admin dashboard should not simply be a basic CRUD page.

It should function as the company's internal content and business management system.

Admin route:

/admin

Require authentication.

Use Supabase Authentication.

Unauthorized users must not access admin pages.

==================================================
16. ADMIN DASHBOARD OVERVIEW

Dashboard should show:

Total quotation requests
New quotation requests
Pending requests
Completed projects
Published services
Published projects
Unread contact messages
Testimonials
Service areas

Include useful charts/summary cards where appropriate.

Example:

Quotation Requests
This Month

New Leads
Pending Quotes
Completed Projects

Use clean professional dashboard design.

==================================================
17. ADMIN SIDEBAR

Create a professional responsive admin sidebar.

Sections:

Dashboard

Content

Services

Categories

Projects

Testimonials

FAQs

Service Areas

Leads

Quote Requests

Contact Messages

Business

Company Information

Office Location

Business Hours

Social Links

Website

Homepage

Navigation

Footer

SEO

Open Graph

Media Library

Settings

Admin Users

Roles

General Settings

Security

The sidebar should collapse elegantly on mobile.

==================================================
18. COMPANY INFORMATION MANAGEMENT

Admin must be able to change:

Company name
Logo
Favicon
Tagline
Description
Phone
WhatsApp
Email
Address
City
State
Country
Business registration information if required
Business hours
Emergency contact
Social media links

These values should be stored in Supabase.

The frontend should dynamically retrieve them.

Do not duplicate business information throughout components.

==================================================
19. FOOTER MANAGEMENT

Create a mature professional footer.

The footer should include:

Company logo
Company description
Quick links
Services
Useful links
Contact information
Office address
Phone
Email
Business hours
Social media icons
Copyright
Privacy Policy
Terms
Request Quote CTA

The footer must look professional on both desktop and mobile.

Admin should be able to manage:

Footer description
Footer links
Footer sections
Social links
Copyright text

Do not make the footer look like a basic template.

==================================================
20. NAVIGATION MANAGEMENT

Admin should be able to manage navigation links.

Admin can:

Add navigation item

Rename navigation item

Change URL

Reorder

Hide/show

Set external link

However, protect critical system routes from accidental removal.

Public navbar must be:

Compact

Professional

Responsive

Non-bulky

No horizontal scrolling

Mobile friendly

Desktop navigation should fit comfortably inside the viewport.

Mobile should use a polished menu drawer.

==================================================
21. MEDIA LIBRARY

Create a media management system.

Admin can upload:

Images
Project images
Service images
Logos
OG images
Testimonials
Documents

Store media in Supabase Storage.

Include:

File preview

File name

Upload date

File type

Delete

Copy URL

Assign/use media where applicable

Optimize images for performance.

Use lazy loading for images.

Use appropriate responsive image sizing.

==================================================
22. ADMIN USER MANAGEMENT

Use Supabase Authentication.

Create role-based access.

Roles:

Super Admin
Admin
Editor

Super Admin:

Full access.

Admin:

Manage business operations and content.

Editor:

Manage website content but cannot modify security/admin settings.

Use Supabase Row Level Security.

Never expose Supabase service-role keys in frontend code.

==================================================
23. DATABASE DESIGN

Create a clean Supabase database architecture.

Suggested tables:

profiles

roles

company_settings

office_locations

services

service_categories

service_features

projects

project_images

before_after_projects

testimonials

faqs

service_areas

quote_requests

quote_request_files

contact_messages

navigation_items

footer_sections

footer_links

social_links

site_settings

seo_settings

media_library

admin_activity_logs

business_hours

Use UUID primary keys.

Include:

created_at
updated_at

where appropriate.

Use foreign keys correctly.

Add indexes for commonly queried fields.

Use Row Level Security policies.

Public users should only access content that is:

published = true

Admin users should have appropriate permissions.

==================================================
24. ADMIN ACTIVITY LOG

Create an admin activity logging system.

Record important actions:

Created service
Updated service
Deleted service
Published project
Changed company information
Changed office location
Updated quote status
Deleted media
Created admin

Include:

User
Action
Entity
Date/time
Relevant information

Create an admin activity log page.

==================================================
25. SECURITY

Security is extremely important.

Do not put Supabase service-role keys in frontend code.

Use:

VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY

Only use public anon key on the client.

Use Row Level Security.

Validate forms.

Sanitize user input.

Validate file uploads.

Restrict dangerous file types.

Set reasonable upload size limits.

Do not expose private customer information publicly.

Quote requests should only be visible to authorized admins.

Contact submissions should only be visible to authorized admins.

==================================================
26. MOBILE EXPERIENCE

Mobile must be treated as a first-class experience.

Test the layout at:

320px
375px
390px
414px
768px

There must be:

NO horizontal scrolling.

Avoid:

oversized headings

huge cards

excessive padding

desktop tables overflowing

fixed-width containers

oversized navigation

elements extending beyond viewport

Tables in admin should become responsive cards or horizontally scroll only within their own controlled container.

Forms should be easy to complete on mobile.

Buttons should have appropriate touch targets.

==================================================
27. DESKTOP EXPERIENCE

Desktop design should use the available screen intelligently.

Maximum content width should be controlled.

Do not create extremely wide text blocks.

Use:

grids

split sections

image/text layouts

professional whitespace

subtle borders

appropriate shadows

The website should feel like a premium established company.

==================================================
28. CONTACT / CTA SYSTEM

Throughout the website use strategically placed CTAs:

Request a Quote
Call Us
WhatsApp Us
View Services
View Projects
Get Directions

Admin should be able to configure CTA text where practical.

WhatsApp CTA should use the admin-configured WhatsApp number.

Phone CTA should use the admin-configured phone number.

Email CTA should use the admin-configured email.

==================================================
29. WHATSAPP INTEGRATION

Create WhatsApp contact buttons.

Use the configured WhatsApp number.

Allow admin to configure the default WhatsApp message.

For example:

"Hello, I would like to request a quotation for Solar Installation."

If the user is on a specific service page, automatically include the service name.

==================================================
30. GOOGLE MAPS / DIRECTIONS

Allow admin to configure:

Google Maps URL
Latitude
Longitude
Address

Public website should display:

View on Map
Get Directions

Do not hard-code the office location.

==================================================
31. SEO

Implement technical SEO.

Include:

Dynamic page titles
Meta descriptions
Canonical URLs
Open Graph
Twitter/X cards
Sitemap-ready architecture
robots.txt-ready architecture
Semantic HTML
Proper heading hierarchy
Alt text
Local business structured data where appropriate

Service pages should be SEO-friendly.

Project pages should be SEO-friendly.

==================================================
32. PERFORMANCE

Optimize the application.

Use:

Lazy loading
Code splitting where appropriate
Optimized images
WebP/modern formats where possible
Responsive images
Minimal unnecessary JavaScript
Efficient Supabase queries

Avoid fetching large datasets unnecessarily.

Pagination should be used in admin lists when appropriate.

==================================================
33. ERROR HANDLING

Create polished error states.

Examples:

No services found
No projects found
No testimonials
Quote submission failed
Quote submitted successfully
Contact form failed
Location permission denied
Location unavailable
Network error
Unauthorized admin access
Session expired

Never leave users with blank screens.

Use professional toast notifications.

==================================================
34. LOADING STATES

Create skeleton loaders for:

Services
Projects
Testimonials
Admin tables
Dashboard cards

Do not rely on blank white space while data loads.

==================================================
35. EMPTY STATES

Admin pages should have professional empty states.

Example:

"No quotation requests yet."

with appropriate icon and CTA.

==================================================
36. FORMS

Use reusable form components.

All forms should have:

Labels
Validation
Helpful placeholders
Error messages
Loading state
Success state

Validate both client-side and database-side where appropriate.

==================================================
37. RESPONSIVE ADMIN

The admin dashboard must work on:

Desktop
Laptop
Tablet
Mobile

Do not create an admin interface that only works on desktop.

On mobile:

Sidebar becomes drawer

Tables become responsive

Filters stack

Forms become single column

Dashboard cards adapt

Charts resize

==================================================
38. CONTENT MANAGEMENT

The admin should be able to control as much public content as reasonably possible without touching code.

This includes:

Homepage hero
Homepage sections
Services
Projects
Testimonials
FAQs
Company information
Contact information
Office location
Service areas
Navigation
Footer
Social media
SEO
Open Graph
Business hours

Do not hard-code these values.

==================================================
39. ADMIN PREVIEW

Where practical, provide preview functionality.

For example:

Preview service
Preview project
Preview homepage content

Allow administrators to review content before publishing.

==================================================
40. DRAFT / PUBLISHED SYSTEM

For major content types use:

Draft
Published

Admin should be able to save content without immediately publishing it.

==================================================
41. SEARCH

Public services page should include search.

Admin should be able to search:

Services
Projects
Quote requests
Contact messages
Media

==================================================
42. FILTERING

Projects:

Filter by category
Filter by location
Filter by year

Services:

Filter by category
Published/unpublished

Quote requests:

Filter by status
Filter by service
Filter by date

==================================================
43. QUOTE MANAGEMENT

Admin quote detail page should show:

Customer information
Service requested
Project description
Location
Files
Preferred date
Budget
Contact method
Status
Internal notes
Assigned administrator
Estimated value
Created date
Updated date

Allow admin to update status without leaving the page.

Provide actions:

Call
Email
WhatsApp
View Location
Download Attachments

==================================================
44. CUSTOMER LOCATION

For quotation requests, allow the customer to optionally provide their project location.

This can be:

Address

Area

City

State

Optionally allow location permission for project-location estimation.

Do not force users to provide GPS coordinates.

==================================================
45. BUSINESS CONFIGURATION

Create a central admin settings page.

Admin can configure:

Company
Contact
Location
Social media
Business hours
Service radius
SEO
Open Graph
WhatsApp
Email
Phone
Currency
Default quote settings
File upload limits

Use these settings throughout the application.

==================================================
46. CURRENCY

Default currency should be NGN / ₦.

However, structure the application so currency can later be configured.

==================================================
47. FUTURE E-COMMERCE READINESS

Although the initial website is service-focused, architect the system so e-commerce can be added later.

Potential future additions:

Solar products
Inverters
Solar panels
Batteries
Paint products
Epoxy materials
Electrical equipment
Tools
Accessories

Do not build the full e-commerce system now unless necessary.

Simply avoid architecture that prevents adding:

Products
Cart
Checkout
Payments
Orders
Inventory

later.

==================================================
48. FUTURE PAYMENT READINESS

The initial version can focus on quotations and service requests.

However, structure the application so payment integration can later be added using:

Paystack
Flutterwave
Other payment processors

Do not implement payment processing unless specifically requested.

==================================================
49. CODE ORGANIZATION

Organize the project professionally.

Suggested structure:

src/
components/
components/ui/
layouts/
pages/
pages/admin/
pages/services/
pages/projects/
hooks/
lib/
services/
types/
utils/
contexts/
integrations/
assets/

Keep business logic separate from UI where practical.

Create reusable components instead of duplicating code.

Create TypeScript types/interfaces for database entities.

Do not use any unnecessarily.

==================================================
50. SUPABASE ARCHITECTURE

Create the required SQL migrations/schema.

Include:

Tables
Relationships
Indexes
RLS policies
Storage buckets
Storage policies

The frontend should use the Supabase client safely.

Never expose privileged credentials.

==================================================
51. SEED / STARTER CONTENT

Create realistic starter content so the interface can be evaluated.

Include sample services such as:

Solar Installation
Solar Maintenance
Inverter Installation
Contract Painting
Interior Painting
Exterior Painting
Epoxy Flooring
Industrial Epoxy Flooring

Include sample projects and FAQs.

Clearly make starter content easy to replace/delete from the admin dashboard.

Do not present fabricated testimonials as real customer testimonials.

Label placeholder testimonials clearly if included.

==================================================
52. FINAL QUALITY REQUIREMENT

This should NOT look like a basic generated website.

It should look like a professionally designed Nigerian engineering, construction, solar and property-services company website.

Prioritize:

Professional UI
Strong typography
Excellent spacing
Responsive layout
Clear CTAs
Trust
Conversion
Fast performance
Security
Maintainability
Admin control

The public website and admin dashboard must feel like two parts of the same mature product.

==================================================
53. IMPORTANT IMPLEMENTATION RULE

Before implementing the UI, first establish:

Database schema

Supabase types

Authentication

RLS policies

Storage structure

Settings architecture

Public routes

Admin routes

Reusable components

Responsive layout system

Then build the public pages and admin pages.

Do not create disconnected mock interfaces that are not connected to Supabase.

The admin dashboard must actually control the public website.

If the admin changes:

Company name
Logo
Phone
Email
Address
Services
Projects
Testimonials
FAQs
Social links
Footer
Office coordinates
Service radius
Homepage content

the public website should reflect the change without requiring code changes.

==================================================
54. FINAL ACCEPTANCE TEST

Before considering the implementation complete, verify:

No horizontal scrolling on desktop

No horizontal scrolling on mobile

Navbar fits viewport

Mobile menu works

Admin authentication works

Admin routes are protected

RLS policies work

Public users can submit quotation requests

Admin can view quotation requests

Admin can change quote status

Admin can manage services

Admin can manage projects

Admin can manage testimonials

Admin can manage FAQs

Admin can manage company information

Admin can manage footer

Admin can manage navigation

Admin can manage office coordinates

Distance calculation requests browser permission

Distance is calculated correctly

Service radius is admin-controlled

Get Directions works

WhatsApp links use configured number

Contact forms work

File uploads work securely

SEO metadata works

Open Graph metadata works

Images are optimized/lazy loaded

Loading states exist

Error states exist

Empty states exist

Desktop layout is polished

Mobile layout is polished

No service-role key is exposed

No unnecessary TanStack dependency is introduced

TypeScript has no avoidable type errors

No broken routes

No placeholder lorem ipsum remains

No fake customer claims are presented as real

Public content comes from Supabase

Admin changes propagate to the public website

Build the application as a cohesive production-ready system rather than a collection of unrelated pages.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://apex-contractor-suite.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/2e336dea-ae63-4106-b127-b130a215ddb3).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
