import { Link, useSearchParams } from "react-router-dom";
import { getTemplate, templates } from "../data/templates";
import { DesignCarousel } from "../components/DesignCarousel";
import { Metadata } from "../components/Metadata";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  Flower2,
  Heart,
  Sparkles,
  Globe2,
  ShieldCheck,
  Smartphone,
  PartyPopper,
  Home as HomeIcon,
  MoonStar,
  Mail,
} from "lucide-react";
import { InvitationAddress } from "../components/InvitationAddress";
import { InvitationCard } from "../components/InvitationCard";
import { Reveal } from "../components/Reveal";
import { business, packages, rupees } from "../config/business";
const occasions = [
  { name: "Weddings", category: "Wedding", icon: Heart },
  { name: "Nikah & Walima", category: "Nikah", icon: MoonStar },
  { name: "Engagements", category: "Engagement", icon: Sparkles },
  { name: "Birthdays", category: "Birthday", icon: PartyPopper },
  { name: "Housewarming", category: "Housewarming", icon: HomeIcon },
  { name: "Every little joy", category: "Other Celebrations", icon: Flower2 },
];
const faqs = [
  [
    "How do I order an invitation?",
    "Explore the design concepts and request a free quotation with your event details. We’ll confirm the design, scope and final price with you. Once you accept the quotation, payment is collected upfront before development begins.",
  ],
  [
    "When will I receive my first preview?",
    `Your first preview is delivered within ${business.previewWorkingDays} working days after payment confirmation and receipt of complete requirements. Your quotation will confirm the scope and delivery schedule.`,
  ],
  [
    "Can I personalize the design?",
    "Yes. Names, event details and design preferences are collected with your requirements. More extensive customization and bespoke designs are quoted individually.",
  ],
  [
    "How long will my invitation stay online?",
    `The first ${business.includedHostingDays} days are included, starting on the agreed publication date. Additional hosting is ${rupees(business.hostingDailyRate)}/day, selected before quotation and paid upfront. Extensions require confirmation and advance payment.`,
  ],
  [
    "Can I use my own domain?",
    "You can request a personalized subdomain, use an existing domain, or request a new domain. Availability, registration, DNS, SSL and renewals are reviewed and quoted individually.",
  ],
];
export default function Home() {
  const [params] = useSearchParams();
  const selected = getTemplate(params.get("template"));
  const selectedPackage = packages.find(
    (plan) => plan.name.toLowerCase() === params.get("package"),
  );
  const quoteParams = new URLSearchParams();
  if (selected) quoteParams.set("template", selected.id);
  if (selectedPackage)
    quoteParams.set("package", selectedPackage.name.toLowerCase());
  const quoteHref = `/request-quote${quoteParams.size ? `?${quoteParams.toString()}` : ""}`;
  return (
    <>
      <Metadata
        title="Beautiful Invitations for Every Celebration"
        description="Thoughtfully crafted digital invitations, starting at ₹499. Explore all invitation cards and personalized pricing."
        path="/"
      />
      <main id="main-content">
        <section className="hero">
          <div className="container hero-grid">
            <Reveal className="hero-copy" immediate>
              <span className="eyebrow">
                <span /> LITTLE DETAILS. LIFELONG MEMORIES.
              </span>
              <h1>
                Beautiful invitations.
                <br />
                For <em>every</em>
                <br />
                celebration.
              </h1>
              <p className="hero-description">
                Your story deserves a beautiful beginning. Thoughtfully crafted
                digital invitations that feel as special as the moment you’re
                celebrating.
              </p>
              <div className="hero-actions">
                <a className="button" href={quoteHref}>
                  Request a Free Quote <ArrowUpRight size={18} />
                </a>
                <Link className="text-link" to="/designs">
                  Explore designs <ArrowRight size={17} />
                </Link>
              </div>
              <div className="hero-note">
                <span className="mini-spark">✧</span> Made with love. Starting
                at <strong>₹499.</strong>
              </div>
            </Reveal>
            <Reveal className="hero-art" immediate>
              <div className="art-orbit orbit-one" />
              <div className="art-orbit orbit-two" />
              <span className="art-star star-one">✧</span>
              <span className="art-star star-two">✦</span>
              <div className="back-card">
                <InvitationCard theme="rose" />
              </div>
              <div className="front-card">
                <InvitationCard />
              </div>
              <div className="floating-note">
                <span className="note-icon">
                  <Heart size={18} />
                </span>
                <div>
                  A little digital magic.<small>A whole lot of you.</small>
                </div>
              </div>
              <div className="art-caption">
                YOUR NEXT CHAPTER, BEAUTIFULLY INVITED.
              </div>
            </Reveal>
          </div>
        </section>
        <div className="promise-strip">
          <div className="container promise-inner">
            <span>
              <Smartphone size={17} /> Beautiful on every screen
            </span>
            <span>
              <Sparkles size={17} /> Thoughtfully personalized
            </span>
            <span>
              <Globe2 size={17} /> Share with a simple link
            </span>
            <span>
              <Heart size={17} /> Made for your moments
            </span>
          </div>
        </div>
        <section className="section occasions">
          <div className="container">
            <Reveal className="section-heading centered">
              <span className="eyebrow">SO MANY REASONS TO CELEBRATE</span>
              <h2>
                Big milestones. <em>Little joys.</em>
              </h2>
              <p>
                Whatever brings your people together, we have a beautiful way to
                invite them.
              </p>
            </Reveal>
            <div className="occasion-grid">
              {occasions.map(({ name, category, icon: Icon }) => (
                <Link
                  to={`/designs?occasion=${encodeURIComponent(category)}`}
                  className="occasion"
                  key={name}
                >
                  <span>
                    <Icon size={25} strokeWidth={1.3} />
                  </span>
                  {name}
                </Link>
              ))}
            </div>
            <p className="occasion-extra">
              And anniversaries, Aqiqah, Griha Pravesh, Puja & all your other
              celebrations.
            </p>
          </div>
        </section>
        <section className="section designs">
          <div className="container">
            <Reveal className="section-heading split">
              <div>
                <span className="eyebrow">A GLIMPSE OF THE POSSIBILITIES</span>
                <h2>
                  Find a little <em>inspiration.</em>
                </h2>
              </div>
              <p>
                From timeless florals to modern minimalism.
                <br />A style for every story, a feeling in every detail.
              </p>
            </Reveal>
            <DesignCarousel
              items={[...templates.filter((item) => !item.premium).slice(0, 3), ...templates.filter((item) => item.premium).slice(0, 3)]}
              anchor="designs"
              label="Featured invitation designs"
            />
            <div className="featured-gallery-link">
              <Link className="text-link" to="/designs">
                Explore all cards <ArrowRight size={17} />
              </Link>
              <p className="section-footnote">
                Interactive samples with fictional event details. Open one and
                make yourself at home.
              </p>
            </div>
          </div>
        </section>
        <section className="section process" id="how-it-works">
          <div className="container">
            <Reveal className="section-heading centered">
              <span className="eyebrow">FROM YOUR IDEA TO THEIR INBOX</span>
              <h2>
                A lovely invitation.
                <br />
                <em>A simple little journey.</em>
              </h2>
            </Reveal>
            <div className="steps">
              {[
                {
                  title: "Tell us your story",
                  text: "Choose a starting style and share your occasion, ideas and all the little details.",
                },
                {
                  title: "Make it yours",
                  text: "Receive a personal quotation. Approve the scope and pay upfront to begin.",
                },
                {
                  title: "Preview the magic",
                  text: "Your first preview arrives within three working days of payment and complete details.",
                },
                {
                  title: "Share the joy",
                  text: "After agreed corrections, your invitation goes live on your chosen publication date.",
                },
              ].map((step, i) => (
                <Reveal className="step" key={step.title}>
                  <span className="step-number">0{i + 1}</span>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
        <section className="section pricing" id="pricing">
          <div className="container">
            <Reveal className="section-heading centered">
              <span className="eyebrow">
                BEAUTIFUL DOESN’T HAVE TO BE COMPLICATED
              </span>
              <h2>
                A perfect fit for <em>your celebration.</em>
              </h2>
              <p>
                A thoughtful starting point. A personalized quotation. No
                surprises.
              </p>
            </Reveal>
            <div className="pricing-grid">
              {packages.map((plan, i) => (
                <Reveal
                  className={`price-card ${i === 1 ? "featured-price" : ""}`}
                  key={plan.name}
                >
                  {i === 1 && (
                    <span className="price-ribbon">A LITTLE EXTRA SPECIAL</span>
                  )}
                  <span className="plan-name">{plan.name}</span>
                  <p>{plan.description}</p>
                  <div className="price">
                    <small>Starting at</small>
                    <strong>{rupees(plan.price)}</strong>
                  </div>
                  <ul>
                    {plan.features.map((feature) => (
                      <li key={feature}>
                        <Check size={15} />
                        {feature}
                      </li>
                    ))}
                    <li>
                      <Check size={15} />
                      {business.includedHostingDays} days of hosting included
                    </li>
                  </ul>
                  <a
                    className={`button ${i === 1 ? "" : "button-outline"}`}
                    href={`/request-quote?package=${plan.name.toLowerCase()}`}
                  >
                    Let’s make it yours <ArrowUpRight size={16} />
                  </a>
                </Reveal>
              ))}
            </div>
            <p className="section-footnote">
              Indicative starting prices. Final pricing depends on your
              requirements and is confirmed in your individual quotation.
            </p>
            <div className="featured-gallery-link">
              <Link className="text-link" to="/pricing">
                Compare packages & hosting <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </section>
        <section className="section hosting">
          <div className="container hosting-panel">
            <Reveal>
              <span className="eyebrow">A LITTLE HOME FOR YOUR BIG DAY</span>
              <h2>
                Your invitation.
                <br />
                <em>Your own little corner.</em>
              </h2>
              <p>
                Share a simple invitation link, request a personalized
                subdomain, or give your celebration its very own domain.
              </p>
              <a href={quoteHref} className="text-link">
                Let’s find your perfect address <ArrowRight size={17} />
              </a>
            </Reveal>
            <div className="hosting-options">
              <InvitationAddress />
              <div className="hosting-detail">
                <ShieldCheck size={22} />
                <p>
                  <strong>{business.includedHostingDays} days, on us.</strong>
                  <br />
                  Stay a little longer for {rupees(business.hostingDailyRate)}
                  /day, paid upfront.
                </p>
              </div>
              <p className="hosting-fine">
                Hosting starts on your agreed publication date. Domain
                availability, setup, SSL and renewals are reviewed and quoted
                individually. Extensions require confirmation and advance
                payment.
              </p>
            </div>
          </div>
        </section>
        <section className="section faq" id="faq">
          <div className="container faq-grid">
            <Reveal className="section-heading">
              <span className="eyebrow">A FEW THINGS YOU MIGHT WONDER</span>
              <h2>
                Good questions.
                <br />
                <em>Thoughtful answers.</em>
              </h2>
              <p>A little clarity before the celebrations begin.</p>
            </Reveal>
            <div>
              {faqs.map(([question, answer]) => (
                <details key={question}>
                  <summary>
                    {question}
                    <ChevronDown size={18} />
                  </summary>
                  <p>{answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
        <section className="contact-section" id="contact">
          <div className="container">
            <Reveal>
              <span className="eyebrow">LET’S MAKE SOMETHING MEANINGFUL</span>
              <span className="contact-flower" aria-hidden="true">
                ✳
              </span>
              <h2>
                Every celebration deserves
                <br />a <em>beautiful invitation.</em>
              </h2>
              <p>Bring your story. We’ll bring it to life.</p>
              <a className="button button-cream" href={quoteHref}>
                Request a Free Quote <ArrowUpRight size={18} />
              </a>
              {(selected || selectedPackage) && (
                <div className="selected-design" role="status">
                  Your starting point:{" "}
                  <strong>{selected?.name ?? selectedPackage?.name}</strong>
                  <span>
                    Your choice is in this URL. Nothing has been submitted.
                  </span>
                </div>
              )}
              <div className="quote-details" id="quote-details">
                <Mail size={18} />
                <p>
                  Complete the quotation form to plan your celebration. It will
                  show whether online submission is available. Visit our{" "}
                  <Link to="/contact">contact page</Link> for more information.
                </p>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
    </>
  );
}
