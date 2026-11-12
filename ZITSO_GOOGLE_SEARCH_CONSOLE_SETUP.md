# Zitso Energy — Google SEO and Search Console Setup

Canonical website: https://zitsoenergy.com

## Included in this update

- Dynamic XML sitemap at `https://zitsoenergy.com/sitemap.xml`.
- The sitemap lists public static pages and, when the public Supabase API configuration is available, published services, projects and blog posts. Published item images are included as image sitemap entries.
- `public/robots.txt` allows crawling so Google can read page-level `noindex` directives and declares the sitemap. Admin pages remain protected by application authentication and are marked `noindex,nofollow`.
- Unique page titles and meta descriptions for the public pages.
- Self-referencing canonical URLs using the non-www HTTPS domain.
- Open Graph and X/Twitter share metadata.
- Organization and WebSite JSON-LD, plus BlogPosting, Service and CreativeWork metadata on relevant detail pages.
- `www.zitsoenergy.com` permanently redirects to `https://zitsoenergy.com`; Cloudflare should also keep Always Use HTTPS enabled for HTTP requests.
- Staff sign-in and admin pages are marked `noindex,nofollow`. The admin content remains protected by application authentication; `robots.txt` is not used as an access-control mechanism.

## Supabase runtime variables required for dynamic sitemap records

The sitemap still works as an XML sitemap with the fixed public pages if these values are unavailable. To include all published database-driven content, configure these Worker runtime variables in Cloudflare:

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`

Use the project URL and public publishable key from the same Supabase project used by the website. Never use `SUPABASE_SERVICE_ROLE_KEY` or a Supabase secret key in browser code. The sitemap endpoint only reads rows marked `published = true`.

The website frontend separately expects the matching build-time values `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` where the deployment pipeline requires Vite-prefixed environment variables. Keep the values pointed at the same project.

## Before Search Console submission

1. Deploy this updated project to the production Worker.
2. Open `https://zitsoenergy.com/robots.txt` and check that it returns plain text with the sitemap line.
3. Open `https://zitsoenergy.com/sitemap.xml`. It must return XML, not the website HTML, a 404, or a 500 response. Confirm it contains the static public pages. With Supabase runtime variables present, it should also contain published `/services/...`, `/projects/...` and `/blog/...` URLs.
4. Confirm `https://www.zitsoenergy.com` redirects to the equivalent `https://zitsoenergy.com` URL and that HTTP redirects to HTTPS at Cloudflare.

## Submit in Google Search Console

1. Open the verified Domain property for `zitsoenergy.com`. A Domain property covers HTTP/HTTPS and www/non-www host variants. If only a URL-prefix property exists, use the exact verified `https://zitsoenergy.com/` property.
2. In the left navigation, choose **Sitemaps**.
3. In **Add a new sitemap**, enter `sitemap.xml` and select **Submit**.
4. Reopen the Sitemaps report and check that the sitemap status becomes **Success** and that Google discovered URLs. If it reports an error, open the sitemap URL directly first and fix any access, XML, or server errors before resubmitting.
5. Open **URL inspection**, enter `https://zitsoenergy.com/`, select **Test live URL**, and then **Request indexing** if the live test is successful.
6. Also inspect the important public pages: `/services`, `/projects`, `/blog`, `/about`, `/contact`, and `/request-quote`. Request indexing for the most important pages after confirming each live test succeeds.
7. Use **Page indexing** and **Core Web Vitals** in Search Console to review discovery, indexing and experience issues after Google recrawls the site.

## Useful Google validation tools

- Search Console: https://search.google.com/search-console
- Rich Results Test: https://search.google.com/test/rich-results
- URL Inspection is available inside Search Console.

## Important notes

- Sitemap submission is a discovery hint, not a guarantee of indexing or rankings.
- Google can choose a different canonical URL if it considers another URL more appropriate. The site now aligns canonical tags, sitemap URLs and the permanent www redirect to the apex HTTPS domain.
- Search appearance changes only after Google recrawls and reprocesses pages. This can take days or longer; it is not an instant switch.
- Structured data must accurately describe content users can see on the page. Do not add invented phone numbers, addresses, opening hours, ratings or reviews. The current Organization markup avoids inventing those business details.
- Google Search ranking also depends on useful original content, reputation, links, page experience and query relevance. Technical SEO setup alone cannot guarantee a first-page position.
