import { securityHeaders } from "./security";
export interface Env {
  DB: D1Database;
  APP_MODE?: string;
  SUBMISSIONS_ENABLED?: string;
  POLICIES_APPROVED?: string;
  TURNSTILE_SITE_KEY?: string;
  TURNSTILE_SECRET_KEY?: string;
  RATE_LIMIT_SALT?: string;
  ALLOWED_HOSTNAMES?: string;
}
export interface RuntimeConfig {
  available: boolean;
  mode: "local" | "production" | "preview";
  siteKey?: string;
}
export function runtimeConfig(env: Env, url: URL): RuntimeConfig {
  const local = env.APP_MODE === "local";
  const production = env.APP_MODE === "production";
  const allowed = (env.ALLOWED_HOSTNAMES ?? "")
    .split(",")
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean);
  const testKey = (key: string) => /^[123]x0{10,}/.test(key);
  const enabled =
    env.SUBMISSIONS_ENABLED === "true" &&
    Boolean(env.DB) &&
    Boolean(env.TURNSTILE_SITE_KEY) &&
    Boolean(env.TURNSTILE_SECRET_KEY) &&
    (env.RATE_LIMIT_SALT?.length ?? 0) >= 32 &&
    allowed.includes(url.hostname.toLowerCase()) &&
    (local
      ? ["localhost", "127.0.0.1"].includes(url.hostname) &&
        testKey(env.TURNSTILE_SITE_KEY!) &&
        testKey(env.TURNSTILE_SECRET_KEY!)
      : production &&
        env.POLICIES_APPROVED === "true" &&
        url.protocol === "https:" &&
        !testKey(env.TURNSTILE_SITE_KEY!) &&
        !testKey(env.TURNSTILE_SECRET_KEY!) &&
        !env.TURNSTILE_SITE_KEY!.includes("REPLACE") &&
        !env.TURNSTILE_SECRET_KEY!.includes("REPLACE") &&
        !env.RATE_LIMIT_SALT!.includes("local-only") &&
        !env.RATE_LIMIT_SALT!.includes("REPLACE"));
  return enabled
    ? {
        available: true,
        mode: local ? "local" : "production",
        siteKey: env.TURNSTILE_SITE_KEY,
      }
    : { available: false, mode: "preview" };
}
export function json(
  body: unknown,
  status = 200,
  headers: Record<string, string> = {},
) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...securityHeaders,
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
      ...headers,
    },
  });
}
