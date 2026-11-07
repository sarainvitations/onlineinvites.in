import { test, expect } from "@playwright/test";
import { Miniflare, convertV4MiniflareOptions } from "miniflare";
import { readFileSync } from "node:fs";
import { handleEnquiry } from "../server/enquiries";
import { runtimeConfig, type Env } from "../server/types";
import { verifyTurnstile } from "../server/turnstile";
import { createRequirements } from "../src/features/quote/model";
let runtime: Miniflare;
let db: D1Database;
let env: Env;
const accepted = async () =>
  Response.json({
    success: true,
    hostname: "example.com",
    metadata: { result_with_testing_key: true },
  });
const token = "XXXX.DUMMY.TOKEN.XXXX";
const requirements = () => ({
  ...createRequirements(new URLSearchParams("template=velvet-overture")),
  fullName: "Test Customer",
  email: "TEST@example.com",
  eventDate: "2099-12-18",
  publicationDate: "2099-12-01",
  privacyConsent: true,
});
const body = () => ({
  requestId: crypto.randomUUID(),
  turnstileToken: token,
  requirements: requirements(),
});
function request(
  value: unknown = body(),
  headers: Record<string, string> = {},
  method = "POST",
) {
  return new Request("http://localhost:8788/api/enquiries", {
    method,
    headers: {
      Origin: "http://localhost:8788",
      "Content-Type": "application/json",
      "CF-Connecting-IP": "127.0.0.1",
      ...headers,
    },
    ...(method === "POST" ? { body: JSON.stringify(value) } : {}),
  });
}
async function call(
  req: Request,
  options: {
    fetcher?: typeof fetch;
    notifier?: any;
    now?: () => number;
    environment?: Env;
  } = {},
) {
  const tasks: Promise<unknown>[] = [];
  const result = await handleEnquiry(
    req,
    options.environment ?? env,
    (task) => tasks.push(task),
    { fetcher: options.fetcher ?? (accepted as typeof fetch), ...options },
  );
  await Promise.allSettled(tasks);
  return result;
}
const count = async () =>
  Number(
    (await db
      .prepare("SELECT COUNT(*) AS count FROM enquiries")
      .first<{ count: number }>())!.count,
  );
test.beforeAll(async () => {
  runtime = new Miniflare(
    convertV4MiniflareOptions({
      modules: true,
      script: 'export default {fetch(){return new Response("test")}}',
      compatibilityDate: "2026-10-01",
      d1Databases: ["DB"],
    }),
  );
  db = (await runtime.getD1Database("DB")) as unknown as D1Database;
  for (const query of readFileSync("migrations/0001_enquiries.sql", "utf8")
    .split(";")
    .map((query) => query.trim())
    .filter(Boolean))
    await db.prepare(query).run();
  env = {
    DB: db,
    APP_MODE: "local",
    SUBMISSIONS_ENABLED: "true",
    TURNSTILE_SITE_KEY: "1x00000000000000000000AA",
    TURNSTILE_SECRET_KEY: "1x0000000000000000000000000000000AA",
    RATE_LIMIT_SALT: "local-only-public-test-salt-do-not-use-in-production",
    ALLOWED_HOSTNAMES: "localhost,127.0.0.1",
  };
});
test.beforeEach(async () => {
  await db.prepare("DELETE FROM enquiries").run();
  await db.prepare("DELETE FROM enquiry_attempts").run();
});
test.afterAll(async () => {
  await runtime?.dispose();
});

test("runtime configuration restricts local keys to loopback and production requires owner-approved policies and real keys", () => {
  expect(runtimeConfig(env, new URL("http://localhost:8788")).available).toBe(
    true,
  );
  expect(runtimeConfig(env, new URL("https://example.com")).available).toBe(
    false,
  );
  expect(
    runtimeConfig(
      {
        ...env,
        APP_MODE: "production",
        ALLOWED_HOSTNAMES: "example.com",
        POLICIES_APPROVED: "true",
      },
      new URL("https://example.com"),
    ).available,
  ).toBe(false);
  const production = {
    ...env,
    APP_MODE: "production",
    ALLOWED_HOSTNAMES: "example.com",
    POLICIES_APPROVED: "true",
    TURNSTILE_SITE_KEY: "production-public-key",
    TURNSTILE_SECRET_KEY: "production-private-key",
    RATE_LIMIT_SALT: "abcdefghijklmnopqrstuvwxyz0123456789",
  };
  expect(
    runtimeConfig(production, new URL("https://example.com")).available,
  ).toBe(true);
  expect(
    runtimeConfig(
      { ...production, POLICIES_APPROVED: "false" },
      new URL("https://example.com"),
    ).available,
  ).toBe(false);
  expect(
    JSON.stringify(runtimeConfig(env, new URL("http://localhost"))),
  ).not.toContain(env.TURNSTILE_SECRET_KEY);
});
test("GET cannot retrieve enquiries; origins and content types are enforced", async () => {
  expect((await call(request(undefined, {}, "GET"))).status).toBe(405);
  expect(
    (await call(request(body(), { Origin: "https://evil.example" }))).status,
  ).toBe(403);
  expect(
    (await call(request(body(), { "Sec-Fetch-Site": "cross-site" }))).status,
  ).toBe(403);
  expect(
    (await call(request(body(), { "Content-Type": "text/plain" }))).status,
  ).toBe(415);
  expect(
    (await call(request(body(), { "Content-Length": "40000" }))).status,
  ).toBe(413);
  expect(await count()).toBe(0);
});
test("strict parsing rejects unknown fields, wrong types, absent consent and malformed JSON", async () => {
  for (const value of [
    { ...body(), extra: "x" },
    { ...body(), requirements: { ...requirements(), email: { unsafe: true } } },
    { ...body(), requirements: { ...requirements(), privacyConsent: false } },
    {
      ...body(),
      requirements: { ...requirements(), features: Array(21).fill("RSVP") },
    },
  ])
    expect((await call(request(value))).status).toBe(400);
  const broken = new Request("http://localhost:8788/api/enquiries", {
    method: "POST",
    headers: {
      Origin: "http://localhost:8788",
      "Content-Type": "application/json",
    },
    body: "{broken",
  });
  expect((await call(broken)).status).toBe(400);
  expect(await count()).toBe(0);
});
test("streamed body limits count UTF-8 bytes even without Content-Length", async () => {
  const req = new Request("http://localhost:8788/api/enquiries", {
    method: "POST",
    headers: {
      Origin: "http://localhost:8788",
      "Content-Type": "application/json",
    },
    body: "語".repeat(11000),
  });
  expect((await call(req)).status).toBe(413);
  expect(await count()).toBe(0);
});
test("server validation independently rejects dates, email, domains and unsafe reference schemes", async () => {
  for (const change of [
    { email: "bad" },
    { publicationDate: "2100-01-01" },
    { references: "javascript:alert(1)" },
    { hostingType: "existing-domain", customDomain: "https://example.com" },
    { hostingDays: "1.5" },
    { hexColors: "#GGGGGG" },
  ]) {
    const response = await call(
      request({ ...body(), requirements: { ...requirements(), ...change } }),
    );
    expect(response.status).toBe(400);
    expect((await response.json()).code).toBe("VALIDATION_FAILED");
  }
  expect(await count()).toBe(0);
});
test("verified enquiry is actually persisted with normalized parameters, status and safe reference only", async () => {
  const input = body();
  input.requirements.fullName = "Test '); DROP TABLE enquiries; --";
  const response = await call(request(input));
  expect(response.status).toBe(201);
  const output = await response.json();
  expect(output.reference).toMatch(/^OI-[0-9A-F-]{36}$/);
  expect(Object.keys(output).sort()).toEqual([
    "duplicate",
    "mode",
    "ok",
    "reference",
  ]);
  expect(response.headers.get("Cache-Control")).toBe("no-store");
  const stored = await db
    .prepare("SELECT * FROM enquiries WHERE id = ?")
    .bind(output.reference)
    .first();
  expect(stored!.customer_name).toBe(input.requirements.fullName);
  expect(stored!.email).toBe("test@example.com");
  expect(stored!.status).toBe("New");
  expect(stored!.notification_status).toBe("not_configured");
  expect(stored!.client_hash).not.toContain("127.0.0.1");
  expect(await count()).toBe(1);
});
test("idempotent retries and content duplicates recover one receipt without reusing Turnstile", async () => {
  let calls = 0;
  const fetcher = async () => {
    calls++;
    return accepted();
  };
  const input = body();
  const first = await (
    await call(request(input), { fetcher: fetcher as typeof fetch })
  ).json();
  const retry = await call(request(input), {
    fetcher: fetcher as typeof fetch,
  });
  expect(retry.status).toBe(200);
  expect((await retry.json()).reference).toBe(first.reference);
  const duplicate = await (
    await call(request({ ...input, requestId: crypto.randomUUID() }), {
      fetcher: fetcher as typeof fetch,
    })
  ).json();
  expect(duplicate.reference).toBe(first.reference);
  expect(calls).toBe(1);
  expect(await count()).toBe(1);
});
test("reusing a request ID for different data is rejected without revealing the receipt", async () => {
  const input = body();
  await call(request(input));
  const response = await call(
    request({
      ...input,
      requirements: { ...input.requirements, fullName: "Different Person" },
    }),
  );
  expect(response.status).toBe(409);
  expect(await response.json()).not.toHaveProperty("reference");
  expect(await count()).toBe(1);
});
test("concurrent content duplicates atomically store only one enquiry", async () => {
  const input = body();
  const responses = await Promise.all(
    Array.from({ length: 8 }, () =>
      call(request({ ...input, requestId: crypto.randomUUID() })),
    ),
  );
  const outputs = await Promise.all(
    responses.map((response) => response.json()),
  );
  expect(responses.every((response) => response.ok)).toBe(true);
  expect(new Set(outputs.map((output) => output.reference)).size).toBe(1);
  expect(await count()).toBe(1);
});
test("hourly accepted-enquiry quota cannot be bypassed by concurrent submissions", async () => {
  const responses = await Promise.all(
    Array.from({ length: 7 }, (_, index) =>
      call(
        request({
          ...body(),
          requirements: {
            ...requirements(),
            specialInstructions: `Different request ${index}`,
          },
        }),
      ),
    ),
  );
  expect(responses.filter((response) => response.status === 201)).toHaveLength(
    5,
  );
  expect(responses.filter((response) => response.status === 429)).toHaveLength(
    2,
  );
  expect(await count()).toBe(5);
});
test("attempt limits are durable, include rejected tokens, and expire by window", async () => {
  const denied = async () =>
    Response.json({
      success: false,
      "error-codes": ["invalid-input-response"],
    });
  const now = Date.now();
  for (let i = 0; i < 20; i++)
    expect(
      (
        await call(request(), {
          fetcher: denied as typeof fetch,
          now: () => now,
        })
      ).status,
    ).toBe(400);
  const last = await call(request(), { now: () => now });
  expect(last.status).toBe(429);
  expect(Number(last.headers.get("Retry-After"))).toBeGreaterThan(0);
  expect(await count()).toBe(0);
  expect(
    (await call(request(), { now: () => now + 10 * 60 * 1000 })).status,
  ).toBe(201);
});
test("Turnstile rejects failures and token expiry and fails closed on provider/network errors", async () => {
  const scenarios: [unknown, number, string][] = [
    [
      { success: false, "error-codes": ["invalid-input-response"] },
      400,
      "VERIFICATION_FAILED",
    ],
    [
      { success: false, "error-codes": ["timeout-or-duplicate"] },
      400,
      "VERIFICATION_EXPIRED",
    ],
    [
      { success: false, "error-codes": ["invalid-input-secret"] },
      503,
      "VERIFICATION_UNAVAILABLE",
    ],
  ];
  for (const [result, status, code] of scenarios) {
    const response = await call(request(), {
      fetcher: (async () => Response.json(result)) as typeof fetch,
    });
    expect(response.status).toBe(status);
    expect((await response.json()).code).toBe(code);
  }
  expect(
    (
      await call(request(), {
        fetcher: (async () => {
          throw new Error("private network detail");
        }) as typeof fetch,
      })
    ).status,
  ).toBe(503);
  expect(await count()).toBe(0);
});
test("production verification enforces hostname, action and challenge freshness", async () => {
  const production = { ...env, APP_MODE: "production" };
  const verified = {
    success: true,
    hostname: "onlineinvites.in",
    action: "quote_request",
    challenge_ts: new Date().toISOString(),
  };
  const check = (result: unknown) =>
    verifyTurnstile(token, production, "onlineinvites.in", (async () =>
      Response.json(result)) as typeof fetch);
  expect(await check(verified)).toBe("verified");
  expect(await check({ ...verified, hostname: "evil.example" })).toBe(
    "rejected",
  );
  expect(await check({ ...verified, action: "other" })).toBe("rejected");
  expect(await check({ ...verified, challenge_ts: "2020-01-01" })).toBe(
    "expired",
  );
  expect(await check({ ...verified, success: "true" })).toBe("rejected");
  expect(
    await check({ ...verified, metadata: { result_with_testing_key: true } }),
  ).toBe("rejected");
});
test("database errors return safe failure without false success or private details", async () => {
  const broken = {
    ...env,
    DB: {
      prepare() {
        throw new Error("secret database path and credentials");
      },
    } as unknown as D1Database,
  };
  const response = await call(request(), { environment: broken });
  expect(response.status).toBe(503);
  const output = await response.text();
  expect(output).not.toContain("credentials");
  expect(output).not.toContain("path");
  expect(await count()).toBe(0);
});
test("write failure after verification keeps retry safe", async () => {
  const input = body();
  const broken = {
    ...env,
    DB: {
      prepare(sql: string) {
        if (sql.startsWith("INSERT INTO enquiries("))
          throw new Error("private write failure");
        return db.prepare(sql);
      },
    } as unknown as D1Database,
  };
  expect((await call(request(input), { environment: broken })).status).toBe(
    503,
  );
  expect(await count()).toBe(0);
  expect((await call(request(input))).status).toBe(201);
  expect(await count()).toBe(1);
});
test("email notification failure does not undo persistence and retries do not send duplicates", async () => {
  let sends = 0;
  const notifier = {
    configured: true,
    async notify() {
      sends++;
      throw new Error("private email failure");
    },
  };
  const input = body();
  const response = await call(request(input), { notifier });
  expect(response.status).toBe(201);
  expect(await count()).toBe(1);
  expect(
    (await db.prepare("SELECT notification_status FROM enquiries").first())!
      .notification_status,
  ).toBe("failed");
  await call(request(input), { notifier });
  expect(sends).toBe(1);
});
