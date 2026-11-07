import { test, expect } from "@playwright/test";
import { Miniflare, convertV4MiniflareOptions } from "miniflare";
import { readFileSync } from "node:fs";
import { handleRsvp } from "../server/rsvps";
import { verifyTurnstile } from "../server/turnstile";
import type { Env } from "../server/types";
let runtime: Miniflare;
let db: D1Database;
let env: Env;
const now = Date.parse("2026-11-08T10:00:00+05:30");
const accepted = async () => Response.json({ success: true, metadata: { result_with_testing_key: true } });
const details = () => ({ templateId: "velvet-overture", fullName: " RSVP Guest ", email: "GUEST@example.com", attendance: "yes", guests: "2", message: "Looking forward to it.", privacyConsent: true });
const body = () => ({ requestId: crypto.randomUUID(), turnstileToken: "REAL_TEST_TOKEN", details: details() });
function request(value: unknown = body(), headers: Record<string, string> = {}, method = "POST") {
  return new Request("http://localhost:8788/api/rsvps", { method, headers: { Origin: "http://localhost:8788", "Content-Type": "application/json", "CF-Connecting-IP": "127.0.0.1", ...headers }, ...(method === "POST" ? { body: JSON.stringify(value) } : {}) });
}
async function call(req: Request, options: { fetcher?: typeof fetch; now?: () => number; environment?: Env } = {}) {
  const tasks: Promise<unknown>[] = [];
  const response = await handleRsvp(req, options.environment ?? env, (task) => tasks.push(task), { fetcher: accepted as typeof fetch, now: () => now, ...options });
  await Promise.allSettled(tasks);
  return response;
}
const count = async () => Number((await db.prepare("SELECT COUNT(*) AS count FROM rsvps").first<{ count: number }>())!.count);
test.beforeAll(async () => {
  runtime = new Miniflare(convertV4MiniflareOptions({ modules: true, script: 'export default {fetch(){return new Response("test")}}', compatibilityDate: "2026-10-01", d1Databases: ["DB"] }));
  db = await runtime.getD1Database("DB") as unknown as D1Database;
  for (const query of readFileSync("migrations/0002_rsvps.sql", "utf8").split(";").map(s => s.trim()).filter(Boolean)) await db.prepare(query).run();
  env = { DB: db, APP_MODE: "local", SUBMISSIONS_ENABLED: "true", TURNSTILE_SITE_KEY: "1x00000000000000000000AA", TURNSTILE_SECRET_KEY: "1x0000000000000000000000000000000AA", RATE_LIMIT_SALT: "local-only-public-test-salt-do-not-use-in-production", ALLOWED_HOSTNAMES: "localhost,127.0.0.1" };
});
test.beforeEach(async () => { await db.prepare("DELETE FROM rsvps").run(); await db.prepare("DELETE FROM rsvp_attempts").run(); });
test.afterAll(async () => runtime.dispose());

test("RSVP persists normalized details, consent and fixed event date before returning a private receipt", async () => {
  const input = body(); input.details.message = "'); DROP TABLE rsvps; --";
  const response = await call(request(input));
  expect(response.status).toBe(201);
  const receipt = await response.json() as any;
  expect(receipt.reference).toMatch(/^RSVP-[0-9A-F-]{36}$/);
  expect(JSON.stringify(receipt)).not.toContain("guest@example.com");
  expect(response.headers.get("Cache-Control")).toBe("no-store");
  const record = await db.prepare("SELECT * FROM rsvps WHERE id = ?").bind(receipt.reference).first<any>();
  expect(record.full_name).toBe("RSVP Guest"); expect(record.email).toBe("guest@example.com");
  expect(record.event_date).toBe("2026-12-08"); expect(record.guests).toBe(2); expect(record.privacy_consent).toBe(1);
  expect(record.message).toBe(input.details.message); expect(await count()).toBe(1);
});

test("declines persist zero guests and duplicate contact details cannot overwrite a response", async () => {
  const input = body(); input.details.attendance = "no"; input.details.guests = "9";
  expect((await call(request(input))).status).toBe(201);
  expect((await db.prepare("SELECT guests FROM rsvps").first<any>()).guests).toBe(0);
  const changed = body(); changed.details.attendance = "yes";
  const conflict = await call(request(changed), { now: () => now + 11 * 60 * 1000 });
  expect(conflict.status).toBe(409); expect(await count()).toBe(1);
  expect((await db.prepare("SELECT attendance FROM rsvps").first<any>()).attendance).toBe("no");
});

test("same-client retries recover one reference, while changed payloads and other clients cannot retrieve it", async () => {
  const input = body(); const saved = await (await call(request(input))).json() as any;
  const retry = await call(request(input), { fetcher: (async () => { throw new Error("must not reverify"); }) as typeof fetch });
  expect(retry.status).toBe(200); expect((await retry.json() as any).reference).toBe(saved.reference);
  const reordered = { ...input, details: Object.fromEntries(Object.entries(input.details).reverse()) };
  const recovered = await call(request(reordered)); expect(recovered.status).toBe(200); expect((await recovered.json() as any).reference).toBe(saved.reference);
  const changed = structuredClone(input); changed.details.guests = "3";
  const conflict = await call(request(changed)); expect(conflict.status).toBe(409); expect(await conflict.text()).not.toContain(saved.reference);
  const other = await call(request(input, { "CF-Connecting-IP": "192.0.2.10" })); expect(other.status).toBe(409); expect(await other.text()).not.toContain(saved.reference);
  expect(await count()).toBe(1);
});

test("concurrent identical responses are deduplicated atomically", async () => {
  const responses = await Promise.all(Array.from({ length: 4 }, () => call(request(body()))));
  expect(responses.map(r => r.status).sort()).toEqual([200, 200, 200, 201]);
  const refs = await Promise.all(responses.map(r => r.json() as Promise<any>));
  expect(new Set(refs.map(r => r.reference)).size).toBe(1); expect(await count()).toBe(1);
});

test("concurrent accepted-response quota is shared across invitations", async () => {
  const responses = await Promise.all(Array.from({ length: 7 }, (_, i) => { const input = body(); input.details.email = `guest-${i}@example.com`; input.details.templateId = i % 2 ? "velvet-overture" : "the-garden-edit"; return call(request(input)); }));
  expect(responses.filter(r => r.status === 201)).toHaveLength(5); expect(responses.filter(r => r.status === 429)).toHaveLength(2); expect(await count()).toBe(5);
});

test("attempt quotas include failed verification and return retry timing", async () => {
  const reject = (async () => Response.json({ success: false })) as typeof fetch;
  for (let i = 0; i < 20; i++) expect((await call(request(), { fetcher: reject })).status).toBe(400);
  const limited = await call(request()); expect(limited.status).toBe(429); expect(Number(limited.headers.get("Retry-After"))).toBeGreaterThan(0); expect(await count()).toBe(0);
});

test("strict input, consent, event cutoff, origin, content type and body size are enforced", async () => {
  expect((await call(request(undefined, {}, "GET"))).status).toBe(405);
  expect((await call(request(body(), { Origin: "https://evil.example" }))).status).toBe(403);
  expect((await call(request(body(), { "Content-Type": "text/plain" }))).status).toBe(415);
  for (const change of [ { templateId: "unknown" }, { guests: "0" }, { guests: "11" }, { guests: "1.5" }, { attendance: "maybe" }, { privacyConsent: false }, { email: "bad" }, { unexpected: "x" }, { fullName: 5 } ]) {
    const input = body(); Object.assign(input.details, change); expect((await call(request(input))).status).toBe(400);
  }
  expect((await call(request(), { now: () => Date.parse("2026-12-09T00:00:00+05:30") })).status).toBe(400);
  const huge = body(); huge.details.message = "x".repeat(9000); expect((await call(request(huge))).status).toBe(413);
  expect(await count()).toBe(0);
});

test("storage/provider failures never return a false RSVP success or expose implementation details", async () => {
  const unavailable = (async () => { throw new Error("provider secret"); }) as typeof fetch;
  expect((await call(request(), { fetcher: unavailable })).status).toBe(503);
  const broken = { ...env, DB: { prepare() { throw new Error("private database path"); } } as unknown as D1Database };
  const response = await call(request(), { environment: broken }); expect(response.status).toBe(503); expect(await response.text()).not.toContain("private database path"); expect(await count()).toBe(0);
});

test("production RSVP verification requires the RSVP action and does not accept quotation tokens", async () => {
  const production = { ...env, APP_MODE: "production" };
  const result = { success: true, hostname: "onlineinvites.in", action: "rsvp_response", challenge_ts: new Date().toISOString() };
  const fetcher = (async () => Response.json(result)) as typeof fetch;
  expect(await verifyTurnstile("token", production, "onlineinvites.in", fetcher, "rsvp_response")).toBe("verified");
  expect(await verifyTurnstile("token", production, "onlineinvites.in", fetcher)).toBe("rejected");
  expect(await verifyTurnstile("token", production, "other.example", fetcher, "rsvp_response")).toBe("rejected");
});
