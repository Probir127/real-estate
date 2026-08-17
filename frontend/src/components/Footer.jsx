import { Link } from 'react-router-dom';
import {
  FaFacebook, FaInstagram, FaTwitter, FaLinkedin, FaYoutube
} from 'react-icons/fa';
import './Footer.css';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="z-footer">
      <div className="container z-footer__container">

        {/* ── Top Navigation Links (Zillow Style) ─── */}
        <nav className="z-footer__nav">
          <ul className="z-footer__links-row">
            <li><Link to="/properties?type=sale">Buy</Link></li>
            <li><Link to="/properties?type=rent">Rent</Link></li>
            <li><Link to="/properties">All Homes</Link></li>
            <li><Link to="/properties/new">List Property</Link></li>
            <li><Link to="/favorites">Saved Homes</Link></li>
            <li><a href="#">About</a></li>
            <li><a href="#">Research</a></li>
            <li><a href="#">Careers</a></li>
            <li><a href="#">Help & Support</a></li>
            <li><a href="#">Advertise</a></li>
            <li><a href="#">Fair Housing Guide</a></li>
            <li><a href="#">Terms of Use</a></li>
            <li><a href="#">Privacy Notice</a></li>
            <li><a href="#">Cookie Preference</a></li>
          </ul>
        </nav>

        {/* ── Real Estate Brands Row ─────────────── */}
        <div className="z-footer__brands">
          <span className="z-footer__brands-title">Prestige Real Estate Network:</span>
          <div className="z-footer__brands-list">
            <span>Dhaka Prime</span>
            <span>Chittagong Bay Living</span>
            <span>Sylhet Green Estates</span>
            <span>Cox's Bazar Coastal</span>
          </div>
        </div>

        {/* ── Mission & Accessibility Statement ──── */}
        <div className="z-footer__disclaimer">
          <p>
            Prestige Realty Bangladesh is committed to ensuring digital accessibility for individuals with disabilities. We are continuously working to improve the accessibility of our web experience for everyone, and we welcome feedback and accommodation requests.
          </p>
          <p>
            Prestige Realty, Inc. holds licensed real estate brokerage credentials across all divisions in Bangladesh. Equal Housing Opportunity. All data is deemed reliable but is not guaranteed accurate by Prestige Realty.
          </p>
        </div>

        {/* ── App Store Badges ───────────────────── */}
        <div className="z-footer__app-badges">
          <img
            src="https://www.zillowstatic.com/s3/pfs/static/app-store-badge.svg"
            alt="Download on the App Store"
            height="32"
          />
          <img
            src="https://www.zillowstatic.com/s3/pfs/static/google-play-badge.svg"
            alt="Get it on Google Play"
            height="32"
          />
        </div>

        {/* ── Bottom Bar: Copyright & Equal Housing ─ */}
        <div className="z-footer__bottom">
          <div className="z-footer__brand-copy">
            <span className="z-footer__brand-text">
              Prestige<strong style={{ color: '#006AFF' }}>Realty</strong>
            </span>
            <span className="z-footer__copyright">
              © 2006–{year} Prestige Realty Inc. All rights reserved.
            </span>
          </div>

          <div className="z-footer__socials">
            <a href="#" aria-label="Facebook"><FaFacebook /></a>
            <a href="#" aria-label="Instagram"><FaInstagram /></a>
            <a href="#" aria-label="Twitter"><FaTwitter /></a>
            <a href="#" aria-label="LinkedIn"><FaLinkedin /></a>
            <a href="#" aria-label="YouTube"><FaYoutube /></a>
          </div>
        </div>

      </div>
    </footer>
  );
}
