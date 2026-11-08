# Varun & Priyanka — Diwali invitation

Guest route: `/invite/varun-priyanka-diwali`.

A personal invitation separate from the fictional design gallery: saffron/vermilion opening, animated diyas and candles, readable celebration details, native sharing (clipboard fallback), downloadable card and replay. Studio navigation and sales footer are hidden on this route. Reduced motion is respected. The invitation is noindex and omitted from the sitemap; anyone with the link can view it.

Confirmed details: Varun & Priyanka, their Niwas at UER Heights, H-Tower, 7 PM onwards. No event date, exact map pin or RSVP contact was supplied; none is invented. No countdown or guest response collection is added.

Source: `src/pages/DiwaliInvitation.tsx`, `src/diwali.css`. Card: `public/invitations/varun-priyanka-diwali.png`. Route metadata includes the actual invitation artwork for link previews in generated HTTP HTML and client navigation.

Validation: production build/type checks pass; `PLAYWRIGHT_CHANNEL=chrome npm test -- tests/diwali.spec.ts` passes on desktop and mobile, covering opening/replay focus, real venue/time, download, social metadata, noindex, overflow and browser errors.

Publishing uses the existing Cloudflare Pages project `online-invites`. This direct deployment does not commit or push source changes to GitHub; include these changes in the next source update so a later GitHub deployment retains the invitation.

Publication result (8 November 2026): deployed successfully to https://49f3c058.online-invites.pages.dev; invitation route returned HTTP 200 with correct sharing metadata. Cloudflare project initially had only its pages.dev domain. Added `onlineinvites.in` as a custom domain; verification/certificate initialization is pending. The existing Cloudflare zone is pending nameserver activation, with assigned nameservers `alec.ns.cloudflare.com` and `sneh.ns.cloudflare.com`. The owner must update nameservers at the domain registrar before the requested domain resolves. No registrar settings were changed.

Curtain opening update: red silk-style panels with gold pattern/trim now meet at the centre on the cover. Opening sweeps them apart over 2.6 seconds, with a lifting pelmet and warm light reveal. Skip animation, replay, temporary scroll lock and inert invitation content during opening are included. Reduced-motion users open immediately. Build and six desktop/mobile browser checks pass.
