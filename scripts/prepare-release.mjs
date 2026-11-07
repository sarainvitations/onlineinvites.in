import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';

// Stage an explicit allowlist; never copy local Wrangler state or env files.
const config = JSON.parse(await fs.readFile('cloudflare/production/wrangler.jsonc', 'utf8'));
if (config.vars.APP_MODE !== 'production' || config.vars.SUBMISSIONS_ENABLED !== 'false' || config.vars.POLICIES_APPROVED !== 'true') {
  throw new Error('Release preparation requires production mode, approved policies and disabled submissions.');
}
if (!config.account_id || !config.d1_databases?.[0]?.database_id || /^[123]x0{10,}/.test(config.vars.TURNSTILE_SITE_KEY)) {
  throw new Error('Reviewed production account, database and real Turnstile site key are required.');
}
await fs.access('dist/_headers');
await fs.access('dist/index.html');
await fs.mkdir('artifacts', { recursive: true });
const directory = await fs.mkdtemp('artifacts/online-invites-release-');
for (const entry of ['dist', 'functions', 'server', 'src', 'migrations']) {
  await fs.cp(entry, path.join(directory, entry), { recursive: true });
}
config.$schema = undefined;
config.pages_build_output_dir = './dist';
config.d1_databases = config.d1_databases.map((database) => ({ ...database, migrations_dir: './migrations' }));
await fs.writeFile(path.join(directory, 'wrangler.jsonc'), JSON.stringify(config, null, 2) + '\n');
const files = [];
async function collect(root, relative = '') {
  for (const entry of await fs.readdir(path.join(root, relative), { withFileTypes: true })) {
    const name = path.join(relative, entry.name);
    if (entry.isDirectory()) await collect(root, name);
    else files.push({ path: name, sha256: createHash('sha256').update(await fs.readFile(path.join(root, name))).digest('hex') });
  }
}
await collect(directory);
files.sort((a, b) => a.path.localeCompare(b.path));
await fs.writeFile(path.join(directory, 'release-manifest.json'), JSON.stringify({ createdAt: new Date().toISOString(), project: config.name, submissionsEnabled: false, files }, null, 2) + '\n');
console.log(JSON.stringify({ directory: path.resolve(directory), files: files.length, project: config.name, submissionsEnabled: false }));
