import { NavLink } from 'react-router-dom';
import { FaSearch, FaBell, FaHeart, FaClipboardList, FaInbox } from 'react-icons/fa';
import './SidebarNav.css';

export default function SidebarNav() {
  return (
    <aside className="z-sidebar-nav" aria-label="Product Navigation">
      <div className="z-sidebar-nav__inner">
        
        <NavLink
          to="/properties"
          className={({ isActive }) => `z-sidebar-link ${isActive ? 'active' : ''}`}
          title="Search"
        >
          <div className="z-sidebar-link__icon-wrap">
            <FaSearch />
          </div>
          <span className="z-sidebar-link__label">Search</span>
        </NavLink>

        <NavLink
          to="/properties?ordering=-created_at"
          className={({ isActive }) => `z-sidebar-link ${isActive ? 'active' : ''}`}
          title="Updates"
        >
          <div className="z-sidebar-link__icon-wrap">
            <FaBell />
          </div>
          <span className="z-sidebar-link__label">Updates</span>
        </NavLink>

        <NavLink
          to="/favorites"
          className={({ isActive }) => `z-sidebar-link ${isActive ? 'active' : ''}`}
          title="Favorites"
        >
          <div className="z-sidebar-link__icon-wrap">
            <FaHeart />
          </div>
          <span className="z-sidebar-link__label">Favorites</span>
        </NavLink>

        <NavLink
          to="/properties?type=sale"
          className={({ isActive }) => `z-sidebar-link ${isActive ? 'active' : ''}`}
          title="Plan"
        >
          <div className="z-sidebar-link__icon-wrap">
            <FaClipboardList />
          </div>
          <span className="z-sidebar-link__label">Plan</span>
        </NavLink>

        <NavLink
          to="/dashboard"
          className={({ isActive }) => `z-sidebar-link ${isActive ? 'active' : ''}`}
          title="Inbox"
        >
          <div className="z-sidebar-link__icon-wrap">
            <FaInbox />
          </div>
          <span className="z-sidebar-link__label">Inbox</span>
        </NavLink>

      </div>
    </aside>
  );
}
