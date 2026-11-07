import { Link } from "react-router-dom";
import { Metadata } from "../components/Metadata";
import { site } from "../config/site";
import "../information.css";

export default function Contact() {
  return <main id="main-content" className="container information-page">
    <Metadata title="Contact Online Invites" description={`Contact Online Invites in ${site.city} about your digital invitation, quotation, hosting or privacy request.`} path="/contact" />
    <span className="eyebrow">LET’S PLAN YOUR CELEBRATION</span><h1>A little conversation.<br />A beautiful beginning.</h1>
    <p className="information-intro">Speak with Online Invites about your celebration, an existing quotation or your invitation’s hosting.</p>
    <section className="contact-card" aria-label="Business contact details"><h2>Online Invites</h2><dl><div><dt>Based in</dt><dd>{site.city}, India</dd></div></dl><p>Public contact details are not available yet. If we are already in touch, reply through your existing conversation and include your enquiry reference. For privacy, correction, deletion or cancellation requests, explain what you need without sending passwords, payment card details or identity documents.</p></section>
    <section className="information-contact"><h2>Have a new invitation in mind?</h2><p>Choose a design and share your requirements. The form tells you whether live submission is available; preview mode lets you download a copy for your own records. A quotation request does not collect payment.</p><Link className="button" to="/request-quote">Request a Free Quote</Link></section>
    <p>Read our <Link to="/policies/privacy">privacy policy</Link>, <Link to="/policies/terms">terms</Link>, <Link to="/policies/refunds">refund and cancellation policy</Link>, and <Link to="/policies/hosting">hosting policy</Link>.</p>
  </main>;
}
