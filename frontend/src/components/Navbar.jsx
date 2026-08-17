import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FaHome, FaBars, FaTimes, FaUser, FaHeart,
  FaTachometerAlt, FaPlus, FaSignOutAlt, FaChevronDown, FaBuilding
} from 'react-icons/fa';
import './Navbar.css';

export default function Navbar() {
  const { isAuthenticated, isAgent, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropRef = useRef(null);

  const rawApiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  const adminUrl = rawApiUrl.replace(/\/api\/?$/, '') + '/admin/';

  // Scroll detection
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close dropdown when clicking outside
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

  return (
    <header className={`z-nav ${scrolled ? 'z-nav--scrolled' : ''}`}>
      <div className="z-nav__inner">

        {/* ── 1. Left Nav: Buy, Rent, Sell, Get a mortgage, Find an agent ─── */}
        <nav className="z-nav__left">
          <ul className="z-nav__menu">
            <li>
              <NavLink to="/properties?type=sale" className={({ isActive }) => isActive ? 'active' : ''}>
                Buy
              </NavLink>
            </li>
            <li>
              <NavLink to="/properties?type=rent" className={({ isActive }) => isActive ? 'active' : ''}>
                Rent
              </NavLink>
            </li>
            <li>
              <NavLink to="/properties/new" className={({ isActive }) => isActive ? 'active' : ''}>
                Sell
              </NavLink>
            </li>
            <li>
              <NavLink to="/properties" className={({ isActive }) => isActive ? 'active' : ''}>
                Get a mortgage
              </NavLink>
            </li>
            <li>
              <NavLink to="/properties" className={({ isActive }) => isActive ? 'active' : ''}>
                Find an agent
              </NavLink>
            </li>
          </ul>
        </nav>

        {/* ── 2. Center Brand Logo (Exact Zillow Style) ─ */}
        <div className="z-nav__center">
          <Link to="/" className="z-nav__brand" onClick={() => setMenuOpen(false)}>
            <div className="z-nav__brand-icon">
              <FaHome />
            </div>
            <span className="z-nav__brand-name">
              Prestige<span className="z-nav__brand-name--blue">Realty</span>
            </span>
          </Link>
        </div>

        {/* ── 3. Right Nav: Manage rentals, Advertise, Get help, Sign In ──── */}
        <div className="z-nav__right">
          <ul className="z-nav__secondary-menu">
            <li>
              <NavLink to="/dashboard" className="z-nav__link">
                Manage rentals
              </NavLink>
            </li>
            <li>
              <NavLink to="/properties/new" className="z-nav__link">
                Advertise
              </NavLink>
            </li>
            <li>
              <a href="#footer" className="z-nav__link">
                Get help
              </a>
            </li>
          </ul>

          {isAuthenticated ? (
            <div className="z-nav__user-dropdown-wrap" ref={dropRef}>
              <button
                className={`z-nav__user-btn ${dropOpen ? 'active' : ''}`}
                onClick={() => setDropOpen(prev => !prev)}
                aria-haspopup="true"
                aria-expanded={dropOpen}
              >
                <div className="z-nav__avatar">
                  <FaUser />
                </div>
                <span className="z-nav__user-text">{user?.full_name?.split(' ')[0] || 'Account'}</span>
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
                    <FaUser /> Profile & Account
                  </Link>
                  <Link to="/favorites" className="z-nav__dropdown-item" onClick={() => setDropOpen(false)}>
                    <FaHeart /> Saved Homes
                  </Link>
                  {isAgent && (
                    <>
                      <Link to="/dashboard" className="z-nav__dropdown-item" onClick={() => setDropOpen(false)}>
                        <FaTachometerAlt /> Agent Dashboard
                      </Link>
                      <Link to="/properties/new" className="z-nav__dropdown-item" onClick={() => setDropOpen(false)}>
                        <FaPlus /> Post a Listing
                      </Link>
                    </>
                  )}
                  {isAdmin && (
                    <a
                      href={adminUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="z-nav__dropdown-item z-nav__dropdown-item--admin"
                      onClick={() => setDropOpen(false)}
                    >
                      <FaBuilding /> Django Control Center ↗
                    </a>
                  )}
                  <div className="z-nav__dropdown-divider" />
                  <button onClick={handleLogout} className="z-nav__dropdown-item z-nav__dropdown-item--danger">
                    <FaSignOutAlt /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="z-nav__auth-btns">
              <Link to="/login" className="z-nav__signin-pill">
                Sign In
              </Link>
            </div>
          )}

          {/* Mobile Hamburger */}
          <button
            className="z-nav__hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

      </div>

      {/* ── Mobile Navigation Drawer ────────────────── */}
      {menuOpen && (
        <div className="z-nav__mobile-drawer">
          <div className="z-nav__mobile-links">
            <NavLink to="/properties?type=sale" onClick={() => setMenuOpen(false)}>
              Buy
            </NavLink>
            <NavLink to="/properties?type=rent" onClick={() => setMenuOpen(false)}>
              Rent
            </NavLink>
            <NavLink to="/properties/new" onClick={() => setMenuOpen(false)}>
              Sell
            </NavLink>
            <NavLink to="/properties" end onClick={() => setMenuOpen(false)}>
              All Properties
            </NavLink>
            {isAuthenticated && (
              <NavLink to="/favorites" onClick={() => setMenuOpen(false)}>
                <FaHeart style={{ marginRight: '8px', color: '#e02424' }} /> Saved Homes
              </NavLink>
            )}
            {isAgent && (
              <>
                <NavLink to="/properties/new" onClick={() => setMenuOpen(false)}>
                  <FaPlus style={{ marginRight: '8px' }} /> List Property
                </NavLink>
                <NavLink to="/dashboard" onClick={() => setMenuOpen(false)}>
                  <FaTachometerAlt style={{ marginRight: '8px' }} /> Agent Dashboard
                </NavLink>
              </>
            )}
            {isAdmin && (
              <a
                href={adminUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMenuOpen(false)}
                className="z-nav__mobile-admin-link"
              >
                <FaBuilding style={{ marginRight: '8px' }} /> Django Control Center ↗
              </a>
            )}
          </div>

          <div className="z-nav__mobile-auth">
            {isAuthenticated ? (
              <div className="z-nav__mobile-user-card">
                <div className="z-nav__mobile-user-info">
                  <FaUser className="z-nav__mobile-avatar-icon" />
                  <div>
                    <strong>{user?.full_name || 'User'}</strong>
                    <small>{user?.email}</small>
                  </div>
                </div>
                <div className="z-nav__mobile-actions">
                  <Link to="/profile" className="btn btn-outline btn-sm" onClick={() => setMenuOpen(false)}>
                    Profile
                  </Link>
                  <button onClick={handleLogout} className="btn btn-dark btn-sm">
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="z-nav__mobile-auth-actions">
                <Link to="/login" className="btn btn-primary w-full" onClick={() => setMenuOpen(false)}>
                  Sign In / Join
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
