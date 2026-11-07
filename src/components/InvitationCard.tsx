import { demoEventDate } from "../data/demoEvent";

export function InvitationCard({
  theme = "garden",
  compact = false,
}: {
  theme?: "garden" | "rose" | "night";
  compact?: boolean;
}) {
  return (
    <div
      className={`invitation ${theme} ${compact ? "compact" : ""}`}
      role="img"
      aria-label={`${theme} illustrative wedding invitation concept`}
    >
      <div className="card-frame" />
      <svg
        className="botanical botanical-top"
        viewBox="0 0 180 160"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M10 150Q50 50 155 12M34 100Q5 75 20 45Q52 50 48 81M65 65Q48 26 69 10Q97 30 82 53M97 42Q103 2 130 5Q142 30 113 34M35 108Q79 112 83 87Q52 73 35 108M83 57Q120 77 139 54Q125 32 99 43"
          stroke="currentColor"
          strokeWidth="1.1"
        />
      </svg>
      <span className="invitation-kicker">TOGETHER WITH THEIR FAMILIES</span>
      <div className="tiny-flower">✳</div>
      <div className="invitation-names">
        {theme === "night" ? "Ayaan" : theme === "rose" ? "Meera" : "Ananya"}
        <em>&</em>
        {theme === "night" ? "Zoya" : theme === "rose" ? "Arjun" : "Rohan"}
      </div>
      <p className="invitation-message">
        invite you to celebrate
        <br />a beautiful beginning
      </p>
      <div className="invitation-date">
        <span>{new Intl.DateTimeFormat("en-IN", { month: "long", timeZone: "Asia/Kolkata" }).format(new Date(`${demoEventDate}T12:00:00+05:30`)).toUpperCase()}</span>
        <strong>{Number(demoEventDate.slice(-2))}</strong>
        <span>{demoEventDate.slice(0, 4)} · 6 PM</span>
      </div>
      <p className="invitation-place">
        THE GARDEN PAVILION
        <br />
        <span>JAIPUR, RAJASTHAN</span>
      </p>
      <svg
        className="botanical botanical-bottom"
        viewBox="0 0 180 160"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M10 150Q50 50 155 12M34 100Q5 75 20 45Q52 50 48 81M65 65Q48 26 69 10Q97 30 82 53M35 108Q79 112 83 87Q52 73 35 108M83 57Q120 77 139 54Q125 32 99 43"
          stroke="currentColor"
          strokeWidth="1.1"
        />
      </svg>
      {compact && <span className="sample-label">DESIGN CONCEPT</span>}
    </div>
  );
}
