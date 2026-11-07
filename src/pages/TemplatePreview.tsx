import { useDesignReturn } from "../hooks/useDesignReturn";
import { lazy, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  Clock3,
  MapPin,
  RotateCcw,
} from "lucide-react";
import { formatEventDate, getTemplate, quoteLink } from "../data/templates";
import { TemplateArt } from "../components/TemplateArt";
import { Metadata } from "../components/Metadata";
import { Reveal } from "../components/Reveal";
import { RsvpSection } from "../components/RsvpSection";
const PremiumInvitation = lazy(
  () => import("../components/premium/PremiumInvitation"),
);
export default function TemplatePreview() {
  const { id } = useParams();
  const template = getTemplate(id);
  const returnTo = useDesignReturn(id ?? "");
  const [opened, setOpened] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const reduced = useReducedMotion();
  const replayFocus = useRef(false);
  useEffect(() => {
    setOpened(false);
  }, [id]);
  function open() {
    setOpened(true);
  }
  function replay() {
    replayFocus.current = true;
    setOpened(false);
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  if (!template)
    return (
      <main id="main-content" className="container pending-page">
        <Metadata title="Invitation not found" description="Choose an Online Invites sample invitation from the design gallery." path={`/designs/${id}`} noindex />
        <h1>This invitation hasn’t been written.</h1>
        <p>Choose a sample design from the gallery to explore.</p>
        <Link className="button" to="/designs">
          Back to designs
        </Link>
      </main>
    );
  if (template.premium)
    return <PremiumInvitation key={template.id} template={template} />;
  const date = formatEventDate(template.date);
  const openingExit = reduced
    ? { opacity: 0 }
    : template.theme === "editorial"
      ? { opacity: 0, x: -45 }
      : template.theme === "confetti"
        ? { opacity: 0, rotate: 5, scale: 1.08 }
        : template.theme === "earth"
          ? { opacity: 0, rotateY: -25 }
          : template.theme === "celestial"
            ? { opacity: 0, scale: 1.08 }
            : { opacity: 0, y: -25, scale: 0.97 };
  return (
    <main
      id="main-content"
      className={`preview-page theme-${template.theme}`}
      key={template.id}
    >
      <Metadata
        title={`${template.name} — ${template.category} demo`}
        description={template.description}
        path={`/designs/${template.id}`}
      />
      <div className="preview-toolbar">
        <Link to={returnTo}>
          <ArrowLeft size={16} /> All designs
        </Link>
        <span>
          {template.name} <small>FICTIONAL DEMO</small>
        </span>
        <Link className="preview-quote" to={quoteLink(template.id)}>
          Request Similar Design <ArrowUpRight size={15} />
        </Link>
      </div>
      <AnimatePresence mode="wait">
        {!opened ? (
          <motion.section
            className="invitation-opening"
            key="opening"
            onAnimationComplete={() => {
              if (replayFocus.current) {
                trigger.current?.focus({ preventScroll: true });
                replayFocus.current = false;
              }
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={openingExit}
            transition={{ duration: reduced ? 0 : 0.55 }}
            aria-label="Open sample invitation"
          >
            <span className="opening-eyebrow">
              SOMETHING BEAUTIFUL IS WAITING
            </span>
            <div className="opening-art">
              <TemplateArt template={template} />
            </div>
            <h1>{template.opening}</h1>
            <button ref={trigger} onClick={open} className="open-invitation">
              {template.theme === "confetti"
                ? "Let’s celebrate"
                : template.theme === "earth"
                  ? "Come on in"
                  : "Open invitation"}{" "}
              <ArrowUpRight size={18} />
            </button>
            <p>A fictional sample, ready for you to explore.</p>
          </motion.section>
        ) : (
          <motion.div
            key="invitation"
            onAnimationComplete={() =>
              heading.current?.focus({ preventScroll: true })
            }
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reduced ? 0 : 0.6 }}
            className="invitation-experience"
          >
            <section className="demo-hero">
              <div className="demo-decor" aria-hidden="true">
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>
              <p className="demo-eyebrow">{template.intro}</p>
              <span className="demo-symbol" aria-hidden="true">
                {template.symbol}
              </span>
              <h1 ref={heading} tabIndex={-1}>
                {template.names.map((name, i) => (
                  <span key={name}>
                    {i > 0 && <em>&</em>}
                    {name}
                  </span>
                ))}
              </h1>
              <p className="demo-headline">{template.title}</p>
              <p className="demo-date">
                {date}
                <span>{template.time}</span>
              </p>
              <a className="demo-scroll" href="#celebration">
                A little more of our story <ArrowDown size={17} />
              </a>
            </section>
            <section id="celebration" className="demo-message">
              <Reveal>
                <span className="demo-eyebrow">YOU’RE PART OF THE STORY</span>
                <h2>{template.title}</h2>
                <p>{template.message}</p>
                <span className="demo-divider" aria-hidden="true">
                  {template.symbol}
                </span>
              </Reveal>
            </section>
            <section className="demo-events" aria-label="Event schedule">
              <Reveal>
                <span className="demo-eyebrow">SAVE A LITTLE TIME FOR JOY</span>
                <h2>The celebration</h2>
                <p className="demo-event-date">
                  <CalendarDays size={17} />
                  {date} · All times IST
                </p>
                <div className="demo-event-grid">
                  {template.events.map((event, i) => (
                    <article key={event.title}>
                      <span className="event-index">0{i + 1}</span>
                      <h3>{event.title}</h3>
                      <span className="event-time">
                        <Clock3 size={15} />
                        {event.time} IST
                      </span>
                      <p>{event.detail}</p>
                    </article>
                  ))}
                </div>
              </Reveal>
            </section>
            <section className="demo-venue">
              <Reveal>
                <span className="demo-eyebrow">MEET US HERE</span>
                <h2>A place to make memories.</h2>
                <div className="venue-illustration" aria-hidden="true">
                  <MapPin size={36} strokeWidth={1} />
                  <span>✧</span>
                </div>
                <h3>{template.venue}</h3>
                <p>{template.city}</p>
                <p className="venue-note">
                  Fictional sample venue. The map opens the city for
                  illustration.
                </p>
                <a
                  className="open-invitation"
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(template.city)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View sample map <ArrowUpRight size={17} />
                </a>
              </Reveal>
            </section>
            <RsvpSection template={template} />
            <section className="demo-signoff">
              <span className="demo-symbol" aria-hidden="true">
                {template.symbol}
              </span>
              <h2>
                It’s more beautiful
                <br />
                with you there.
              </h2>
              <p>With love, {template.names.join(" & ")}</p>
              <button className="replay-button" onClick={replay}>
                <RotateCcw size={14} /> Replay opening
              </button>
            </section>
            <section className="demo-studio-cta">
              <p>Imagine this, with your story.</p>
              <Link className="button" to={quoteLink(template.id)}>
                Request Similar Design <ArrowUpRight size={17} />
              </Link>
              <small>
                Fictional sample invitation · RSVP storage depends on the connected runtime.
              </small>
            </section>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
