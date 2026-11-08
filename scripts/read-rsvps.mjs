import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
const args = process.argv.slice(2);
const value = (flag) => {
  const index = args.indexOf(flag);
  return index < 0 ? undefined : args[index + 1];
};
const reference = value("--reference");
const remote = args.includes("--remote");
const config = value("--config") ?? "wrangler.local.jsonc";
if (remote && !value("--config"))
  throw new Error(
    "Remote retrieval requires an explicit reviewed production --config.",
  );
if (
  reference &&
  !/^RSVP-[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/.test(
    reference,
  )
)
  throw new Error("Invalid RSVP reference.");
const query = reference
  ? `SELECT id,template_id,event_date,full_name,email,attendance,guests,message,consent_version,created_at FROM rsvps WHERE id = '${reference}'`
  : args.includes("--summary")
    ? "SELECT template_id,event_date,attendance,COUNT(*) AS responses,SUM(guests) AS guests FROM rsvps GROUP BY template_id,event_date,attendance ORDER BY template_id,attendance"
    : "SELECT id,template_id,event_date,attendance,guests,created_at FROM rsvps ORDER BY created_at DESC LIMIT 20";
const persist = value("--persist-to");
if (remote && persist) throw new Error("--persist-to is only available for local inspection.");
const bin = fileURLToPath(
  new URL("../node_modules/wrangler/bin/wrangler.js", import.meta.url),
);
const result = spawnSync(
  process.execPath,
  [
    bin,
    "d1",
    "execute",
    "DB",
    remote ? "--remote" : "--local",
    "--config",
    config,
    ...(persist ? ["--persist-to", persist] : []),
    "--command",
    query,
    "--json",
  ],
  { stdio: "inherit" },
);
process.exitCode = result.status ?? 1;
