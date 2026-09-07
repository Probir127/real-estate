import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FaBars, FaTimes, FaUser, FaHeart,
  FaPlus, FaSignOutAlt, FaChevronDown
} from 'react-icons/fa';
import './Navbar.css';

export default function Navbar() {
  const { isAuthenticated, isAgent, isAdmin, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [lang, setLang] = useState('EN'); // 'EN' | 'BN'
  const [savedCount, setSavedCount] = useState(0);
  const dropRef = useRef(null);

  // Sync saved count
  useEffect(() => {
    const updateCount = () => {
      try {
        const saved = JSON.parse(localStorage.getItem('pr-saved') || localStorage.getItem('zennor_saved_homes') || '[]');
        setSavedCount(saved.length);
      } catch {
        setSavedCount(0);
      }
    };
    updateCount();
    window.addEventListener('storage', updateCount);
    window.addEventListener('savedHomesUpdated', updateCount);
    return () => {
      window.removeEventListener('storage', updateCount);
      window.removeEventListener('savedHomesUpdated', updateCount);
    };
  }, []);

  // Scroll detection for subtle border shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setDropOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setMenuOpen(false);
    setDropOpen(false);
    await logout();
    navigate('/');
  };

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'EN' ? 'BN' : 'EN'));
  };

  // Helper to check active status with query parameters (e.g. ?type=buy or ?type=rent)
  const isPathActive = (path) => {
    if (path.includes('?')) {
      const [pathname, search] = path.split('?');
      return location.pathname === pathname && location.search.includes(search);
    }
    return location.pathname === path;
  };

  return (
    <header className={`z-nav ${scrolled ? 'z-nav--scrolled' : ''}`}>
      <div className="z-nav__container">
        <div className="z-nav__inner">

          {/* ── 1. Brand Logo ──────────────────────────────────── */}
          <Link to="/" className="z-nav__brand" onClick={() => setMenuOpen(false)} aria-label="Zennor home">
            <span className="z-nav-logo-box">
              <svg viewBox="0 0 24 24" className="z-nav-logo-svg" aria-hidden="true">
                <path d="M4 11.2 12 4.5l8 6.7V20a1 1 0 0 1-1 1h-4.6v-5.1H9.6V21H5a1 1 0 0 1-1-1z" fill="#ffffff" />
                <path d="M12 4.5 20 11.2V20a1 1 0 0 1-1 1h-4.6v-5.1H12z" fill="#d19f33" />
              </svg>
            </span>
            <span className="z-nav-brand-text">
              <span className="z-nav-brand-name">
                Zennor<span className="z-nav-brand-gold">.</span>
              </span>
              <span className="z-nav-brand-sub">BANGLADESH</span>
            </span>
          </Link>

          {/* ── 2. Center Nav Links (Matches Screenshot) ────────────────── */}
          <nav className="z-nav__center-menu" aria-label="Main Navigation">
            <Link
              to="/search?type=buy"
              className={`z-nav-link ${isPathActive('/search?type=buy') ? 'active' : ''}`}
            >
              {lang === 'BN' ? 'কিনুন' : 'Buy'}
            </Link>
            <Link
              to="/search?type=rent"
              className={`z-nav-link ${isPathActive('/search?type=rent') ? 'active' : ''}`}
            >
              {lang === 'BN' ? 'ভাড়া' : 'Rent'}
            </Link>
            <Link
              to="/sell"
              className={`z-nav-link ${isPathActive('/sell') ? 'active' : ''}`}
            >
              {lang === 'BN' ? 'বিক্রয়' : 'Sell'}
            </Link>
            <Link
              to="/agents"
              className={`z-nav-link ${isPathActive('/agents') ? 'active' : ''}`}
            >
              {lang === 'BN' ? 'এজেন্ট খুঁজুন' : 'Find an agent'}
            </Link>
            <Link
              to="/loan"
              className={`z-nav-link ${isPathActive('/loan') ? 'active' : ''}`}
            >
              {lang === 'BN' ? 'গৃহঋণ' : 'Home loan'}
            </Link>
            <Link
              to="/valuation"
              className={`z-nav-link ${isPathActive('/valuation') ? 'active' : ''}`}
            >
              {lang === 'BN' ? 'প্রপার্টির দাম' : 'Property value'}
            </Link>
            <Link
              to="/pricing"
              className={`z-nav-link ${isPathActive('/pricing') ? 'active' : ''}`}
            >
              {lang === 'BN' ? 'এজেন্টদের জন্য' : 'For agents'}
            </Link>
          </nav>

          {/* ── 3. Right Action Tools (Matches Screenshot) ──────────────── */}
          <div className="z-nav__right-tools">

            {/* Language Switcher with Translate Icon */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="z-nav-lang-btn"
              title="Switch language"
              aria-label="Switch language"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="z-lang-icon" aria-hidden="true">
                <path d="m5 8 6 6" />
                <path d="m4 14 6-6 2-3" />
                <path d="M2 5h12" />
                <path d="M7 2h1" />
                <path d="m22 22-5-10-5 10" />
                <path d="M14 18h6" />
              </svg>
              <span>{lang === 'EN' ? 'বাংলা' : 'English'}</span>
            </button>

            {/* Saved Button with Heart Icon */}
            <Link to="/saved" className="z-nav-saved-btn" title="Saved properties" aria-label="Saved properties">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="z-saved-heart-icon" aria-hidden="true">
                <path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5" />
              </svg>
              <span className="z-nav-saved-text">Saved</span>
              {savedCount > 0 && <span className="z-saved-counter">{savedCount}</span>}
            </Link>

            {/* Sign in / User Profile Dropdown */}
            {isAuthenticated ? (
              <div className="z-nav__user-dropdown-wrap" ref={dropRef}>
                <button
                  type="button"
                  className={`z-nav__user-btn ${dropOpen ? 'active' : ''}`}
                  onClick={() => setDropOpen((prev) => !prev)}
                >
                  <div className="z-nav__avatar">
                    <FaUser />
                  </div>
                  <span className="z-nav__user-name">{user?.full_name?.split(' ')[0] || 'Account'}</span>
                  <FaChevronDown className="z-nav__chevron" />
                </button>

                {dropOpen && (
                  <div className="z-nav__dropdown-menu">
                    <div className="z-nav__dropdown-header">
                      <strong>{user?.full_name || 'User'}</strong>
                      <small>{user?.email}</small>
                    </div>
                    <div className="z-nav__dropdown-divider" />
                    <Link to="/profile" className="z-nav__dropdown-item" onClick={() => setDropOpen(false)}>
                      <FaUser /> Profile &amp; Account
                    </Link>
                    <Link to="/saved" className="z-nav__dropdown-item" onClick={() => setDropOpen(false)}>
                      <FaHeart /> Saved Properties
                    </Link>
                    {isAgent && (
                      <Link to="/dashboard" className="z-nav__dropdown-item" onClick={() => setDropOpen(false)}>
                        Agent Dashboard
                      </Link>
                    )}
                    {isAdmin && (
                      <a href="http://127.0.0.1:8000/admin/" target="_blank" rel="noreferrer" className="z-nav__dropdown-item">
                        Django Admin
                      </a>
                    )}
                    <div className="z-nav__dropdown-divider" />
                    <button type="button" className="z-nav__dropdown-item z-nav__logout-btn" onClick={handleLogout}>
                      <FaSignOutAlt /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="z-nav-signin-link">
                Sign in
              </Link>
            )}

            {/* Post a property Emerald Pill Button */}
            <Link to="/sell" className="z-nav-post-cta" title="Post a property">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="z-plus-icon" aria-hidden="true">
                <path d="M5 12h14" />
                <path d="M12 5v14" />
              </svg>
              <span className="z-post-text-full">Post a property</span>
              <span className="z-post-text-mobile">Post</span>
            </Link>

            {/* Mobile Hamburger Toggle Button */}
            <button
              type="button"
              className="z-nav-mobile-toggle"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle Navigation Menu"
            >
              {menuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>

        </div>
      </div>

      {/* ── 4. Mobile Navigation Drawer ─────────────────────────── */}
      {menuOpen && (
        <div className="z-mobile-drawer">
          <div className="z-mobile-drawer__links">
            <Link to="/search?type=buy" onClick={() => setMenuOpen(false)}>Buy</Link>
            <Link to="/search?type=rent" onClick={() => setMenuOpen(false)}>Rent</Link>
            <Link to="/sell" onClick={() => setMenuOpen(false)}>Sell</Link>
            <Link to="/agents" onClick={() => setMenuOpen(false)}>Find an agent</Link>
            <Link to="/loan" onClick={() => setMenuOpen(false)}>Home loan</Link>
            <Link to="/valuation" onClick={() => setMenuOpen(false)}>Property value</Link>
            <Link to="/pricing" onClick={() => setMenuOpen(false)}>For agents</Link>
            <Link to="/saved" onClick={() => setMenuOpen(false)}>Saved properties</Link>
            {isAuthenticated ? (
              <>
                <Link to="/profile" onClick={() => setMenuOpen(false)}>My Profile</Link>
                {isAgent && <Link to="/dashboard" onClick={() => setMenuOpen(false)}>Agent Dashboard</Link>}
                <button type="button" onClick={handleLogout} className="text-left text-rose-600 font-bold">
                  Sign Out
                </button>
              </>
            ) : (
              <Link to="/login" onClick={() => setMenuOpen(false)} className="font-bold text-brand-700">
                Sign In / Register
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
