import { getTemplate } from "../../data/templates";
import { eventTimestamp } from "../../data/demoEvent";

export interface RsvpDetails {
  templateId: string;
  fullName: string;
  email: string;
  attendance: "yes" | "no" | "";
  guests: string;
  message: string;
  privacyConsent: boolean;
}
export type RsvpErrors = Partial<Record<keyof RsvpDetails, string>>;
export function normalizeRsvp(data: RsvpDetails): RsvpDetails {
  // Keep a canonical property order so reordered JSON keys recover the same retry.
  return {
    templateId: data.templateId,
    fullName: data.fullName.normalize("NFC").trim().replace(/\s+/g, " "),
    email: data.email.normalize("NFC").trim().toLowerCase(),
    attendance: data.attendance,
    guests: data.attendance === "no" ? "0" : data.guests,
    message: data.message.normalize("NFC").trim(),
    privacyConsent: data.privacyConsent,
  };
}
export function validateRsvp(data: RsvpDetails, now = Date.now()): RsvpErrors {
  const errors: RsvpErrors = {};
  const template = getTemplate(data.templateId);
  if (!template) errors.templateId = "Choose an invitation from the gallery.";
  else if (eventTimestamp(template.date, template.time) <= now) errors.templateId = "RSVP has closed because this sample event has started.";
  if (data.fullName.trim().length < 2 || data.fullName.length > 100) errors.fullName = "Enter a name between 2 and 100 characters.";
  if (data.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) errors.email = "Enter a valid email address.";
  if (!["yes", "no"].includes(data.attendance)) errors.attendance = "Please choose whether you can attend.";
  if (data.attendance === "yes" && (!/^\d{1,2}$/.test(data.guests) || Number(data.guests) < 1 || Number(data.guests) > 10)) errors.guests = "Choose 1–10 guests, including yourself.";
  if (data.message.length > 500) errors.message = "Please use 500 characters or fewer.";
  if (!data.privacyConsent) errors.privacyConsent = "Please confirm your consent.";
  return errors;
}
