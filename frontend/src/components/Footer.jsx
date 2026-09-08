import { Link } from 'react-router-dom';
import {
  FaPhoneAlt, FaEnvelope, FaMapMarkerAlt,
  FaFacebookF, FaInstagram, FaLinkedinIn, FaYoutube
} from 'react-icons/fa';
import useSiteContent from '../hooks/useSiteContent';
import './Footer.css';

export default function Footer() {
  const footer = useSiteContent('footer', {
    brand: { name: 'Zennor', subtitle: 'BANGLADESH' },
    motto: 'Bangladesh’s property marketplace, built for how people here actually buy and rent.',
    contact: {
      phone: '+880 9612-345678',
      email: 'hello@zennor.com.bd',
      address: 'Level 7, Gulshan Avenue, Gulshan 1, Dhaka 1212',
    },
    socials: [
      { label: 'Facebook', url: 'https://facebook.com' },
      { label: 'Instagram', url: 'https://instagram.com' },
      { label: 'LinkedIn', url: 'https://linkedin.com' },
      { label: 'YouTube', url: 'https://youtube.com' },
    ],
    columns: [
      { title: 'Buy', links: [['Apartments for sale', '/search?type=buy&kind=apartment'], ['Land & plots', '/search?type=buy&kind=land'], ['Duplex & houses', '/search?type=buy&kind=house'], ['New projects', '/search?type=buy&status=under-construction'], ['Home loan calculator', '/loan']] },
      { title: 'Rent', links: [['Flats for rent', '/search?type=rent&kind=apartment'], ['Office space', '/search?type=rent&kind=office'], ['Commercial space', '/search?type=rent&kind=commercial'], ['Furnished homes', '/search?type=rent&amenity=furnished']] },
      { title: 'Sell & list', links: [['Post a property', '/sell'], ['What is my property worth?', '/valuation'], ['Plans for agents', '/pricing'], ['Agent dashboard', '/dashboard']] },
      { title: 'Popular areas', links: [['Gulshan', '/search?q=Gulshan'], ['Banani', '/search?q=Banani'], ['Dhanmondi', '/search?q=Dhanmondi'], ['Uttara', '/search?q=Uttara'], ['Bashundhara R/A', '/search?q=Bashundhara'], ['Mirpur DOHS', '/search?q=Mirpur']] },
    ],
    legal: [['Terms', '#'], ['Privacy', '#'], ['Trust & safety', '#'], ['Careers', '#']],
    copyright: '© 2026 Zennor Bangladesh Ltd. All rights reserved.',
  });
  const socials = footer.socials || [];
  const socialIcons = [FaFacebookF, FaInstagram, FaLinkedinIn, FaYoutube];

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
                  {footer.brand?.name || 'Zennor'}<span className="text-gold-500">.</span>
                </span>
                  <span className="z-footer-brand-sub">{footer.brand?.subtitle || 'BANGLADESH'}</span>
              </span>
            </Link>

            <p className="z-footer__motto">
              {footer.motto}
            </p>

            <div className="z-footer__contacts">
              <a href={`tel:${footer.contact?.phone || ''}`} className="z-footer__contact-item">
                <FaPhoneAlt className="text-gold-400" />
                <span>{footer.contact?.phone}</span>
              </a>
              <a href={`mailto:${footer.contact?.email || ''}`} className="z-footer__contact-item">
                <FaEnvelope className="text-gold-400" />
                <span>{footer.contact?.email}</span>
              </a>
              <p className="z-footer__contact-item">
                <FaMapMarkerAlt className="text-gold-400 mt-0.5 shrink-0" />
                <span>{footer.contact?.address}</span>
              </p>
            </div>

            <div className="z-footer__socials">
              {socials.map((social, index) => {
                const Icon = socialIcons[index % socialIcons.length];
                return (
                  <a key={social.label || index} href={social.url || '#'} target="_blank" rel="noreferrer" aria-label={social.label}>
                    <Icon />
                  </a>
                );
              })}
            </div>
          </div>

          {(footer.columns || []).map((column) => (
            <div className="z-footer__links-col" key={column.title}>
              <h3>{column.title}</h3>
              <ul>
                {(column.links || []).map(([label, path]) => (
                  <li key={`${label}-${path}`}><Link to={path}>{label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="container-page z-footer__bottom">
        <p>{footer.copyright}</p>
        <div className="z-footer__legal">
          {(footer.legal || []).map(([label, path]) => <a key={label} href={path}>{label}</a>)}
        </div>
      </div>
    </footer>
  );
}
