import { useState } from "react";
import { Globe2, Sparkles } from "lucide-react";

const addresses = [
  { label: "Standard link", address: "onlineinvites.in/invite/your-story" },
  { label: "Personalized subdomain", address: "your-story.onlineinvites.in" },
  { label: "Custom domain", address: "your-story.in" },
];

export function InvitationAddress() {
  const [selected, setSelected] = useState(0);
  return (
    <div className="invitation-address" aria-label="Invitation link examples">
      <div className="address-bar">
        <span className="address-icon"><Globe2 size={19} /></span>
        <span>{addresses[selected].address}</span>
        <Sparkles size={17} />
      </div>
      <div className="address-choices" role="group" aria-label="Choose a link example">
        {addresses.map((option, index) => <button key={option.label} type="button" aria-pressed={selected === index} onClick={() => setSelected(index)}>{option.label}</button>)}
      </div>
    </div>
  );
}
