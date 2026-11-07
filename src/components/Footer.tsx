import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
export function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="footer-top">
          <Link className="brand" to="/">
            online<span className="brand-light">invites</span>
            <span className="brand-dot">.</span>
          </Link>
          <p>Made for moments. Remembered forever.</p>
          <Link to="/#faq">
            A little help <ArrowUpRight size={14} />
          </Link>
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} Online Invites. All rights reserved.
          </span>
          <div>
            <Link to="/policies/privacy">Privacy policy</Link>
            <Link to="/policies/terms">Terms & conditions</Link>
            <Link to="/policies/refunds">Refunds & cancellations</Link>
            <Link to="/policies/hosting">Hosting policy</Link>
            <Link to="/contact">Contact us</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
