import { useRef, useState } from "react";
import { ArrowUpRight, Mail, Menu, X } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
export function Navigation() {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  return (
    <header className="site-header">
      <div className="container nav-shell">
        <Link
          className="brand"
          onClick={() => setOpen(false)}
          to="/"
          aria-label="Online Invites home"
        >
          <span className="brand-icon">
            <Mail size={22} />
          </span>
          online<span className="brand-light">invites</span>
          <span className="brand-dot">.</span>
        </Link>
        <button
          ref={toggle}
          className="menu-toggle"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          aria-controls="primary-nav"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
        <nav
          id="primary-nav"
          className={open ? "nav-links is-open" : "nav-links"}
          aria-label="Main navigation"
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setOpen(false);
              toggle.current?.focus();
            }
          }}
        >
          <NavLink to="/designs" onClick={() => setOpen(false)}>
            Our designs
          </NavLink>
          <NavLink to="/our-works" onClick={() => setOpen(false)}>Our works</NavLink>
          <a href="/#how-it-works" onClick={() => setOpen(false)}>
            How it works
          </a>
          <NavLink to="/pricing" onClick={() => setOpen(false)}>
            Pricing
          </NavLink>
          <Link
            to="/request-quote"
            className="button button-small"
            onClick={() => setOpen(false)}
          >
            Get a free quote <ArrowUpRight size={16} />
          </Link>
        </nav>
      </div>
    </header>
  );
}
