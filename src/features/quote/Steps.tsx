import { Link } from "react-router-dom";
import { ArrowUpRight, Globe2 } from "lucide-react";
import { business, packages, rupees } from "../../config/business";
import { getTemplate, occasions } from "../../data/templates";
import {
  TextField,
  ChoiceGroup,
  MultiChoice,
  StepGrid,
  type StepProps,
} from "./Fields";
import {
  estimateHosting,
  features,
  hostingTypes,
  languages,
  templates,
  todayInIndia,
} from "./model";
export function ContactStep({ data, errors, change }: StepProps) {
  return (
    <>
      <TextField
        name="fullName"
        label="Full name"
        value={data.fullName}
        onChange={(v) => change("fullName", v)}
        required
        maxLength={100}
        autoComplete="name"
        placeholder="How should we address you?"
        error={errors.fullName}
      />
      <TextField
        name="email"
        label="Email address"
        value={data.email}
        onChange={(v) => change("email", v)}
        required
        type="email"
        maxLength={254}
        autoComplete="email"
        placeholder="you@example.com"
        error={errors.email}
      />
      <TextField
        name="whatsapp"
        label="WhatsApp number"
        value={data.whatsapp}
        onChange={(v) => change("whatsapp", v)}
        type="tel"
        inputMode="tel"
        maxLength={30}
        autoComplete="tel"
        placeholder="+91 98765 43210"
        hint="Include your country code. Required only if you prefer WhatsApp."
        error={errors.whatsapp}
      />
      <ChoiceGroup
        name="contactMethod"
        label="How would you like us to contact you?"
        choices={[
          { value: "email", label: "Email" },
          { value: "whatsapp", label: "WhatsApp" },
        ]}
        value={data.contactMethod}
        onChange={(v) => change("contactMethod", v as "email" | "whatsapp")}
        error={errors.contactMethod}
        compact
        required
      />
    </>
  );
}
export function EventStep({ data, errors, change }: StepProps) {
  return (
    <>
      <TextField
        name="occasion"
        label="Occasion"
        value={data.occasion}
        onChange={(v) => change("occasion", v)}
        required
        options={[
          { value: "", label: "Choose your celebration" },
          ...occasions.map((item) => ({ value: item, label: item })),
        ]}
        error={errors.occasion}
      />
      <StepGrid>
        <TextField
          name="eventDate"
          label="Event date"
          value={data.eventDate}
          onChange={(v) => change("eventDate", v)}
          required
          type="date"
          min={todayInIndia()}
          error={errors.eventDate}
        />
        <TextField
          name="publicationDate"
          label="Preferred publication date"
          value={data.publicationDate}
          onChange={(v) => change("publicationDate", v)}
          required
          type="date"
          min={todayInIndia()}
          max={data.eventDate || undefined}
          hint="When should your invitation go live? On or before the event date."
          error={errors.publicationDate}
        />
      </StepGrid>
      <p className="quote-inline-note">
        Your first preview is delivered within {business.previewWorkingDays}{" "}
        working days after payment confirmation and complete requirements. Your
        requested dates will be reviewed before a quotation is confirmed.
      </p>
      <TextField
        name="functionCount"
        label="Number of events / functions"
        value={data.functionCount}
        onChange={(v) => change("functionCount", v)}
        required
        type="number"
        inputMode="numeric"
        min={1}
        max={50}
        hint="Include all functions you want on the invitation, from 1 to 50."
        error={errors.functionCount}
      />
      <MultiChoice
        name="languages"
        label="Invitation languages"
        choices={languages}
        value={data.languages}
        onChange={(v) => change("languages", v)}
        required
        hint="Choose one or more. Translation and multilingual layouts are reviewed individually."
        error={errors.languages}
      />
      {data.languages.includes("Other") && (
        <TextField
          name="otherLanguages"
          label="Other languages"
          value={data.otherLanguages}
          onChange={(v) => change("otherLanguages", v)}
          required
          maxLength={200}
          error={errors.otherLanguages}
        />
      )}
    </>
  );
}
export function DesignStep({ data, errors, change }: StepProps) {
  const selected = getTemplate(data.selectedTemplate);
  return (
    <>
      <ChoiceGroup
        name="designType"
        label="Where shall we begin?"
        choices={[
          {
            value: "template",
            label: "Start with a template",
            detail: "Personalize an existing style around your story.",
          },
          {
            value: "custom",
            label: "Create something bespoke",
            detail: "A new experience, designed around your ideas.",
          },
        ]}
        value={data.designType}
        onChange={(v) => change("designType", v as "template" | "custom")}
        error={errors.designType}
        required
      />
      <TextField
        name="selectedTemplate"
        label="Selected design / inspiration"
        value={data.selectedTemplate}
        onChange={(v) => change("selectedTemplate", v)}
        options={[
          { value: "", label: "Help me choose a design" },
          ...templates.map((item) => ({
            value: item.id,
            label: `${item.name} · ${item.category}`,
          })),
        ]}
        error={errors.selectedTemplate}
        hint="You can use a demo as inspiration even for a bespoke design."
      />
      {selected && (
        <div className="quote-selected-preview">
          <span>YOUR STARTING POINT</span>
          <strong>{selected.name}</strong>
          <Link
            to={`/designs/${selected.id}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open sample in a new tab <ArrowUpRight size={14} />
          </Link>
        </div>
      )}
      <TextField
        name="packagePreference"
        label="Package preference"
        value={data.packagePreference}
        onChange={(v) => change("packagePreference", v)}
        options={[
          { value: "", label: "Please recommend a package" },
          ...packages.map((plan) => ({
            value: plan.name.toLowerCase(),
            label: `${plan.name} · starting ${rupees(plan.price)}`,
          })),
        ]}
        error={errors.packagePreference}
        hint="A preference, not a confirmed price. Your final quotation depends on the scope."
      />
      <StepGrid>
        <TextField
          name="colorPreferences"
          label="Preferred colors"
          value={data.colorPreferences}
          onChange={(v) => change("colorPreferences", v)}
          maxLength={250}
          placeholder="Midnight blue, champagne, soft ivory…"
          error={errors.colorPreferences}
        />
        <TextField
          name="hexColors"
          label="Hex color values"
          value={data.hexColors}
          onChange={(v) => change("hexColors", v)}
          maxLength={100}
          placeholder="#16213E, #D4B879"
          hint="Use 3 or 6 hex digits, separated by commas or spaces."
          error={errors.hexColors}
        />
      </StepGrid>
      <TextField
        name="typography"
        label="Typography preferences"
        value={data.typography}
        onChange={(v) => change("typography", v)}
        maxLength={250}
        placeholder="Classic serif, modern minimal, calligraphy…"
        error={errors.typography}
      />
      <TextField
        name="animation"
        label="Animation preferences"
        value={data.animation}
        onChange={(v) => change("animation", v)}
        multiline
        maxLength={500}
        placeholder="Curtain opening, a moonlit scene, gentle transitions…"
        error={errors.animation}
      />
      <TextField
        name="references"
        label="Reference links"
        value={data.references}
        onChange={(v) => change("references", v)}
        multiline
        maxLength={2000}
        placeholder="https://example.com/inspiration"
        hint="Up to five http:// or https:// links, one per line. Please do not include login details or private access tokens."
        error={errors.references}
      />
      <TextField
        name="specialInstructions"
        label="Special instructions"
        value={data.specialInstructions}
        onChange={(v) => change("specialInstructions", v)}
        multiline
        maxLength={3000}
        placeholder="Tell us the little things that matter to you."
        error={errors.specialInstructions}
      />
    </>
  );
}
export function FeaturesStep({ data, errors, change }: StepProps) {
  return (
    <>
      <MultiChoice
        name="features"
        label="What would make it yours?"
        choices={features}
        value={data.features}
        onChange={(v) => change("features", v)}
        hint="All optional. Leave these unchecked if you’d prefer a simple invitation."
        error={errors.features}
      />
      {data.features.includes("Other custom requirements") && (
        <TextField
          name="otherFeatures"
          label="Other feature requirements"
          value={data.otherFeatures}
          onChange={(v) => change("otherFeatures", v)}
          required
          multiline
          maxLength={1500}
          error={errors.otherFeatures}
        />
      )}
      <div className="quote-soft-panel">
        <span aria-hidden="true">✧</span>
        <h3>A wish list, thoughtfully reviewed.</h3>
        <p>
          Feature selection does not add a fixed charge here. Audio licensing,
          RSVP needs, language work and interactive features are discussed and
          quoted individually.
        </p>
        <p>
          {Number(data.functionCount) > 1
            ? "You’ve requested multiple functions. We’ll review the event structure with you."
            : "You can choose extra features now or describe them in your instructions."}
        </p>
      </div>
    </>
  );
}
export function HostingStep({ data, errors, change }: StepProps) {
  const estimate = estimateHosting(data.hostingDays);
  return (
    <>
      <ChoiceGroup
        name="hostingType"
        label="Where should your invitation live?"
        choices={[...hostingTypes]}
        value={data.hostingType}
        onChange={(v) => change("hostingType", v as typeof data.hostingType)}
        required
        error={errors.hostingType}
      />
      {data.hostingType === "subdomain" && (
        <>
          <TextField
            name="subdomain"
            label="Preferred subdomain"
            value={data.subdomain}
            onChange={(v) => change("subdomain", v)}
            required
            maxLength={63}
            placeholder="ananya-and-rohan"
            hint="Letters, numbers and hyphens only. Availability is reviewed manually."
            error={errors.subdomain}
          />
          <p className="quote-address">
            <Globe2 size={16} />
            <span>
              {data.subdomain.trim().toLowerCase() || "your-story"}
              .onlineinvites.in
            </span>
          </p>
        </>
      )}
      {["existing-domain", "new-domain"].includes(data.hostingType) && (
        <TextField
          name="customDomain"
          label={
            data.hostingType === "existing-domain"
              ? "Your existing domain"
              : "Preferred new domain"
          }
          value={data.customDomain}
          onChange={(v) => change("customDomain", v)}
          required
          maxLength={253}
          placeholder="ourcelebration.in"
          hint="Enter the domain only, without https:// or a path. Registration, DNS, SSL and renewals are reviewed and quoted individually."
          error={errors.customDomain}
        />
      )}
      <TextField
        name="hostingDays"
        label="Requested hosting duration (days)"
        value={data.hostingDays}
        onChange={(v) => change("hostingDays", v)}
        required
        type="number"
        inputMode="numeric"
        min={1}
        max={3650}
        error={errors.hostingDays}
        hint={`The first ${business.includedHostingDays} days are included. Choose 1–3,650 whole days.`}
      />
      <div className="hosting-estimate" aria-live="polite" aria-atomic="true">
        <span>ADDITIONAL HOSTING ESTIMATE</span>
        <strong>{estimate ? rupees(estimate.extraCost) : "—"}</strong>
        <p>
          {estimate
            ? `${estimate.extraDays} additional ${estimate.extraDays === 1 ? "day" : "days"} × ${rupees(business.hostingDailyRate)}/day. ${estimate.includedDays} of your requested days are covered by included hosting.`
            : "Enter a valid whole number of days to see the estimate."}
        </p>
        <small>
          Additional hosting only. Design, features and domain costs are
          individually quoted.
        </small>
      </div>
      <div className="quote-inline-note">
        <p>
          Hosting starts on your agreed publication date. Select the duration
          before quotation; hosting charges are paid upfront. Extensions require
          confirmation and advance payment.
        </p>
        <p>
          Domain and subdomain requests are handled manually. We do not register
          or configure an address when you choose it here.
        </p>
      </div>
    </>
  );
}
