import type { InvitationTemplate } from "../../data/templates";
import { formatEventDate } from "../../data/templates";
import { Scene } from "./Scene";
export function PremiumCover({ template }: { template: InvitationTemplate }) {
  if (!template.premium) return null;
  return (
    <div
      className={`premium-cover premium-${template.theme} cover-${template.premium.layout}`}
      aria-hidden="true"
    >
      <Scene effect={template.premium.effect} />
      <span className="cover-edition">{template.premium.edition}</span>
      <div className="cover-composition">
        <span className="cover-symbol">{template.symbol}</span>
        <div className="cover-names">
          {template.names.map((name, i) => (
            <span key={name}>
              {i > 0 && <i>&</i>}
              {name}
            </span>
          ))}
        </div>
        <span className="cover-date">{formatEventDate(template.date)}</span>
      </div>
      <span className="cover-bottom">
        {template.category.toUpperCase()} ·{" "}
        {template.premium.label.toUpperCase()}
      </span>
    </div>
  );
}
