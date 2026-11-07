import { test, expect } from "@playwright/test";
import {
  createRequirements,
  validateRequirements,
  validateStep,
  calculateHosting,
  estimateHosting,
  isCalendarDate,
  isDomain,
  normalizeWhatsApp,
  requirementsExport,
} from "../src/features/quote/model";
const today = "2026-10-31";
function valid() {
  return {
    ...createRequirements(new URLSearchParams()),
    fullName: "Ananya Rao",
    email: "ananya@example.com",
    occasion: "Wedding",
    eventDate: "2027-12-18",
    publicationDate: "2027-12-01",
    privacyConsent: true,
  };
}
test("complete valid requirements and Unicode names pass", () => {
  expect(validateRequirements(valid(), today)).toEqual({});
  expect(
    validateRequirements({ ...valid(), fullName: "अनन्या राव" }, today),
  ).toEqual({});
});
test("required fields and step-scoped validation", () => {
  const empty = createRequirements(new URLSearchParams());
  expect(Object.keys(validateStep(empty, 0, today))).toEqual([
    "fullName",
    "email",
  ]);
  expect(validateStep(empty, 1, today)).toMatchObject({
    occasion: expect.any(String),
    eventDate: expect.any(String),
    publicationDate: expect.any(String),
  });
  expect(validateStep(empty, 3, today)).toEqual({});
  expect(validateStep(empty, 5, today)).toHaveProperty("privacyConsent");
});
test("email whitespace normalization, syntax and lengths", () => {
  expect(
    validateStep({ ...valid(), email: "  ananya@example.com  " }, 0, today),
  ).toEqual({});
  for (const email of ["missing-domain", "a@b", "a @example.com"])
    expect(validateStep({ ...valid(), email }, 0, today)).toHaveProperty(
      "email",
    );
  expect(
    validateStep({ ...valid(), fullName: "x".repeat(101) }, 0, today),
  ).toHaveProperty("fullName");
});
test("WhatsApp is optional for email, required for WhatsApp, and accepts country codes only", () => {
  expect(validateStep(valid(), 0, today)).toEqual({});
  expect(
    validateStep({ ...valid(), contactMethod: "whatsapp" }, 0, today),
  ).toHaveProperty("whatsapp");
  expect(
    validateStep(
      { ...valid(), contactMethod: "whatsapp", whatsapp: "+91 (98765) 43210" },
      0,
      today,
    ),
  ).toEqual({});
  expect(normalizeWhatsApp("+91 (98765) 43210")).toBe("+919876543210");
  for (const whatsapp of [
    "9876543210",
    "+01234567890",
    "+91text1234",
    "+1234567890123456",
  ])
    expect(validateStep({ ...valid(), whatsapp }, 0, today)).toHaveProperty(
      "whatsapp",
    );
});
test("calendar validation rejects impossible dates and understands leap years", () => {
  expect(isCalendarDate("2028-02-29")).toBe(true);
  for (const date of [
    "2027-02-29",
    "2027-02-30",
    "2027-13-01",
    "2027-1-2",
    "bad-date",
  ])
    expect(isCalendarDate(date)).toBe(false);
});
test("dates reject the past and publication after the event; same-day is allowed", () => {
  expect(
    validateStep({ ...valid(), publicationDate: "2027-12-19" }, 1, today),
  ).toHaveProperty("publicationDate");
  expect(
    validateStep({ ...valid(), eventDate: "2026-10-30" }, 1, today),
  ).toHaveProperty("eventDate");
  expect(
    validateStep(
      { ...valid(), eventDate: today, publicationDate: today },
      1,
      today,
    ),
  ).toEqual({});
});
test("language, other language and function-count boundaries", () => {
  expect(validateStep({ ...valid(), languages: [] }, 1, today)).toHaveProperty(
    "languages",
  );
  expect(
    validateStep({ ...valid(), languages: ["Other"] }, 1, today),
  ).toHaveProperty("otherLanguages");
  expect(
    validateStep(
      { ...valid(), languages: ["Other"], otherLanguages: "French" },
      1,
      today,
    ),
  ).toEqual({});
  for (const functionCount of ["0", "1.5", "51", "1e1"])
    expect(
      validateStep({ ...valid(), functionCount }, 1, today),
    ).toHaveProperty("functionCount");
});
test("hex colors allow short/long values and reject invalid colors", () => {
  expect(
    validateStep({ ...valid(), hexColors: "#abc, #D4B879" }, 2, today),
  ).toEqual({});
  for (const hexColors of ["red", "194F3E", "#12345", "#GGGGGG"])
    expect(validateStep({ ...valid(), hexColors }, 2, today)).toHaveProperty(
      "hexColors",
    );
});
test("reference links reject unsafe schemes, credentials and too many entries", () => {
  expect(
    validateStep(
      {
        ...valid(),
        references: "https://example.com/design\nhttp://example.org",
      },
      2,
      today,
    ),
  ).toEqual({});
  for (const references of [
    "javascript:alert(1)",
    "data:text/html,test",
    "https://user:password@example.com",
    Array(6).fill("https://example.com").join("\n"),
  ])
    expect(validateStep({ ...valid(), references }, 2, today)).toHaveProperty(
      "references",
    );
});
test("selected design/package prefills and unknown IDs are handled safely", () => {
  const prefill = createRequirements(
    new URLSearchParams("template=velvet-overture&package=custom"),
  );
  expect(prefill.selectedTemplate).toBe("velvet-overture");
  expect(prefill.occasion).toBe("Wedding");
  expect(prefill.designType).toBe("custom");
  const unknown = createRequirements(
    new URLSearchParams("template=unknown&package=unknown"),
  );
  expect(unknown.selectedTemplate).toBe("");
  expect(unknown.packagePreference).toBe("");
  expect(
    validateStep({ ...valid(), selectedTemplate: "missing" }, 2, today),
  ).toHaveProperty("selectedTemplate");
});
test("custom feature details are conditional and text lengths are bounded", () => {
  expect(
    validateStep(
      { ...valid(), features: ["Other custom requirements"] },
      3,
      today,
    ),
  ).toHaveProperty("otherFeatures");
  expect(
    validateStep({ ...valid(), otherFeatures: "x".repeat(1501) }, 3, today),
  ).toHaveProperty("otherFeatures");
});
test("hosting estimate boundaries use the configured included days and rate", () => {
  expect(calculateHosting(1)).toMatchObject({
    extraDays: 0,
    extraCost: 0,
    includedDays: 1,
  });
  expect(calculateHosting(30)).toMatchObject({ extraDays: 0, extraCost: 0 });
  expect(calculateHosting(31)).toMatchObject({ extraDays: 1, extraCost: 5 });
  expect(calculateHosting(45)).toMatchObject({ extraDays: 15, extraCost: 75 });
  expect(calculateHosting(45, 20, 12)).toMatchObject({
    extraDays: 25,
    extraCost: 300,
  });
  for (const days of [0, -1, 1.5, 3651, NaN, Infinity])
    expect(calculateHosting(days)).toBeNull();
  for (const input of ["", "1e2", "30.5", "0", "-5"])
    expect(estimateHosting(input)).toBeNull();
});
test("hosting domain/subdomain requests are validated conditionally", () => {
  expect(
    validateStep(
      { ...valid(), hostingType: "subdomain", subdomain: "our-day" },
      4,
      today,
    ),
  ).toEqual({});
  for (const subdomain of ["-our-day", "our-day-", "our.day", "with spaces"])
    expect(
      validateStep(
        { ...valid(), hostingType: "subdomain", subdomain },
        4,
        today,
      ),
    ).toHaveProperty("subdomain");
  expect(isDomain("ourday.co.in")).toBe(true);
  for (const domain of [
    "localhost",
    "https://ourday.in",
    "ourday.in/path",
    "-ourday.in",
    "ourday..in",
  ])
    expect(isDomain(domain)).toBe(false);
  expect(
    validateStep(
      {
        ...valid(),
        hostingType: "existing-domain",
        customDomain: " OURDAY.IN ",
      },
      4,
      today,
    ),
  ).toEqual({});
  expect(
    validateStep(
      { ...valid(), hostingType: "standard", customDomain: "not-a-domain" },
      4,
      today,
    ),
  ).toEqual({});
});
test("export is explicitly local, normalizes contact and clears inactive conditional fields", () => {
  const output = requirementsExport({
    ...valid(),
    email: " ananya@example.com ",
    whatsapp: "+91 98765 43210",
    otherLanguages: "French",
    otherFeatures: "Hidden value",
    subdomain: "old-address",
    customDomain: "old.in",
  });
  expect(output.status).toBe("local-requirements-draft");
  expect(output.requirements.email).toBe("ananya@example.com");
  expect(output.requirements.whatsapp).toBe("+919876543210");
  expect(output.requirements.customDomain).toBe("");
  expect(output.requirements.subdomain).toBe("");
  expect(output.requirements.otherLanguages).toBe("");
  expect(output.requirements.otherFeatures).toBe("");
  expect(output).not.toHaveProperty("id");
});
