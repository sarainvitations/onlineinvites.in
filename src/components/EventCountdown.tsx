import { useEffect, useState } from "react";
import { eventTimestamp, remainingTime } from "../data/demoEvent";
import { formatEventDate, type InvitationTemplate } from "../data/templates";
import "../event-features.css";

export function EventCountdown({ template }: { template: InvitationTemplate }) {
  const target = eventTimestamp(template.date, template.time);
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    if (!Number.isFinite(target) || target <= Date.now()) return;
    const refresh = () => {
      const current = Date.now();
      setNow(current);
      if (current >= target) window.clearInterval(timer);
    };
    const timer = window.setInterval(refresh, 1000);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [target]);
  if (!Number.isFinite(target)) return null;
  const remaining = remainingTime(target, now);
  return (
    <section className="event-countdown" aria-label="Countdown to the celebration">
      <span className="event-feature-kicker">A LITTLE CLOSER, EVERY SECOND</span>
      <h2>{remaining.ended ? "It’s celebration time." : "Counting down to our day."}</h2>
      <p><time dateTime={new Date(target).toISOString()}>{formatEventDate(template.date)} · {template.time}</time></p>
      {!remaining.ended && <div className="countdown-digits" role="timer" aria-live="off" aria-label="Time remaining until the event">
        {(["days", "hours", "minutes", "seconds"] as const).map((unit) => <div key={unit}><strong data-unit={unit}>{String(remaining[unit]).padStart(2, "0")}</strong><span>{unit}</span></div>)}
      </div>}
      <p className="event-feature-note">Fictional sample event · All times are India Standard Time (IST).</p>
    </section>
  );
}
