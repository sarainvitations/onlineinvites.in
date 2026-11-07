import { getTemplate } from "../src/data/templates";
import { normalizeRsvp, validateRsvp, type RsvpDetails } from "../src/features/rsvp/model";
import { json, runtimeConfig, type Env } from "./types";
import { keyedHash, readLimitedJson } from "./validation";
import { verifyTurnstile } from "./turnstile";

const windowSize = 10 * 60 * 1000;
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
interface Stored { id: string; client_hash: string; payload_hash: string }
const fail = (status: number, message: string, errors?: unknown, retry?: string) => json({ ok: false, message, ...(errors ? { errors } : {}) }, status, retry ? { "Retry-After": retry } : {});
const receipt = (reference: string, mode: string, duplicate = false) => json({ ok: true, reference, mode, duplicate }, duplicate ? 200 : 201);

function parse(value: unknown): { requestId: string; token: string; details: RsvpDetails } | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return;
  const raw = value as Record<string, unknown>;
  if (Object.keys(raw).some((key) => !["requestId", "turnstileToken", "details"].includes(key))) return;
  if (typeof raw.requestId !== "string" || !uuid.test(raw.requestId) || typeof raw.turnstileToken !== "string" || !raw.turnstileToken.trim() || raw.turnstileToken.length > 2048) return;
  if (!raw.details || typeof raw.details !== "object" || Array.isArray(raw.details)) return;
  const details = raw.details as Record<string, unknown>;
  const limits: Record<string, number> = { templateId: 80, fullName: 100, email: 254, attendance: 3, guests: 2, message: 500 };
  if (Object.keys(details).some((key) => ![...Object.keys(limits), "privacyConsent"].includes(key))) return;
  for (const [key, max] of Object.entries(limits)) {
    if (typeof details[key] !== "string" || details[key].length > max || /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(details[key] as string)) return;
  }
  if (typeof details.privacyConsent !== "boolean") return;
  return { requestId: raw.requestId.toLowerCase(), token: raw.turnstileToken.trim(), details: normalizeRsvp(details as unknown as RsvpDetails) };
}

export async function handleRsvp(request: Request, env: Env, waitUntil: (task: Promise<unknown>) => void = () => {}, deps: { fetcher?: typeof fetch; now?: () => number } = {}) {
  if (request.method !== "POST") return json({ ok: false, message: "Use POST to send an RSVP." }, 405, { Allow: "POST" });
  const url = new URL(request.url);
  const config = runtimeConfig(env, url);
  if (!config.available) return fail(503, "RSVP storage is not connected here. Your response has not been sent.");
  if (request.headers.get("Origin") !== url.origin || request.headers.get("Sec-Fetch-Site") === "cross-site") return fail(403, "Send your RSVP from this website.");
  if (request.headers.get("Content-Type")?.split(";")[0].trim().toLowerCase() !== "application/json") return fail(415, "Send a JSON RSVP.");
  const now = deps.now?.() ?? Date.now();
  try {
    const client = await keyedHash(`rsvp-client:${request.headers.get("CF-Connecting-IP") ?? "unknown"}`, env.RATE_LIMIT_SALT!);
    const start = Math.floor(now / windowSize) * windowSize;
    const attempts = await env.DB.prepare("INSERT INTO rsvp_attempts(client_hash,window_start,hits,expires_at) VALUES(?,?,1,?) ON CONFLICT(client_hash,window_start) DO UPDATE SET hits=hits+1 RETURNING hits").bind(client, start, start + windowSize).first<{ hits: number }>();
    if (!attempts || attempts.hits > 20) return fail(429, "Too many attempts. Please wait before retrying.", undefined, String(Math.max(1, Math.ceil((start + windowSize - now) / 1000))));
    let value: unknown;
    try { value = await readLimitedJson(request, 8192); }
    catch (error) { return fail(error instanceof Error && error.message === "BODY_TOO_LARGE" ? 413 : 400, "The RSVP could not be read. Check its size and try again."); }
    const parsed = parse(value);
    if (!parsed) return fail(400, "Please review your RSVP details and verification.");
    const { details, requestId, token } = parsed;
    const errors = validateRsvp(details, now);
    if (Object.keys(errors).length) return fail(400, "Please review the highlighted details.", errors);
    const template = getTemplate(details.templateId)!;
    const payload = await keyedHash(`rsvp:${JSON.stringify(details)}`, env.RATE_LIMIT_SALT!);
    const findRequest = () => env.DB.prepare("SELECT id,client_hash,payload_hash FROM rsvps WHERE request_id = ?").bind(requestId).first<Stored>();
    const findDuplicate = () => env.DB.prepare("SELECT id,client_hash,payload_hash FROM rsvps WHERE client_hash = ? AND payload_hash = ? AND created_at >= ? ORDER BY created_at DESC LIMIT 1").bind(client, payload, now - windowSize).first<Stored>();
    const recover = (row: Stored) => row.client_hash === client && row.payload_hash === payload ? receipt(row.id, config.mode, true) : fail(409, "This response could not be confirmed. Review the details or contact the organizer.");
    const existing = await findRequest();
    if (existing) return recover(existing);
    const duplicate = await findDuplicate();
    if (duplicate) return recover(duplicate);
    const verified = await verifyTurnstile(token, env, url.hostname, deps.fetcher, "rsvp_response");
    if (verified !== "verified") return fail(verified === "unavailable" ? 503 : 400, "Complete spam verification again, then retry. Your response has not been confirmed.");
    const reference = `RSVP-${crypto.randomUUID().toUpperCase()}`;
    // Both quota and uniqueness are checked atomically. A later response cannot overwrite a guest.
    const result = await env.DB.prepare(`INSERT INTO rsvps(id,request_id,client_hash,payload_hash,template_id,event_date,full_name,email,attendance,guests,message,privacy_consent,consent_version,created_at)
      SELECT ?,?,?,?,?,?,?,?,?,?,?,?,?,? WHERE NOT EXISTS(SELECT 1 FROM rsvps WHERE template_id = ? AND event_date = ? AND email = ?)
      AND NOT EXISTS(SELECT 1 FROM rsvps WHERE request_id = ?)
      AND (SELECT COUNT(*) FROM rsvps WHERE client_hash = ? AND created_at >= ?) < 5`)
      .bind(reference, requestId, client, payload, template.id, template.date, details.fullName, details.email, details.attendance, Number(details.guests), details.message, 1, config.mode === "local" ? "local-rsvp-test-v1" : "rsvp-privacy-v1", now, template.id, template.date, details.email, requestId, client, now - 3600000).run();
    if (!result.success) throw new Error("rsvp_storage_failed");
    if (!result.meta.changes) {
      const matched = await findRequest() ?? await findDuplicate();
      if (matched) return recover(matched);
      const count = await env.DB.prepare("SELECT COUNT(*) AS count FROM rsvps WHERE client_hash = ? AND created_at >= ?").bind(client, now - 3600000).first<{ count: number }>();
      if ((count?.count ?? 0) >= 5) return fail(429, "The response limit has been reached. Please try later.", undefined, "3600");
      return fail(409, "An RSVP could not be added for these details. Contact the organizer to check or change a previous response.");
    }
    waitUntil(env.DB.prepare("DELETE FROM rsvp_attempts WHERE (client_hash,window_start) IN (SELECT client_hash,window_start FROM rsvp_attempts WHERE expires_at < ? LIMIT 100)").bind(now).run().catch(() => console.error("rsvp_cleanup_failed")));
    return receipt(reference, config.mode);
  } catch {
    console.error("rsvp_request_failed");
    return fail(503, "We could not confirm your RSVP. Your entries are still here. Retry with the same details to recover a saved response safely.");
  }
}
