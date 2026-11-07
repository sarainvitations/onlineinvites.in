import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
const args = process.argv.slice(2);
const value = (flag) => {
  const index = args.indexOf(flag);
  return index < 0 ? undefined : args[index + 1];
};
const reference = value("--reference");
const remote = args.includes("--remote");
const config = value("--config") ?? "wrangler.jsonc";
if (remote && !value("--config"))
  throw new Error(
    "Remote retrieval requires an explicit reviewed production --config.",
  );
if (
  reference &&
  !/^OI-[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/.test(
    reference,
  )
)
  throw new Error("Invalid enquiry reference.");
const query = reference
  ? `SELECT id,customer_name,email,whatsapp,occasion,status,requirements_json,notification_status,created_at FROM enquiries WHERE id = '${reference}'`
  : "SELECT id,occasion,status,notification_status,created_at FROM enquiries ORDER BY created_at DESC LIMIT 20";
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
    "--command",
    query,
    "--json",
  ],
  { stdio: "inherit" },
);
process.exitCode = result.status ?? 1;
