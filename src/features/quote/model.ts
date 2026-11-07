import { business } from "../../config/business";
import { getTemplate, occasions, templates } from "../../data/templates";

export const quoteSteps = [
  {
    title: "About you",
    subtitle: "A little introduction",
    description:
      "Tell us how to reach you when your personal quotation is ready.",
  },
  {
    title: "Your celebration",
    subtitle: "Every good story starts here",
    description: "Share the occasion, dates and languages that make it yours.",
  },
  {
    title: "Your design",
    subtitle: "Find your kind of beautiful",
    description:
      "Start with a demo, bring a new idea or leave a little room for us to guide you.",
  },
  {
    title: "The little extras",
    subtitle: "A touch more magic",
    description:
      "Choose what matters to your celebration. Every addition is reviewed in your quotation.",
  },
  {
    title: "A home for your invitation",
    subtitle: "Your link, your timeline",
    description:
      "Choose an address preference and how long you’d like your invitation online.",
  },
  {
    title: "Review your story",
    subtitle: "All the details, together",
    description:
      "Check your requirements before saving a copy. Live submission is not connected yet. You can check and save a local copy.",
  },
] as const;
export const languages = [
  "English",
  "Hindi",
  "Urdu",
  "Tamil",
  "Telugu",
  "Malayalam",
  "Kannada",
  "Marathi",
  "Bengali",
  "Gujarati",
  "Punjabi",
  "Other",
];
export const features = [
  "Background audio",
  "Photo gallery",
  "Countdown",
  "RSVP",
  "Multiple languages",
  "Multiple functions",
  "Additional animation",
  "Other custom requirements",
];
export const hostingTypes = [
  {
    value: "standard",
    label: "Standard invitation URL",
    detail: "A simple shareable invitation link, included with the design.",
  },
  {
    value: "subdomain",
    label: "Personalized subdomain",
    detail:
      "Request a name under onlineinvites.in. Availability and setup are reviewed.",
  },
  {
    value: "existing-domain",
    label: "My existing custom domain",
    detail:
      "You own the domain. DNS access, SSL and renewal responsibilities need review.",
  },
  {
    value: "new-domain",
    label: "Register a new custom domain",
    detail:
      "Tell us your preferred address. Registration, setup and renewals are quoted individually.",
  },
] as const;
export interface QuoteRequirements {
  fullName: string;
  email: string;
  whatsapp: string;
  contactMethod: "email" | "whatsapp";
  occasion: string;
  eventDate: string;
  publicationDate: string;
  languages: string[];
  otherLanguages: string;
  functionCount: string;
  selectedTemplate: string;
  packagePreference: string;
  designType: "template" | "custom";
  colorPreferences: string;
  hexColors: string;
  typography: string;
  animation: string;
  references: string;
  specialInstructions: string;
  features: string[];
  otherFeatures: string;
  hostingType: (typeof hostingTypes)[number]["value"];
  hostingDays: string;
  subdomain: string;
  customDomain: string;
  privacyConsent: boolean;
}
export type QuoteErrors = Partial<Record<keyof QuoteRequirements, string>>;
export function createRequirements(params: URLSearchParams): QuoteRequirements {
  const selected = getTemplate(params.get("template"));
  const requestedPackage = params.get("package");
  const packagePreference = ["basic", "premium", "custom"].includes(
    requestedPackage ?? "",
  )
    ? requestedPackage!
    : "";
  return {
    fullName: "",
    email: "",
    whatsapp: "",
    contactMethod: "email",
    occasion: selected?.category ?? "",
    eventDate: "",
    publicationDate: "",
    languages: ["English"],
    otherLanguages: "",
    functionCount: "1",
    selectedTemplate: selected?.id ?? "",
    packagePreference,
    designType: packagePreference === "custom" ? "custom" : "template",
    colorPreferences: "",
    hexColors: "",
    typography: "No preference — please guide me",
    animation: "Please recommend an approach",
    references: "",
    specialInstructions: "",
    features: [],
    otherFeatures: "",
    hostingType: "standard",
    hostingDays: String(business.includedHostingDays),
    subdomain: "",
    customDomain: "",
    privacyConsent: false,
  };
}
export function todayInIndia() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const part = (type: string) =>
    parts.find((value) => value.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}
export function isCalendarDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}
export function normalizeWhatsApp(value: string) {
  return value.replace(/[\s()-]/g, "");
}
function integer(value: string, min: number, max: number) {
  return (
    /^\d+$/.test(value) &&
    Number.isSafeInteger(Number(value)) &&
    Number(value) >= min &&
    Number(value) <= max
  );
}
export function calculateHosting(
  days: number,
  included = business.includedHostingDays,
  rate = business.hostingDailyRate,
) {
  if (
    !Number.isSafeInteger(days) ||
    days < 1 ||
    days > 3650 ||
    !Number.isSafeInteger(included) ||
    included < 0 ||
    !Number.isFinite(rate) ||
    rate < 0
  )
    return null;
  const extraDays = Math.max(0, days - included);
  return {
    days,
    includedDays: Math.min(days, included),
    extraDays,
    extraCost: Math.round(extraDays * rate * 100) / 100,
  };
}
export function estimateHosting(value: string) {
  return integer(value, 1, 3650) ? calculateHosting(Number(value)) : null;
}
export function isDomain(value: string) {
  const domain = value.trim().toLowerCase();
  return (
    domain.length <= 253 &&
    domain.includes(".") &&
    domain
      .split(".")
      .every((label) => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label)) &&
    /^[a-z]{2,63}$/.test(domain.split(".").slice(-1)[0] ?? "")
  );
}
export const stepFields: (keyof QuoteRequirements)[][] = [
  ["fullName", "email", "whatsapp", "contactMethod"],
  [
    "occasion",
    "eventDate",
    "publicationDate",
    "languages",
    "otherLanguages",
    "functionCount",
  ],
  [
    "selectedTemplate",
    "packagePreference",
    "designType",
    "colorPreferences",
    "hexColors",
    "typography",
    "animation",
    "references",
    "specialInstructions",
  ],
  ["features", "otherFeatures"],
  ["hostingType", "hostingDays", "subdomain", "customDomain"],
  ["privacyConsent"],
];
export function validateRequirements(
  data: QuoteRequirements,
  today = todayInIndia(),
): QuoteErrors {
  const errors: QuoteErrors = {};
  const required = (key: keyof QuoteRequirements, message: string) => {
    if (!String(data[key]).trim()) errors[key] = message;
  };
  const length = (key: keyof QuoteRequirements, max: number) => {
    if (String(data[key]).length > max)
      errors[key] =
        `Please use ${max.toLocaleString("en-IN")} characters or fewer.`;
  };
  required("fullName", "Please enter your full name.");
  if (data.fullName.trim() && data.fullName.trim().length < 2)
    errors.fullName = "Please enter at least two characters.";
  length("fullName", 100);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim()))
    errors.email = "Please enter a valid email address.";
  length("email", 254);
  if (!["email", "whatsapp"].includes(data.contactMethod))
    errors.contactMethod = "Choose how you’d like us to contact you.";
  if (
    data.whatsapp.trim() &&
    !/^\+[1-9]\d{7,14}$/.test(normalizeWhatsApp(data.whatsapp))
  )
    errors.whatsapp =
      "Include a country code and 8–15 digits, for example +91 98765 43210.";
  if (data.contactMethod === "whatsapp" && !data.whatsapp.trim())
    errors.whatsapp =
      "Add a WhatsApp number or choose email as your contact method.";
  length("whatsapp", 30);
  if (!occasions.some((occasion) => occasion === data.occasion))
    errors.occasion = "Please choose an occasion.";
  for (const key of ["eventDate", "publicationDate"] as const) {
    if (!isCalendarDate(data[key])) errors[key] = "Please choose a valid date.";
    else if (data[key] < today)
      errors[key] = "Please choose today or a future date.";
  }
  if (
    !errors.eventDate &&
    !errors.publicationDate &&
    data.publicationDate > data.eventDate
  )
    errors.publicationDate =
      "Publication must be on or before your event date.";
  if (
    !data.languages.length ||
    data.languages.some((value) => !languages.includes(value))
  )
    errors.languages = "Choose at least one language.";
  if (data.languages.includes("Other"))
    required("otherLanguages", "Tell us which other languages you’d like.");
  length("otherLanguages", 200);
  if (!integer(data.functionCount, 1, 50))
    errors.functionCount = "Enter a whole number between 1 and 50.";
  if (data.selectedTemplate && !getTemplate(data.selectedTemplate))
    errors.selectedTemplate =
      "Choose an available demo or select “Help me choose”.";
  if (!["", "basic", "premium", "custom"].includes(data.packagePreference))
    errors.packagePreference = "Choose an available package preference.";
  if (!["template", "custom"].includes(data.designType))
    errors.designType = "Choose a template-based or custom design.";
  length("colorPreferences", 250);
  length("hexColors", 100);
  if (
    data.hexColors.trim() &&
    !data.hexColors
      .trim()
      .split(/[\s,]+/)
      .every((color) => /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(color))
  )
    errors.hexColors =
      "Use hex colors like #194F3E or #D4B879, separated by commas or spaces.";
  length("typography", 250);
  length("animation", 500);
  length("references", 2000);
  length("specialInstructions", 3000);
  if (data.references.trim()) {
    const urls = data.references
      .split(/\r?\n/)
      .map((url) => url.trim())
      .filter(Boolean);
    if (urls.length > 5)
      errors.references = "Please add no more than five reference links.";
    else if (
      urls.some((value) => {
        try {
          const url = new URL(value);
          return (
            !["https:", "http:"].includes(url.protocol) ||
            !url.hostname ||
            Boolean(url.username || url.password)
          );
        } catch {
          return true;
        }
      })
    )
      errors.references =
        "Add valid http:// or https:// links, one per line, without login details.";
  }
  if (data.features.some((feature) => !features.includes(feature)))
    errors.features = "Choose features from the available options.";
  if (data.features.includes("Other custom requirements"))
    required("otherFeatures", "Tell us about the other features you need.");
  length("otherFeatures", 1500);
  if (!hostingTypes.some((type) => type.value === data.hostingType))
    errors.hostingType = "Choose a hosting address preference.";
  if (!integer(data.hostingDays, 1, 3650))
    errors.hostingDays = "Enter a whole number of days between 1 and 3,650.";
  if (
    data.hostingType === "subdomain" &&
    !/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(
      data.subdomain.trim().toLowerCase(),
    )
  )
    errors.subdomain =
      "Use 1–63 letters, numbers or hyphens; start and end with a letter or number.";
  if (
    ["existing-domain", "new-domain"].includes(data.hostingType) &&
    !isDomain(data.customDomain)
  )
    errors.customDomain =
      "Enter a domain such as ourcelebration.in, without https://, paths or spaces.";
  if (!data.privacyConsent)
    errors.privacyConsent =
      "Please confirm your consent before checking the complete requirements.";
  return errors;
}
export function validateStep(
  data: QuoteRequirements,
  step: number,
  today = todayInIndia(),
): QuoteErrors {
  const all = validateRequirements(data, today);
  return Object.fromEntries(
    Object.entries(all).filter(([key]) =>
      stepFields[step]?.includes(key as keyof QuoteRequirements),
    ),
  );
}
export function requirementsExport(data: QuoteRequirements) {
  const selected = getTemplate(data.selectedTemplate);
  return {
    formatVersion: 1,
    status: "local-requirements-draft",
    notice:
      "Not submitted. No enquiry reference or confirmed quotation has been issued.",
    requirements: {
      ...data,
      fullName: data.fullName.trim(),
      email: data.email.trim(),
      whatsapp: normalizeWhatsApp(data.whatsapp),
      otherLanguages: data.languages.includes("Other")
        ? data.otherLanguages.trim()
        : "",
      otherFeatures: data.features.includes("Other custom requirements")
        ? data.otherFeatures.trim()
        : "",
      subdomain:
        data.hostingType === "subdomain"
          ? data.subdomain.trim().toLowerCase()
          : "",
      customDomain: ["existing-domain", "new-domain"].includes(data.hostingType)
        ? data.customDomain.trim().toLowerCase()
        : "",
    },
    selectedDesignName: selected?.name ?? "Help me choose",
    hostingEstimate: estimateHosting(data.hostingDays),
    hostingRate: business.hostingDailyRate,
    pricingNote:
      "Additional hosting only. Design, features and domain costs require an individual quotation.",
  };
}
export { templates };
