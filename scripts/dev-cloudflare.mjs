import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import ts from 'typescript';

// Pages requires a standard config filename. Isolate local settings without
// changing the production config that GitHub deployments read from the root.
const root = fileURLToPath(new URL('../', import.meta.url));
const directory = path.join(root, '.wrangler/local-project');
await fs.mkdir(directory, { recursive: true });
await fs.writeFile(path.join(directory, 'package.json'), JSON.stringify({ name: 'online-invites-local-dev', private: true, type: 'module' }) + '\n');
const source = await fs.readFile(path.join(root, 'wrangler.local.jsonc'), 'utf8');
const parsed = ts.parseConfigFileTextToJson('wrangler.local.jsonc', source);
if (parsed.error) throw new Error('Cannot read local Wrangler configuration.');
const config = parsed.config;
if (config.vars.APP_MODE !== 'local') throw new Error('Expected local-only configuration.');
config.pages_build_output_dir = './dist';
config.d1_databases = config.d1_databases.map((db) => ({ ...db, migrations_dir: path.join(root, 'migrations') }));
await fs.writeFile(path.join(directory, 'wrangler.jsonc'), JSON.stringify(config, null, 2) + '\n');
for (const name of ['functions', 'server', 'src']) {
  const target = path.join(directory, name);
  const existing = await fs.lstat(target).catch(() => undefined);
  if (existing?.isSymbolicLink()) await fs.unlink(target);
  await fs.cp(path.join(root, name), target, { recursive: true });
}
try { await fs.symlink(path.join(root, 'dist'), path.join(directory, 'dist'), 'dir'); }
catch (error) { if (error.code !== 'EEXIST') throw error; }
const args = process.argv.slice(2);
const defaults = args.includes('--persist-to') ? [] : ['--persist-to', path.join(root, '.wrangler/state')];
const child = spawn(process.execPath, [path.join(root, 'node_modules/wrangler/bin/wrangler.js'), 'pages', 'dev', './dist', ...(args.includes('--ip') ? [] : ['--ip', '127.0.0.1']), ...(args.includes('--port') ? [] : ['--port', '8788']), ...defaults, ...args], { cwd: directory, stdio: 'inherit' });
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
child.on('exit', (code) => { process.exitCode = code ?? 0; });
