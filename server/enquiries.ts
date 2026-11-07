import { json, runtimeConfig, type Env } from "./types";
import { keyedHash, parseSubmission, readLimitedJson } from "./validation";
import { verifyTurnstile } from "./turnstile";
import {
  noEmailProvider,
  notifyStoredEnquiry,
  type EnquiryNotifier,
} from "./notifications";
interface Receipt {
  id: string;
  payload_hash: string;
  client_hash: string;
}
interface Dependencies {
  fetcher?: typeof fetch;
  notifier?: EnquiryNotifier;
  now?: () => number;
}
const attemptWindow = 10 * 60 * 1000;
function failure(
  status: number,
  code: string,
  message: string,
  extra: Record<string, unknown> = {},
  headers: Record<string, string> = {},
) {
  return json({ ok: false, code, message, ...extra }, status, headers);
}
const success = (id: string, mode: string, duplicate = false) =>
  json({ ok: true, reference: id, mode, duplicate }, duplicate ? 200 : 201);
export async function handleEnquiry(
  request: Request,
  env: Env,
  waitUntil: (task: Promise<unknown>) => void = () => {},
  deps: Dependencies = {},
) {
  if (request.method !== "POST")
    return failure(
      405,
      "METHOD_NOT_ALLOWED",
      "Use POST to submit an enquiry.",
      {},
      { Allow: "POST" },
    );
  const url = new URL(request.url);
  const config = runtimeConfig(env, url);
  if (!config.available)
    return failure(
      503,
      "SUBMISSIONS_UNAVAILABLE",
      "Enquiry submission is not available. Your details have not been sent.",
    );
  if (
    request.headers.get("Origin") !== url.origin ||
    request.headers.get("Sec-Fetch-Site") === "cross-site"
  )
    return failure(
      403,
      "ORIGIN_REJECTED",
      "Submit the form from this website.",
    );
  if (
    request.headers.get("Content-Type")?.split(";")[0].trim().toLowerCase() !==
    "application/json"
  )
    return failure(415, "CONTENT_TYPE", "Send JSON requirements.");
  if (Number(request.headers.get("Content-Length") ?? 0) > 32768)
    return failure(
      413,
      "REQUEST_TOO_LARGE",
      "The requirements are too large. Shorten the instructions and try again.",
    );
  const now = deps.now?.() ?? Date.now();
  try {
    const clientHash = await keyedHash(
      `client:${request.headers.get("CF-Connecting-IP") ?? "unknown"}`,
      env.RATE_LIMIT_SALT!,
    );
    const windowStart = Math.floor(now / attemptWindow) * attemptWindow;
    const attempts = await env.DB.prepare(
      `INSERT INTO enquiry_attempts(client_hash,window_start,hits,expires_at) VALUES(?,?,1,?) ON CONFLICT(client_hash,window_start) DO UPDATE SET hits=hits+1 RETURNING hits`,
    )
      .bind(clientHash, windowStart, windowStart + attemptWindow)
      .first<{ hits: number }>();
    if (!attempts || attempts.hits > 20)
      return failure(
        429,
        "RATE_LIMITED",
        "Too many attempts. Please wait before trying again.",
        {},
        {
          "Retry-After": String(
            Math.max(1, Math.ceil((windowStart + attemptWindow - now) / 1000)),
          ),
        },
      );
    let body: unknown;
    try {
      body = await readLimitedJson(request);
    } catch (error) {
      return error instanceof Error && error.message === "BODY_TOO_LARGE"
        ? failure(413, "REQUEST_TOO_LARGE", "The requirements are too large.")
        : failure(
            400,
            "INVALID_JSON",
            "The request could not be read. Please try again.",
          );
    }
    const parsed = parseSubmission(body);
    if (!parsed.data)
      return failure(
        400,
        "VALIDATION_FAILED",
        parsed.message ?? "Please review the highlighted requirements.",
        parsed.errors ? { errors: parsed.errors } : {},
      );
    const { requirements: data, requestId, turnstileToken } = parsed.data;
    const payloadHash = await keyedHash(
      `requirements:${JSON.stringify(data)}`,
      env.RATE_LIMIT_SALT!,
    );
    const findRequest = () =>
      env.DB.prepare(
        "SELECT id,payload_hash,client_hash FROM enquiries WHERE request_id = ?",
      )
        .bind(requestId)
        .first<Receipt>();
    const findDuplicate = () =>
      env.DB.prepare(
        "SELECT id,payload_hash,client_hash FROM enquiries WHERE client_hash = ? AND payload_hash = ? AND created_at >= ? ORDER BY created_at DESC LIMIT 1",
      )
        .bind(clientHash, payloadHash, now - attemptWindow)
        .first<Receipt>();
    const existing = await findRequest();
    if (existing)
      return existing.payload_hash === payloadHash &&
        existing.client_hash === clientHash
        ? success(existing.id, config.mode, true)
        : failure(
            409,
            "REQUEST_CONFLICT",
            "This request has changed. Please review your details and try again.",
          );
    const duplicate = await findDuplicate();
    if (duplicate) return success(duplicate.id, config.mode, true);
    const verified = await verifyTurnstile(
      turnstileToken,
      env,
      url.hostname,
      deps.fetcher,
    );
    if (verified !== "verified")
      return verified === "unavailable"
        ? failure(
            503,
            "VERIFICATION_UNAVAILABLE",
            "Spam verification is temporarily unavailable. Your details are still here; please try again.",
          )
        : failure(
            400,
            verified === "expired"
              ? "VERIFICATION_EXPIRED"
              : "VERIFICATION_FAILED",
            "Complete spam verification again, then retry.",
          );
    const reference = `OI-${crypto.randomUUID().toUpperCase()}`;
    const notifier = deps.notifier ?? noEmailProvider;
    const columns = [
      "id",
      "request_id",
      "payload_hash",
      "client_hash",
      "customer_name",
      "email",
      "whatsapp",
      "contact_method",
      "occasion",
      "event_date",
      "publication_date",
      "selected_template",
      "package_preference",
      "design_type",
      "color_preferences",
      "language_preferences",
      "requested_features",
      "hosting_type",
      "hosting_days",
      "custom_domain",
      "special_requests",
      "requirements_json",
      "privacy_consent",
      "consent_version",
      "notification_status",
      "created_at",
      "updated_at",
    ];
    const values = [
      reference,
      requestId,
      payloadHash,
      clientHash,
      data.fullName,
      data.email,
      data.whatsapp || null,
      data.contactMethod,
      data.occasion,
      data.eventDate,
      data.publicationDate,
      data.selectedTemplate || null,
      data.packagePreference || null,
      data.designType,
      data.colorPreferences || null,
      JSON.stringify(data.languages),
      JSON.stringify(data.features),
      data.hostingType,
      Number(data.hostingDays),
      data.customDomain || data.subdomain || null,
      data.specialInstructions || null,
      JSON.stringify(data),
      1,
      config.mode === "local" ? "local-test-consent-v1" : "privacy-v1",
      notifier.configured ? "pending" : "not_configured",
      now,
      now,
    ];
    // One guarded INSERT is atomic in SQLite/D1: concurrent requests cannot bypass duplicate or hourly quota checks.
    const result = await env.DB.prepare(
      `INSERT INTO enquiries(${columns.join(",")}) SELECT ${values.map(() => "?").join(",")} WHERE NOT EXISTS(SELECT 1 FROM enquiries WHERE request_id = ?) AND NOT EXISTS(SELECT 1 FROM enquiries WHERE client_hash = ? AND payload_hash = ? AND created_at >= ?) AND (SELECT COUNT(*) FROM enquiries WHERE client_hash = ? AND created_at >= ?) < 5`,
    )
      .bind(
        ...values,
        requestId,
        clientHash,
        payloadHash,
        now - attemptWindow,
        clientHash,
        now - 60 * 60 * 1000,
      )
      .run();
    if (!result.success) throw new Error("STORAGE_FAILED");
    if (!result.meta.changes) {
      const requestRow = await findRequest();
      if (requestRow)
        return requestRow.payload_hash === payloadHash &&
          requestRow.client_hash === clientHash
          ? success(requestRow.id, config.mode, true)
          : failure(
              409,
              "REQUEST_CONFLICT",
              "This request has changed. Please review your details and try again.",
            );
      const recent = await findDuplicate();
      if (recent) return success(recent.id, config.mode, true);
      return failure(
        429,
        "RATE_LIMITED",
        "The enquiry limit has been reached. Please try again later.",
        {},
        { "Retry-After": "3600" },
      );
    }
    waitUntil(
      notifyStoredEnquiry(
        env.DB,
        { reference, occasion: data.occasion, createdAt: now },
        notifier,
      ),
    );
    waitUntil(
      env.DB.prepare(
        "DELETE FROM enquiry_attempts WHERE (client_hash,window_start) IN (SELECT client_hash,window_start FROM enquiry_attempts WHERE expires_at < ? LIMIT 100)",
      )
        .bind(now)
        .run()
        .catch(() => {
          console.error("enquiry_cleanup_failed");
        }),
    );
    return success(reference, config.mode);
  } catch {
    console.error("enquiry_request_failed");
    return failure(
      503,
      "STORAGE_UNAVAILABLE",
      "We could not save your enquiry. Your details are still here; please try again.",
    );
  }
}
