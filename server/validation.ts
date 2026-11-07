import {
  createRequirements,
  validateRequirements,
  type QuoteRequirements,
} from "../src/features/quote/model";
const stringLimits: Record<string, number> = {
  fullName: 100,
  email: 254,
  whatsapp: 30,
  contactMethod: 15,
  occasion: 60,
  eventDate: 10,
  publicationDate: 10,
  otherLanguages: 200,
  functionCount: 3,
  selectedTemplate: 80,
  packagePreference: 20,
  designType: 20,
  colorPreferences: 250,
  hexColors: 100,
  typography: 250,
  animation: 500,
  references: 2000,
  specialInstructions: 3000,
  otherFeatures: 1500,
  hostingType: 30,
  hostingDays: 4,
  subdomain: 63,
  customDomain: 253,
};
export interface Submission {
  requestId: string;
  turnstileToken: string;
  requirements: QuoteRequirements;
}
export function parseSubmission(value: unknown): {
  data?: Submission;
  errors?: Record<string, string>;
  message?: string;
} {
  if (!value || typeof value !== "object" || Array.isArray(value))
    return { message: "Send a JSON object." };
  const object = value as Record<string, unknown>;
  if (
    Object.keys(object).some(
      (key) => !["requestId", "turnstileToken", "requirements"].includes(key),
    )
  )
    return { message: "Unexpected submission fields." };
  if (
    typeof object.requestId !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      object.requestId,
    )
  )
    return { message: "A valid request identifier is required." };
  if (
    typeof object.turnstileToken !== "string" ||
    !object.turnstileToken.trim() ||
    object.turnstileToken.length > 2048
  )
    return { message: "Complete the spam verification." };
  if (
    !object.requirements ||
    typeof object.requirements !== "object" ||
    Array.isArray(object.requirements)
  )
    return { message: "Requirements must be an object." };
  const raw = object.requirements as Record<string, unknown>;
  const normalized: Record<string, unknown> = {};
  const permitted = [
    ...Object.keys(stringLimits),
    "languages",
    "features",
    "privacyConsent",
  ];
  if (Object.keys(raw).some((key) => !permitted.includes(key)))
    return { message: "Unexpected requirement fields." };
  for (const [key, max] of Object.entries(stringLimits)) {
    if (
      typeof raw[key] !== "string" ||
      raw[key].length > max ||
      /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(raw[key] as string)
    )
      return { message: `Invalid ${key} field.` };
    normalized[key] = (raw[key] as string)
      .normalize("NFC")
      .replace(/\r\n/g, "\n")
      .trim();
    if (
      ![
        "references",
        "animation",
        "specialInstructions",
        "otherFeatures",
      ].includes(key)
    )
      normalized[key] = (normalized[key] as string).replace(/\s+/g, " ");
  }
  for (const key of ["languages", "features"]) {
    if (
      !Array.isArray(raw[key]) ||
      raw[key].length > 20 ||
      (raw[key] as unknown[]).some(
        (item) => typeof item !== "string" || item.length > 100,
      )
    )
      return { message: `Invalid ${key} field.` };
    normalized[key] = [
      ...new Set(
        (raw[key] as string[]).map((item) => item.normalize("NFC").trim()),
      ),
    ].sort();
  }
  if (raw.privacyConsent !== true)
    return {
      errors: { privacyConsent: "Please confirm your privacy consent." },
    };
  normalized.privacyConsent = true;
  normalized.email = (normalized.email as string).toLowerCase();
  normalized.whatsapp = (normalized.whatsapp as string).replace(/[\s()-]/g, "");
  normalized.customDomain = (normalized.customDomain as string).toLowerCase();
  normalized.subdomain = (normalized.subdomain as string).toLowerCase();
  const data = {
    ...createRequirements(new URLSearchParams()),
    ...normalized,
  } as QuoteRequirements;
  const errors = validateRequirements(data);
  if (Object.keys(errors).length) return { errors };
  if (!data.languages.includes("Other")) data.otherLanguages = "";
  if (!data.features.includes("Other custom requirements"))
    data.otherFeatures = "";
  if (data.hostingType !== "subdomain") data.subdomain = "";
  if (!["new-domain", "existing-domain"].includes(data.hostingType))
    data.customDomain = "";
  return {
    data: {
      requestId: object.requestId.toLowerCase(),
      turnstileToken: object.turnstileToken.trim(),
      requirements: data,
    },
  };
}
export async function readLimitedJson(
  request: Request,
  limit = 32768,
): Promise<unknown> {
  if (Number(request.headers.get("Content-Length") ?? 0) > limit)
    throw new Error("BODY_TOO_LARGE");
  const reader = request.body?.getReader();
  if (!reader) throw new Error("INVALID_JSON");
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) {
        await reader.cancel();
        throw new Error("BODY_TOO_LARGE");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const buffer = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    buffer.set(chunk, offset);
    offset += chunk.byteLength;
  }
  try {
    return JSON.parse(
      new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(buffer),
    );
  } catch {
    throw new Error("INVALID_JSON");
  }
}
export async function keyedHash(value: string, salt: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(salt),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(value),
  );
  return [...new Uint8Array(signature)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
