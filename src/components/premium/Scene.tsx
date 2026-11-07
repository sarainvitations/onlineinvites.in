import type { OpeningEffect } from "../../data/templates";

/** Original, scalable scene artwork. The same motif appears on the cover and opening stage. */
export function Scene({ effect }: { effect: OpeningEffect }) {
  return (
    <div className={`scene scene-${effect}`} aria-hidden="true">
      {effect === "curtains" && (
        <>
          <div className="curtain-valance" />
          <div className="curtain curtain-left">
            <i />
            <b />
          </div>
          <div className="curtain curtain-right">
            <i />
            <b />
          </div>
          <div className="stage-footlights" />
        </>
      )}
      {effect === "moonlight" && (
        <>
          <div className="night-stars" />
          <div className="moon-orbit" />
          <div className="silver-moon" />
          <div className="moon-beam" />
          <div className="night-horizon" />
        </>
      )}
      {effect === "sunrise" && (
        <>
          <div className="sun-rays" />
          <div className="rising-sun" />
          <div className="sun-hill hill-back" />
          <div className="sun-hill hill-front" />
        </>
      )}
      {(effect === "gates" || effect === "shutters") && (
        <>
          <div className="portal-light" />
          <div className="portal-frame" />
          <div className="portal-door door-left">
            <i />
            <b />
            <span />
          </div>
          <div className="portal-door door-right">
            <i />
            <b />
            <span />
          </div>
        </>
      )}
      {effect === "envelope" && (
        <>
          <div className="letter-sheet" />
          <div className="envelope-body" />
          <div className="envelope-flap" />
          <div className="wax-seal">&</div>
        </>
      )}
      {effect === "aperture" && (
        <>
          <div className="deco-sunburst" />
          {Array.from({ length: 8 }, (_, i) => (
            <span
              className="aperture-blade"
              key={i}
              style={{ "--i": i } as React.CSSProperties}
            />
          ))}
          <div className="deco-diamond" />
        </>
      )}
      {effect === "bloom" && (
        <>
          <div className="lotus-halo" />
          {Array.from({ length: 8 }, (_, i) => (
            <span
              className="lotus-petal"
              key={i}
              style={{ "--i": i } as React.CSSProperties}
            />
          ))}
          <div className="lotus-heart" />
        </>
      )}
      {effect === "tide" && (
        <>
          <div className="ocean-sun" />
          <svg
            className="tide-wave wave-one"
            viewBox="0 0 1440 500"
            preserveAspectRatio="none"
          >
            <path d="M0 100Q180 0 360 100T720 100T1080 100T1440 100V500H0Z" />
          </svg>
          <svg
            className="tide-wave wave-two"
            viewBox="0 0 1440 500"
            preserveAspectRatio="none"
          >
            <path d="M0 60Q180 160 360 60T720 60T1080 60T1440 60V500H0Z" />
          </svg>
          <svg
            className="tide-wave wave-three"
            viewBox="0 0 1440 500"
            preserveAspectRatio="none"
          >
            <path d="M0 100Q240 -20 480 100T960 100T1440 100V500H0Z" />
          </svg>
        </>
      )}
      {effect === "prism" && (
        <>
          <div className="prism-glow" />
          {Array.from({ length: 6 }, (_, i) => (
            <span
              className="crystal-facet"
              key={i}
              style={{ "--i": i } as React.CSSProperties}
            />
          ))}
          <div className="prism-star">✧</div>
        </>
      )}
      {effect === "lanterns" && (
        <>
          <div className="night-stars" />
          <div className="lantern-moon" />
          {Array.from({ length: 5 }, (_, i) => (
            <div
              className="floating-lantern"
              key={i}
              style={{ "--i": i } as React.CSSProperties}
            >
              <i />
              <span />
            </div>
          ))}
        </>
      )}
      {effect === "ribbons" && (
        <>
          <div className="silk-grid" />
          {Array.from({ length: 6 }, (_, i) => (
            <div
              className="silk-ribbon"
              key={i}
              style={{ "--i": i } as React.CSSProperties}
            />
          ))}
          <div className="brass-medallion">❖</div>
        </>
      )}
    </div>
  );
}
