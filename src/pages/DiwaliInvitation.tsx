import { useEffect, useRef, useState } from 'react';
import { Metadata } from '../components/Metadata';
import '../diwali.css';

const invitationPath = '/invite/varun-priyanka-diwali';
function Lamps() {
  return <div className="diwali-lamps" aria-hidden="true"><span className="diwali-candle"><i /></span><span className="diwali-diya"><i /></span><span className="diwali-diya main-diya"><i /></span><span className="diwali-diya"><i /></span><span className="diwali-candle"><i /></span></div>;
}
export default function DiwaliInvitation() {
  const [opened, setOpened] = useState(false);
  const [opening, setOpening] = useState(false);
  const [status, setStatus] = useState('');
  const heading = useRef<HTMLHeadingElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!opening) { if (opened) heading.current?.focus({ preventScroll: true }); return; }
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const timer = window.setTimeout(() => setOpening(false), 2600);
    return () => { window.clearTimeout(timer); document.body.style.overflow = previous; };
  }, [opened, opening]);
  function openInvitation() {
    window.scrollTo(0, 0);
    setOpening(!window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    setOpened(true);
  }
  async function share() {
    const url = new URL(invitationPath, window.location.origin).href;
    try {
      if (navigator.share) await navigator.share({ title: 'Diwali with Varun & Priyanka', text: 'Join us for an evening of light & togetherness. 7 PM onwards at UER Heights, H-Tower.', url });
      else { await navigator.clipboard.writeText(url); setStatus('Invitation link copied.'); }
    } catch (error) { if (!(error instanceof DOMException && error.name === 'AbortError')) setStatus('Please copy the invitation link from your address bar.'); }
  }
  return <main id="main-content" className={`diwali-page ${opened ? 'is-open' : ''}`}>
    <Metadata title="Diwali with Varun & Priyanka" description="An evening of light & togetherness. Join Varun and Priyanka at their Niwas, UER Heights, H-Tower, from 7 PM onwards." path={invitationPath} noindex image="/invitations/varun-priyanka-diwali.png" imageAlt="Varun and Priyanka’s Diwali invitation with glowing diyas and candles" />
    {(!opened || opening) && <div className={`diwali-curtains ${opening ? 'parting' : ''}`} aria-hidden="true">
      <div className="diwali-curtain curtain-left"><span className="curtain-border" /></div>
      <div className="diwali-curtain curtain-right"><span className="curtain-border" /></div>
      <div className="diwali-pelmet"><span>✦</span><span>✦</span><span>✦</span><span>✦</span><span>✦</span></div>
      <div className="diwali-curtain-glow" />
    </div>}
    {opening && <button className="diwali-skip" onClick={() => setOpening(false)}>Skip animation</button>}
    {!opened ? <section className="diwali-envelope" aria-label="Your Diwali invitation">
      <span className="diwali-kicker">A LITTLE LIGHT, A LOT OF LOVE</span>
      <div className="diwali-seal" aria-hidden="true">✦</div>
      <p className="diwali-script">You’re invited</p><h1>Diwali<br /><em>at our Niwas</em></h1>
      <button ref={trigger} className="diwali-button" onClick={openInvitation}>Open your invitation <span aria-hidden="true">↗</span></button>
      <Lamps /><p className="diwali-small">An evening of light & togetherness</p>
    </section> : <div className="diwali-content" ref={element => { if (element) element.inert = opening; }} aria-hidden={opening || undefined}>
      <section className="diwali-hero">
        <span className="diwali-kicker">AN EVENING OF LIGHT & TOGETHERNESS</span>
        <span className="diwali-star" aria-hidden="true">✦</span>
        <h1 ref={heading} tabIndex={-1}>Diwali</h1>
        <p className="diwali-script">Let the light bring us together.</p>
        <div className="diwali-rule" aria-hidden="true">✧</div>
        <p>With hearts full of joy,</p><h2>Varun <em>&</em> Priyanka</h2>
        <p>warmly invite you to celebrate<br />the Festival of Lights at their Niwas.</p>
        <Lamps /><a className="diwali-scroll" href="#diwali-celebration">Come, celebrate with us <span aria-hidden="true">↓</span></a>
      </section>
      <section id="diwali-celebration" className="diwali-gathering">
        <span className="diwali-kicker">SERENITY · PROSPERITY · TOGETHERNESS</span>
        <h2>A home full of light.<br />An evening full of love.</h2>
        <p>May the glow of diyas bring serenity, prosperity and joy to our hearts and homes. This Diwali, we would love to share that warmth with you.</p>
        <div className="diwali-details"><div><span>THE TIME</span><strong>7 PM onwards</strong></div><div><span>OUR NIWAS</span><strong>UER Heights</strong><p>H-Tower</p></div></div>
        <p className="diwali-script">Your presence will make it brighter.</p>
      </section>
      <section className="diwali-signoff"><span className="diwali-star" aria-hidden="true">✦</span><h2>Come for the lights.<br />Stay for the togetherness.</h2><p>With love,<br /><strong>Varun & Priyanka</strong></p><div className="diwali-actions"><button className="diwali-button" onClick={share}>Share invitation ↗</button><a className="diwali-download" href="/invitations/varun-priyanka-diwali.png" download>Download invitation</a></div><p role="status" className="diwali-small">{status}</p><button className="diwali-replay" onClick={() => { setOpened(false); window.scrollTo(0, 0); requestAnimationFrame(() => trigger.current?.focus()); }}>Replay opening</button></section>
      <div className="diwali-credit">Made with love at <a href="https://onlineinvites.in" target="_blank" rel="noopener noreferrer">onlineinvites.in</a></div>
    </div>}
  </main>;
}
