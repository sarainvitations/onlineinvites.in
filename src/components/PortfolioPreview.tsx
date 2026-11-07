import { useEffect, useRef, useState } from "react";

export function PortfolioPreview({ url, title }: { url: string; title: string }) {
  const screen = useRef<HTMLDivElement>(null);
  const [html, setHtml] = useState("");
  const [error, setError] = useState(false);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const controller = new AbortController();
    fetch(url, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Preview unavailable");
        return response.json() as Promise<{ html: string }>;
      })
      .then((preview) => {
        if (typeof preview.html !== "string") throw new Error("Invalid preview");
        setHtml(preview.html);
      })
      .catch(() => { if (!controller.signal.aborted) setError(true); });
    return () => controller.abort();
  }, [url]);

  useEffect(() => {
    const element = screen.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / 390));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="work-phone">
      <div className="work-phone-screen" ref={screen}>
        {error ? <p className="work-preview-status">Preview unavailable. Please try again later.</p> : html ?
          <iframe srcDoc={html} title={`${title} invitation preview`} onLoad={(event) => {
            const preview = event.currentTarget.contentDocument;
            if (preview) {
              preview.documentElement.style.overscrollBehaviorY = "contain";
              preview.documentElement.style.scrollBehavior = "auto";
              if (preview.body) preview.body.style.overscrollBehaviorY = "contain";
            }
          }}
            style={{ width: 390, height: 844, transform: `scale(${scale})` }} referrerPolicy="no-referrer" /> :
          <p className="work-preview-status" role="status">Loading preview…</p>}
      </div>
    </div>
  );
}
