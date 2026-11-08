# Online Invites

Current release status: Phase 5 preparation was refreshed on 8 November 2026 after the latest design changes. Build and 212 regression checks pass; 92 accessibility scans report zero WCAG-tagged violations. Policies are approved, and a verified production release is staged with submissions disabled. Deployment, DNS and live acceptance testing remain pending. See [current Phase 5 review](docs/PHASE5_CURRENT_REVIEW.md). Older progress sections below are historical.


A premium, quotation-first digital invitation studio. Phases 1–4 and Phase 5 local launch preparation (steps 1–5) are implemented, with individual demo animation refinements deferred for later updates. The full local Cloudflare runtime can store test enquiries; permanent hosting and launch have not been performed. See [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) for progress and approval boundaries.

## Start locally

Recommended: **Node.js 26 LTS**. The minimum supported version is 22.12. If you use nvm, run `nvm use` (`.nvmrc` selects Node 26).

If your terminal still reports Node 16 (`node -v`), use this project command without changing the system Node installation:

```sh
npm exec --yes --package=node@26 -- npm run dev:cloudflare
```

For frontend-only work, replace `dev:cloudflare` with `dev`. The first run may download Node 26 into npm’s cache. An error mentioning `node:util` / `styleText` indicates the older runtime was used.


```sh
npm install
npm run dev
```

Open http://127.0.0.1:5173 (or the Local URL printed by Vite). No credentials are needed.

- `/` — homepage, occasion shortcuts, featured invitations and contact explanation.
- `/designs` — eighteen-design gallery, search and all eleven occasion filters. Search/filter state is kept in the URL, e.g. `/designs?occasion=Wedding&q=botanical`.
- `/designs/the-garden-edit` — botanical wedding.
- `/designs/under-the-stars` — celestial Nikah.
- `/designs/the-modern-vow` — editorial engagement.
- `/designs/a-little-confetti` — playful birthday.
- `/designs/a-place-to-belong` — earthy housewarming.
- `/designs/marigold-mornings` — festive Puja.
- `/pricing` — full package inclusions, hosting terms and four domain preferences.
- `/request-quote` — six-step requirements form with validation, hosting estimate, editable review, consent and local JSON export.

Open each demo, scroll through the event and venue sections, and replay its opening. The sample Google Maps links point to the city; all customer names, events and venues are fictional. All eleven occasion categories now have a demo. Search combinations with no matches show a useful empty state and custom-design contact link.

“Request Similar Design” links to `/request-quote?template=<id>`; pricing choices use `/request-quote?package=basic`. These prefill the selected demo, occasion and package preference. Legacy homepage links with template/package parameters carry the selection forward through their quote buttons. In static/Vite preview no enquiry is transmitted. The configured local Cloudflare runtime now supports verified test submissions to local D1. No payment is collected and no personal draft is persisted to browser storage.

## Build and preview production output

```sh
npm run typecheck
npm run build
npm run preview
```

`build` checks TypeScript and generates `dist/`; `preview` serves that output, normally on port 4173. Gallery, invitation preview and pricing routes are lazy-loaded. Fonts are self-hosted with Georgia/system fallbacks. DM Sans, Cormorant Garamond, Bodoni Moda and Cinzel are open-source fonts under the SIL Open Font License. Artwork is original local CSS/SVG; there is no external image or audio dependency.

## Browser tests

Install Playwright’s Chromium once, then run the suite:

```sh
npx playwright install chromium
npm test
```

Alternatively, use an existing Google Chrome installation:

```sh
PLAYWRIGHT_CHANNEL=chrome npm test
```

Tests reuse a local Vite server on port 5173, or start one if needed. The suite exercises desktop and emulated mobile Chrome: search/filter URL state, empty states, all eighteen invitation openings and replay focus, map links, selected-design handoff, pricing, navigation, Escape keyboard focus, reduced motion, unknown invitation recovery, runtime errors and 320px layout overflow. `npm run test:ui` opens Playwright's interactive runner. Failure screenshots and traces are stored in ignored `test-results/`.

These are browser checks, not a full Lighthouse, screen-reader, Safari or physical-device audit; that wider review remains in Phase 5.

## Source and configuration

- `src/config/business.ts`: shared package prices, package inclusions, included hosting days and daily hosting rate.
- `src/data/templates.ts`: eighteen typed fictional demo records, occasion list, search/filter helpers and quote links.
- `src/components/TemplateArt.tsx`: reusable invitation cover artwork.
- `src/pages/TemplatePreview.tsx`: invitation opening, scrollable event/venue experience and replay behavior.
- `src/phase2.css`: studio gallery/pricing layouts and six invitation visual systems.
- `src/components/Metadata.tsx`: route titles, descriptions, Open Graph text and canonical URLs.

No secrets are needed for Phases 1–3. `.env.example` contains notes for later integration; server secrets must never be embedded in frontend code.

## Deferred work

Production Cloudflare account configuration, a remote database, real hostname-bound verification keys and optional outbound email delivery remain deferred until the owner is ready. Phase 5 local checks, SEO/security improvements and policy drafts are documented in docs/PHASE5_LAUNCH_REVIEW.md. Owner approval of policies and actual production setup/verification remain pending. Policy routes contain complete drafts that still require owner approval.

Wrangler local scripts, database migrations, test-key verification and a disabled production configuration example are now included; see [Phase 4 local backend](docs/PHASE4_LOCAL_BACKEND.md). No permanent Cloudflare Pages deployment has been performed. A future Cloudflare Pages build will use `npm run build`, output directory `dist` and a supported Node environment. Domain provisioning remains manual and individually quoted. Production launch requires completing the remaining phases and owner configuration.

## Twelve premium additions

The basic collection remain available under **Basic collection** in the gallery. The **Premium collection** filter shows twelve new designs. Collection, occasion and search filters compose and remain in the URL: `/designs?collection=Premium`. These collection names describe the design presentation; actual implementation and add-ons are individually quoted.

| Preview route (under `/designs/`) | Palette | Opening |
| --- | --- | --- |
| `velvet-overture` | Bordeaux / antique gold | Parting theatre curtains |
| `lunar-nocturne` | Indigo / silver | Rising moon and sweeping moonlight |
| `the-golden-hour` | Sienna / apricot | Sunrise and receding hills |
| `palace-of-promises` | Sapphire / gold | Perspective palace gates |
| `letters-in-ivory` | Pearl / espresso | Wax seal and unfolding envelope |
| `midnight-in-paris` | Onyx / champagne | Art Deco aperture |
| `a-window-in-provence` | French blue / buttercream | Opening window shutters |
| `the-lotus-court` | Aubergine / rose gold | Unfurling lotus petals |
| `ocean-afterglow` | Marine / coral | Three receding ocean layers |
| `the-crystal-ball` | Amethyst / platinum | Turning crystal facets |
| `little-moon-and-stars` | Mulberry / luminous gold | Floating lanterns |
| `threads-of-saffron` | Vermilion / antique brass | Lifting silk ribbons |

Each premium opening displays the event date and uses a finite 2.6-second transition after activation. A **Skip animation** control is available during the transition; reduced-motion preferences open the invitation immediately. Replay restores focus to the opening control. Opening artwork, invitation content and cover thumbnails share original scene primitives without videos, image downloads or new runtime packages.

Premium artwork and tokens live in `src/premium-covers.css` and `src/components/premium/Scene.tsx`. Full invitation layouts, animation choreography and responsive rules live in `src/premium.css`; this stylesheet and `PremiumInvitation.tsx` are loaded only when a premium preview is visited. Premium content lives in `src/data/premiumTemplates.ts`.

## Compact carousel browsing

The gallery displays a single row of designs: three on desktop, two on tablet and one on mobile. Use the arrows, swipe/trackpad or focus the track and use Left/Right/Home/End. There is no autoplay. Filters still apply to all eighteen designs.

Opening a demo remembers collection, occasion, search and selected design. **All designs** in either demo toolbar returns to that carousel, restores its horizontal/vertical position and focuses the preview you opened. Browser Back restores the saved location too. Direct demo links return to their own position in the gallery; homepage previews return to the homepage carousel. The selected slide is shareable through `?slide=<template-id>#design-carousel` (or `#designs` for the homepage).

Implementation: `src/components/DesignCarousel.tsx`, `src/carousel.css` and `src/hooks/useDesignReturn.ts`. Interaction/return checks are in `tests/carousel.spec.ts`.

## Temporary remote sharing

For the current remote demo, the production build is served on loopback port 4173 and exposed through a Cloudflare Quick Tunnel. The tunnel was verified in Chrome, including the gallery, invitation opening and saved carousel return.

To repeat with `cloudflared` installed, start the built frontend and the tunnel in separate terminals:

```sh
npm run build
npm run preview -- --port 4173 --strictPort
```

```sh
cloudflared tunnel --url http://127.0.0.1:4173 --http-host-header localhost --no-autoupdate
```

For this session, the tunnel binary was downloaded to `/tmp/online-invites-share/cloudflared`; it is a temporary file, not a permanent installation. Its printed HTTPS URL can be shared. Anyone with the URL can view the demo. Keep the Mac awake and connected, with both processes running. There is no scheduled expiry or uptime guarantee. Stop the tunnel process to end access; a new tunnel normally generates a different URL.

This shares the built frontend only. Source changes need `npm run build` before they appear on the shared link; visitors should refresh after rebuilding. Permanent Cloudflare Pages hosting and launch readiness remain later work.

## Phase 3 quotation form

Six steps collect customer contact details, event dates and languages, design preferences, optional features, hosting/domain preferences, then a complete editable review and privacy consent. The form matches the studio design and works on mobile, including a 320px layout.

- Country-code WhatsApp numbers are optional unless WhatsApp is the preferred contact method.
- Dates use the current day in Asia/Kolkata. Past/invalid dates and publication after the event are rejected. Requested dates are reviewed, not promised automatically; the three-working-day preview timeline still starts after payment and complete requirements.
- Language and feature groups support conditional custom requirements. Hex values accept 3 or 6 digits. Up to five HTTP(S) reference links are allowed; unsafe schemes and embedded login details are rejected.
- Function count accepts 1–50 whole functions; hosting accepts 1–3,650 whole days. These frontend bounds are explicit in the form and model, and can be adjusted when production business limits are finalized.
- Hosting shows **additional hosting only**: included days and daily rate come from `src/config/business.ts`. At the current settings, 30 days adds ₹0 and 45 days adds ₹75. Domains, feature costs and design fees remain individually quoted.
- Subdomains and existing/new domains have conditional validation. Selection does not reserve, register or configure an address.
- Back/Continue, visited-step controls and review Edit buttons keep entered values in memory. Opening a demo from the form uses a new tab. Refreshing or leaving clears entries; no localStorage/sessionStorage draft is created. The explicit Clear action removes entered details while retaining initial query preferences.
- Errors are associated with controls and summarized in a focused, keyboard-operable error panel. Step headings receive focus when moving between steps. Reduced motion and keyboard navigation are supported.
- In static preview, **Check my requirements** validates the complete form and consent locally. **Download requirements** generates a real JSON file on the visitor’s device. The file identifies itself as an unsubmitted local draft and includes normalized requirements and the extra-hosting estimate. It contains the entered personal details; the visitor controls that downloaded copy.
- The static preview does not simulate Turnstile, API storage or a successful submission. In the configured local Cloudflare runtime, the form instead uses real test-key verification and saves to local D1 before returning a clearly labelled test receipt. The privacy policy is still a draft awaiting owner review; no live customer enquiry service or payment collection has been launched.

Source: `src/features/quote/model.ts` (types, validation, calculations, export), `Fields.tsx` (accessible controls), `Steps.tsx`, `Review.tsx`, `src/pages/Quote.tsx` and lazy-loaded `src/quote.css`.

Phase 3 checks are in `tests/quote-model.spec.ts` and `tests/quote.spec.ts`. Run them with `npm test -- tests/quote-model.spec.ts tests/quote.spec.ts` (or prefix `PLAYWRIGHT_CHANNEL=chrome` to use installed Chrome). Tests cover required fields, date and hosting boundaries, unsafe reference links, prefills, conditional fields, navigation, editable review, consent, real JSON download, in-memory retention, absence of submission/storage and narrow responsive layouts.

Latest Phase 3 verification: `npm run build` passed, and the complete suite passed **114 automated checks** across desktop and emulated mobile Chrome projects. The built form and selected-demo handoff were also verified through the current temporary public link. Phase 4 was subsequently approved for local implementation only.

## Phase 4 local backend

Detailed setup, API contract, security boundaries, owner retrieval, email behavior, testing and deferred production steps are documented in **[docs/PHASE4_LOCAL_BACKEND.md](docs/PHASE4_LOCAL_BACKEND.md)**.

```sh
npm run db:migrate:local
npm run dev:cloudflare
```

Open **http://127.0.0.1:8788/request-quote**, use sample details, complete official test-key verification and choose **Save test enquiry locally**. This runs Pages Functions and D1 entirely on this Mac. An internet connection is needed for the Cloudflare widget/Siteverify call. A reference is shown only after storage succeeds.

```sh
npm run enquiries:list
npm run test:backend
```

The owner CLI lists local references; `--reference <actual-OI-reference>` retrieves one local enquiry. There is no public admin API. The notification abstraction sends nothing until a transactional provider is configured; database storage works independently of email.

The existing temporary sharing link still serves the static frontend on port 4173 and remains a non-submitting preview. No remote database, production account login, permanent deployment, domain change or launch was performed. Review and perfect individual demos before any owner-approved production setup.

Latest Phase 4 verification: frontend/server TypeScript and production build passed; **164 automated checks passed** across desktop and emulated mobile projects. Actual Cloudflare test-widget/Siteverify flows saved fictional enquiries to local D1 in desktop and 320px mobile Chrome; owner-only CLI retrieval also passed. Server secrets/salt were absent from frontend assets. Production deployment and live keys were not tested or configured.

## Continuing design refinement

Read [HANDOFF.md](HANDOFF.md) for current project state, owner priorities, preview/database locations and continuation instructions. [Design review](docs/DESIGN_REVIEW.md) tracks the current visual/live-animation audit and per-demo proposals. Design review is not yet complete; no demo redesign has been made as part of that review. Individual refinements precede Phase 5 and explicit launch approval.

## Phase 5: local launch preparation (8 November 2026)

Steps 1–5 have been implemented and checked locally: production regression checks, performance/accessibility, SEO, security headers and business/policy pages. The evidence and final results are recorded in [docs/PHASE5_LAUNCH_REVIEW.md](docs/PHASE5_LAUNCH_REVIEW.md). No Cloudflare production provisioning or deployment is included in this work.

- Business details: Sara, Delhi, `sara.invitations@gmail.com`, configured in `src/config/site.ts`; public route `/contact`.
- Four full policy drafts: `/policies/privacy`, `/policies/terms`, `/policies/refunds`, `/policies/hosting`. They remain visibly unapproved/noindex. Review the proposed retention/refund procedures and operator details before enabling production submissions.
- `npm run build` now generates HTTP HTML metadata for 27 routes, a 22-URL sitemap, robots rules, 404 recovery, Cloudflare `_headers` and known-route rewrites. Client navigation updates matching metadata. This adds static metadata, not full server-rendered page bodies.
- Fonts are self-hosted with their OFL licenses in `public/fonts/`. Google Fonts is no longer contacted by the app. The original fonts section above describes the earlier setup.
- `public/social-card.png` is the 1200 × 630 sharing image. Its source is `scripts/social-card.html`; regenerate with `node scripts/generate-social-card.mjs` using installed Chrome.
- `server/security.ts` defines the static/API security policy. Static headers are generated into `dist/_headers`; API responses add their own. Vite development/preview does not apply Cloudflare `_headers`; verify them with Wrangler locally and on the eventual HTTPS deployment.

Run `npm run build` before the complete suite (`PLAYWRIGHT_CHANNEL=chrome npm test`), because launch checks inspect generated production metadata and security files as well as browser behavior.

Latest Phase 5 local verification: production build passed; **176 regression checks** and **14 final focused checks** passed. **104 accessibility page/state scans** found no WCAG-tagged violations. Final local homepage Lighthouse scored **100 performance, accessibility, best practices and SEO** on desktop/mobile profiles. These are local lab results; production verification remains necessary. Policy drafts are ready for owner review; no deployment has been performed.

## RSVP, countdown and Our works (8 November 2026)

All eighteen fictional invitation demos now include a live countdown and RSVP section. Their fixed event date is **8 December 2026**, one calendar month from the owner's request, with each demo's existing start time in IST. Covers, event details and countdowns use the same date. The target does not move when visitors return.

The owner chose database RSVP storage. Run `npm run db:migrate:local` then `npm run dev:cloudflare` to test real local persistence with sample details. Static preview offers an explicitly unsubmitted RSVP draft download. A stored reference appears only after verified D1 persistence; no notification email is sent. Accept/decline, guest counts, validation, idempotent retries and duplicate/quota protection are included. There is no public guest list or administration API.

```sh
npm run rsvps:list
npm run rsvps:summary
```

The homepage **Our works** section links to [nikah.fahed.in](https://nikah.fahed.in) and is also reachable from navigation. See [docs/RSVP_AND_COUNTDOWN.md](docs/RSVP_AND_COUNTDOWN.md) for the API, fixed-date behavior, privacy/retention draft, retrieval and verification details. The external invitation itself was not modified.

RSVP addition verification: **206 full regression checks passed**, followed by **30 focused RSVP/countdown checks** after retry-normalization refinement. Four actual test-key RSVP submissions were stored in isolated local D1 and verified through owner summary retrieval. Production build passed; no deployment was performed.

## Owner update — 8 November 2026

The owner approved the current policies, subject to future changes. Public pages, metadata, generated HTML and client configuration now use Online Invites without the owner’s personal name or email. Public contact details are temporarily unavailable; existing customers are directed to their existing conversation. No replacement mailbox or working support form is claimed. Customer/guest name and email fields remain required where applicable. Production submissions and deployment remain disabled/pending; policy approval alone does not launch the service. Earlier draft/approval notes above are historical and superseded by this update.

Our works now has its own `/our-works` page, linked from the main navigation. The portfolio section has been removed from the homepage. Route metadata, sitemap and static build output include the new page.

Countdowns are now exclusive to premium invitation demos. Basic demos retain event details and RSVP. The gallery shows Basic collection and Premium collection; older `collection=Original` links still select Basic. The homepage invitation-link tile starts at `onlineinvites.in/invite/your-story`, then cycles every four seconds through `your-story.onlineinvites.in` and illustrative `your-story.in`. Controls allow selecting/pausing examples; reduced motion keeps the standard link until a choice is selected. Existing domain constraints remain.

The invitation address tile now uses only its three selection buttons, with Standard link selected by default. Automatic cycling and Play/Pause controls were removed at the owner’s request. Additional hosting after the included 30 days is now ₹5/day (45 total days: ₹75 extra). Shared configuration updates the homepage, pricing, policy and quote calculations.

Our works now uses a selectable list and an embedded phone preview (390:844 screen aspect ratio), with a stacked layout on mobile. The portfolio page has no external/new-tab invitation links. `src/data/works.ts` holds each item's preview URL; CSP allows the current invitation origin. **Expiration limitation:** the current preview still loads `https://nikah.fahed.in`; iframe embedding does not retain its contents. A separate owner-approved portfolio copy must be supplied and its URL configured before that customer invitation expires. No portfolio archive has been created and no customer hosting/expiry policy was changed.

Portfolio refinement: Our works now has compact Invite 1-style selectors and a viewport-fitted phone with a fixed 390×844 logical screen scaled to available space. The title/panel/restart/help copy beside the phone was removed. Hover or keyboard focus opens the invitation and auto-scrolls; leaving/blurring pauses. The current invitation has a retained local portfolio copy under `public/portfolio/nikah/`, loaded into a same-origin srcdoc iframe so browser origin restrictions do not prevent scroll control. Relative assets resolve through its local base URL. The original external site is unchanged; the portfolio copy is noindex and its response form is inert with all submit network code removed. This supersedes the earlier note requiring a future retained copy. No remote deployment was performed.

Portfolio scroll correction: the phone now uses native manual iframe scrolling and clickable invitation controls. Hover does not open or auto-scroll; scroll gestures target the invitation while inside the phone, and the page while outside. Overscroll containment keeps the page still when the invitation reaches an edge. The homepage carousel now features three Basic and three Premium designs, and every carousel card carries its collection label. Fixed eighteen-card marketing text was replaced with all-cards wording; the full gallery remains available.
