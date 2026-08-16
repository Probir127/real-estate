import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FaHome, FaBars, FaTimes, FaUser, FaHeart,
  FaTachometerAlt, FaPlus, FaSignOutAlt, FaChevronDown
} from 'react-icons/fa';
import './Navbar.css';

export default function Navbar() {
  const { isAuthenticated, isAgent, user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropRef = useRef(null);

  // Scroll detection
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
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
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="container navbar__inner">

        {/* Brand */}
        <Link to="/" className="navbar__brand" onClick={() => setMenuOpen(false)}>
          <FaHome className="navbar__brand-icon" />
          <span>Prestige<span className="text-gold">Realty</span></span>
        </Link>

        {/* Desktop Nav Links */}
        <ul className="navbar__links">
          <li><NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>Home</NavLink></li>
          <li><NavLink to="/properties" className={({ isActive }) => isActive ? 'active' : ''}>Properties</NavLink></li>
          {isAuthenticated && (
            <li><NavLink to="/favorites" className={({ isActive }) => isActive ? 'active' : ''}>Favorites</NavLink></li>
          )}
          {isAgent && (
            <li><NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>Dashboard</NavLink></li>
          )}
        </ul>

        {/* Desktop Auth */}
        <div className="navbar__auth">
          {isAuthenticated ? (
            <>
              {isAgent && (
                <Link to="/properties/new" className="btn btn-primary btn-sm">
                  <FaPlus /> List Property
                </Link>
              )}
              <div className="navbar__user-menu" ref={dropRef}>
                <button
                  className={`navbar__avatar-btn ${dropOpen ? 'navbar__avatar-btn--active' : ''}`}
                  onClick={() => setDropOpen(prev => !prev)}
                  aria-haspopup="true"
                  aria-expanded={dropOpen}
                >
                  <FaUser />
                  <span>{user?.full_name?.split(' ')[0] || 'Account'}</span>
                  <FaChevronDown
                    style={{
                      fontSize: '0.7rem',
                      transition: 'transform 0.2s',
                      transform: dropOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                    }}
                  />
                </button>

                {dropOpen && (
                  <div className="navbar__dropdown navbar__dropdown--open">
                    <Link to="/profile" className="navbar__dropdown-item" onClick={() => setDropOpen(false)}>
                      <FaUser /> Profile
                    </Link>
                    <Link to="/favorites" className="navbar__dropdown-item" onClick={() => setDropOpen(false)}>
                      <FaHeart /> Favorites
                    </Link>
                    {isAgent && (
                      <Link to="/dashboard" className="navbar__dropdown-item" onClick={() => setDropOpen(false)}>
                        <FaTachometerAlt /> Dashboard
                      </Link>
                    )}
                    <a
                      href="http://localhost:8000/admin/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="navbar__dropdown-item text-gold"
                      onClick={() => setDropOpen(false)}
                    >
                      <FaTachometerAlt /> Django Admin Panel
                    </a>
                    <div className="navbar__dropdown-divider" />
                    <button onClick={handleLogout} className="navbar__dropdown-item navbar__dropdown-item--danger">
                      <FaSignOutAlt /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          className="navbar__hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="navbar__mobile">
          <NavLink to="/" end onClick={() => setMenuOpen(false)}>Home</NavLink>
          <NavLink to="/properties" onClick={() => setMenuOpen(false)}>Properties</NavLink>
          {isAuthenticated && (
            <NavLink to="/favorites" onClick={() => setMenuOpen(false)}>Favorites</NavLink>
          )}
          {isAgent && (
            <>
              <NavLink to="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</NavLink>
              <NavLink to="/properties/new" onClick={() => setMenuOpen(false)}>List Property</NavLink>
            </>
          )}
          <div className="navbar__mobile-divider" />
          {isAuthenticated ? (
            <>
              <NavLink to="/profile" onClick={() => setMenuOpen(false)}>Profile</NavLink>
              <a href="http://localhost:8000/admin/" target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)}>
                Django Admin Panel ↗
              </a>
              <button onClick={handleLogout} className="navbar__mobile-logout">Sign Out</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)}>Sign In</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="btn btn-primary">Get Started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
