# RSVP, countdown and Our works

Added 8 November 2026 at the owner's request. No deployment was performed.

## Event date and countdown

All 18 fictional demo records now use **8 December 2026**, one calendar month after the request date. `src/data/demoEvent.ts` contains the fixed date. It is not calculated on page load, so visiting again does not postpone the event. Each demo retains its own existing start time, interpreted as IST (UTC+05:30); covers, opening dates, schedules and countdown refer to the same record.

The countdown displays days/hours/minutes/seconds, recomputes from the absolute target once per second and refreshes after visibility changes. At the event time it displays a celebration message and clamps at zero. Its timer does not announce every second to screen readers. RSVP closes when the sample event starts; the server checks the cutoff independently.

## Database RSVP

The owner chose database storage. All original and premium invitations now include an RSVP section after the venue, with name, email, accept/decline, attending party size (1–10 including the guest), optional note and consent. Declines store zero guests. Notes do not request sensitive dietary/medical information.

- Static/Vite preview: clearly unsubmitted JSON draft download, with no fake receipt or transmission.
- Local Cloudflare runtime: genuine public test-key verification and persistence to local D1; use fictional information.
- Production: reuses the existing real-key/host/HTTPS/policy-approval safeguards. The gallery remains fictional and makes no real event reservation. Production keys, review and deployment remain separate work.

`POST /api/rsvps` is the only RSVP API. There is no public list, attendance count, email lookup or update endpoint. It enforces same-origin JSON, an 8 KiB streamed limit, strict fields/types, server validation, event cutoff and Turnstile action `rsvp_response`. Quotation verification continues to use `quote_request`. Test-key flows stay loopback-only.

Separate durable quotas permit 20 attempts per client per ten minutes and five accepted responses per hour, shared across the demo invitations. Raw IPs are not stored; keyed hashes identify clients/payloads. A request ID binds retries to the same client and normalized details. Matching retries/content recover the same reference; concurrent SQL guards enforce quota/unique responses. A template/event/email can have only one response: later anonymous submissions cannot overwrite it or retrieve its reference. Changes require contacting the organizer/operator through the published contact channel. SQL parameters are bound and public success contains only a reference/mode/duplicate marker. Receipt appears only after storage succeeds. No notification email is sent.

Migration `0002_rsvps.sql` adds RSVP and attempt tables without changing existing enquiries. Apply locally with:

```sh
npm run db:migrate:local
npm run dev:cloudflare
```

Owner-only inspection:

```sh
npm run rsvps:list
npm run rsvps:summary
npm run rsvps:list -- --reference RSVP-REPLACE-WITH-THE-ACTUAL-UUID
```

The summary counts responses and sums attending guests per invitation/event/attendance. A reference lookup includes personal information and must stay in the owner's private terminal. Explicit `--remote --config <reviewed-production-config>` is supported later; it never defaults to remote. For isolated local tests, `--persist-to <temporary-state-directory>` is supported.

The privacy draft now covers RSVP information and proposes deletion/anonymization within 30 days after the event. This is for owner review; no automatic purge or new production collection was enabled.

## Our works

Homepage section `/#our-works`, also linked from navigation, features **https://nikah.fahed.in**. The public URL responded to inspection with title `F ✦ S`. The card uses original CSS artwork rather than copying names/photos or embedding the external site. Its live-invitation link opens a new tab with `noopener noreferrer`. No external-page contents or event details were modified.

## Verification

- Production frontend/server typecheck and build passed, including route metadata generation after the shared-date change.
- **206 full regression checks passed** across desktop and mobile Chrome, including the quotation backend/form, all 18 openings and carousel returns, plus the new RSVP/countdown/portfolio checks.
- **30 focused new-feature checks passed again** after final canonical retry normalization, including equivalent JSON with reordered keys.
- Actual Cloudflare test-widget/Siteverify submissions saved **four fictional RSVP records** to the isolated temporary D1 database: original/premium themes × desktop/320px, with accepted and declined responses. Each returned HTTP 201 and a real reference. Owner-only summary retrieval confirmed one accepted party of three and one decline per tested invitation.
- Axe WCAG A/AA scans of the four tested RSVP sections reported zero violations; no horizontal overflow, recorded page errors or CSP errors occurred in those flows. Desktop/mobile Our works, countdown, form and receipt screenshots were visually inspected.
- Preview JSON export, consent validation/focus, retry recovery, IST/noon/midnight math, countdown ticking/reload/expiry, duplicate privacy protections and quota races passed automated checks.
- Evidence: ignored `artifacts/rsvp-2026-11-08/` (full/focused test logs, screenshots and actual-provider results). Earlier Phase 5 Lighthouse scores predate these additions and are not presented as new measurements.

The homepage illustration dates also use the same shared fixed date. No permanent deployment, real customer event registration, outbound email, public guest list or external-site change was performed.
