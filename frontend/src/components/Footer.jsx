import { Link } from 'react-router-dom'
import { FaHome, FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa'
import './Footer.css'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer__top">
        <div className="container footer__grid">

          {/* Brand */}
          <div className="footer__brand">
            <Link to="/" className="footer__logo">
              <FaHome className="footer__logo-icon" />
              <span>Prestige<span className="text-gold">Realty</span></span>
            </Link>
            <p className="footer__tagline">
              Bangladesh's premier luxury real estate platform. Find your dream home across 64 districts.
            </p>
            <div className="footer__socials">
              <a href="#" aria-label="Facebook" className="footer__social-icon"><FaFacebook /></a>
              <a href="#" aria-label="Twitter" className="footer__social-icon"><FaTwitter /></a>
              <a href="#" aria-label="Instagram" className="footer__social-icon"><FaInstagram /></a>
              <a href="#" aria-label="LinkedIn" className="footer__social-icon"><FaLinkedin /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer__col">
            <h4 className="footer__heading">Quick Links</h4>
            <ul className="footer__links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/properties">Browse Properties</Link></li>
              <li><Link to="/properties?listing_type=sale">Properties for Sale</Link></li>
              <li><Link to="/properties?listing_type=rent">Properties for Rent</Link></li>
              <li><Link to="/register">List Your Property</Link></li>
            </ul>
          </div>

          {/* Property Types */}
          <div className="footer__col">
            <h4 className="footer__heading">Property Types</h4>
            <ul className="footer__links">
              <li><Link to="/properties?property_type=apartment">Apartments</Link></li>
              <li><Link to="/properties?property_type=house">Houses</Link></li>
              <li><Link to="/properties?property_type=villa">Villas</Link></li>
              <li><Link to="/properties?property_type=commercial">Commercial</Link></li>
              <li><Link to="/properties?property_type=land">Land</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer__col">
            <h4 className="footer__heading">Contact Us</h4>
            <ul className="footer__contact">
              <li>
                <FaMapMarkerAlt className="footer__contact-icon" />
                <span>Gulshan-2, Dhaka 1212, Bangladesh</span>
              </li>
              <li>
                <FaPhone className="footer__contact-icon" />
                <a href="tel:+8801700000000">+880 1700-000000</a>
              </li>
              <li>
                <FaEnvelope className="footer__contact-icon" />
                <a href="mailto:info@prestigerealty.bd">info@prestigerealty.bd</a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <p>&copy; {year} PrestigeRealty. All rights reserved.</p>
          <div className="footer__legal">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
