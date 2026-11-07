import { PremiumCover } from "./premium/PremiumCover";
import type { InvitationTemplate } from "../data/templates";
export function TemplateArt({ template }: { template: InvitationTemplate }) {
  if (template.premium) return <PremiumCover template={template} />;
  return (
    <div className={`template-art theme-${template.theme}`} aria-hidden="true">
      <div className="art-border" />
      <span className="art-topline">
        {template.category === "Birthday"
          ? "YOU’RE INVITED TO A LITTLE JOY"
          : template.intro}
      </span>
      <span className="art-symbol">{template.symbol}</span>
      <div className="art-names">
        {template.names.map((name, i) => (
          <span key={name}>
            {i > 0 && <i>&</i>}
            {name}
          </span>
        ))}
      </div>
      <span className="art-rule" />
      <span className="art-message">{template.title}</span>
      <span className="art-date">
        {new Intl.DateTimeFormat("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
          timeZone: "Asia/Kolkata",
        }).format(new Date(`${template.date}T12:00:00+05:30`))}
      </span>
      <span className="art-city">{template.city}</span>
      <div className="art-petals">
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}
