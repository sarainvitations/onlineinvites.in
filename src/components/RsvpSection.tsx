import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { type InvitationTemplate } from "../data/templates";
import { eventTimestamp } from "../data/demoEvent";
import { normalizeRsvp, validateRsvp, type RsvpDetails, type RsvpErrors } from "../features/rsvp/model";
import type { SubmissionConfig } from "../features/quote/submission";
import { Turnstile } from "../features/quote/Turnstile";
import "../event-features.css";

const initialConfig: SubmissionConfig = { available: false, mode: "preview" };
export function RsvpSection({ template }: { template: InvitationTemplate }) {
  const [config, setConfig] = useState(initialConfig);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<RsvpDetails>({ templateId: template.id, fullName: "", email: "", attendance: "", guests: "1", message: "", privacyConsent: false });
  const [errors, setErrors] = useState<RsvpErrors>({});
  const [error, setError] = useState("");
  const [token, setToken] = useState("");
  const [reset, setReset] = useState(0);
  const [pending, setPending] = useState(false);
  const [reference, setReference] = useState("");
  const [clock, setClock] = useState(Date.now);
  const [focusRequest, setFocusRequest] = useState(0);
  const summary = useRef<HTMLDivElement>(null);
  const receipt = useRef<HTMLDivElement>(null);
  const locked = useRef(false);
  const request = useRef<{ id: string; signature: string }>();
  const activeRequest = useRef<AbortController>();
  const closed = eventTimestamp(template.date, template.time) <= clock;
  useEffect(() => {
    let active = true;
    const abort = new AbortController();
    const timeout = setTimeout(() => abort.abort(), 5000);
    fetch("/api/config", { cache: "no-store", credentials: "same-origin", signal: abort.signal })
      .then(async (response) => {
        if (!response.ok || !response.headers.get("Content-Type")?.includes("application/json")) return;
        const value = await response.json();
        if (active && value.available === true && ["local", "production"].includes(value.mode) && typeof value.siteKey === "string") setConfig({ available: true, mode: value.mode, siteKey: value.siteKey });
      }).catch(() => {}).finally(() => { clearTimeout(timeout); if (active) setLoading(false); });
    const timer = window.setInterval(() => setClock(Date.now()), 1000);
    return () => { active = false; clearTimeout(timeout); clearInterval(timer); abort.abort(); activeRequest.current?.abort(); };
  }, []);
  useEffect(() => { if (reference) receipt.current?.focus(); }, [reference]);
  useEffect(() => { if (focusRequest) summary.current?.focus(); }, [focusRequest]);

  function update<K extends keyof RsvpDetails>(key: K, value: RsvpDetails[K]) {
    if (locked.current) return;
    setData((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => ({ ...previous, [key]: undefined }));
    setError("");
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (locked.current || reference) return;
    const normalized = normalizeRsvp(data);
    const found = validateRsvp(normalized);
    setErrors(found);
    if (Object.keys(found).length) { setFocusRequest((value) => value + 1); return; }
    if (!config.available) {
      const blob = new Blob([JSON.stringify({ status: "unsubmitted-rsvp-draft", eventDate: template.date, eventTime: template.time, details: normalized }, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url; link.download = `rsvp-${template.id}-draft.json`; link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      return;
    }
    if (!token) { setError("Complete spam verification before sending your RSVP."); setFocusRequest((value) => value + 1); return; }
    const signature = JSON.stringify(normalized);
    if (!request.current || request.current.signature !== signature) request.current = { id: crypto.randomUUID(), signature };
    const abort = new AbortController(); activeRequest.current = abort;
    const timeout = setTimeout(() => abort.abort(), 15000);
    locked.current = true; setPending(true); setError("");
    try {
      const response = await fetch("/api/rsvps", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "same-origin", signal: abort.signal, body: JSON.stringify({ requestId: request.current.id, turnstileToken: token, details: normalized }) });
      if (!response.headers.get("Content-Type")?.includes("application/json")) throw new Error("unconfirmed");
      const result = await response.json();
      if (response.ok && result.ok === true && /^RSVP-[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/.test(result.reference) && result.mode === config.mode) { setReference(result.reference); return; }
      if (result.errors && typeof result.errors === "object") setErrors(result.errors);
      setError(typeof result.message === "string" ? result.message : "Your RSVP could not be confirmed. Please retry.");
      setFocusRequest((value) => value + 1);
    } catch {
      setError("We could not confirm whether your RSVP was saved. Keep the same details and retry to safely recover a saved response.");
      setFocusRequest((value) => value + 1);
    } finally { clearTimeout(timeout); locked.current = false; setPending(false); setReset((value) => value + 1); }
  }
  function fieldError(key: keyof RsvpDetails) { return errors[key] ? <p className="rsvp-field-error" id={`rsvp-${key}-error`}>{errors[key]}</p> : null; }
  return (
    <section className="rsvp-section" id="rsvp" aria-labelledby="rsvp-heading">
      <div className="rsvp-intro"><span className="event-feature-kicker">A PLACE FOR YOU</span><h2 id="rsvp-heading">Will you join us?</h2><p>Your presence makes the celebration.</p></div>
      <div className="rsvp-panel">
        <p className="rsvp-mode-note">{config.available ? config.mode === "local" ? "Local RSVP test · Use sample details. Responses are saved on this Mac only." : "Sample RSVP · Use fictional details. Responses are stored for this demo, not a real event reservation." : "RSVP preview · Storage is not connected here. Download a draft to try the form; it is not sent."}</p>
        {reference ? <div className="rsvp-receipt" ref={receipt} tabIndex={-1} role="status"><h3>{config.mode === "local" ? "Test RSVP stored locally." : "Your sample RSVP is recorded."}</h3><p>{data.attendance === "yes" ? `${data.guests} guest${data.guests === "1" ? "" : "s"}, including you.` : "Thank you for letting us know you cannot attend."}</p><strong>{reference}</strong><p>No email notification was sent. To check or change a response, see our <Link to="/contact">contact page</Link> with this reference.</p></div>
          : closed ? <p className="rsvp-closed" role="status">RSVP has closed because this sample event has started.</p>
          : <form onSubmit={submit} noValidate aria-label="RSVP response">
            {(error || Object.values(errors).some(Boolean)) && <div ref={summary} className="rsvp-errors" tabIndex={-1} role="alert"><strong>{error || "Please check your RSVP."}</strong>{Object.entries(errors).map(([key, value]) => value && <a key={key} href={`#rsvp-${key}`} onClick={(event) => { const field = document.getElementById(`rsvp-${key}`); if (field) { event.preventDefault(); field.focus(); } }}>{value}</a>)}</div>}
            <fieldset disabled={pending} className="rsvp-fields"><legend className="sr-only">Your RSVP details</legend>
              <div><label htmlFor="rsvp-fullName">Your name</label><input id="rsvp-fullName" autoComplete="name" required maxLength={100} value={data.fullName} onChange={(e) => update("fullName", e.target.value)} aria-invalid={Boolean(errors.fullName)} aria-describedby={errors.fullName ? "rsvp-fullName-error" : undefined} />{fieldError("fullName")}</div>
              <div><label htmlFor="rsvp-email">Email address</label><input id="rsvp-email" type="email" autoComplete="email" required maxLength={254} value={data.email} onChange={(e) => update("email", e.target.value)} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "rsvp-email-error" : undefined} />{fieldError("email")}</div>
              <fieldset className="rsvp-attendance" id="rsvp-attendance" tabIndex={-1} aria-describedby={errors.attendance ? "rsvp-attendance-error" : undefined}><legend>Can you attend?</legend><div>{([ ["yes", "Joyfully accept"], ["no", "Regretfully decline"] ] as const).map(([value, label]) => <label key={value}><input type="radio" name="rsvp-attendance" value={value} checked={data.attendance === value} onChange={() => update("attendance", value)} required />{label}</label>)}</div>{fieldError("attendance")}</fieldset>
              {data.attendance === "yes" && <div><label htmlFor="rsvp-guests">Number of guests, including you</label><input id="rsvp-guests" type="number" inputMode="numeric" min="1" max="10" required value={data.guests} onChange={(e) => update("guests", e.target.value)} aria-invalid={Boolean(errors.guests)} aria-describedby={`rsvp-guests-hint${errors.guests ? " rsvp-guests-error" : ""}`} /><small id="rsvp-guests-hint">1–10 guests per response.</small>{fieldError("guests")}</div>}
              <div className="rsvp-wide"><label htmlFor="rsvp-message">A little note <span>(optional)</span></label><textarea id="rsvp-message" rows={3} maxLength={500} value={data.message} onChange={(e) => update("message", e.target.value)} aria-invalid={Boolean(errors.message)} aria-describedby={errors.message ? "rsvp-message-error" : undefined} />{fieldError("message")}</div>
              <div className="rsvp-wide rsvp-consent"><label><input id="rsvp-privacyConsent" type="checkbox" checked={data.privacyConsent} onChange={(e) => update("privacyConsent", e.target.checked)} aria-invalid={Boolean(errors.privacyConsent)} aria-describedby={`rsvp-privacy-note${errors.privacyConsent ? " rsvp-privacyConsent-error" : ""}`} />{config.mode === "local" ? "I agree to save these sample RSVP details in the local test database." : config.available ? "I agree to the use of my details to manage this sample RSVP." : "I agree to include these details in a draft downloaded to my device."}</label><p id="rsvp-privacy-note">Read the <Link to="/policies/privacy" target="_blank" rel="noopener noreferrer">privacy policy</Link>. Unsent entries clear when you leave or refresh. Please do not include sensitive information.</p>{fieldError("privacyConsent")}</div>
            </fieldset>
            {config.available && data.privacyConsent && <Turnstile siteKey={config.siteKey!} action="rsvp_response" reset={reset} onToken={setToken} />}
            <button type="submit" className="rsvp-submit" disabled={pending || loading}>{loading ? "Checking RSVP availability…" : pending ? "Saving your response…" : config.available ? config.mode === "local" ? "Save test RSVP locally" : "Send sample RSVP" : "Download RSVP draft"}</button>
          </form>}
      </div>
    </section>
  );
}
