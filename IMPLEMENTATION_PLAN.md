# Online Invites implementation plan

## Current Phase 5 continuation — 8 November 2026

The owner authorized Phase 5 following the latest carousel, pricing and portfolio changes. The current policies are approved; personal operator name/email stay off public pages. The checked-in production policy flag reflects approval, with submissions still disabled. The latest Phase 5 verification supersedes historical draft/pending-approval notes below. See `docs/PHASE5_CURRENT_REVIEW.md` for current results and the deployment handoff. No public deployment, DNS change or production submission enablement is included in this continuation.

Master specification: user-provided “Online Invites — Updated Codex Development Prompt”. Implementation is gated by phase approval. Phases 1–4 are authorized for implementation; Phase 4 is local development only. Phase 2 and Phase 3 approved by the owner on 31 October 2026.

## Current progress snapshot — 31 October 2026

| Workstream | Status |
| --- | --- |
| Phase 1: setup, design system, navigation and homepage | Implemented and build verified |
| Phase 2: gallery, pricing and preview routes | Implemented; 18 demos in a compact carousel |
| Individual demo animation polish | Owner review deferred; refine demos one by one later |
| Temporary remote preview | Built frontend shared through a running Cloudflare Quick Tunnel; not permanent hosting |
| Phase 3: quotation form and validation | Implemented and verified; six-step form, local review/export |
| Phase 4: Functions, D1 and Turnstile | Complete locally; real test-key submissions and D1 persistence verified |
| Phase 5: local verification, accessibility/performance, SEO, security and policy drafts | Local steps 1–5 verified; policy drafts await owner review; deployment pending |

Latest verification: frontend/server TypeScript and production build passed; all 164 automated checks passed across desktop and emulated mobile projects, covering real local D1 integration, submission/retry/error handling, the form, all eighteen demo handoffs and carousel returns. A full production-readiness audit is still pending. Quotation buttons now prefill the six-step form. Requirements can be checked and exported locally; no enquiries are submitted and no payments are collected.

## Architecture
- React + TypeScript, Vite, Tailwind CSS, Motion for React, React Router and Lucide icons.
- Static, mobile-first frontend on Cloudflare Pages; later Pages Functions own validation, Turnstile verification and D1 persistence.
- Modular presentation components, shared configurable business values, and route-level pages. No payment collection or automatic domain provisioning.
- CSS/SVG invitation artwork avoids external image requests. Respect reduced motion, keyboard access and semantic structure.

## Folder structure
```
src/
  components/    navigation, invitation artwork, reveal animations
  pages/         homepage, gallery, pricing, invitation preview, fallback
  config/        business settings and pricing constants
  data/          typed demo catalog and gallery filtering
  hooks/         safe return navigation to the design carousel
  features/quote/ typed form model, fields, steps and review
  styles.css     base design tokens and responsive styles
  phase2.css     gallery/pricing layouts and six original themes
  premium-covers.css  twelve premium palettes and scene artwork
  premium.css    lazy-loaded premium layouts and opening choreography
  carousel.css   responsive horizontal browsing
  quote.css      lazy-loaded quotation form styles
  main.tsx       router and application bootstrap
public/          favicon and static assets
tests/           Playwright interaction and responsive tests
functions/api/   public runtime configuration and POST enquiry endpoint
server/          validation, verification, quotas, persistence, notifications
migrations/      local/production D1 schema
scripts/         authenticated owner-only enquiry retrieval
docs/            backend setup and operations
```

## Dependencies
Runtime: react, react-dom, react-router-dom, motion, lucide-react.
Build: vite, typescript, @vitejs/plugin-react, tailwindcss, postcss, autoprefixer, React type definitions.
Testing: @playwright/test uses Chromium or installed Chrome for Phase 2 browser interactions. Backend development: Wrangler, Miniflare and Cloudflare Worker types. No paid backend or unnecessary UI framework.

## Phases and acceptance criteria
1. **Phase 1 — complete:** initialize project, design tokens, responsive navigation, complete homepage with hero artwork, occasion categories, featured visual concepts, process, pricing overview, hosting, FAQ, contact and footer. Accessible animation and mobile menu. Verify TypeScript and production build; start and check local preview. No gallery, interactive template routes, quotation form or backend.
2. **Phase 2 — implemented, further visual refinement deferred:** searchable/filterable gallery, 18 interactive demos (6 original + 12 premium), compact carousel with saved return position, dedicated preview routes and pricing page. Owner wants to review individual demo animations later.
3. **Phase 3 — complete:** multi-step quotation form, validation, requirements summary, configurable hosting calculation and meaningful validation tests.
4. **Phase 4 — complete (local only):** Pages Functions, D1 migration, Turnstile, request limits, duplicate/rate protection, safe enquiry references, optional email abstraction and secure owner retrieval documentation.
5. **Phase 5 — local steps 1–5 implemented:** interaction/integration verification, performance/accessibility improvements, SEO/sitemap, draft legal pages and security review. Production setup/deployment are separate later steps; see docs/PHASE5_LAUNCH_REVIEW.md.

## Verification and boundaries
Each phase updates this document with delivered work, checks and known limitations. Phase 1 pricing is indicative homepage content only. Quote CTAs lead to the form. Configured local runtime supports test submissions; public static preview remains non-submitting. Production configuration and launch remain deferred. No invented contact inbox, testimonials or live services. Policy links identify drafts awaiting later implementation. Deployment and external integrations must not be claimed without verification.

## Phase 1 completion — 30 October 2026
- Delivered React/TypeScript/Vite project with Tailwind, Motion, Router and Lucide. Node 22.12+ is required; `.nvmrc` selects 22. Lockfile included.
- Implemented full ivory/emerald homepage: responsive mobile navigation, animated invitation artwork, occasion shortcuts, three visual design concepts, four-step process, indicative three-tier pricing, hosting terms, FAQ accordions, contact explanation and footer.
- Added reduced-motion support, skip link, focus styles, native keyboard-operable accordions, semantic landmarks, baseline metadata, favicon, shared configurable pricing, README and placeholder-only environment documentation.
- Created policy placeholder routes explicitly stating that policy drafts need owner review. Actual policies are deferred to Phase 5. Quote links lead to the contact section; no form, gallery or interactive demos were implemented.
- Verification: TypeScript + Vite production build passed using Node 22. npm dependency audit reported zero vulnerabilities after updating Vite, React plugin and Router. Build output: CSS 21.86 kB (6.28 kB gzip), JS 322.13 kB (105.21 kB gzip).
- Local Vite runtime started successfully at http://127.0.0.1:5173/. HTTP checks returned 200 for the homepage, React entry, policy fallback and favicon. Browser automation is unavailable, so screenshot, device, keyboard interaction and Lighthouse checks have not been performed. Responsive behavior has been implemented and reviewed in code, not visually certified.
- Initial runtime attempts exposed host Node 16 and sandbox socket restrictions; verification uses temporary npm-provided Node 22 and an approved localhost server. README instructs standard Node 22 development.
- Cloudflare configuration/deployment, customer enquiries, transactional email and live domain provisioning are not implemented or claimed.

**Approval history:** Phases 2–4 were subsequently approved, with Phase 4 restricted to local development. Permanent hosting and launch require explicit approval after demo refinement.

## Phase 2 implementation scope
- Preserve the approved ivory/emerald studio design and introduce route-based code splitting.
- Build searchable occasion-filtered gallery with all eleven occasion categories and six original demo invitations: botanical wedding, celestial Nikah, editorial engagement, playful birthday, earthy housewarming and marigold Puja.
- Each demo has an opening interaction, themed scrollable content, fictional names, event/date/time details, venue and sample Google Maps link, and selected-design quotation handoff without implementing Phase 3 forms.
- Add dedicated pricing page with complete package inclusions, configurable hosting terms and manually reviewed domain options.
- Connect homepage and navigation to the new routes, add route metadata, verify catalog filtering and production build, and check local routes.

## Phase 2 completion — 31 October 2026
- Gallery at `/designs` has case-insensitive search, all eleven occasion filters, result counts, URL-preserved filters, clear/reset actions and an honest empty state for categories without a demo.
- Delivered six original invitation routes: The Garden Edit (Wedding), Under the Stars (Nikah), The Modern Vow (Engagement), A Little Confetti (Birthday), A Place to Belong (Housewarming) and Marigold Mornings (Puja).
- Each invitation has its own theme, typography treatment, cover, opening transition, scrollable story, two event sections, date/time, fictional venue, city-only sample Google Maps link, opening replay and Request Similar Design handoff.
- `/pricing` includes complete Basic/Premium/Custom inclusions, individually quoted starting prices, revision limits, payment/delivery explanation, configurable hosting rate and four manually reviewed domain options. No checkout or automatic provisioning.
- Navigation and homepage connect to the new routes; shared footer and data-driven cover artwork avoid duplication. New pages are lazy-loaded. Route metadata supplies titles, descriptions, Open Graph text and canonical URLs.
- Template/package quotation links retain the selected starting point in the homepage URL and show it in the contact section. No customer details are collected and no form or backend has been implemented.
- Verification: `npm run build` passed (TypeScript + Vite). Latest install audit reported zero known vulnerabilities. Main JS: 334.41 kB / 109.51 kB gzip; lazy gallery 4.16 kB, pricing 6.59 kB, invitation preview 10.98 kB; CSS 45.55 kB / 11.07 kB gzip.
- **26 Playwright checks passed** using installed Google Chrome across desktop and emulated mobile projects. Coverage includes search/filter URL state, empty state, all six openings, focus after opening/replay, venue links, quotation handoff, pricing, navigation, Escape focus, reduced motion, unknown routes, JavaScript runtime errors and 320px overflow checks.
- Browser checks caught an opening-animation focus timing issue; focus now moves after the incoming content animation completes. All final checks passed after the fix.
- Visually reviewed Chrome screenshots of the desktop gallery, mobile birthday invitation and desktop/mobile pricing. Physical devices, Safari, screen-reader audit and Lighthouse remain for Phase 5; mobile emulation is not physical iPhone/Safari verification.
- Updated README with route list, preview instructions, configuration locations and repeatable browser test commands. Existing user-requested local development server remains available at http://127.0.0.1:5173/.

**Historical Phase 2 boundary:** Phase 3 was subsequently approved. No permanent deployment has been performed.

## Phase 2 expansion — requested 31 October 2026
Owner requested keeping the original six and adding twelve more with distinctly premium colors and opening animations. This remains Phase 2; no quotation form or backend work is authorized.

- Add twelve independent premium themes across all occasion categories, taking the catalog to eighteen.
- Build original CSS/SVG theatrical scenes: velvet curtains, moonlight, sunrise, palace gates, unfolding letter, Art Deco aperture, window shutters, lotus bloom, ocean tide, crystal facets, lantern light and silk ribbons.
- Use varied full invitation compositions (theatrical, orbital, editorial, architectural and landscape), distinct motifs, date-led openings and individual palettes independent of studio branding.
- Preserve the six existing routes and their behavior. Add an accessible premium collection filter, searchable animation descriptions and selected-design handoff.
- Respect reduced motion, provide an explicit skip-animation control, prevent duplicate opening activation and verify replay/focus behavior.
- Update browser checks for all eighteen routes and the expanded gallery; check mobile/narrow screens and visually inspect representative scenes. Update documentation and completion evidence after verification.

### Expansion delivered
- Retained all six original invitation routes and themes. Catalog now contains **18 designs**, including **12 premium additions**, and covers every listed occasion category.
- Premium designs: Velvet Overture, Lunar Nocturne, The Golden Hour, Palace of Promises, Letters in Ivory, Midnight in Paris, A Window in Provence, The Lotus Court, Ocean Afterglow, The Crystal Ball, Little Moon & Stars, and Threads of Saffron.
- Added independent invitation palettes: bordeaux/gold, indigo/silver, sienna/apricot, sapphire/gold, pearl/espresso, onyx/champagne, French blue/buttercream, aubergine/rose gold, marine/coral, amethyst/platinum, mulberry/gold and vermilion/brass. Studio colors are preserved.
- Built twelve original CSS/SVG opening scenes with finite, user-triggered choreography: curtains, moonlight, sunrise, palace gates, envelope/seal, aperture, shutters, lotus, tide, crystal, lanterns and ribbons. Each opening includes the actual fictional event date, hosts and time.
- Premium invitation compositions use five layout systems with theme-specific typography, scene art, date placement, schedules, venue artwork and closing details. Scene artwork is shared with gallery thumbnails for visual continuity.
- Added All / Premium collection / Original six filters. Collection, occasion and text search compose in the URL; search also matches animation names. Premium designs appear first in the combined gallery.
- Opening transitions support skip, replay, keyboard focus, duplicate-activation protection, inert underlying content during transition and immediate opening under reduced-motion preferences. No audio, video, new runtime dependencies, form or backend added.
- Premium full experience code and choreography stylesheet are lazy-loaded separately. Final build passed: premium experience 7.35 kB JS (2.25 kB gzip) and 35.47 kB CSS (7.30 kB gzip); shared CSS 61.88 kB (15.37 kB gzip).
- Visually reviewed the complete premium gallery, desktop opening scenes, mobile invitation heroes and an actual mid-animation curtain reveal. Replaced a heavy gate pattern with fine gold lattice and refined Ocean Afterglow mobile typography after screenshot review.
- Expanded browser suite to 56 checks across desktop and emulated mobile Chrome: all 18 opening/replay/map/handoff paths, search/filter persistence, collection counts, reduced motion for every premium scene, skip and keyboard activation, runtime errors and 320px layouts. The initial run passed 54; the two Velvet checks hit an ambiguous test selector shared by an h2 and h3. Selector now targets the schedule's h2. All 8 focused rerun checks passed, covering Velvet, Ocean, gallery and 320px layouts in both projects; all 56 test cases are now verified across the original run and affected-check rerun.
- README documents all twelve premium routes, palettes, opening effects, collection browsing, motion behavior and source organization.

Phase 3 remains unstarted. The existing local server continues to serve the updated gallery at http://127.0.0.1:5173/designs?collection=Premium.

## Phase 2 carousel refinement — 31 October 2026
Owner deferred individual animation refinements and requested compact demo browsing with return to the same carousel.

- Replaced the eighteen-item gallery grid with a native horizontal scroll-snap carousel: three visible designs on desktop, two on tablet, one on mobile; arrow controls, touch/trackpad scrolling, keyboard arrows/Home/End, progress and position count. No autoplay or carousel library.
- Reused the carousel for homepage featured designs so mobile visitors browse one preview at a time.
- Preserve collection, occasion, search and slide in the return URL. Both original and premium demo toolbars return to the same carousel, scroll to its section and restore focus to the opened design. Direct preview links return to their position in the full gallery.
- Preserve the source browsing history entry before opening a demo, so browser Back restores the carousel too. Filter changes reset the carousel to its beginning. Return destinations are limited to the two internal browsing pages.
- Original eighteen demos and animations remain unchanged. Phase 3 is still unstarted.
- Verification complete: TypeScript + production build passed. All 22 focused desktop/mobile Chrome checks passed, including ten new carousel/return checks plus gallery, navigation, classic/premium demo and 320px layout regressions. Visually reviewed desktop/mobile screenshots. Verified the carousel and return position through the existing public tunnel; it serves rebuilt `dist/` without changing its URL.

## Temporary remote sharing
- Created a Cloudflare Quick Tunnel to the built website served by Vite preview on loopback port 4173. It exposes the built frontend, not the Vite development server or project directory.
- Verified the public homepage, premium gallery, invitation opening, and later the carousel/return behavior in Chrome.
- Temporary utility is stored in `/tmp/online-invites-share/`; no permanent Cloudflare account, domain configuration, Pages deployment, database or backend was created.
- The link has no scheduled expiry but depends on the Mac staying awake, internet connectivity and both running processes. Anyone with the URL can view the demo. A restarted Quick Tunnel normally generates a new URL; uptime is not guaranteed.
- The production build must be regenerated to share source edits. The latest carousel build is already served through the same session link.

## Phase 3 implementation scope — 31 October 2026
- Add a lazy-loaded `/request-quote` route with six accessible steps: contact, event, design, features, hosting and review/consent.
- Carry selected demo/package into the form from invitation previews, gallery custom-design links, pricing and homepage/navigation CTAs.
- Use a typed requirements model and reusable pure validation/calculation helpers without a form-library dependency. Validate required fields, contact method, country-code telephone, dates and publication ordering, integer limits, hex colors, reference URLs, domain/subdomain preferences and hosting duration.
- Preserve input while moving between steps. Keep personal details in memory only; do not persist them to browser storage or send them to an endpoint in this phase.
- Show an editable complete summary and a clearly scoped extra-hosting estimate, using shared configurable rate/included days. Do not imply a final quote or price domain/features automatically.
- Final action checks requirements locally; allow a real local JSON download after validation and consent. State explicitly that no enquiry is submitted. Turnstile and secure submission remain Phase 4; no simulated verification, enquiry ID or payment collection.
- Test validation/calculation boundaries and actual multi-step browser interactions, mobile layouts, prefills, errors, edit flow, retention and local export. Build, update documentation and refresh the existing temporary preview.

## Phase 3 completion — 31 October 2026
- Added lazy-loaded `/request-quote` with six accessible steps: contact, celebration, design, features, hosting and full editable review.
- Implemented every requested customer/event/design/feature/hosting field, including conditional WhatsApp, other languages/features, subdomain and existing/new domain details.
- Connected homepage, gallery custom-design links, pricing, navigation and all eighteen demo quotation links. Template/occasion/package preferences prefill the form; legacy homepage preference URLs carry through their quote CTAs.
- Shared typed model validates required fields, lengths, country-code telephone, calendar/past dates and publication order, languages, function count, hex colors, safe reference URL schemes/count, conditional requirements, domains and whole hosting durations.
- Extra-hosting calculations use configurable included days and daily rate, with invalid-input handling. The estimate is explicitly limited to extra hosting and does not quote design, domains or add-ons.
- Input remains in memory across step navigation and review editing. Refresh/leaving clears entries; no browser-storage draft is created. Clear action resets personal details to the initial URL preferences.
- Final review includes explicit consent and draft-policy status. Complete local validation unlocks a real JSON download with normalized requirements and the hosting estimate, clearly marked as an unsubmitted local draft.
- Added error summaries/control associations, keyboard focus management, step progress, responsive desktop sidebar/mobile stepper and reduced-motion behavior. No new dependencies.
- No API, Turnstile verification, database, outbound email, enquiry reference or payment flow is simulated. Phase 4 remains unstarted.
- TypeScript and production build passed. Quote route code is 34.85 kB (10.93 kB gzip); its lazy stylesheet is 19.08 kB (4.26 kB gzip).
- Verification: initial 48 Phase 3 validation/browser checks passed, followed by the complete suite: **114 checks passed** across desktop and emulated mobile Chrome projects. Coverage includes all eighteen demo handoffs, carousel returns, pricing/navigation, form validation, date/hosting boundaries, local export, no submission/storage and 320px layouts.
- Reviewed desktop/mobile contact, hosting and review screenshots. Refined initial step focus so development Strict Mode does not jump into the form on first load; improved offscreen skip-link clipping and mobile textarea font sizing.
- README and `.env.example` now document form route, prefills, validation rules, input limits, local-only retention/export, calculation boundaries, test commands, zero required environment variables for Phases 1–3, and remaining integrations.

- Verified the built form and selected-demo handoff through the existing public Cloudflare Quick Tunnel at `/request-quote`. The public preview serves the latest production build. Mobile first-load scroll and final desktop/mobile screenshots were checked.

**Historical approval gate:** Phase 3 completed; Phase 4 was subsequently approved locally. Those backend features were pending at the Phase 3 checkpoint and are implemented locally in the Phase 4 section below. Individual demo animation polish remains deferred for owner review; permanent hosting and the full production audit remain pending.

## Phase 4 scope — approved 31 October 2026
- Implement Pages Functions for public configuration and POST-only enquiry creation, local Wrangler/D1 configuration and migrations. No deployment, remote database, account login or production provisioning.
- Keep static/Vite preview working without an API. Enable actual submission only when the runtime reports valid configuration; local runtime explicitly uses official Turnstile test keys and stores only in local D1.
- Parse untrusted JSON with strict shape/type/size/field limits, normalize allowlisted values, independently validate server-side, verify same-origin requests and Turnstile tokens including production hostname/action, and store parameterized SQL.
- Add durable D1 rate limiting, keyed privacy-preserving client hashes, request-id idempotency, short-window content duplicate protection and transactional quota/storage handling. Never expose customer details in public responses or build an admin API.
- Confirm success only after storage; return a unique enquiry reference, meaningful failure/retry states and retain input after failures. Email notification is an optional abstraction that cannot undo successful persistence.
- Provide owner-only CLI retrieval and explicit local/production setup documentation. Public tunnel stays on the static preview; no customer enquiry service is launched.
- Test verifier errors, malformed requests, persistence, duplicates, concurrency/rate limits, database failures and UI submission/error flows; run real local runtime smoke tests and update progress.

## Phase 4 local completion — 31 October 2026
- Added `/api/config` and POST-only `/api/enquiries` Pages Functions, typed Worker environment and server typecheck. Static/Vite mode falls back to the existing local requirements preview.
- Added a complete D1 migration with all enquiry fields, full normalized requirements, consent/version, eight lifecycle statuses, notification status and indexed duplicate/quota lookups. The migration was applied successfully to local D1 only.
- Server independently validates unknown JSON shape/types, field/array lengths, 32 KiB streamed UTF-8 body size, same-origin JSON requests, dates, phone, links, domains and consent. Inputs are normalized; SQL values are parameterized. Public responses never include customer details.
- Implemented server-side Siteverify with timeout, production hostname/action/time/test-marker checks and explicit local dummy-key handling. The current real dummy response uses a testing-key metadata marker rather than the hostname/action in older examples; the local verifier was adjusted after inspecting an actual provider response. Production verification remains strict.
- Implemented durable attempt quotas (20/10 minutes), atomic accepted quotas (5/hour), salted HMAC client/payload identifiers, UUID request idempotency and ten-minute content duplicate protection. Atomic SQL guard checks passed real-D1 concurrency tests. Raw IPs and payloads are not logged.
- Added optional email notifier interface; no provider is configured or contacted. Persistence is independent of notification failure, and duplicate retries do not resend notifications. No public admin API was added.
- Frontend runtime discovery enables actual submission only for configured local/production runtimes. Added real widget lifecycle, expired/failed/blocked verification handling, compact narrow-screen widget, pending-state edit/navigation lock, duplicate-safe retries, field errors, stored receipts and downloadable submitted copies. Missing API retains the Phase 3 preview.
- Default `wrangler.jsonc` is explicitly local: loopback hosts, local database identifier and official public dummy keys. Pages requires a standard configuration filename; an initial custom config path was replaced after Wrangler rejected it. The disabled production example contains placeholders only and is not deployed.
- Added owner-only CLI enquiry retrieval and detailed setup/operations documentation in `docs/PHASE4_LOCAL_BACKEND.md`; README and environment examples updated. Real secrets must stay in Cloudflare/ignored local secret files, never frontend variables.
- Verified the actual local Chrome flow with the real Cloudflare test widget and Siteverify API: HTTP 201 and reference `OI-EA772438-9664-4BFE-B800-EC2E71455D11` appeared after local storage. Owner CLI retrieved the fictional record with status New and notification status not_configured.
- Verification: frontend and server TypeScript + production build passed. All **164 automated checks passed** across desktop and emulated mobile projects, including backend D1 concurrency/storage/failure cases, blocked/expired widget recovery, submission locks and retries, all eighteen demos and carousel navigation.
- No production login, remote database, production keys, outbound email, permanent hosting, domain configuration or launch was performed. Public sharing tunnel remains on the non-submitting static preview at port 4173. Individual demo animation refinements remain deferred until owner review.

- Real provider smoke tests also passed in desktop and 320px mobile Chrome using the actual Cloudflare test widget and Siteverify service. Fictional records were stored in local D1 and retrieved with the owner CLI. The mobile receipt received keyboard focus, with zero horizontal overflow; receipt screenshots were visually reviewed.
- Confirmed the frontend bundle contains neither server secrets nor the local HMAC salt. Confirmed the existing public tunnel still reports FORM PREVIEW and does not submit enquiries.
- Detailed instructions are in `docs/PHASE4_LOCAL_BACKEND.md`. No account/secret setup is required for local testing; use `npm run db:migrate:local` and `npm run dev:cloudflare` on Node 22.12+.

**Current boundary:** Phases 1–4 are implemented; Phase 4 has been verified locally only. Individual demo refinements come next at the owner's direction. Phase 5, production accounts/bindings/keys, permanent hosting, domain setup and launch remain deferred. No transactional email provider is configured.

The temporary backend verification runtime on port 8788 was stopped after verification. Local D1 test records remain on disk. The previously requested frontend server, static preview and sharing tunnel were left running. Restart full local testing with `npm run dev:cloudflare`; no credentials or remote setup are needed.

## Local startup troubleshooting — 31 October 2026
Reproduced the reported terminal startup failure with the host default Node 16: Vite/Rolldown cannot import `styleText` from `node:util`. Typechecking passes under the existing Node 22 runtime. Added a portable `npm exec --yes --package=node@22 -- npm run dev:cloudflare` startup command to README and backend instructions; this runs the project on supported Node without replacing the system installation. Restarting the backend for user preview with that command.

## System Node/npm upgrade — 31 October 2026
- Installed Node 26.13.0 LTS through the existing Apple Silicon Homebrew installation and updated npm globally to 12.2.1, the current stable registry release at verification time.
- A fresh login shell resolves both commands from `/opt/homebrew/bin`; verified Node v26.13.0 and npm 12.2.1. Existing shell PATH configuration already prioritizes Homebrew, so no shell-profile edits were needed.
- Updated `.nvmrc` to 26 and README/backend setup recommendations, retaining the minimum supported project engine declaration. The older system binary was not deleted.
- Verified production build (frontend/server TypeScript + Vite) and all 16 isolated D1 backend checks under Node 26. No application dependencies or production hosting configuration were changed. Existing terminal sessions may need `exec zsh -l` or a new terminal window to refresh command lookup.

## Design refinement review — 31 October 2026
Owner requested a thorough design self-review, including live animations where possible, and wants changes identified by demo. Phase 5 and launch remain deferred. Review source inspection has begun; no demo changes have been made and the comprehensive live audit is not yet complete. Track evidence/findings in `docs/DESIGN_REVIEW.md` and continuation context in `HANDOFF.md`. Keep observations, proposed fixes and implemented changes clearly separate.


## Visual and live-animation review completed — 3 November 2026
- Completed a running Chrome review of all 18 openings, intermediate/handoff frames and full invitation content at desktop 1440 × 1000 and mobile emulation 390 × 844.
- Saved 36 contact sheets/full-page captures, 18 timestamped desktop browser motion recordings, raw observations, reproducible capture scripts and a local evidence viewer under ignored `artifacts/design-review-2026-11-03/`.
- Wrote the findings, limitations, per-demo strengths/problems/proposals and refinement order in `docs/DESIGN_REVIEW.md`; updated `HANDOFF.md`.
- Confirmed premium scene reset at handoff; Golden Hour's sample Dev breaks across lines on desktop; Letters' blank sheet and Provence's bright portal obscure the reveal. Small supporting text and repeated body sections need refinement.
- Replay/focus passed in 36 desktop/mobile runs; premium skip/focus passed in 24; fresh reduced-motion keyboard openings passed for all 18 at 320px. No document overflow in inspected standard/narrow/landscape geometry checks or recorded page runtime errors. Map targets, quote prefills and direct-demo gallery/slide returns passed for all 18.
- No invitation implementation changes, backend changes, production work or Phase 5 audit. Full suite/build not rerun for this documentation-only review. Chrome emulation is not physical-device/Safari verification.
- Recommend Velvet Overture as the first owner-selected refinement, followed by The Golden Hour, Letters in Ivory and A Window in Provence. Proposals remain unimplemented.


## Phase 5 local steps 1–5 — authorized 8 November 2026
Owner chose launch preparation now and ongoing individual demo refinements later. This task covers local verification/performance/accessibility/SEO/security and business/policy drafts; production account setup and deployment are later steps.

- Added Sara's supplied Delhi business contact and email, a contact route and four complete policy drafts. Policy approval remains false. Proposed retention/refund procedures are for owner review, not an automated operational promise.
- Self-hosted existing fonts with OFL licenses; replaced simple scroll reveals with native IntersectionObserver/CSS and made homepage hero content visible immediately. Main entry reduced from ~93 kB to ~55 kB gzip; invitation Motion features remain in lazy route code.
- Corrected supporting-text contrast/size throughout studio/form/demos. Golden Hour sample names no longer split Dev on desktop; Provence closing/signature contrast corrected. Individual opening redesigns remain deferred.
- Generated per-route metadata before JavaScript for 27 routes, 22-URL sitemap, robots, branded social image, noindex 404, known-route rewrites and static security headers. Added matching client metadata/robots updates.
- Centralized API/static CSP and other security headers. Confirmed real test-key widget and local D1 test submissions under CSP using isolated temporary state. No production settings or existing enquiry records changed.
- Added launch regression checks. Final results, source references and remaining manual review/deployment steps are documented in `docs/PHASE5_LAUNCH_REVIEW.md`; raw evidence is in ignored `artifacts/phase5-2026-11-08/`.

- Final evidence: production build passed; 176 regression checks plus 14 final focused checks passed. 104 settled/cover/form WCAG-tagged axe scans reported zero violations. Final local homepage Lighthouse scored 100 performance/accessibility/best practices/SEO on desktop and mobile. Actual test-key verification stored two fictional records in isolated temporary D1 under CSP. Zero known npm advisories. See Phase 5 review for limits and artifacts.


## RSVP, fixed-date countdown and Our works — 8 November 2026
- Owner approved database storage for RSVP responses. Added validated name/email, accept/decline, party size, optional note and consent, with secure POST-only persistence and owner-only CLI retrieval.
- Added additive local D1 migration, strict server limits, RSVP-specific Turnstile action, shared-per-client quotas, atomic uniqueness/idempotency and safe error/retry/receipt behavior. No public guest lists or unauthenticated updates.
- All 18 fictional records use 8 December 2026, retaining their own IST start times; countdowns and openings agree and do not move the target on revisit. Countdown expiry and RSVP closure are explicit.
- Added Our works homepage section/navigation and the requested live link https://nikah.fahed.in. External site was not modified.
- Documented setup/privacy/owner retrieval in docs/RSVP_AND_COUNTDOWN.md. Production deployment remains pending.

- RSVP verification: production build passed; 206 full regression checks and 30 focused new-feature checks passed. Four actual test-key responses were persisted in isolated local D1 and verified by owner-only summary retrieval. Four RSVP accessibility scans reported zero WCAG-tagged violations and no document overflow/CSP errors. See docs/RSVP_AND_COUNTDOWN.md.

## Production service configuration — 8 November 2026
Owner authorized production provisioning. Completed D1 database, enquiry/RSVP migrations, real managed Turnstile widget and encrypted server secrets on Pages project `online-invites`. Remote verification passed; no pending migrations and both tables empty. See `docs/PRODUCTION_SERVICES.md`. Production submissions remain disabled pending policy approval; deployment, DNS and live verification remain pending.

## Phase 5 continuation completed — 8 November 2026

Current production build, 212 regression checks and 92 WCAG-tagged accessibility scans pass. Fixed collection badge and dark Basic RSVP contrast. Lighthouse desktop scores 100/100/100/100; mobile 99/100/100/100. Dependency audit has no known advisories. Production migration status verified read-only with no pending migrations. Local release configuration records approved policies and keeps submissions disabled. Prepared and verified a production staging directory/archive and compiled Pages Functions; added reusable allowlist-based release preparation script. Public deployment, DNS and live acceptance remain separate launch steps. Details: `docs/PHASE5_CURRENT_REVIEW.md`.
