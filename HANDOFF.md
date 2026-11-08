# Online Invites — continuation handoff

Updated 8 November 2026. Workspace: `/Users/fahedm/Desktop/OnlineInvites.in`.

## Owner priorities and approval boundaries
- Master specification is in `prompt.md` / `prompt.txt`; staged progress is in `IMPLEMENTATION_PLAN.md`.
- Phases 1–4 are implemented. On 8 November the owner authorized Phase 5 steps 1–5 locally: verification, performance/accessibility, SEO, security and policy/contact pages. The owner subsequently authorized production service configuration; D1, migrations, Turnstile and encrypted secrets are now configured. Deployment remains pending.
- Owner now wants to launch and continue demo refinements later. Preserve the 18 demos; the current task completes local Phase 5 preparation before Cloudflare setup.
- Keep all 18 demos. Main studio colors are approved for now. Basic collection were considered too similar; twelve additional premium themes/opening effects were added, but owner still wants substantial individual design/animation refinement.
- Gallery and homepage previews must remain compact carousels. Demo return links and browser Back must preserve slide, filters, position and focus.
- Visual/live-animation review is complete for all 18 demos. **Explain proposed/implemented changes by demo name.** Individual redesigns are deferred. Phase 5 includes practical legibility fixes, Golden Hour name wrapping and Provence closing contrast; it does not fix/rework the opening choreographies.

## Current review status
- Completed 3 November 2026: inspected all 18 live openings and full invitations in Chrome desktop (1440 × 1000) and mobile emulation (390 × 844).
- Findings and per-demo proposals: `docs/DESIGN_REVIEW.md`. Evidence, 36 contact sheets, 18 timestamped desktop motion recordings and local viewer: `artifacts/design-review-2026-11-03/` (ignored artifacts; retain locally).
- Review viewer: `http://127.0.0.1:5175/artifacts/design-review-2026-11-03/index.html` while the dedicated review Vite server on 5175 is running. This is a local address, not a remote sharing URL.
- Confirmed major findings: premium scenes reset at the 2600ms handoff; Golden Hour breaks the sample name Dev on desktop; Letters' blank sheet obstructs incoming names; Provence's portal washes out type; Ocean shows two suns during reveal. Small practical text and repeated body sections affect the collection.
- Browser checks: 36 replay/focus passes; 24 premium skip/focus passes; 18 fresh reduced-motion keyboard openings at 320px passed; no document overflow in the inspected runs/narrow/landscape geometry checks; no recorded page errors. Map targets, quote prefills and direct-demo gallery slide returns passed for all 18.
- The capture script's post-mount motion-preference toggle produced inconclusive early focus samples. Do not label these reduced-motion defects: the separate fresh reduced-motion run passed all 18. See report limitations.
- No demo implementation changes. This was Chrome/emulation, not physical-device/Safari or Phase 5 certification. No full automated suite/build rerun for documentation-only review.

## Project state
- React/TypeScript/Vite/Tailwind/Motion/Router/Lucide frontend.
- Homepage, gallery with 18 demos, pricing, six-step quotation form.
- Basic collection: Garden Edit, Under the Stars, Modern Vow, Little Confetti, Place to Belong, Marigold Mornings.
- Twelve premium: Velvet Overture, Lunar Nocturne, Golden Hour, Palace of Promises, Letters in Ivory, Midnight in Paris, Window in Provence, Lotus Court, Ocean Afterglow, Crystal Ball, Little Moon & Stars, Threads of Saffron.
- Local Pages Functions/D1/Turnstile verification, validated POST enquiries, rate/duplicate protection, stored reference receipts, owner CLI retrieval and unconfigured email-provider abstraction.
- No public admin API. Production D1, Turnstile and Pages secrets are configured; see docs/PRODUCTION_SERVICES.md. Email delivery, deployment and domain configuration remain pending.
- Local test submissions are real records in local D1; do not expose their personal details in reports, public endpoints or screenshots. Design review does not require reading customer data.

## Runtime and previews
- System upgraded via Homebrew: Node `26.13.0`, npm `12.2.1`; `.nvmrc` selects 26. Fresh terminal or `exec zsh -l` refreshes old command caching.
- Frontend: `npm run dev`, normally `http://127.0.0.1:5173`.
- Built static preview: port 4173. Existing temporary Cloudflare link: `https://gasoline-limitation-neck-funk.trycloudflare.com`; may stop if its process/Mac/network stops. Verify before reusing.
- Full local backend: `npm run db:migrate:local` then `npm run dev:cloudflare`, port 8788. Default `wrangler.jsonc` is local-only with official public test keys.
- At last inspection all three ports were listening. Existing user-requested servers/tunnel should be preserved during review.
- Local DB viewer: `http://127.0.0.1:8788/cdn-cgi/local/explorer` → **D1 Databases → DB → enquiries**. Actual viewer and saved user submission were confirmed.
- `npm run enquiries:list` lists local reference summaries. `--reference <actual-OI-reference>` retrieves one record. Documentation: `docs/PHASE4_LOCAL_BACKEND.md`.

## Checks already completed
- Phase 4: frontend/server TypeScript, production build and 164 automated checks passed across desktop/emulated-mobile projects.
- Actual Cloudflare test-widget + Siteverify submissions saved fictional enquiries to local D1 in desktop and 320px mobile Chrome; owner retrieval verified.
- After system upgrade: build and 16 backend integration checks passed under Node 26.
- These checks are historical functional evidence, not a substitute for the current visual/motion audit.

## Design source map
- `src/data/templates.ts`, `src/data/premiumTemplates.ts`: catalog and fictional event content.
- `src/pages/TemplatePreview.tsx`, `src/phase2.css`: basic collection invitation experiences.
- `src/components/premium/PremiumInvitation.tsx`: premium opening state and shared content sections; uses a fixed 2600 ms transition timer.
- `src/components/premium/Scene.tsx`, `src/premium-covers.css`: original CSS/SVG scene primitives and independent premium palettes.
- `src/premium.css`: premium layouts/choreography; selectors `.is-revealing ...` and opening-to-hero handoff need particular scrutiny.
- `src/components/DesignCarousel.tsx`, `src/carousel.css`, `src/hooks/useDesignReturn.ts`: browsing and return behavior.
- `src/pages/Home.tsx`, `src/styles.css`: studio homepage.
- `tests/phase2.spec.ts`, `tests/carousel.spec.ts`: existing demo/navigation checks.

## Browser audit method available
Installed Chrome can be controlled with project `@playwright/test`: `chromium.launch({channel:'chrome'})`. Browser/socket commands need the normal tool sandbox escalation. No browser downloads are needed. Use real motion (`reducedMotion:'no-preference'`), timed screenshots/video and desktop/mobile viewport checks. Reduced-motion and screenshot/CPU instrumentation limitations must be stated honestly. Do not claim physical iPhone/Safari testing.

## Phase 5 local launch preparation — 8 November 2026
- Read `docs/PHASE5_LAUNCH_REVIEW.md` for implemented scope, final evidence, limitations and owner policy decisions.
- Business contact supplied by owner: **Sara, Delhi, sara.invitations@gmail.com**. Shared config: `src/config/site.ts`. Added `/contact` and four full, visibly unapproved policy drafts under `/policies/` (including refunds).
- `npm run build` now generates per-route HTTP metadata for 27 routes, a sitemap/robots/404 and Cloudflare route/header rules. Fonts are self-hosted with OFL licenses. Public sharing image: `public/social-card.png`.
- Shared native/CSS scroll reveals and an immediately visible homepage hero reduce initial Motion code. The full opening animation code remains lazy-loaded with invitation routes.
- Security headers are shared from `server/security.ts`; API JSON sets them directly and static assets use build-generated `_headers`. Production approval/test-key safeguards remain enabled.
- Audit evidence: ignored `artifacts/phase5-2026-11-08/`. Temporary audit-only packages: `/tmp/online-invites-phase5-tools`. Smoke testing uses isolated `/tmp/online-invites-phase5-state`, never the owner's `.wrangler` database.
- Local Cloudflare test runtime: port 8789; built preview: 4176. These can be stopped after review. Existing development/review processes should be preserved. Verify ports before claiming a server is still running.
- `site.policiesApproved` remains false; proposed 180-day enquiry retention and seven-working-day refund initiation need owner approval and actual operating procedures. Do not enable production consent while policy drafts remain unresolved.

## RSVP/countdown/portfolio additions — 8 November 2026
- Owner requested RSVP and a countdown one month ahead, and selected **database storage** for responses.
- All 18 demo dates are fixed at **2026-12-08** via `src/data/demoEvent.ts`, retaining their existing IST start times. The countdown does not reset on reload; RSVP closes when the event starts.
- Shared `EventCountdown` and `RsvpSection` are integrated into classic/premium previews. New POST `/api/rsvps` validates, verifies action `rsvp_response`, rate-limits, deduplicates and stores in separate D1 tables; no public guest-list/update API.
- Migration `0002_rsvps.sql` was applied to local default and isolated test state. Existing enquiries were not changed. Owner commands: `npm run rsvps:list` / `npm run rsvps:summary`.
- Verification: 206 full regression checks and 30 focused new-feature checks passed; four real test-widget RSVPs stored in isolated D1, owner summary verified, four RSVP axe scans found zero violations.
- Static preview permits a clearly unsubmitted JSON draft; configured local runtime saves fictional test responses and returns a real reference. Production approval/key/domain safeguards remain unchanged.
- Homepage `/#our-works` and navigation feature https://nikah.fahed.in with original CSS artwork and an external live-invitation link. Do not alter that external site as part of this work.
- Privacy draft now covers RSVP data and proposed 30-day post-event retention; actual retention operations still require owner review. Details: `docs/RSVP_AND_COUNTDOWN.md`. Evidence: ignored `artifacts/rsvp-2026-11-08/`.

## Next actions
1. Local verification complete: production build, 176 regression checks and 14 final focused checks passed; 104 WCAG-tagged axe scans found zero violations. Final local homepage Lighthouse scored 100 performance/accessibility/best practices/SEO in desktop and mobile profiles. Owner next reviews the four concrete policy drafts and proposed operational terms.
2. Cloudflare steps 6–11: owner completes login; confirm account/domain/DNS; prepare production D1, real Turnstile and secrets; deploy; verify a live enquiry. No production work was performed in steps 1–5.
3. Preserve gallery return, quotation behavior and 18 demos through deployment. Refine individual demo artwork/openings later; Velvet Overture remains the recommended first full refinement.

## Owner update — 8 November 2026

The owner approved the current policies, subject to future changes. Public pages, metadata, generated HTML and client configuration now use Online Invites without the owner’s personal name or email. Public contact details are temporarily unavailable; existing customers are directed to their existing conversation. No replacement mailbox or working support form is claimed. Customer/guest name and email fields remain required where applicable. Production submissions and deployment remain disabled/pending; policy approval alone does not launch the service. Earlier draft/approval notes above are historical and superseded by this update.

## Production services — 8 November 2026
- Owner authorized and completed production D1, both schema migrations, managed Turnstile and Pages encrypted secrets. Verified remotely; both business tables contain zero records.
- Production config: `cloudflare/production/wrangler.jsonc`; root config remains local. Full resource identifiers and maintenance commands: `docs/PRODUCTION_SERVICES.md`.
- Pages project `online-invites` has no deployment yet. Submission and policy approval flags remain false. Preview has no production DB or secret bindings. No live end-to-end claim.

Our works now has its own `/our-works` page, linked from the main navigation. The portfolio section has been removed from the homepage. Route metadata, sitemap and static build output include the new page.

Countdowns are now exclusive to premium invitation demos. Basic demos retain event details and RSVP. The gallery shows Basic collection and Premium collection; older `collection=Original` links still select Basic. The homepage invitation-link tile starts at `onlineinvites.in/invite/your-story`, then cycles every four seconds through `your-story.onlineinvites.in` and illustrative `your-story.in`. Controls allow selecting/pausing examples; reduced motion keeps the standard link until a choice is selected. Existing domain constraints remain.

The invitation address tile now uses only its three selection buttons, with Standard link selected by default. Automatic cycling and Play/Pause controls were removed at the owner’s request. Additional hosting after the included 30 days is now ₹5/day (45 total days: ₹75 extra). Shared configuration updates the homepage, pricing, policy and quote calculations.

Our works now uses a selectable list and an embedded phone preview (390:844 screen aspect ratio), with a stacked layout on mobile. The portfolio page has no external/new-tab invitation links. `src/data/works.ts` holds each item's preview URL; CSP allows the current invitation origin. **Expiration limitation:** the current preview still loads `https://nikah.fahed.in`; iframe embedding does not retain its contents. A separate owner-approved portfolio copy must be supplied and its URL configured before that customer invitation expires. No portfolio archive has been created and no customer hosting/expiry policy was changed.

CSP preview fix: Vite production preview now uses the shared security headers. Rebuilt static headers explicitly allow `https://nikah.fahed.in` in frame-src. Chrome verified the real external invitation body loads inside the iframe with no framing CSP errors. A server still returning only `frame-src https://challenges.cloudflare.com` is serving an older header policy and must be restarted/redeployed as applicable. No production deployment was performed.

Portfolio refinement: Our works now has compact Invite 1-style selectors and a viewport-fitted phone with a fixed 390×844 logical screen scaled to available space. The title/panel/restart/help copy beside the phone was removed. Hover or keyboard focus opens the invitation and auto-scrolls; leaving/blurring pauses. The current invitation has a retained local portfolio copy under `public/portfolio/nikah/`, loaded into a same-origin srcdoc iframe so browser origin restrictions do not prevent scroll control. Relative assets resolve through its local base URL. The original external site is unchanged; the portfolio copy is noindex and its response form is inert with all submit network code removed. This supersedes the earlier note requiring a future retained copy. No remote deployment was performed.

Portfolio scroll correction: the phone now uses native manual iframe scrolling and clickable invitation controls. Hover does not open or auto-scroll; scroll gestures target the invitation while inside the phone, and the page while outside. Overscroll containment keeps the page still when the invitation reaches an edge. The homepage carousel now features three Basic and three Premium designs, and every carousel card carries its collection label. Fixed eighteen-card marketing text was replaced with all-cards wording; the full gallery remains available.

## Current Phase 5 refresh — 8 November 2026

Completed current testing and deployment preparation at the owner’s request. Build and all 212 regression checks passed. After gallery-badge and dark-Basic RSVP contrast fixes, 92 WCAG-tagged desktop/mobile page/cover/open-state scans reported zero violations/errors/overflow. Lighthouse homepage: desktop 100/100/100/100; mobile 99/100/100/100 (performance/accessibility/best-practices/SEO). Dependency audit has zero known advisories; remote migration check has no pending migrations. Current review: `docs/PHASE5_CURRENT_REVIEW.md`.

`cloudflare/production/wrangler.jsonc` now records policy approval locally with submissions still disabled; no remote flags were changed. `scripts/prepare-release.mjs` stages a production-only allowlist and integrity manifest. Current verified stage/archive: `artifacts/online-invites-release-mziylv/` and `.tar.gz` (164 files, Functions compile successful). Do not deploy the root local-test Wrangler config. No public deployment, DNS changes, production test record or live submission enablement occurred. Remaining launch steps and contact/operational limitations are in the current review. Evidence: `artifacts/phase5-refresh-2026-11-08/`.

## GitHub deployment correction — 8 November 2026

Diagnosed three failed Pages production deployments and HTTP 522 at the main Pages hostname. Cloudflare had selected `npx vitepress build` instead of `npm run build`; its latest build failed on documentation dead links. It also loaded local test mode from the root Wrangler configuration. Root `wrangler.jsonc` now contains production settings with submissions disabled; local settings moved to `wrangler.local.jsonc`, explicitly selected by local npm/owner-retrieval commands. Preview branches have no production D1 binding. The explicit config under `cloudflare/production/` remains equivalent. See `docs/GITHUB_DEPLOYMENT.md` for exact settings. Earlier instructions identifying the root config as local-only are superseded. Changes are local until committed/pushed; remote build settings/retry were not changed.

The public GitHub main branch is now readable and includes commit `49e4987` with the production/local separation. Cloudflare's dashboard now uses the correct `npm run build` command. The latest build failed before compilation because Pages rejects `account_id`; removed it from root/explicit production configs, updated the release preparer, and passed Pages-specific config validation plus Functions compilation. These newest changes remain local until pushed.
