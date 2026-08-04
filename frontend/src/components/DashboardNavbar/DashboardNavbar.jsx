import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { IconSearch, IconBell, IconPlus } from '../Icons/Icons';
import './DashboardNavbar.css';

export default function DashboardNavbar({ scrolled = false }) {
  const navigate = useNavigate();
  const [navSearchQuery, setNavSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [userInitials, setUserInitials] = useState('U');

  const dropdownRef = useRef(null);

  useEffect(() => {
    // Get user from local storage to set initials
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user && user.name) {
          const names = user.name.trim().split(' ');
          let initials = names[0].charAt(0).toUpperCase();
          if (names.length > 1) {
            initials += names[names.length - 1].charAt(0).toUpperCase();
          }
          setUserInitials(initials);
        }
      } catch (e) {
        console.error("Error parsing user data");
      }
    }

    // Close dropdown on outside click
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNavSearch = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      if (navSearchQuery.trim()) {
        // encodeURIComponent transforms special characters into a URL-encoded format
        navigate(`/search?locality=${encodeURIComponent(navSearchQuery.trim())}`);
      }
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate('/login');
  }

  return (
    <nav className={`un-navbar${scrolled ? ' scrolled' : ''}`}>
      <div className="un-navbar-left">
        <Link className="un-logo" to="/dashboard" aria-label="UrbanNest home">
          <div className="un-logo-mark">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9,22 9,12 15,12 15,22" />
            </svg>
          </div>
          <span className="un-logo-name">Urban<span>Nest</span></span>
        </Link>
      </div>

      <div className="un-navbar-center">
        <div className={`un-nav-search${scrolled ? ' visible' : ''}`} role="search">
          <input
            type="text"
            placeholder="Search city, locality…"
            aria-label="Search"
            value={navSearchQuery}
            onChange={e => setNavSearchQuery(e.target.value)}
            onKeyDown={handleNavSearch}
          />
          <button className="un-nav-search-btn" aria-label="Search" onClick={handleNavSearch}>
            <IconSearch />
          </button>
        </div>
      </div>

      <div className="un-navbar-right">
        <button className="un-btn-list" aria-label="List a property" onClick={() => navigate('/post-property')}>
          <IconPlus />
          <span>List Property</span>
        </button>
        <button className="un-icon-btn" aria-label="Notifications">
          <IconBell />
          <span className="un-notif-dot" aria-label="New notifications" />
        </button>

        <div className="un-avatar-container" ref={dropdownRef}>
          <div
            className="un-avatar"
            role="button"
            aria-label="User profile"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {userInitials}
          </div>

          {menuOpen && (
            <div className="un-avatar-dropdown">
              <Link to="/dashboard" className="un-dropdown-item" onClick={() => setMenuOpen(false)}>
                Dashboard
              </Link>
              <Link to="/my-properties?tab=saved" className="un-dropdown-item" onClick={() => setMenuOpen(false)}>
                Saved Properties
              </Link>
              <Link to="/my-properties?tab=listings" className="un-dropdown-item" onClick={() => setMenuOpen(false)}>
                My Listings
              </Link>
              <div className="un-dropdown-divider"></div>
              <button className="un-dropdown-item un-logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
