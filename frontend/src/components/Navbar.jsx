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
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="container navbar__inner">

        {/* Brand */}
        <Link to="/" className="navbar__brand" onClick={() => setMenuOpen(false)}>
          <div className="navbar__brand-logo-icon">
            <FaHome />
          </div>
          <span className="navbar__brand-text">
            Prestige<span className="navbar__brand-highlight">Realty</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="navbar__nav">
          <ul className="navbar__links">
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
              <NavLink to="/properties" end className={({ isActive }) => isActive ? 'active' : ''}>
                All Homes
              </NavLink>
            </li>
            {isAgent && (
              <li>
                <NavLink to="/properties/new" className={({ isActive }) => isActive ? 'active' : ''}>
                  List Property
                </NavLink>
              </li>
            )}
            {isAuthenticated && (
              <li>
                <NavLink to="/favorites" className={({ isActive }) => isActive ? 'active' : ''}>
                  <FaHeart style={{ marginRight: '4px', fontSize: '0.85rem' }} /> Saved Homes
                </NavLink>
              </li>
            )}
            {isAgent && (
              <li>
                <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
                  Dashboard
                </NavLink>
              </li>
            )}
          </ul>
        </nav>

        {/* Desktop Auth */}
        <div className="navbar__auth">
          {isAuthenticated ? (
            <div className="navbar__user-menu" ref={dropRef}>
              <button
                className={`navbar__avatar-btn ${dropOpen ? 'navbar__avatar-btn--active' : ''}`}
                onClick={() => setDropOpen(prev => !prev)}
                aria-haspopup="true"
                aria-expanded={dropOpen}
              >
                <div className="navbar__avatar-circle">
                  <FaUser />
                </div>
                <span className="navbar__user-name">{user?.full_name?.split(' ')[0] || 'My Account'}</span>
                <FaChevronDown
                  className="navbar__chevron"
                  style={{
                    transform: dropOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                  }}
                />
              </button>

              {dropOpen && (
                <div className="navbar__dropdown">
                  <div className="navbar__dropdown-header">
                    <strong>{user?.full_name || 'User'}</strong>
                    <small>{user?.email}</small>
                  </div>
                  <div className="navbar__dropdown-divider" />
                  <Link to="/profile" className="navbar__dropdown-item" onClick={() => setDropOpen(false)}>
                    <FaUser /> Profile Settings
                  </Link>
                  <Link to="/favorites" className="navbar__dropdown-item" onClick={() => setDropOpen(false)}>
                    <FaHeart /> Saved Homes
                  </Link>
                  {isAgent && (
                    <>
                      <Link to="/dashboard" className="navbar__dropdown-item" onClick={() => setDropOpen(false)}>
                        <FaTachometerAlt /> Agent Dashboard
                      </Link>
                      <Link to="/properties/new" className="navbar__dropdown-item" onClick={() => setDropOpen(false)}>
                        <FaPlus /> Post a Listing
                      </Link>
                    </>
                  )}
                  {isAdmin && (
                    <a
                      href={adminUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="navbar__dropdown-item navbar__dropdown-item--admin"
                      onClick={() => setDropOpen(false)}
                    >
                      <FaBuilding /> Django Control Center ↗
                    </a>
                  )}
                  <div className="navbar__dropdown-divider" />
                  <button onClick={handleLogout} className="navbar__dropdown-item navbar__dropdown-item--danger">
                    <FaSignOutAlt /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="navbar__auth-buttons">
              <Link to="/login" className="btn btn-ghost btn-sm">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Join
              </Link>
            </div>
          )}

          {/* Mobile hamburger button */}
          <button
            className="navbar__hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="navbar__mobile-drawer">
          <div className="navbar__mobile-links">
            <NavLink to="/properties?type=sale" onClick={() => setMenuOpen(false)}>
              Buy Homes
            </NavLink>
            <NavLink to="/properties?type=rent" onClick={() => setMenuOpen(false)}>
              Rent Homes
            </NavLink>
            <NavLink to="/properties" end onClick={() => setMenuOpen(false)}>
              All Properties
            </NavLink>
            {isAuthenticated && (
              <NavLink to="/favorites" onClick={() => setMenuOpen(false)}>
                <FaHeart style={{ marginRight: '6px' }} /> Saved Homes
              </NavLink>
            )}
            {isAgent && (
              <>
                <NavLink to="/properties/new" onClick={() => setMenuOpen(false)}>
                  <FaPlus style={{ marginRight: '6px' }} /> List Property
                </NavLink>
                <NavLink to="/dashboard" onClick={() => setMenuOpen(false)}>
                  <FaTachometerAlt style={{ marginRight: '6px' }} /> Agent Dashboard
                </NavLink>
              </>
            )}
            {isAdmin && (
              <a
                href={adminUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMenuOpen(false)}
                className="navbar__mobile-admin-link"
              >
                <FaBuilding style={{ marginRight: '6px' }} /> Django Control Center ↗
              </a>
            )}
          </div>

          <div className="navbar__mobile-auth">
            {isAuthenticated ? (
              <div className="navbar__mobile-user-card">
                <div className="navbar__mobile-user-info">
                  <FaUser className="navbar__mobile-avatar-icon" />
                  <div>
                    <strong>{user?.full_name || 'User'}</strong>
                    <small>{user?.email}</small>
                  </div>
                </div>
                <div className="navbar__mobile-actions">
                  <Link to="/profile" className="btn btn-secondary btn-sm" onClick={() => setMenuOpen(false)}>
                    Profile
                  </Link>
                  <button onClick={handleLogout} className="btn btn-dark btn-sm">
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="navbar__mobile-auth-actions">
                <Link to="/login" className="btn btn-secondary" onClick={() => setMenuOpen(false)}>
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-primary" onClick={() => setMenuOpen(false)}>
                  Join Prestige Realty
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
