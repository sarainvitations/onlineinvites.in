# Phase 5 — local launch preparation, steps 1–5

8 November 2026. Scope authorized by the owner: verify the app; performance/accessibility; SEO; security; business/policy pages. Cloudflare login, production provisioning, DNS and deployment are later steps and were not performed here. Individual demo redesigns remain deferred.

## Deliverables

### 1. Application verification

The production build runs frontend/server TypeScript, Vite, then the route metadata generator. The complete Playwright suite covers local D1 validation/persistence/concurrency/failure handling, the six-step quotation form and downloads, submission/retry/widget states, all eighteen demos and gallery return behavior on desktop and mobile emulation. Launch checks additionally cover all policy routes, business contact details, recovery from unknown pages, indexing changes during client navigation, generated HTML metadata and security policies.

Validation results and any qualifications are recorded below after the final checks complete.

### 2. Performance and accessibility

- Self-hosted the existing DM Sans, Cormorant Garamond, Bodoni Moda and Cinzel font families as browser-optimized WOFF2 subsets; licenses and source attribution are in `public/fonts/`. No Google Fonts request is needed. The total stored font set is about 480 kB; pages load only relevant faces/subsets. The two principal Latin normal faces are preloaded. Font CSS itself is not marked immutable, while font binaries have content-hashed names.
- Replaced simple shared scroll reveals with IntersectionObserver/CSS and made the homepage hero immediately visible. This moved full Motion opening features into the lazy invitation code: main entry JS fell from about 287 kB (93 kB gzip) to 166 kB (55 kB gzip). Full invitation transitions still use Motion.
- Preserved lazy loading for gallery, pricing, quotation and premium previews; new contact/policy pages also load on demand. No new runtime package was added. Axe and Lighthouse audit tools were installed only under `/tmp/online-invites-phase5-tools`, not in the application dependency list.
- Fixed detected supporting-text contrast issues across studio, gallery, pricing, form and the eighteen invitation themes. Increased practical labels, date details and toolbar/disclosure text; preserved palettes and carousel behavior.
- **The Golden Hour:** put the two existing names on deliberate separate lines, keeping “Dev” intact on desktop. This is a typography correction, not a new opening concept.
- **A Window in Provence:** corrected the closing italic phrase's contrast. **Letters in Ivory / A Window in Provence:** corrected small story-signature contrast. All original themes gained fully opaque event indices and venue/scroll hints; all premium themes gained clearer schedule/time and disclosure text.
- The premium scene reset and individual artistic refinements recorded in `DESIGN_REVIEW.md` remain deferred. This pass does not claim those opening choreographies have been redesigned.

### 3. SEO and sharing

`scripts/build-seo.mjs` uses the existing template catalog and shared page records to generate 27 route-specific HTML files, including all 18 invitation routes. Titles, descriptions, canonicals, Open Graph URLs/images and Twitter card metadata exist in the HTTP HTML before JavaScript runs; client navigation updates them too. Queries containing carousel/filter selections are excluded from canonicals.

The build also produces `sitemap.xml` with 22 indexable public routes, `robots.txt`, a noindex `404.html`, and explicit rewrites for known routes. Draft policies and the quotation form are noindex and absent from the sitemap. Robots does not disallow policy pages, so crawlers can read their noindex directives. API responses independently carry noindex headers. The intended canonical origin remains `https://onlineinvites.in`; deployment/domain verification is still pending.

`public/social-card.png` is an original 1200 × 630 brand card rendered from `scripts/social-card.html`. Regenerate locally with `node scripts/generate-social-card.mjs` using installed Chrome and the project Playwright dependency. Fonts are embedded only for that generation step. A no-JavaScript fallback supplies each page's summary and Sara's email contact.

This remains a client-rendered React application. Route metadata is statically generated; full route bodies are not server-rendered. Do not describe this as complete SSR, guarantee search rankings, or claim public crawler/social cache validation before deployment.

### 4. Security review

- `server/security.ts` centralizes production security headers. The build emits Cloudflare `_headers` for static files. API JSON responses set the same headers themselves because Cloudflare does not apply static `_headers` to Functions responses.
- CSP allows this origin and the explicit Cloudflare Turnstile script/frame host. It disallows arbitrary script origins, inline scripts and eval; `style-src 'unsafe-inline'` remains necessary for Motion and CSS/SVG artwork style attributes. Fonts are restricted to this origin. Object embedding and framing the app are blocked; base/form destinations are restricted.
- Added nosniff, frame denial, a restrictive browser permissions policy and a strict referrer policy. HSTS has a six-month lifetime without includeSubDomains or preload; HTTPS behavior still requires verification after deployment. Only fingerprinted assets/font binaries receive one-year immutable cache headers.
- API responses remain uncached and non-indexable. Existing strict request shape/size/type validation, normalized inputs, bound SQL, same-origin checks, salted identifiers, rate limits, idempotency, verified Turnstile hostname/action/freshness and safe errors were reviewed and exercised by the backend suite. No public record-reading/admin endpoint was introduced.
- Local public test keys remain loopback-only. Production still requires real keys, HTTPS, an allowed host, a non-test salt and `POLICIES_APPROVED=true`. These production settings were not enabled. There is no verification bypass or fake authentication.
- The dependency advisory report is stored under the audit artifacts. This is an npm advisory scan and focused application review, not an independent penetration test or a guarantee against every future vulnerability.
- Build contents are limited to frontend assets and generated public files; source documents, test artifacts and `.wrangler` data are not packaged in `dist`. Test-key server values and the local HMAC salt were checked against built frontend assets.

### 5. Business and policy pages

The owner supplied **Sara**, **Delhi**, **sara.invitations@gmail.com**. These are in `src/config/site.ts`, appear on `/contact`, and are linked from the homepage/footer. No registration, GST number, street address, phone, inbox automation or service response-time promise was invented.

The former placeholders are replaced by readable, linked drafts:

- `/policies/privacy`: collected data, preview/local/live modes, purpose/consent, security identifiers, Cloudflare/Gmail providers, external map links, self-hosted fonts, retention/deletion proposal, children and complaints.
- `/policies/terms`: quote acceptance, upfront payment, preview timing, revision rounds, content rights/approval, optional scope, domain responsibilities and remedies.
- `/policies/refunds`: a proposed work-based cancellation approach, authorized unrecoverable costs, non-delivery/deficient-service remedies and proposed refund processing.
- `/policies/hosting`: included 30 days, current ₹10/day extras, publication/expiration agreement, extension approval, sharing/access, domains and outage concerns.

All four retain a visible **Draft · owner review required** label and noindex. `site.policiesApproved` is false. The backend production approval flag is also left false in its example. Preparing these drafts is complete; approving or declaring them legally effective is not.

#### Owner decisions before real submissions or paid orders

1. Approve final text and set an effective date. Confirm operator/correspondence and complaint contact requirements; only a city is currently provided. Check applicable privacy/consumer requirements for the actual business before publication.
2. Confirm the proposed **180-day unconverted-enquiry retention** and implement/document the actual deletion or anonymization procedure. It is not automated by this change. Establish retention for orders, disputes and backups separately.
3. Confirm the proposed work-based refund deductions and **seven-working-day refund initiation** procedure. The payment provider and refund operations are not configured.
4. Define working days/holidays, scope/ownership of source files, quotation validity and domain/renewal responsibilities in actual order quotations.
5. Once approved, update draft wording/metadata and the shared site setting together; production submission approval, keys, domain checks and live tests belong to the deployment steps. Do not simply flip a flag while draft language and unresolved operating procedures remain.

## Reproduce locally

```sh
npm run build
PLAYWRIGHT_CHANNEL=chrome npm test
npm run preview -- --port 4176 --strictPort
```

Audit helper scripts and raw evidence are in ignored `artifacts/phase5-2026-11-08/`. Existing customer/local test enquiries were not queried or changed. The Cloudflare smoke runtime uses the isolated temporary state directory `/tmp/online-invites-phase5-state` on port 8789.

## References consulted

- [Cloudflare Pages headers](https://developers.cloudflare.com/pages/configuration/headers/) — static versus Function response handling.
- [Turnstile CSP guidance](https://developers.cloudflare.com/turnstile/reference/content-security-policy/) — required script/frame origins.
- [Google Fonts source and licenses](https://github.com/google/fonts/tree/main/ofl) — family-specific OFL files are retained with the assets.
- [MeitY data protection framework](https://www.meity.gov.in/data-protection-framework) — owner/legal review reference; no blanket legal compliance certification is made here.

## Final verification results

- **Production TypeScript/build: passed.** Generated 27 route HTML documents, sitemap/robots/404 and security rules; main entry is ~166 kB / 55 kB gzip, down from ~287 kB / 93 kB gzip before the shared reveal optimization.
- **Full regression suite: 176 passed (4.3 minutes).** The final small decorative-heading correction then passed 14 focused homepage/launch checks (11.3 seconds). Logs: [full](../artifacts/phase5-2026-11-08/final-tests.log), [focused](../artifacts/phase5-2026-11-08/final-focused-tests.log). An earlier new mobile test failed because it did not open the navigation menu; that test was corrected and passed in the complete run.
- **Axe accessibility: 104 desktop/mobile page/state scans with zero detected violations** under WCAG 2 A/AA, 2.1 AA and 2.2 AA tags. This comprises 54 settled-page scans, 36 sealed covers and 14 form-step/error-state scans. Zero document overflow/runtime errors in the settled-page scans. [Settled results](../artifacts/phase5-2026-11-08/release-accessibility.json), [cover/form results](../artifacts/phase5-2026-11-08/states-accessibility.json). The later decorative-heading correction also cleared Lighthouse's heading-order finding.
- **Dependency audit: zero known vulnerabilities** in the recorded npm audit, including development dependencies. [Advisory report](../artifacts/phase5-2026-11-08/npm-audit.json).
- **Cloudflare runtime:** 26 redirects and three static-header rules parsed successfully. Known routes, sitemap, robots and sharing image returned 200; unknown pages/admin path returned 404; GET enquiries returned 405. Static pages and API responses contained the configured security headers. Desktop/mobile loaded local fonts and the actual Cloudflare test widget without recorded CSP errors. [HTTP/browser results](../artifacts/phase5-2026-11-08/runtime-smoke.json).
- **Actual provider/storage smoke:** desktop and mobile test widgets obtained genuine dummy-key tokens; server-side verification returned HTTP 201 and focused the stored receipt. A count query confirmed **two records** in the isolated temporary D1 database. No outbound email was sent. [Receipts](../artifacts/phase5-2026-11-08/provider-smoke.json).
- Frontend JavaScript contained neither the server test secret nor local HMAC salt. No remote database, production key, paid provider, DNS or deployment was configured.

Final homepage Lighthouse results, measured sequentially against the local Cloudflare production build with other browser audits stopped:

| Profile | Performance | Accessibility | Best practices | SEO | LCP | Blocking time |
| --- | --- | --- | --- | --- | --- | --- |
| mobile | 100 | 100 | 100 | 100 | 1.1 s | 60 ms |
| desktop | 100 | 100 | 100 | 100 | 0.3 s | 0 ms |

[Mobile report](../artifacts/phase5-2026-11-08/complete-lighthouse-mobile.report.html) · [Desktop report](../artifacts/phase5-2026-11-08/complete-lighthouse-desktop.report.html) · [Machine-readable summary](../artifacts/phase5-2026-11-08/lighthouse-summary.json)

These are local synthetic homepage measurements, not public CDN/real-device field metrics or a guarantee for every route. The early baseline used a different local server and overlapping audit activity; treat the measured bundle-size reduction as direct evidence and avoid claiming a controlled before/after Lighthouse experiment. Performance testing after real deployment is still required. Chrome/emulated mobile checks do not replace physical iPhone/Android, Safari, manual screen-reader or independent security/legal review.

**Local steps 1–5 are prepared and verified.** Policy text/procedures need owner review; Cloudflare account access, real D1/Turnstile/secrets, domain setup, deployment and live acceptance testing remain steps 6–11.
