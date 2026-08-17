import { Link } from 'react-router-dom';
import { FaHome, FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import './Footer.css';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container footer__inner">

        {/* Brand & Mission */}
        <div className="footer__brand-block">
          <Link to="/" className="footer__logo">
            <div className="footer__logo-icon">
              <FaHome />
            </div>
            <span className="footer__logo-text">
              Prestige<span className="text-blue">Realty</span>
            </span>
          </Link>
          <p className="footer__tagline">
            Prestige Realty is Bangladesh's trusted real estate platform. We empower home buyers, sellers, and renters with transparent pricing, verified legal titles, and licensed agent connections across all divisions.
          </p>
        </div>

        {/* Footer Navigation Columns */}
        <div className="footer__nav-grid">
          
          <div className="footer__col">
            <h4 className="footer__heading">Real Estate</h4>
            <ul className="footer__links">
              <li><Link to="/properties?type=sale">Homes for Sale</Link></li>
              <li><Link to="/properties?type=rent">Homes for Rent</Link></li>
              <li><Link to="/properties">All Property Listings</Link></li>
              <li><Link to="/properties/new">Post a Listing</Link></li>
            </ul>
          </div>

          <div className="footer__col">
            <h4 className="footer__heading">Popular Cities</h4>
            <ul className="footer__links">
              <li><Link to="/properties?city=Dhaka">Homes in Dhaka</Link></li>
              <li><Link to="/properties?city=Chittagong">Homes in Chittagong</Link></li>
              <li><Link to="/properties?city=Sylhet">Homes in Sylhet</Link></li>
              <li><Link to="/properties?city=Cox%27s+Bazar">Homes in Cox's Bazar</Link></li>
            </ul>
          </div>

          <div className="footer__col">
            <h4 className="footer__heading">Account</h4>
            <ul className="footer__links">
              <li><Link to="/login">Sign In</Link></li>
              <li><Link to="/register">Create an Account</Link></li>
              <li><Link to="/favorites">Saved Homes</Link></li>
              <li><Link to="/dashboard">Agent Dashboard</Link></li>
            </ul>
          </div>

          <div className="footer__col">
            <h4 className="footer__heading">Contact & Legal</h4>
            <ul className="footer__links">
              <li><span>Gulshan-2, Dhaka 1212</span></li>
              <li><a href="tel:+8801700000000">+880 1700-000000</a></li>
              <li><a href="mailto:info@prestigerealty.bd">info@prestigerealty.bd</a></li>
              <li><a href="#">Equal Housing Opportunity</a></li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="footer__bottom">
          <p>&copy; {year} Prestige Realty Bangladesh Inc. All rights reserved.</p>
          <div className="footer__socials">
            <a href="#" aria-label="Facebook" className="footer__social-btn"><FaFacebook /></a>
            <a href="#" aria-label="Twitter" className="footer__social-btn"><FaTwitter /></a>
            <a href="#" aria-label="Instagram" className="footer__social-btn"><FaInstagram /></a>
            <a href="#" aria-label="LinkedIn" className="footer__social-btn"><FaLinkedin /></a>
          </div>
        </div>

      </div>
    </footer>
  );
}
