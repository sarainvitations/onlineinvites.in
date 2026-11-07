import { Check } from "lucide-react";
import type { ReactNode } from "react";
import type { QuoteErrors, QuoteRequirements } from "./model";
export type ChangeRequirements = <K extends keyof QuoteRequirements>(
  key: K,
  value: QuoteRequirements[K],
) => void;
export interface StepProps {
  data: QuoteRequirements;
  errors: QuoteErrors;
  change: ChangeRequirements;
}
export interface Choice {
  value: string;
  label: string;
  detail?: string;
}
const describedBy = (name: string, hint?: string, error?: string) =>
  [hint ? `quote-${name}-hint` : "", error ? `quote-${name}-error` : ""]
    .filter(Boolean)
    .join(" ") || undefined;
export function TextField({
  name,
  label,
  value,
  onChange,
  error,
  hint,
  required = false,
  type = "text",
  options,
  multiline = false,
  maxLength,
  min,
  max,
  autoComplete,
  placeholder,
  inputMode,
}: {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  required?: boolean;
  type?: string;
  options?: Choice[];
  multiline?: boolean;
  maxLength?: number;
  min?: string | number;
  max?: string | number;
  autoComplete?: string;
  placeholder?: string;
  inputMode?: "text" | "tel" | "email" | "numeric";
}) {
  const props = {
    id: `quote-${name}`,
    name,
    value,
    onChange: (
      event: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => onChange(event.target.value),
    "aria-invalid": Boolean(error),
    "aria-describedby": describedBy(name, hint, error),
    required,
  };
  return (
    <div className={`quote-field ${error ? "has-error" : ""}`}>
      <label htmlFor={props.id}>
        {label}
        {required ? (
          <span className="required-mark" aria-hidden="true">
            {" "}
            *
          </span>
        ) : (
          <small>Optional</small>
        )}
      </label>
      {options ? (
        <select {...props}>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : multiline ? (
        <textarea
          {...props}
          rows={4}
          maxLength={maxLength}
          placeholder={placeholder}
        />
      ) : (
        <input
          {...props}
          type={type}
          maxLength={maxLength}
          min={min}
          max={max}
          step={type === "number" ? 1 : undefined}
          autoComplete={autoComplete}
          placeholder={placeholder}
          inputMode={inputMode}
        />
      )}
      {hint && (
        <p className="field-hint" id={`quote-${name}-hint`}>
          {hint}
        </p>
      )}
      {error && (
        <p className="field-error" id={`quote-${name}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}
export function ChoiceGroup({
  name,
  label,
  choices,
  value,
  onChange,
  error,
  hint,
  required = false,
  compact = false,
}: {
  name: string;
  label: string;
  choices: Choice[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  required?: boolean;
  compact?: boolean;
}) {
  return (
    <fieldset
      id={`quote-${name}`}
      tabIndex={-1}
      className={`quote-choice-field ${compact ? "compact-choices" : ""}`}
      aria-describedby={describedBy(name, hint, error)}
    >
      <legend>
        {label}
        {required && (
          <span className="required-mark" aria-hidden="true">
            {" "}
            *
          </span>
        )}
      </legend>
      {hint && (
        <p className="field-hint" id={`quote-${name}-hint`}>
          {hint}
        </p>
      )}
      <div className="quote-choice-grid">
        {choices.map((choice) => (
          <label
            className={`quote-choice ${value === choice.value ? "is-selected" : ""}`}
            key={choice.value}
          >
            <input
              type="radio"
              name={name}
              value={choice.value}
              checked={value === choice.value}
              onChange={() => onChange(choice.value)}
              required={required}
            />
            <span>
              <strong>{choice.label}</strong>
              {choice.detail && <small>{choice.detail}</small>}
            </span>
            <Check size={16} aria-hidden="true" />
          </label>
        ))}
      </div>
      {error && (
        <p className="field-error" id={`quote-${name}-error`}>
          {error}
        </p>
      )}
    </fieldset>
  );
}
export function MultiChoice({
  name,
  label,
  choices,
  value,
  onChange,
  error,
  hint,
  required = false,
}: {
  name: string;
  label: string;
  choices: string[];
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
  hint?: string;
  required?: boolean;
}) {
  return (
    <fieldset
      id={`quote-${name}`}
      tabIndex={-1}
      className="quote-choice-field"
      aria-describedby={describedBy(name, hint, error)}
    >
      <legend>
        {label}
        {required && (
          <span className="required-mark" aria-hidden="true">
            {" "}
            *
          </span>
        )}
      </legend>
      {hint && (
        <p className="field-hint" id={`quote-${name}-hint`}>
          {hint}
        </p>
      )}
      <div className="quote-check-grid">
        {choices.map((choice) => (
          <label
            key={choice}
            className={value.includes(choice) ? "is-selected" : ""}
          >
            <input
              type="checkbox"
              checked={value.includes(choice)}
              onChange={() =>
                onChange(
                  value.includes(choice)
                    ? value.filter((item) => item !== choice)
                    : [...value, choice],
                )
              }
            />
            <span>{choice}</span>
          </label>
        ))}
      </div>
      {error && (
        <p className="field-error" id={`quote-${name}-error`}>
          {error}
        </p>
      )}
    </fieldset>
  );
}
export function StepGrid({ children }: { children: ReactNode }) {
  return <div className="quote-field-grid">{children}</div>;
}
