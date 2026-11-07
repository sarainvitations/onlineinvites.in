import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Pencil, ShieldCheck } from "lucide-react";
import { business, packages, rupees } from "../../config/business";
import { formatEventDate, getTemplate } from "../../data/templates";
import {
  estimateHosting,
  hostingTypes,
  isCalendarDate,
  normalizeWhatsApp,
} from "./model";
import type { StepProps } from "./Fields";
function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="review-row">
      <dt>{label}</dt>
      <dd>{children || "Not specified"}</dd>
    </div>
  );
}
function Section({
  title,
  step,
  edit,
  children,
}: {
  title: string;
  step: number;
  edit: (step: number) => void;
  children: ReactNode;
}) {
  return (
    <section className="review-section">
      <div>
        <h3>{title}</h3>
        <button
          type="button"
          onClick={() => edit(step)}
          aria-label={`Edit ${title.toLowerCase()}`}
        >
          <Pencil size={13} />
          Edit
        </button>
      </div>
      <dl>{children}</dl>
    </section>
  );
}
export function ReviewStep({
  data,
  errors,
  change,
  edit,
  mode = "preview",
}: {
  edit: (step: number) => void;
  mode?: "preview" | "local" | "production";
} & StepProps) {
  const selected = getTemplate(data.selectedTemplate);
  const estimate = estimateHosting(data.hostingDays);
  const date = (value: string) =>
    isCalendarDate(value) ? formatEventDate(value) : "Not specified";
  return (
    <>
      <Section title="Contact details" step={0} edit={edit}>
        <Row label="Full name">{data.fullName}</Row>
        <Row label="Email">{data.email}</Row>
        <Row label="WhatsApp">
          {normalizeWhatsApp(data.whatsapp) || "Not provided"}
        </Row>
        <Row label="Preferred contact">
          {data.contactMethod === "email" ? "Email" : "WhatsApp"}
        </Row>
      </Section>
      <Section title="Event details" step={1} edit={edit}>
        <Row label="Occasion">{data.occasion}</Row>
        <Row label="Event date">{date(data.eventDate)}</Row>
        <Row label="Publication date">{date(data.publicationDate)}</Row>
        <Row label="Languages">
          {data.languages
            .map((language) =>
              language === "Other" ? data.otherLanguages : language,
            )
            .join(", ")}
        </Row>
        <Row label="Number of functions">{data.functionCount}</Row>
      </Section>
      <Section title="Design preferences" step={2} edit={edit}>
        <Row label="Design approach">
          {data.designType === "custom"
            ? "Bespoke design"
            : "Template-based design"}
        </Row>
        <Row label="Selected demo">
          {selected?.name ?? "Please help me choose"}
        </Row>
        <Row label="Package preference">
          {packages.find(
            (plan) => plan.name.toLowerCase() === data.packagePreference,
          )?.name ?? "Please recommend a package"}
        </Row>
        <Row label="Colors">{data.colorPreferences}</Row>
        <Row label="Hex values">{data.hexColors}</Row>
        <Row label="Typography">{data.typography}</Row>
        <Row label="Animation">{data.animation}</Row>
        <Row label="Reference links">
          {data.references || "No reference links"}
        </Row>
        <Row label="Special instructions">{data.specialInstructions}</Row>
      </Section>
      <Section title="Additional features" step={3} edit={edit}>
        <Row label="Requested features">
          {data.features.join(", ") || "None selected"}
        </Row>
        {data.features.includes("Other custom requirements") && (
          <Row label="Other requirements">{data.otherFeatures}</Row>
        )}
      </Section>
      <Section title="Hosting preferences" step={4} edit={edit}>
        <Row label="Address type">
          {hostingTypes.find((type) => type.value === data.hostingType)?.label}
        </Row>
        {data.hostingType === "subdomain" && (
          <Row label="Requested address">
            {data.subdomain.trim().toLowerCase()}.onlineinvites.in
          </Row>
        )}
        {["existing-domain", "new-domain"].includes(data.hostingType) && (
          <Row label="Requested domain">
            {data.customDomain.trim().toLowerCase()}
          </Row>
        )}
        <Row label="Hosting duration">{data.hostingDays} days</Row>
        <Row label="Additional hosting">
          {estimate
            ? `${rupees(estimate.extraCost)} (${estimate.extraDays} extra days × ${rupees(business.hostingDailyRate)}/day)`
            : "Enter a valid duration"}
        </Row>
      </Section>
      <div className="review-pricing-note">
        <strong>This is a requirements summary, not a final quotation.</strong>
        <p>
          Design, features, domains and any setup costs are reviewed
          individually. No payment is collected here. Your requested dates and
          scope need confirmation.
        </p>
      </div>
      <div className="consent-field">
        <label>
          <input
            id="quote-privacyConsent"
            name="privacyConsent"
            type="checkbox"
            checked={data.privacyConsent}
            onChange={(event) => change("privacyConsent", event.target.checked)}
            aria-invalid={Boolean(errors.privacyConsent)}
            aria-describedby={
              errors.privacyConsent
                ? "quote-privacyConsent-error quote-consent-note"
                : "quote-consent-note"
            }
          />
          <span>
            {mode === "local"
              ? "I agree to save these sample details in the local development database for testing."
              : mode === "production"
                ? "I consent to the use of my details to prepare and discuss my quotation."
                : "I consent to the use of my details to prepare and discuss my quotation when secure submission becomes available."}
          </span>
        </label>
        <p id="quote-consent-note">
          {mode === "preview"
            ? "This preview keeps your entries in this page only. The "
            : mode === "local"
              ? "This test saves sample details on this Mac only. The "
              : "Your details are stored to respond to your request. Read our "}
          <Link
            to="/policies/privacy"
            target="_blank"
            rel="noopener noreferrer"
          >
            privacy policy
          </Link>
          .{" "}
          {mode === "preview"
            ? "You may download your own copy; nothing is sent to us."
            : "You may download a copy for your records after submission."}
        </p>
        {errors.privacyConsent && (
          <p className="field-error" id="quote-privacyConsent-error">
            {errors.privacyConsent}
          </p>
        )}
      </div>
      <div className="quote-verification-note">
        <ShieldCheck size={20} />
        <div>
          <strong>
            {mode === "preview"
              ? "Secure submission is not connected here."
              : mode === "local"
                ? "Local development submission."
                : "Secure enquiry submission."}
          </strong>
          <p>
            {mode === "preview"
              ? "Checking this form validates your entries locally; it does not submit an enquiry or issue a reference."
              : mode === "local"
                ? "A successful test stores your sample details only in the database on this Mac and returns a test reference. No email is sent."
                : "Your enquiry reference appears only after your requirements have been saved successfully. No payment is collected."}
          </p>
        </div>
      </div>
    </>
  );
}
