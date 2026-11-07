import { useEffect, useRef, useState } from "react";
interface TurnstileApi {
  render(container: HTMLElement, options: Record<string, unknown>): string;
  remove(id: string): void;
}
declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}
let loader: Promise<void> | undefined;
function loadWidget() {
  if (window.turnstile) return Promise.resolve();
  if (loader) return loader;
  loader = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src =
      "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    const fail = () => {
      script.remove();
      loader = undefined;
      reject(new Error("widget_unavailable"));
    };
    const timer = setTimeout(fail, 10000);
    script.onload = () => {
      clearTimeout(timer);
      if (window.turnstile) resolve();
      else fail();
    };
    script.onerror = () => {
      clearTimeout(timer);
      fail();
    };
    document.head.append(script);
  });
  return loader;
}
export function Turnstile({
  siteKey,
  reset,
  onToken,
  action = "quote_request",
}: {
  siteKey: string;
  reset: number;
  onToken: (token: string) => void;
  action?: "quote_request" | "rsvp_response";
}) {
  const container = useRef<HTMLDivElement>(null);
  const callback = useRef(onToken);
  callback.current = onToken;
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let disposed = false;
    let widget: string | undefined;
    callback.current("");
    setFailed(false);
    loadWidget()
      .then(() => {
        if (disposed || !container.current) return;
        widget = window.turnstile!.render(container.current, {
          sitekey: siteKey,
          action,
          theme: "light",
          size: container.current.clientWidth < 300 ? "compact" : "flexible",
          callback: (token: string) => {
            callback.current(token);
            setFailed(false);
          },
          "expired-callback": () => callback.current(""),
          "error-callback": () => {
            callback.current("");
            setFailed(true);
            return true;
          },
          "timeout-callback": () => {
            callback.current("");
            setFailed(true);
          },
        });
      })
      .catch(() => {
        if (!disposed) setFailed(true);
      });
    return () => {
      disposed = true;
      callback.current("");
      if (widget && window.turnstile) window.turnstile.remove(widget);
    };
  }, [siteKey, reset, retry, action]);
  return (
    <div className="quote-turnstile">
      <strong>Spam verification</strong>
      <div ref={container} />
      {failed && (
        <p role="alert">
          Verification could not load. Check your connection or browser
          blockers, then{" "}
          <button
            type="button"
            onClick={() => {
              loader = undefined;
              setRetry((value) => value + 1);
            }}
          >
            try verification again
          </button>
          .
        </p>
      )}
      <small>
        Verification is provided by Cloudflare. An expired check must be
        completed again.
      </small>
    </div>
  );
}
