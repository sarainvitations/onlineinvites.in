# Phase 4: local enquiry backend

This phase implements and tests the backend **on this Mac**. No Cloudflare account login, remote database, permanent hosting, production widget, outbound email or launch has been performed. Individual demo refinement and the final launch review remain later work.

## Two preview modes

| Command / address | Behavior |
| --- | --- |
| `npm run dev` → port 5173 | Frontend iteration. Without a configured API, form requirements can be checked/downloaded locally; no enquiry is submitted. |
| `npm run preview` → port 4173 | Built static frontend. The existing temporary sharing tunnel still points here and cannot save enquiries. |
| `npm run dev:cloudflare` → port 8788 | Builds the frontend, runs Pages Functions and local D1, and enables clearly labelled **local test submissions** using official Turnstile test keys. |

Node 26 LTS is recommended; the minimum is 22.12 (`nvm use` selects 26 if available). Install dependencies, migrate and start the full local runtime:

```sh
npm install
npm run db:migrate:local
npm run dev:cloudflare
```

If your terminal uses Node 16, start with a temporary supported runtime instead:

```sh
npm exec --yes --package=node@26 -- npm run dev:cloudflare
```

This avoids the `node:util` / `styleText` startup error and does not replace the system Node installation.

Open **http://127.0.0.1:8788/request-quote**. Use fictional details. Complete all six steps, consent to local test storage, complete the visible test widget and choose **Save test enquiry locally**. The receipt appears only after local persistence succeeds. It is explicitly a local test, not a live customer enquiry. No email is sent.

The widget and server-side Siteverify call require an internet connection even though D1 and the application runtime are local. A blocked/expired/unavailable widget does not bypass verification: the form retains the details and offers verification retry. Offline/static mode still supports local requirements export.

`wrangler.jsonc` is intentionally the default **local** configuration because Pages requires a standard configuration filename. The zero database UUID is a local development identifier, not a remote database. D1 files live under ignored `.wrangler/state/`; restarting the local runtime preserves them. Migrations are tracked in `migrations/`. Do not delete local state unless you intend to remove local test enquiries.

The visible dummy site key and test secret in `wrangler.jsonc` are public Cloudflare testing values, not credentials. The local HMAC salt is explicitly non-production. Server configuration permits these only on loopback hostnames. Production mode rejects dummy keys/local salt and requires policy approval, HTTPS and an explicit allowed hostname. `wrangler.production.example.jsonc` is a disabled template, not a configured deployment.

## Owner-only retrieval

There is **no public administration or enquiry-list endpoint**. Inspect local records using the local CLI:

```sh
npm run enquiries:list
npm run enquiries:list -- --reference OI-REPLACE-WITH-THE-RETURNED-UUID
```

The first command lists the latest twenty references, occasions, statuses, notification states and timestamps. A valid reference command also returns customer details and the complete normalized requirements JSON. The placeholder above must be replaced by the actual `OI-…` reference. Run these in your own terminal; detail output contains personal data and should not be pasted into public logs.

When production is eventually approved, the same script supports explicit `--remote --config <reviewed-production-config>` under an authenticated Cloudflare account. It never selects remote mode by default. No remote command has been executed during this phase. An owner can also use Cloudflare’s authenticated D1 console. There are no browser passwords, fake admin login or insecure public shortcuts.

## API contract and privacy

- `GET /api/config` returns only `{available, mode, siteKey?}`; it never returns secrets. Missing/incomplete configuration disables submission and leaves the frontend in preview mode.
- `POST /api/enquiries` accepts `{requestId, turnstileToken, requirements}`. All requirement fields match `src/features/quote/model.ts`; the server independently parses/normalizes the untrusted object and runs shared business validation.
- `requestId` is a random UUID v4 held in page memory. Retry with unchanged details reuses it. Editing requirements generates a new request ID; no personal details are written into the URL or browser storage.
- On successful persistence: HTTP 201 `{ok:true, reference, mode, duplicate:false}`. A recovered retry/recent duplicate returns HTTP 200 with the same reference and `duplicate:true`. No customer data is returned.
- Failure responses use safe fixed codes/messages and optional field errors: 400 invalid input/verification, 403 wrong origin, 405 unsupported method, 409 conflicting request ID, 413 size limit, 415 wrong content type, 429 rate limit, and 503 unavailable verification/storage/configuration.
- JSON requests have a **32 KiB streamed UTF-8 byte limit**, independent of Content-Length. Unknown fields, wrong types, control characters and excessive field/array lengths are rejected. Text is NFC-normalized/trimmed; email, phone and domain preferences are normalized. Inactive conditional fields are cleared. SQL uses bound parameters.
- Requests must be same-origin JSON; no cross-origin access is enabled. Browser form validation is never the only validation.
- Cloudflare’s Siteverify API is called on the server with an 8-second timeout. Production requires the correct hostname, action `quote_request`, recent challenge time and no testing-key marker. Local mode checks the provider’s explicit testing-key marker; current dummy responses do not reliably contain the hostname/action shown in older documentation examples. There is no verification bypass endpoint.
- Attempt quota: **20 attempts per client per fixed ten-minute window**. Accepted-enquiry quota: **5 per rolling hour**. These are basic application limits, not a complete edge/WAF strategy. Limit responses include Retry-After. Raw IP addresses are not stored: CF-Connecting-IP is used only to calculate a salted HMAC client identifier; X-Forwarded-For is not trusted. Provider secrets and customer payloads are not logged.
- Idempotency checks bind request ID to client and normalized payload. Matching content from the same client is deduplicated over ten minutes. A single guarded SQLite INSERT atomically applies duplicate and accepted-quota checks, including concurrent requests. Attempts use an atomic UPSERT. Old attempt rows are cleaned in bounded batches after successful submissions.
- Enquiries store status `New` and support Reviewing, Quoted, Accepted, In Progress, Preview Sent, Completed and Cancelled. Full requirements, consent version, timestamps and notification status are stored alongside searchable business fields.
- References are confirmation of receipt only, not quotation acceptance, payment or a reserved domain. Hosting/design/domain costs remain individually reviewed. Policy pages are still drafts; local test consent is clearly distinguished from future production consent.

## Email behavior

`server/notifications.ts` defines an optional transactional-provider interface. The default provider is unconfigured and sends nothing. Every enquiry is stored independently of notification delivery; provider failures are recorded as `failed` without removing the enquiry or changing a valid storage receipt. Duplicate retries do not resend notifications.

Cloudflare Email Routing can forward incoming business mail, but it is not an outbound transactional notification provider. No personal inbox, sender domain, delivery claim or email integration is invented. Owner-only D1 retrieval is the working interim method.

## Tests and checks

```sh
npm run typecheck
npm run build
npm run test:backend
PLAYWRIGHT_CHANNEL=chrome npm test
```

`test:backend` uses isolated ephemeral D1 via the installed Miniflare runtime; it does not touch the owner’s local database or any remote database. It tests real SQL persistence, parameter binding, validation, malformed/oversized bodies, origin enforcement, races, duplicate recovery, quotas, provider failure and database errors. Network/provider responses are injected in these deterministic tests; no HTTP-accessible testing bypass is added.

`tests/submission.spec.ts` tests UI success/error/retry/locking and widget failure states with explicitly intercepted test responses. These are separate from the real local smoke test with Cloudflare’s actual test widget and Siteverify service. The remaining suites cover the form, all eighteen demos and carousel returns. Tests use fictional data.

## When you choose to prepare a real launch later

Do not run production provisioning or deployment while refining demos. Before any live enquiry service is enabled:

1. Complete the owner’s demo review, policy review and Phase 5 audits.
2. Sign in to the owner’s Cloudflare account, create a real D1 database and approved Pages project, and configure a real widget for the chosen hostname.
3. Replace the local Wrangler configuration with a reviewed production configuration based on the example. Set the real binding UUID, allowed hostnames and public site key. The example defaults to submission disabled and policies unapproved.
4. Configure `TURNSTILE_SECRET_KEY` and a cryptographically random `RATE_LIMIT_SALT` (32+ characters) as server secrets. Never use VITE_ for secrets or commit `.dev.vars`. `.dev.vars.example` contains placeholders only.
5. Apply the tracked migrations to the approved remote database, establish authenticated owner access and review privacy/retention/operational procedures.
6. Only after explicit launch approval enable submission, mark actually reviewed policies approved, deploy and verify a real end-to-end enquiry on the intended hostname. Notification integration can remain unconfigured; D1 storage and owner retrieval must work independently.

Official references: [Pages local development](https://developers.cloudflare.com/pages/functions/local-development/), [D1 local development](https://developers.cloudflare.com/d1/best-practices/local-development/), [Pages bindings](https://developers.cloudflare.com/pages/functions/bindings/), [Turnstile testing](https://developers.cloudflare.com/turnstile/troubleshooting/testing/), [server-side verification](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/).
