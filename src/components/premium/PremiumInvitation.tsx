import { useDesignReturn } from "../../hooks/useDesignReturn";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Link } from "react-router-dom";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUpRight,
  MapPin,
  RotateCcw,
  X,
} from "lucide-react";
import {
  formatEventDate,
  quoteLink,
  type InvitationTemplate,
} from "../../data/templates";
import { Metadata } from "../Metadata";
import { Reveal } from "../Reveal";
import { Scene } from "./Scene";
import { EventCountdown } from "../EventCountdown";
import { RsvpSection } from "../RsvpSection";
import "../../premium.css";

type Stage = "sealed" | "revealing" | "open";
export default function PremiumInvitation({
  template,
}: {
  template: InvitationTemplate;
}) {
  const design = template.premium!;
  const returnTo = useDesignReturn(template.id);
  const [stage, setStage] = useState<Stage>("sealed");
  const reduced = useReducedMotion();
  const heading = useRef<HTMLHeadingElement>(null);
  const openButton = useRef<HTMLButtonElement>(null);
  const replayed = useRef(false);
  useEffect(() => {
    if (stage !== "revealing") return;
    const timer = window.setTimeout(() => setStage("open"), reduced ? 0 : 2600);
    return () => window.clearTimeout(timer);
  }, [stage, reduced]);
  useEffect(() => {
    if (stage === "open") heading.current?.focus({ preventScroll: true });
    else if (stage === "sealed" && replayed.current)
      openButton.current?.focus({ preventScroll: true });
  }, [stage]);
  function replay() {
    replayed.current = true;
    window.scrollTo({ top: 0, behavior: "instant" });
    setStage("sealed");
  }
  const date = formatEventDate(template.date);
  const day = template.date.slice(-2);
  const month = new Intl.DateTimeFormat("en-IN", {
    month: "long",
    timeZone: "Asia/Kolkata",
  }).format(new Date(`${template.date}T12:00:00+05:30`));
  const names = (
    <>
      {template.names.map((name, i) => (
        <span key={name}>
          {i > 0 && <em>&</em>}
          {name}
        </span>
      ))}
    </>
  );
  return (
    <main
      id="main-content"
      className={`premium-invitation premium-${template.theme} layout-${design.layout} ${stage === "revealing" ? "is-revealing" : ""}`}
    >
      <Metadata
        title={`${template.name} — ${template.category} invitation`}
        description={template.description}
        path={`/designs/${template.id}`}
      />
      <div className="premium-toolbar">
        <Link to={returnTo}>
          <ArrowLeft size={15} />
          All designs
        </Link>
        <span>
          {template.name}
          <small>FICTIONAL SAMPLE · PREMIUM COLLECTION</small>
        </span>
        <Link to={quoteLink(template.id)}>
          Request Similar Design <ArrowUpRight size={15} />
        </Link>
      </div>
      {stage !== "open" && (
        <section
          className={`premium-opening effect-${design.effect} ${stage === "revealing" ? "is-revealing" : ""}`}
          aria-label="Open premium sample invitation"
        >
          <div className="opening-scene">
            <Scene effect={design.effect} />
          </div>
          <div className="premium-opening-copy">
            <span className="premium-eyebrow">{design.edition}</span>
            <div className="opening-date">
              <span>{day}</span>
              <span>
                {month}
                <i>{template.date.slice(0, 4)}</i>
              </span>
            </div>
            <p className="opening-hosts">{template.names.join(" & ")}</p>
            <h1>{template.opening}</h1>
            <button
              className="premium-open-button"
              ref={openButton}
              disabled={stage === "revealing"}
              onClick={() => setStage(reduced ? "open" : "revealing")}
            >
              Open invitation <ArrowUpRight size={17} />
            </button>
            <p className="opening-instruction" role="status">
              {stage === "revealing"
                ? "Your invitation is unfolding…"
                : `${design.label} · ${template.time}`}
            </p>
          </div>
          {stage === "revealing" && (
            <button className="skip-scene" onClick={() => setStage("open")}>
              Skip animation <X size={14} />
            </button>
          )}
          <span className="opening-demo-note">
            Fictional event & venue · No audio
          </span>
        </section>
      )}
      {stage !== "sealed" && (
        <div
          className={`premium-experience ${stage === "revealing" ? "experience-behind" : ""}`}
          aria-hidden={stage !== "open"}
          ref={(node) => node?.toggleAttribute("inert", stage !== "open")}
        >
          <motion.section
            className="premium-hero"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="hero-scene">
              <Scene effect={design.effect} />
            </div>
            <div className="premium-hero-aside">
              <span>{design.edition}</span>
              <span>
                {template.category} · {template.date.slice(0, 4)}
              </span>
            </div>
            <div className="premium-hero-title">
              <p className="premium-eyebrow">{template.intro}</p>
              <span className="premium-hero-symbol" aria-hidden="true">
                {template.symbol}
              </span>
              <h1 className="premium-names" ref={heading} tabIndex={-1}>
                {names}
              </h1>
              <p className="premium-hero-caption">{template.title}</p>
            </div>
            <div className="premium-date-block">
              <span className="date-number">{day}</span>
              <div>
                <span>
                  {month} {template.date.slice(0, 4)}
                </span>
                <span>{template.time}</span>
                <span>{template.city}</span>
              </div>
            </div>
            <a className="premium-scroll" href="#premium-story">
              The invitation <ArrowDown size={16} />
            </a>
          </motion.section>
          <EventCountdown template={template} />
          <section className="premium-story" id="premium-story">
            <Reveal>
              <span className="premium-section-number">
                01 / THE INVITATION
              </span>
              <div className="premium-story-layout">
                <div>
                  <span className="story-ornament" aria-hidden="true">
                    {template.symbol}
                  </span>
                  <h2>{template.title}</h2>
                </div>
                <div>
                  <p>{template.message}</p>
                  <span className="story-signature">
                    {template.names.join(" & ")}
                  </span>
                </div>
              </div>
            </Reveal>
          </section>
          <section className="premium-schedule">
            <Reveal>
              <div className="premium-section-heading">
                <span className="premium-section-number">
                  02 / THE OCCASION
                </span>
                <h2>The celebration</h2>
                <p>{date} · All times IST</p>
              </div>
              <div className="premium-event-list">
                {template.events.map((event, i) => (
                  <article key={event.title}>
                    <span className="premium-event-number">0{i + 1}</span>
                    <span className="premium-event-time">
                      {event.time}
                      <small>IST</small>
                    </span>
                    <div>
                      <h3>{event.title}</h3>
                      <p>{event.detail}</p>
                    </div>
                    <span className="event-ornament" aria-hidden="true">
                      {template.symbol}
                    </span>
                  </article>
                ))}
              </div>
            </Reveal>
          </section>
          <section className="premium-location">
            <Reveal>
              <div className="premium-location-art" aria-hidden="true">
                <Scene effect={design.effect} />
                <MapPin size={44} strokeWidth={1} />
                <span>{template.city.split(",")[0]}</span>
              </div>
              <div className="premium-location-copy">
                <span className="premium-section-number">03 / THE SETTING</span>
                <h2>
                  A place.
                  <br />A moment.
                  <br />
                  <em>A memory.</em>
                </h2>
                <h3>{template.venue}</h3>
                <p>{template.city}</p>
                <a
                  className="premium-link"
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(template.city)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View sample map <ArrowUpRight size={16} />
                </a>
                <small>Fictional venue. The sample map opens the city.</small>
              </div>
            </Reveal>
          </section>
          <RsvpSection template={template} />
          <section className="premium-finale">
            <span className="finale-symbol" aria-hidden="true">
              {template.symbol}
            </span>
            <p className="premium-eyebrow">THE MOST BEAUTIFUL PART IS YOU</p>
            <h2>
              We saved you
              <br />
              <em>a little place.</em>
            </h2>
            <p>With love, {template.names.join(" & ")}</p>
            <button className="premium-replay" onClick={replay}>
              <RotateCcw size={14} /> Replay opening
            </button>
          </section>
          <section className="premium-studio">
            <p>Make this moment yours.</p>
            <Link className="button" to={quoteLink(template.id)}>
              Request Similar Design <ArrowUpRight size={16} />
            </Link>
            <small>
              Original demonstration · Fictional details · Sample RSVP available
            </small>
          </section>
        </div>
      )}
    </main>
  );
}
