import type { Env } from "./types";
export type Verification = "verified" | "expired" | "rejected" | "unavailable";
export async function verifyTurnstile(
  token: string,
  env: Env,
  hostname: string,
  fetcher: typeof fetch = fetch,
  action = "quote_request",
): Promise<Verification> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetcher(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secret: env.TURNSTILE_SECRET_KEY,
          response: token,
          idempotency_key: crypto.randomUUID(),
        }),
        signal: controller.signal,
      },
    );
    if (!response.ok) return "unavailable";
    const result = (await response.json()) as Record<string, unknown>;
    if (!result || typeof result !== "object") return "unavailable";
    if (result.success !== true) {
      const codes = Array.isArray(result["error-codes"])
        ? result["error-codes"]
        : [];
      if (
        codes.includes("missing-input-secret") ||
        codes.includes("invalid-input-secret") ||
        codes.includes("internal-error")
      )
        return "unavailable";
      return codes.includes("timeout-or-duplicate") ? "expired" : "rejected";
    }
    const metadata = result.metadata as
      { result_with_testing_key?: boolean } | undefined;
    if (env.APP_MODE === "local")
      return /^[123]x0{10,}/.test(env.TURNSTILE_SECRET_KEY ?? "") &&
        metadata?.result_with_testing_key === true
        ? "verified"
        : "rejected";
    if (metadata?.result_with_testing_key === true) return "rejected";
    if (result.hostname !== hostname || result.action !== action)
      return "rejected";
    const time =
      typeof result.challenge_ts === "string"
        ? Date.parse(result.challenge_ts)
        : NaN;
    const age = Date.now() - time;
    return Number.isFinite(age) && age >= -30000 && age <= 300000
      ? "verified"
      : "expired";
  } catch {
    return "unavailable";
  } finally {
    clearTimeout(timer);
  }
}
