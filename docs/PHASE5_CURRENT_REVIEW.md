# Phase 5 current release review

8 November 2026. This is the current review after the owner’s latest design changes. It supersedes the historical draft-policy and older verification counts in `PHASE5_LAUNCH_REVIEW.md`. Scope: testing, performance, accessibility, SEO, security and deployment preparation. No website deployment, DNS change or production submission enablement was performed.

## Verified results

| Check | Current result |
| --- | --- |
| Frontend/server TypeScript and production build | Passed |
| Full desktop/mobile regression suite | 212 passed |
| WCAG-tagged accessibility scans | 92 page/cover/open-state scans; zero violations, page errors or horizontal overflow |
| Dependency audit | Zero known advisories |
| Local Cloudflare HTTP checks | Public routes, sitemap and robots return 200; enquiry/RSVP GET requests return 405; unknown page returns 404 |
| Generated SEO | 28 HTML routes and 27 sitemap URLs; quotation form and retained portfolio data excluded from sitemap |
| Client asset inspection | No removed owner contact details, server secret key name or local rate-limit salt in built JS |
| Existing production D1 migration status | No pending migrations; read-only remote check |
| Pages project | Existing `online-invites` project and reserved Pages hostname verified read-only |
| Staged release | 164 files verified against SHA-256 manifest; Pages Functions compile successfully |

Local Lighthouse homepage scores:

| Profile | Performance | Accessibility | Best practices | SEO |
| --- | --- | --- | --- | --- |
| Desktop | 100 | 100 | 100 | 100 |
| Mobile | 99 | 100 | 100 | 100 |

Desktop LCP: 0.3 s, TBT: 0 ms, CLS: 0.002. Mobile LCP: 1.1 s, TBT: 120 ms, CLS: 0.002. These are local lab measurements; production behavior, real networks, physical devices, Safari and manual assistive-technology review remain separate verification. WCAG-tagged scans are not a complete accessibility certification.

## Changes made during this review

- Fixed collection-badge contrast with an explicit light background and darker text.
- Fixed the dark Basic invitation’s RSVP heading contrast by inheriting its actual `--paper` theme background.
- Recorded the already-approved policies in the checked-in production configuration. `SUBMISSIONS_ENABLED` remains false. This configuration has not been applied remotely.
- Added `scripts/prepare-release.mjs`, which stages an explicit source/build/config allowlist, validates production flags, excludes local state/env files and generates a SHA-256 manifest. The staged configuration points to the production D1 binding and real public Turnstile site key. Encrypted production secrets remain in Cloudflare.

## Reviewable release

Current staged directory: `artifacts/online-invites-release-0XW3FR/`.
Archive: `artifacts/online-invites-release-0XW3FR.tar.gz`.
Manifest: `artifacts/online-invites-release-0XW3FR/release-manifest.json`.

To prepare a fresh staging directory after future changes, run a successful `npm run build`, then `node scripts/prepare-release.mjs`. It creates a new directory and does not deploy. Do not deploy from the root local-test Wrangler configuration. The staging directory has a production `wrangler.jsonc`, `dist/`, `functions/`, all referenced source modules and migrations. Before deploying, confirm the existing Pages project’s production branch; use the staged project as Wrangler’s working directory.

Current staging flags: `APP_MODE=production`, `POLICIES_APPROVED=true`, `SUBMISSIONS_ENABLED=false`. Verify the remote secret names and bindings before publication; do not export their values into the release. Compilation produced a non-fatal sandbox restriction writing Wrangler’s user-directory log, while the Worker bundle compiled successfully.

## Remaining launch steps

1. Deploy the reviewed release to the existing Cloudflare Pages project, initially keeping public submissions disabled.
2. Attach `onlineinvites.in` and the agreed `www` behavior; verify DNS, HTTPS, canonical URLs, security headers, redirects, all assets and the embedded portfolio on the actual hostname.
3. Perform a controlled live quote and RSVP test using real hostname-bound Turnstile keys, verify storage through owner-only retrieval, test retry/failure behavior and remove test records. Public production submission enablement has not been performed.
4. Enable customer submissions after live verification. No automatic email notification is promised; owner retrieval is database/CLI based until a provider is configured.
5. Confirm a usable business contact channel for quotation follow-up and privacy/cancellation requests while keeping the owner’s personal contact details private. The current contact page explicitly says public contact details are unavailable.

Customer domain provisioning, hosting expiry and retention/deletion procedures remain manual operating responsibilities; these checks do not introduce an automatic day-31 shutdown or data purge. The retained portfolio copy is independent of customer invitation expiry.

## Evidence

Ignored artifacts: `artifacts/phase5-refresh-2026-11-08/`, containing accessibility scan data, Lighthouse desktop/mobile reports, HTTP checks, audit script and compiled Functions. Earlier reports remain historical evidence rather than current production claims.

Release configuration was subsequently corrected for GitHub/Pages: the unsupported `account_id` field was removed, and Pages-specific configuration validation plus Functions compilation now pass. The previous staged release is superseded by the current path above.
