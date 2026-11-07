import { useEffect, useRef, useState } from "react";
import type { QuoteErrors, QuoteRequirements } from "./model";
export interface SubmissionConfig {
  available: boolean;
  mode: "preview" | "local" | "production";
  siteKey?: string;
}
export interface EnquiryReceipt {
  reference: string;
  mode: "local" | "production";
  duplicate: boolean;
}
const preview: SubmissionConfig = { available: false, mode: "preview" };
export function useEnquirySubmission() {
  const [config, setConfig] = useState<SubmissionConfig>(preview);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState<EnquiryReceipt>();
  const [resetToken, setResetToken] = useState(0);
  const locked = useRef(false);
  const request = useRef<{ id: string; signature: string }>();
  const controller = useRef<AbortController>();
  useEffect(() => {
    const abort = new AbortController();
    const timeout = setTimeout(() => abort.abort(), 5000);
    fetch("/api/config", {
      signal: abort.signal,
      credentials: "same-origin",
      cache: "no-store",
    })
      .then(async (response) => {
        if (
          !response.ok ||
          !response.headers.get("Content-Type")?.includes("application/json")
        )
          return;
        const data = await response.json();
        if (
          data.available === true &&
          ["local", "production"].includes(data.mode) &&
          typeof data.siteKey === "string"
        )
          setConfig({
            available: true,
            mode: data.mode,
            siteKey: data.siteKey,
          });
      })
      .catch(() => {})
      .finally(() => {
        clearTimeout(timeout);
        if (!abort.signal.aborted) setLoading(false);
      });
    const finish = () => setLoading(false);
    abort.signal.addEventListener("abort", finish);
    return () => {
      abort.signal.removeEventListener("abort", finish);
      clearTimeout(timeout);
      abort.abort();
      controller.current?.abort();
    };
  }, []);
  async function send(
    data: QuoteRequirements,
    token: string,
  ): Promise<{ errors?: QuoteErrors }> {
    if (locked.current || receipt || !config.available) return {};
    if (!token) {
      setError("Complete spam verification before sending your requirements.");
      return {};
    }
    const signature = JSON.stringify(data);
    if (!request.current || request.current.signature !== signature)
      request.current = { id: crypto.randomUUID(), signature };
    locked.current = true;
    setPending(true);
    setError("");
    const abort = new AbortController();
    controller.current = abort;
    const timeout = setTimeout(() => abort.abort(), 15000);
    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          requestId: request.current.id,
          turnstileToken: token,
          requirements: data,
        }),
        signal: abort.signal,
      });
      if (!response.headers.get("Content-Type")?.includes("application/json"))
        throw new Error("unconfirmed");
      const result = await response.json();
      if (
        response.ok &&
        result.ok === true &&
        /^OI-[0-9A-F-]{36}$/.test(result.reference) &&
        result.mode === config.mode
      ) {
        setReceipt({
          reference: result.reference,
          mode: result.mode,
          duplicate: result.duplicate === true,
        });
        return {};
      }
      if (result.code === "REQUEST_CONFLICT") request.current = undefined;
      const delay =
        response.status === 429 ? " Please wait before retrying." : "";
      setError(
        `${typeof result.message === "string" ? result.message : "We could not confirm your enquiry. Please try again."}${delay}`,
      );
      return result.code === "VALIDATION_FAILED" &&
        result.errors &&
        typeof result.errors === "object"
        ? { errors: result.errors }
        : {};
    } catch {
      setError(
        "We could not confirm whether your enquiry was saved. Your details are still here. Retry with the same details to safely recover an existing reference.",
      );
      return {};
    } finally {
      clearTimeout(timeout);
      locked.current = false;
      setPending(false);
      setResetToken((value) => value + 1);
    }
  }
  function reset() {
    if (locked.current) return;
    request.current = undefined;
    setReceipt(undefined);
    setError("");
    setResetToken((value) => value + 1);
  }
  return { config, loading, pending, error, receipt, resetToken, send, reset };
}
