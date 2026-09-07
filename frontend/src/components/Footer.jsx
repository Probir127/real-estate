import { Link } from 'react-router-dom';
import {
  FaPhoneAlt, FaEnvelope, FaMapMarkerAlt,
  FaFacebookF, FaInstagram, FaLinkedinIn, FaYoutube
} from 'react-icons/fa';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="z-footer">
      <div className="container-page z-footer__top">
        <div className="z-footer__grid">
          {/* Brand Info */}
          <div className="z-footer__brand-col">
            <Link to="/" className="z-footer__brand">
              <span className="z-footer-logo-box">
                <svg viewBox="0 0 24 24" className="z-footer-logo-svg" aria-hidden="true">
                  <path d="M4 11.2 12 4.5l8 6.7V20a1 1 0 0 1-1 1h-4.6v-5.1H9.6V21H5a1 1 0 0 1-1-1z" fill="#ffffff" />
                  <path d="M12 4.5 20 11.2V20a1 1 0 0 1-1 1h-4.6v-5.1H12z" fill="#e6b95c" />
                </svg>
              </span>
              <span className="z-footer-brand-text">
                <span className="z-footer-brand-name">
                  Zennor<span className="text-gold-500">.</span>
                </span>
                <span className="z-footer-brand-sub">BANGLADESH</span>
              </span>
            </Link>

            <p className="z-footer__motto">
              Bangladesh’s property marketplace, built for how people here actually buy and rent.
            </p>

            <div className="z-footer__contacts">
              <a href="tel:+8809612345678" className="z-footer__contact-item">
                <FaPhoneAlt className="text-gold-400" />
                <span>+880 9612-345678</span>
              </a>
              <a href="mailto:hello@zennor.com.bd" className="z-footer__contact-item">
                <FaEnvelope className="text-gold-400" />
                <span>hello@zennor.com.bd</span>
              </a>
              <p className="z-footer__contact-item">
                <FaMapMarkerAlt className="text-gold-400 mt-0.5 shrink-0" />
                <span>Level 7, Gulshan Avenue, Gulshan 1, Dhaka 1212</span>
              </p>
            </div>

            <div className="z-footer__socials">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">
                <FaFacebookF />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
                <FaInstagram />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn">
                <FaLinkedinIn />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube">
                <FaYoutube />
              </a>
            </div>
          </div>

          {/* Col 1: Buy */}
          <div className="z-footer__links-col">
            <h3>Buy</h3>
            <ul>
              <li><Link to="/search?type=buy&kind=apartment">Apartments for sale</Link></li>
              <li><Link to="/search?type=buy&kind=land">Land &amp; plots</Link></li>
              <li><Link to="/search?type=buy&kind=house">Duplex &amp; houses</Link></li>
              <li><Link to="/search?type=buy&status=under-construction">New projects</Link></li>
              <li><Link to="/loan">Home loan calculator</Link></li>
            </ul>
          </div>

          {/* Col 2: Rent */}
          <div className="z-footer__links-col">
            <h3>Rent</h3>
            <ul>
              <li><Link to="/search?type=rent&kind=apartment">Flats for rent</Link></li>
              <li><Link to="/search?type=rent&kind=office">Office space</Link></li>
              <li><Link to="/search?type=rent&kind=commercial">Commercial space</Link></li>
              <li><Link to="/search?type=rent&amenity=furnished">Furnished homes</Link></li>
            </ul>
          </div>

          {/* Col 3: Sell & list */}
          <div className="z-footer__links-col">
            <h3>Sell &amp; list</h3>
            <ul>
              <li><Link to="/sell">Post a property</Link></li>
              <li><Link to="/valuation">What is my property worth?</Link></li>
              <li><Link to="/pricing">Plans for agents</Link></li>
              <li><Link to="/dashboard">Agent dashboard</Link></li>
            </ul>
          </div>

          {/* Col 4: Popular areas */}
          <div className="z-footer__links-col">
            <h3>Popular areas</h3>
            <ul>
              <li><Link to="/search?q=Gulshan">Gulshan</Link></li>
              <li><Link to="/search?q=Banani">Banani</Link></li>
              <li><Link to="/search?q=Dhanmondi">Dhanmondi</Link></li>
              <li><Link to="/search?q=Uttara">Uttara</Link></li>
              <li><Link to="/search?q=Bashundhara">Bashundhara R/A</Link></li>
              <li><Link to="/search?q=Mirpur">Mirpur DOHS</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="container-page z-footer__bottom">
        <p>© 2026 Zennor Bangladesh Ltd. All rights reserved.</p>
        <div className="z-footer__legal">
          <a href="#">Terms</a>
          <a href="#">Privacy</a>
          <a href="#">Trust &amp; safety</a>
          <a href="#">Careers</a>
        </div>
      </div>
    </footer>
  );
}
