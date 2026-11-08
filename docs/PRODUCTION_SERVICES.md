# Production services

Configured and remotely verified on 8 November 2026 under Sara's Cloudflare account. No website deployment or DNS changes were performed in this step.

| Resource | Value |
| --- | --- |
| Cloudflare account | `fbfcbbe2b25daac633ab03d066f27afe` |
| Pages project | `online-invites` |
| Reserved Pages hostname | `online-invites.pages.dev` (no deployment yet) |
| D1 database | `online-invites-production` |
| D1 ID / binding | `29a36a75-0d67-434c-9e80-06f5377c1a1a` / `DB` |
| D1 location hint | APAC; verification served from Singapore, not an India residency guarantee |
| Turnstile widget | `Online Invites production`, managed |
| Public site key | `0x4AAAAAAF39az-T1rpEe2hS` |
| Allowed hostnames | `onlineinvites.in`, `www.onlineinvites.in`, `online-invites.pages.dev` |

`TURNSTILE_SECRET_KEY` and a cryptographically random 64-character `RATE_LIMIT_SALT` are stored as encrypted production Pages secrets. Values are not stored in project files. Both enquiry and RSVP handlers use these credentials, with separate Turnstile actions and quota tables. No outbound notification provider is configured; responses are stored in D1.

The last remotely verified production settings have `APP_MODE=production`, `SUBMISSIONS_ENABLED=false` and `POLICIES_APPROVED=false`. The owner has since approved the current policies: the checked-in deployment configuration now has `POLICIES_APPROVED=true`, while `SUBMISSIONS_ENABLED` remains false. This local configuration update has not been deployed or applied to the remote project. Preview is disabled with no production DB or server secrets. Root `wrangler.jsonc` now holds the GitHub-compatible production configuration; local commands explicitly use `wrangler.local.jsonc`. The equivalent `cloudflare/production/wrangler.jsonc` entrypoint is retained for existing production operations. The checked-in production file contains public identifiers and variables only.

## Schema and maintenance

Applied `0001_enquiries.sql` and `0002_rsvps.sql` remotely. Verified no outstanding migrations, and zero enquiry/RSVP records. No local records were copied.

Run from the repository root:

```sh
# Read migration status
npm run db:status:production

# Apply future reviewed migrations
npm run db:migrate:production

# Authenticated owner retrieval
npm run enquiries:list -- --remote --config cloudflare/production/wrangler.jsonc
npm run rsvps:summary -- --remote --config cloudflare/production/wrangler.jsonc
```

Use Cloudflare Dashboard → Workers & Pages → online-invites → Settings for environment variables and secrets, and Turnstile → Online Invites production for widget settings. Never copy secret values into documentation or source control. Keep database binding and public production configuration synchronized when changing remote settings.

## Remaining launch work

1. Policy approval is recorded in `src/config/site.ts` and the checked-in production configuration. Apply that approved configuration in the eventual deployment; keep submissions disabled until ready for live testing.
2. Build and deploy Pages with the production configuration, ensuring the root `functions/` directory is bundled. Do not deploy using the local test-key configuration. Deployment has not been performed or validated by this configuration step.
3. Attach the custom domain and confirm DNS/HTTPS. The hostname above is reserved, not a verified live link.
4. Verify the deployed API, real Turnstile and a consented test enquiry/RSVP end to end, plus owner retrieval and failure/rate-limit behavior. Remove test data using authenticated administration.
5. Enable submissions when those checks and policies are ready, then verify public behavior again.

The December demo event dates/countdowns are unchanged. Secret storage and schema checks do not establish live form functionality before a deployment.
