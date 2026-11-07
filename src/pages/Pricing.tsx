import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Check,
  Globe2,
  Link2,
  AtSign,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { business, packages, rupees } from "../config/business";
import { Reveal } from "../components/Reveal";
import { Metadata } from "../components/Metadata";
const domainOptions = [
  {
    icon: Link2,
    title: "Standard invitation URL",
    label: "Simple & ready to share",
    text: "A standard invitation link is included with every package. No separate domain registration is needed.",
  },
  {
    icon: AtSign,
    title: "Personalized subdomain",
    label: "A little more personal",
    text: "Request a name under onlineinvites.in. Availability and setup are manually reviewed and included in your quotation.",
  },
  {
    icon: Globe2,
    title: "Your existing domain",
    label: "Already have an address?",
    text: "Use a customer-owned domain, subject to DNS access and technical review. DNS, SSL setup and renewals are confirmed individually.",
  },
  {
    icon: Sparkles,
    title: "A new custom domain",
    label: "A home of your own",
    text: "We review availability, registration costs, DNS, SSL and renewal responsibilities before confirming your individual quotation.",
  },
];
export default function Pricing() {
  return (
    <main id="main-content" className="pricing-page">
      <Metadata
        title="Pricing & hosting"
        description="Digital invitation packages start at ₹499. Compare Basic, Premium and Custom designs, hosting terms and individually quoted domain options."
        path="/pricing"
      />
      <section className="page-intro container">
        <span className="eyebrow">THOUGHTFUL DESIGN. CLEAR BEGINNINGS.</span>
        <h1>
          Made for your moment.
          <br />
          <em>Priced for your needs.</em>
        </h1>
        <p>
          Choose a starting point. We’ll confirm the details and final price in
          a personal quotation before any work begins.
        </p>
      </section>
      <section className="container" aria-label="Invitation packages">
        <div className="pricing-grid">
          {packages.map((plan, i) => (
            <Reveal
              className={`price-card ${i === 1 ? "featured-price" : ""}`}
              key={plan.name}
            >
              {i === 1 && (
                <span className="price-ribbon">A LITTLE EXTRA SPECIAL</span>
              )}
              <h2 className="plan-name">{plan.name}</h2>
              <p>{plan.description}</p>
              <div className="price">
                <small>Starting at</small>
                <strong>{rupees(plan.price)}</strong>
              </div>
              <ul>
                {plan.fullFeatures.map((feature) => (
                  <li key={feature}>
                    <Check size={16} />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                className={`button ${i === 1 ? "" : "button-outline"}`}
                to={`/request-quote?package=${plan.name.toLowerCase()}`}
              >
                Request a Free Quote <ArrowUpRight size={16} />
              </Link>
            </Reveal>
          ))}
        </div>
        <p className="section-footnote">
          All prices are indicative starting prices. Final scope, add-ons,
          hosting and domain costs are confirmed in an individual quotation. No
          checkout or payment is collected on this website.
        </p>
      </section>
      <section className="section container pricing-explainer">
        <div>
          <span className="eyebrow">BEFORE WE MAKE THE MAGIC</span>
          <h2>
            Agreed together.
            <br />
            <em>Then brought to life.</em>
          </h2>
        </div>
        <div>
          <p>
            Quotations are non-binding until accepted and confirmed. Once the
            scope is agreed, payment is made upfront before development begins.
          </p>
          <p>
            Your first preview arrives within {business.previewWorkingDays}{" "}
            working days after payment confirmation and receipt of complete
            requirements. Revision limits and final delivery timing are
            confirmed in your quotation.
          </p>
          <Link className="text-link" to="/designs">
            Find your starting design <ArrowUpRight size={16} />
          </Link>
        </div>
      </section>
      <section className="pricing-hosting section">
        <div className="container">
          <Reveal className="section-heading centered">
            <span className="eyebrow">LET THE MOMENT LAST</span>
            <h2>
              A little longer <em>online.</em>
            </h2>
            <p>
              Your first {business.includedHostingDays} days of hosting are
              included with every package.
            </p>
          </Reveal>
          <div className="hosting-price-panel">
            <div>
              <ShieldCheck size={27} />
              <span>Additional hosting</span>
              <strong>
                {rupees(business.hostingDailyRate)}
                <small> / day</small>
              </strong>
            </div>
            <ul>
              <li>
                Select your hosting duration before receiving a quotation.
              </li>
              <li>Hosting charges are paid upfront.</li>
              <li>Hosting begins on the agreed publication date.</li>
              <li>Extensions require confirmation and advance payment.</li>
            </ul>
          </div>
          <p className="section-footnote">
            For example, 45 days includes {business.includedHostingDays} days
            plus {45 - business.includedHostingDays} additional days:{" "}
            {rupees(
              Math.max(0, 45 - business.includedHostingDays) *
                business.hostingDailyRate,
            )}{" "}
            in extra hosting. Domain fees, if any, are quoted separately.
          </p>
        </div>
      </section>
      <section className="section container">
        <Reveal className="section-heading centered">
          <span className="eyebrow">YOUR INVITATION’S LITTLE ADDRESS</span>
          <h2>
            A link that feels <em>like you.</em>
          </h2>
          <p>
            Four flexible choices. All domain and subdomain requests are
            reviewed manually.
          </p>
        </Reveal>
        <div className="domain-grid">
          {domainOptions.map(({ icon: Icon, ...option }) => (
            <article key={option.title}>
              <Icon size={24} strokeWidth={1.4} />
              <span className="eyebrow">{option.label}</span>
              <h3>{option.title}</h3>
              <p>{option.text}</p>
            </article>
          ))}
        </div>
        <p className="section-footnote">
          Domain registration, DNS setup, SSL and renewals are reviewed and
          quoted individually where applicable. Domain renewal responsibility is
          agreed before acceptance; provisioning is not automatic.
        </p>
      </section>
      <section className="gallery-bottom container">
        <div>
          <h2>Start with a little inspiration.</h2>
          <p>
            Open a sample invitation and find the feeling you’re looking for.
          </p>
        </div>
        <Link className="button" to="/designs">
          Explore designs <ArrowUpRight size={16} />
        </Link>
      </section>
    </main>
  );
}
