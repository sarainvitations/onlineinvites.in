import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent,
  type KeyboardEvent,
} from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { useReducedMotion } from "motion/react";
import type { InvitationTemplate } from "../data/templates";
import { TemplateArt } from "./TemplateArt";
import "../carousel.css";

export function DesignCarousel({
  items,
  anchor = "design-carousel",
  label = "Invitation designs",
}: {
  items: InvitationTemplate[];
  anchor?: string;
  label?: string;
}) {
  const track = useRef<HTMLDivElement>(null);
  const section = useRef<HTMLElement>(null);
  const [params] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const [first, setFirst] = useState(0);
  const [visible, setVisible] = useState(1);
  const active = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const persist = useRef(false);
  const restore = useRef(location.hash === `#${anchor}`);
  const itemsKey = items.map((item) => item.id).join("|");
  const latest = useRef({ items, params, location, navigate });
  latest.current = { items, params, location, navigate };
  function measure() {
    const node = track.current;
    const card = node?.firstElementChild as HTMLElement | null;
    if (!node || !card) return;
    const stride =
      card.offsetWidth +
      Number.parseFloat(getComputedStyle(node).columnGap || "0");
    const count = Math.min(
      items.length,
      Math.max(1, Math.round(node.clientWidth / stride)),
    );
    const index = Math.min(
      Math.max(0, items.length - count),
      Math.max(0, Math.round(node.scrollLeft / stride)),
    );
    active.current = index;
    setFirst(index);
    setVisible(count);
  }
  useLayoutEffect(() => {
    const node = track.current;
    if (!node) return;
    persist.current = false;
    const selected = latest.current.items.findIndex(
      (item) => item.id === latest.current.params.get("slide"),
    );
    const target = node.children[Math.max(0, selected)] as
      HTMLElement | undefined;
    if (target)
      node.scrollTo({
        left: target.offsetLeft - node.offsetLeft,
        behavior: "instant",
      });
    measure();
    const observer = new ResizeObserver(() => {
      measure();
    });
    observer.observe(node);
    const frame = requestAnimationFrame(() => {
      if (restore.current) {
        section.current?.scrollIntoView({
          behavior: "instant",
          block: "start",
        });
        target
          ?.querySelector<HTMLAnchorElement>("a")
          ?.focus({ preventScroll: true });
        restore.current = false;
      }
      persist.current = true;
    });
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      clearTimeout(timer.current);
    };
    // A changed result set starts a new carousel; its query parameters already hold the requested slide.
  }, [itemsKey]);
  useEffect(() => () => clearTimeout(timer.current), []);
  function onScroll() {
    measure();
    clearTimeout(timer.current);
    if (!persist.current) return;
    timer.current = setTimeout(() => {
      const current = latest.current;
      const id = current.items[active.current]?.id;
      if (!id || current.params.get("slide") === id) return;
      const next = new URLSearchParams(current.params);
      next.set("slide", id);
      current.navigate(
        {
          pathname: current.location.pathname,
          search: `?${next.toString()}`,
          hash: current.location.hash,
        },
        {
          replace: true,
          preventScrollReset: true,
          state: current.location.state,
        },
      );
    }, 150);
  }
  function go(index: number) {
    const node = track.current;
    if (!node) return;
    const clamped = Math.max(0, Math.min(items.length - visible, index));
    const card = node.children[clamped] as HTMLElement | undefined;
    if (card)
      node.scrollTo({
        left: card.offsetLeft - node.offsetLeft,
        behavior: reduced ? "instant" : "smooth",
      });
  }
  function keyboard(event: KeyboardEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) return;
    if (["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      go(
        event.key === "Home"
          ? 0
          : event.key === "End"
            ? items.length
            : event.key === "ArrowRight"
              ? first + 1
              : first - 1,
      );
    }
  }
  function remember(event: MouseEvent<HTMLAnchorElement>, id: string) {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    navigate(returnTo(id), {
      replace: true,
      preventScrollReset: true,
      state: location.state,
    });
  }
  function returnTo(id: string) {
    const next = new URLSearchParams(params);
    next.set("slide", id);
    return `${location.pathname}?${next.toString()}#${anchor}`;
  }
  return (
    <section
      ref={section}
      id={anchor}
      className="design-carousel"
      aria-roledescription="carousel"
      aria-label={label}
    >
      <div className="carousel-heading">
        <div>
          <span className="eyebrow">
            A LITTLE INSPIRATION, ONE SLIDE AT A TIME
          </span>
          <p>
            Swipe or use the arrows to explore. Your place is saved when you
            open a demo.
          </p>
        </div>
        <div className="carousel-controls">
          <button
            aria-label="Previous designs"
            aria-controls={`${anchor}-track`}
            disabled={first === 0}
            onClick={() => go(first - 1)}
          >
            <ArrowLeft size={19} />
          </button>
          <button
            aria-label="Next designs"
            aria-controls={`${anchor}-track`}
            disabled={first + visible >= items.length}
            onClick={() => go(first + 1)}
          >
            <ArrowRight size={19} />
          </button>
        </div>
      </div>
      <div
        id={`${anchor}-track`}
        ref={track}
        className="carousel-track"
        tabIndex={0}
        aria-label="Scrollable invitation designs. Use left and right arrow keys."
        onKeyDown={keyboard}
        onScroll={onScroll}
      >
        {items.map((template, index) => (
          <article
            className="carousel-slide design-item"
            key={template.id}
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${items.length}: ${template.name}`}
          >
            <Link
              className={`gallery-art-link stage-${template.theme}`}
              to={`/designs/${template.id}`}
              state={{ designReturnTo: returnTo(template.id) }}
              onClick={(event) => remember(event, template.id)}
              aria-label={`Preview ${template.name}`}
            >
              <TemplateArt template={template} />
              <span className="preview-pill">
                Open invitation <ArrowUpRight size={14} />
              </span>
            </Link>
            <span className={`premium-card-badge${template.premium ? "" : " basic-card-badge"}`}>
              {template.premium ? "Premium" : "Basic"}
            </span>
            <div className="design-meta">
              <div>
                <span>
                  {template.category.toUpperCase()} ·{" "}
                  {template.mood.split(" · ")[0].toUpperCase()}
                </span>
                <h2>
                  <Link
                    to={`/designs/${template.id}`}
                    state={{ designReturnTo: returnTo(template.id) }}
                    onClick={(event) => remember(event, template.id)}
                  >
                    {template.name}
                  </Link>
                </h2>
              </div>
              <Link
                to={`/designs/${template.id}`}
                state={{ designReturnTo: returnTo(template.id) }}
                onClick={(event) => remember(event, template.id)}
                aria-label={`Explore ${template.name}`}
              >
                <ArrowUpRight size={21} />
              </Link>
            </div>
            <p className="design-description">{template.description}</p>
          </article>
        ))}
      </div>
      <div className="carousel-footer">
        <span className="carousel-progress" aria-hidden="true">
          <span
            style={{
              width: `${(100 * visible) / items.length}%`,
              left: `${(100 * first) / items.length}%`,
            }}
          />
        </span>
        <span
          aria-live="polite"
          aria-atomic="true"
          className="carousel-position"
        >
          {first + 1}
          {visible > 1
            ? `–${Math.min(first + visible, items.length)}`
            : ""} of {items.length}
        </span>
      </div>
    </section>
  );
}
