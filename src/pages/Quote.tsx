import { useEnquirySubmission } from "../features/quote/submission";
import { Turnstile } from "../features/quote/Turnstile";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCircle2,
  Download,
  FileHeart,
  LockKeyhole,
  RotateCcw,
} from "lucide-react";
import { getTemplate } from "../data/templates";
import { business, packages, rupees } from "../config/business";
import { Metadata } from "../components/Metadata";
import {
  ContactStep,
  EventStep,
  DesignStep,
  FeaturesStep,
  HostingStep,
} from "../features/quote/Steps";
import { ReviewStep } from "../features/quote/Review";
import {
  createRequirements,
  quoteSteps,
  requirementsExport,
  stepFields,
  validateRequirements,
  validateStep,
  type QuoteErrors,
  type QuoteRequirements,
} from "../features/quote/model";
import type { ChangeRequirements } from "../features/quote/Fields";
import "../quote.css";
const stepLabels = [
  "Contact",
  "Event",
  "Design",
  "Features",
  "Hosting",
  "Review",
];
export default function Quote() {
  const [params] = useSearchParams();
  const submission = useEnquirySubmission();
  const [token, setToken] = useState("");
  const [data, setData] = useState(() => createRequirements(params));
  const [step, setStep] = useState(0);
  const [furthest, setFurthest] = useState(0);
  const [errors, setErrors] = useState<QuoteErrors>({});
  const [focusRequest, setFocusRequest] = useState(0);
  const [checked, setChecked] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const title = useRef<HTMLHeadingElement>(null);
  const errorSummary = useRef<HTMLDivElement>(null);
  const ready = useRef<HTMLDivElement>(null);
  const previousStep = useRef(step);
  const selected = getTemplate(data.selectedTemplate);
  const selectedPackage = packages.find(
    (plan) => plan.name.toLowerCase() === data.packagePreference,
  );
  useEffect(() => {
    if (previousStep.current !== step) {
      title.current?.focus({ preventScroll: true });
      title.current?.scrollIntoView({ block: "start", behavior: "instant" });
    }
    previousStep.current = step;
  }, [step]);
  useEffect(() => {
    if (focusRequest) {
      errorSummary.current?.focus();
      errorSummary.current?.scrollIntoView({
        block: "center",
        behavior: "instant",
      });
    }
  }, [focusRequest]);
  useEffect(() => {
    if (checked || submission.receipt) {
      ready.current?.focus();
      ready.current?.scrollIntoView({ block: "center", behavior: "instant" });
    }
  }, [checked, submission.receipt]);
  const change: ChangeRequirements = (key, value) => {
    if (submission.pending) return;
    const next = { ...data, [key]: value };
    setData(next);
    setChecked(false);
    setDownloaded(false);
    const remaining = validateStep(next, step);
    setErrors((previous) =>
      Object.fromEntries(
        Object.keys(previous)
          .filter((field) => remaining[field as keyof QuoteRequirements])
          .map((field) => [field, remaining[field as keyof QuoteRequirements]]),
      ),
    );
  };
  function navigateStep(next: number) {
    if (submission.pending || submission.receipt) return;
    if (next > step) {
      const issues = validateStep(data, step);
      if (Object.keys(issues).length) {
        setErrors(issues);
        setFocusRequest((value) => value + 1);
        return;
      }
    }
    setErrors({});
    setStep(next);
    setFurthest((value) => Math.max(value, next));
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (step < 5) {
      navigateStep(step + 1);
      return;
    }
    const issues = validateRequirements(data);
    if (Object.keys(issues).length) {
      const firstStep = stepFields.findIndex((fields) =>
        fields.some((field) => issues[field]),
      );
      setStep(firstStep);
      setErrors(
        Object.fromEntries(
          Object.entries(issues).filter(([field]) =>
            stepFields[firstStep].includes(field as keyof QuoteRequirements),
          ),
        ),
      );
      setFocusRequest((value) => value + 1);
      return;
    }
    if (submission.config.available) {
      const result = await submission.send(data, token);
      if (result.errors) {
        const firstStep = stepFields.findIndex((fields) =>
          fields.some((field) => result.errors![field]),
        );
        if (firstStep >= 0) {
          setStep(firstStep);
          setErrors(
            Object.fromEntries(
              Object.entries(result.errors).filter(([field]) =>
                stepFields[firstStep].includes(
                  field as keyof QuoteRequirements,
                ),
              ),
            ),
          );
          setFocusRequest((value) => value + 1);
        }
      }
      return;
    }
    setErrors({});
    setChecked(true);
    setDownloaded(false);
  }
  function focusField(key: keyof QuoteRequirements) {
    const field = document.getElementById(`quote-${key}`);
    field?.focus();
    field?.scrollIntoView({ block: "center", behavior: "instant" });
  }
  function download() {
    if (
      (!checked && !submission.receipt) ||
      (!submission.receipt && Object.keys(validateRequirements(data)).length)
    )
      return;
    const objectUrl = URL.createObjectURL(
      new Blob(
        [
          JSON.stringify(
            submission.receipt
              ? {
                  ...requirementsExport(data),
                  status:
                    submission.receipt.mode === "local"
                      ? "local-test-enquiry"
                      : "submitted-enquiry",
                  notice:
                    submission.receipt.mode === "local"
                      ? "Stored in the local development database only."
                      : "Enquiry stored. This is not an accepted quotation.",
                  reference: submission.receipt.reference,
                }
              : requirementsExport(data),
            null,
            2,
          ),
        ],
        {
          type: "application/json",
        },
      ),
    );
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = "online-invites-requirements.json";
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    setDownloaded(true);
  }
  function clear() {
    if (submission.pending) return;
    submission.reset();
    setToken("");
    setData(createRequirements(params));
    setErrors({});
    setChecked(false);
    setDownloaded(false);
    setStep(0);
    setFurthest(0);
    title.current?.focus();
  }
  const CurrentStep = [
    ContactStep,
    EventStep,
    DesignStep,
    FeaturesStep,
    HostingStep,
  ][step];
  return (
    <main id="main-content" className="quote-page">
      <Metadata
        title="Request a free quotation"
        description="Plan a personalized digital invitation. Share your celebration, design preferences, features and hosting requirements in a thoughtful six-step form."
        path="/request-quote"
      />
      <section className="container quote-page-intro">
        <span className="eyebrow">
          YOUR CELEBRATION STARTS WITH A CONVERSATION
        </span>
        <h1>
          Tell us your story.
          <br />
          <em>We’ll imagine the invitation.</em>
        </h1>
        <p>
          A few thoughtful details help us understand your vision. No payment,
          no commitment—just a beautiful place to begin.
        </p>
      </section>
      <div className="container quote-layout">
        <aside className="quote-sidebar">
          <div className="quote-side-heading">
            <FileHeart size={23} strokeWidth={1.3} />
            <span>
              A LITTLE PLAN FOR
              <br />
              YOUR BIG MOMENT
            </span>
          </div>
          <nav aria-label="Quotation steps">
            <ol>
              {quoteSteps.map((item, index) => (
                <li key={item.title}>
                  <button
                    type="button"
                    disabled={
                      Boolean(submission.receipt) ||
                      submission.pending ||
                      index > furthest
                    }
                    aria-current={step === index ? "step" : undefined}
                    aria-label={`Step ${index + 1}: ${stepLabels[index]}`}
                    onClick={() => navigateStep(index)}
                  >
                    <span className="quote-step-number">
                      {index < step ? (
                        <Check size={14} />
                      ) : (
                        String(index + 1).padStart(2, "0")
                      )}
                    </span>
                    <span>
                      {stepLabels[index]}
                      <small>
                        {index === step
                          ? "You’re here"
                          : index < step
                            ? "Visited"
                            : "Up next"}
                      </small>
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </nav>
          {selected && (
            <div className="quote-starting-point">
              <span>{selected.symbol}</span>
              <small>YOUR SELECTED DESIGN</small>
              <strong>{selected.name}</strong>
              <Link
                to={`/designs/${selected.id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Revisit the demo <ArrowUpRight size={13} />
              </Link>
            </div>
          )}
          {selectedPackage && (
            <p className="quote-package-note">
              {selectedPackage.name} preference · starting{" "}
              {rupees(selectedPackage.price)}
              <small>Final scope and price are individually quoted.</small>
            </p>
          )}
          <div className="quote-side-note">
            <LockKeyhole size={15} />
            <p>
              Your entries stay in this page while you move between steps.
              Refreshing or leaving clears unsent entries.{" "}
              {submission.config.available
                ? "Details are sent only when you submit the reviewed form."
                : "Nothing is uploaded in this preview."}
            </p>
          </div>
        </aside>
        <div className="quote-main">
          <div className="quote-preview-banner">
            <span>
              {submission.config.available
                ? submission.config.mode === "local"
                  ? "LOCAL TEST"
                  : "QUOTATION"
                : "FORM PREVIEW"}
            </span>
            <p>
              {submission.config.available
                ? submission.config.mode === "local"
                  ? "Test submissions are saved to a development database on this Mac, using test verification. Please use sample details only."
                  : "Your reviewed requirements will be securely stored for a personal quotation. No payment is collected."
                : "Live enquiry submission is not connected here. You can complete, check and download your requirements locally."}
            </p>
          </div>
          {submission.receipt ? (
            <section
              ref={ready}
              tabIndex={-1}
              className="quote-submission-receipt"
              role="status"
            >
              <CheckCircle2 size={32} />
              <span className="eyebrow">
                {submission.receipt.mode === "local"
                  ? "LOCAL TEST RECEIPT"
                  : "YOUR ENQUIRY REFERENCE"}
              </span>
              <h2>
                {submission.receipt.mode === "local"
                  ? "Test enquiry stored locally."
                  : "Your quotation request is received."}
              </h2>
              <p>
                {submission.receipt.mode === "local"
                  ? "Saved to the development database on this Mac only. This is not a live customer enquiry."
                  : "We’ll review your requirements and contact you using your chosen method. Keep your reference for follow-up."}
              </p>
              <code>{submission.receipt.reference}</code>
              {submission.receipt.duplicate && (
                <p className="field-hint">
                  This request was already saved. The existing reference has
                  been recovered.
                </p>
              )}
              <p className="field-hint">
                {submission.receipt.mode === "local"
                  ? "No email has been sent."
                  : "This confirms receipt, not quotation acceptance or payment."}
              </p>
              <div>
                <button type="button" className="button" onClick={download}>
                  <Download size={15} />
                  Download your copy
                </button>
                <button type="button" className="quote-back" onClick={clear}>
                  Start a new request
                </button>
              </div>
            </section>
          ) : (
            <>
              <form
                onSubmit={submit}
                noValidate
                aria-label="Quotation requirements"
                aria-busy={submission.pending}
              >
                <fieldset
                  className="quote-submit-lock"
                  disabled={submission.pending}
                >
                  <div className="quote-form-header">
                    <span className="eyebrow">{quoteSteps[step].subtitle}</span>
                    <span className="quote-step-counter">
                      STEP {step + 1} OF 6
                    </span>
                    <div className="quote-progress-track" aria-hidden="true">
                      <span style={{ width: `${((step + 1) / 6) * 100}%` }} />
                    </div>
                    <h2 ref={title} tabIndex={-1}>
                      {quoteSteps[step].title}
                    </h2>
                    <p>
                      {step === 5 && submission.config.available
                        ? submission.config.mode === "local"
                          ? "Review your sample requirements before saving a local test enquiry."
                          : "Review your requirements before sending your quotation request."
                        : quoteSteps[step].description}
                    </p>
                    <small>
                      Fields marked <span aria-hidden="true">*</span> are
                      required.
                    </small>
                  </div>
                  {Object.keys(errors).length > 0 && (
                    <div
                      ref={errorSummary}
                      className="quote-error-summary"
                      tabIndex={-1}
                      role="alert"
                    >
                      <strong>A few details need your attention.</strong>
                      <ul>
                        {Object.entries(errors).map(([field, message]) => (
                          <li key={field}>
                            <a
                              href={`#quote-${field}`}
                              onClick={(event) => {
                                event.preventDefault();
                                focusField(field as keyof QuoteRequirements);
                              }}
                            >
                              {message}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="quote-step-fields">
                    {step < 5 ? (
                      <CurrentStep
                        data={data}
                        errors={errors}
                        change={change}
                      />
                    ) : (
                      <ReviewStep
                        data={data}
                        errors={errors}
                        change={change}
                        edit={navigateStep}
                        mode={submission.config.mode}
                      />
                    )}
                  </div>
                  {step === 5 && submission.config.available && (
                    <Turnstile
                      siteKey={submission.config.siteKey!}
                      reset={submission.resetToken}
                      onToken={setToken}
                    />
                  )}
                  {step === 5 && submission.error && (
                    <div className="quote-error-summary" role="alert">
                      {submission.error}
                    </div>
                  )}
                  {checked && (
                    <div
                      ref={ready}
                      className="quote-local-ready"
                      tabIndex={-1}
                      role="status"
                    >
                      <CheckCircle2 size={25} />
                      <div>
                        <h3>Requirements checked locally.</h3>
                        <p>
                          Nothing has been submitted. Save your own copy while
                          secure quotation submission is being prepared.
                        </p>
                        <button
                          type="button"
                          className="button"
                          onClick={download}
                        >
                          <Download size={16} />
                          Download requirements
                        </button>
                        {downloaded && (
                          <p className="quote-download-note">
                            Your local copy has been downloaded. No enquiry was
                            sent and no reference number was issued.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="quote-form-actions">
                    {step > 0 ? (
                      <button
                        type="button"
                        className="quote-back"
                        onClick={() => navigateStep(step - 1)}
                      >
                        <ArrowLeft size={15} />
                        Back
                      </button>
                    ) : (
                      <Link className="quote-back" to="/designs">
                        <ArrowLeft size={15} />
                        Explore designs
                      </Link>
                    )}
                    <button
                      type="submit"
                      className="button"
                      disabled={submission.pending || submission.loading}
                    >
                      {submission.pending
                        ? "Saving your request…"
                        : step === 5 && submission.config.available
                          ? submission.config.mode === "local"
                            ? "Save test enquiry locally"
                            : "Send quotation request"
                          : step === 5
                            ? "Check my requirements"
                            : "Continue"}
                      {step === 5 ? (
                        <Check size={16} />
                      ) : (
                        <ArrowRight size={16} />
                      )}
                    </button>
                  </div>
                  {furthest === 5 && step < 5 && (
                    <button
                      type="button"
                      className="quote-back-to-review"
                      onClick={() => navigateStep(5)}
                    >
                      Return to requirements review <ArrowRight size={14} />
                    </button>
                  )}
                </fieldset>
              </form>
            </>
          )}
          <div className="quote-form-foot">
            <span>
              <LockKeyhole size={13} />
              No payment is collected here.
            </span>
            <details>
              <summary>Clear this form</summary>
              <p>
                This removes the details currently entered. Your original
                design/package preference will remain.
              </p>
              <button
                type="button"
                onClick={clear}
                disabled={submission.pending}
              >
                <RotateCcw size={13} />
                Clear entered details
              </button>
            </details>
          </div>
        </div>
      </div>
      <section className="container quote-next-note">
        <span aria-hidden="true">✧</span>
        <div>
          <h2>A thoughtful quotation, made around you.</h2>
          <p>
            Your requirements are reviewed individually before a quotation is
            confirmed. Your first preview follows within{" "}
            {business.previewWorkingDays} working days of payment confirmation
            and complete requirements.
          </p>
        </div>
        <Link className="text-link" to="/pricing">
          Explore pricing <ArrowUpRight size={15} />
        </Link>
      </section>
    </main>
  );
}
