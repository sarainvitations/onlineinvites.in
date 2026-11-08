# Cloudflare Pages deployment from GitHub

The Pages project `online-invites` is connected to `sarainvitations/OnlineInvites.in`, production branch `main`.

## Cloudflare build settings

In Workers & Pages → online-invites → Settings → Build, configure:

| Setting | Value |
| --- | --- |
| Framework preset | Vite, or None with the settings below |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | Repository root (blank) |
| Production branch | `main` |
| Node version | 26 (`.nvmrc` is committed) |

`npx vitepress build` is incorrect: this app uses Vite and React, not VitePress. It tries to compile the repository documentation instead of building the website. The failed deployment `c53394c5-a52d-4e14-8e77-a865734d0da9` used that command and failed on five documentation links. The project had no successful production deployment when checked; the main Pages URL returned HTTP 522.

## Wrangler configuration

- Root `wrangler.jsonc` is now the production configuration used by GitHub builds: real D1 binding/site key, approved policies and submissions disabled.
- `wrangler.local.jsonc` is explicitly local: local D1, official test keys and loopback-only hostnames. Local migration/retrieval commands select it explicitly. `npm run dev:cloudflare` uses `scripts/dev-cloudflare.mjs` to stage it under an ignored local working directory with the standard config filename that Pages requires.
- Preview branches use disabled submission settings and no production database binding.
- `cloudflare/production/wrangler.jsonc` remains equivalent for existing explicit production commands, with paths relative to its directory.
- Real encrypted server secrets stay in Cloudflare. Do not put them in GitHub or frontend environment variables.

Push the reviewed configuration changes to GitHub `main`, save the corrected Cloudflare build settings, then retry the deployment. Verify a successful production build before expecting `https://online-invites.pages.dev/` to serve the website. Connecting a repository or pushing a commit alone does not establish a successful deployment.

The configuration change is prepared locally. No Git commit/push, remote build-setting update, deployment retry or submission enablement was performed by this fix.
