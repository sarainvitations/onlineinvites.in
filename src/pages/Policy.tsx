import { Link, useParams } from "react-router-dom";
import { Metadata } from "../components/Metadata";
import { policies } from "../data/policies";
import { site } from "../config/site";
import "../information.css";

export default function Policy() {
  const { slug } = useParams();
  const policy = policies.find((item) => item.slug === slug);
  if (!policy) return <main id="main-content" className="container information-page"><Metadata title="Policy not found" description="Choose an Online Invites policy." path={`/policies/${slug}`} noindex /><h1>That policy isn’t here.</h1><Link to="/policies/privacy">Read the privacy policy</Link></main>;
  return <main id="main-content" className="container information-page">
    <Metadata title={policy.title} description={policy.intro} path={`/policies/${policy.slug}`} noindex={!site.policiesApproved} />
    <span className="eyebrow">THE DETAILS THAT MATTER</span>
    <h1>{policy.title}</h1>
    {!site.policiesApproved && <div className="information-notice"><strong>Draft · owner review required</strong><p>Prepared {site.policyUpdated}. This draft is not yet approved or effective. The final policy and operating procedures must be confirmed before live customer submissions or paid orders begin.</p></div>}
    {site.policiesApproved && <p>Last updated: {site.policyUpdated}</p>}
    <p className="information-intro">{policy.intro}</p>
    <nav className="policy-navigation" aria-label="Policy pages">{policies.map((item) => <Link key={item.slug} to={`/policies/${item.slug}`} aria-current={item.slug === slug ? "page" : undefined}>{item.title}</Link>)}</nav>
    <div className="information-content">{policy.sections.map((section) => <section key={section.title}><h2>{section.title}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section>)}</div>
    <div className="information-contact"><h2>Questions about these details?</h2><p>See our <Link to="/contact">contact page</Link> for current contact availability. If we are already in touch, reply through your existing conversation with your enquiry reference.</p></div>
  </main>;
}
