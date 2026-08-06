import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { IconSearch, IconBell, IconPlus } from '../Icons/Icons';
import { notificationService } from '../../services/notificationService';
import './DashboardNavbar.css';

export default function DashboardNavbar({ scrolled = false }) {
  const navigate = useNavigate();
  const [navSearchQuery, setNavSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [userInitials, setUserInitials] = useState('U');

  const dropdownRef = useRef(null);

  const [notifications, setNotifications] = useState([]);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifDropdownRef = useRef(null);

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

    // Fetch notifications
    const fetchNotifications = async () => {
      if (localStorage.getItem('token')) {
        try {
          const res = await notificationService.getUserNotifications();
          if (res && res.data) {
            setNotifications(res.data);
            setUnreadCount(res.data.filter(n => !n.isRead).length);
          }
        } catch (error) {
          console.error("Error fetching notifications", error);
        }
      }
    };
    fetchNotifications();

    // Close dropdown on outside click
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target)) {
        setNotifMenuOpen(false);
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

  const handleMarkAsRead = async (e, id, targetLink) => {
    if (e) e.stopPropagation();
    try {
      await notificationService.markAsRead(id);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
      if (targetLink) {
        navigate(targetLink);
        setNotifMenuOpen(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async (e) => {
    if (e) e.stopPropagation();
    try {
      await notificationService.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotifClick = (e, notif) => {
      e.stopPropagation();
      if (!notif.isRead) {
          handleMarkAsRead(e, notif._id, notif.targetLink);
      } else if (notif.targetLink) {
          navigate(notif.targetLink);
          setNotifMenuOpen(false);
      }
  };

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
        <div className="un-notif-container" ref={notifDropdownRef}>
          <button 
            className="un-icon-btn" 
            aria-label="Notifications"
            onClick={() => setNotifMenuOpen(!notifMenuOpen)}
          >
            <IconBell />
            {unreadCount > 0 && <span className="un-notif-dot" aria-label="New notifications">{unreadCount}</span>}
          </button>
          
          {notifMenuOpen && (
            <div className="un-notif-dropdown">
              <div className="un-notif-header">
                <h3>Notifications</h3>
                {unreadCount > 0 && (
                  <button className="un-notif-mark-all" onClick={handleMarkAllAsRead}>
                    Mark all as read
                  </button>
                )}
              </div>
              <div className="un-notif-body">
                {notifications.length === 0 ? (
                  <div className="un-notif-empty">You're all caught up! No new notifications.</div>
                ) : (
                  notifications.map(notif => (
                    <div 
                      key={notif._id} 
                      className={`un-notif-item ${!notif.isRead ? 'unread' : ''}`}
                      onClick={(e) => handleNotifClick(e, notif)}
                    >
                      <div className="un-notif-content">
                        <strong>{notif.title}</strong>
                        <p>{notif.message}</p>
                        <span className="un-notif-time">{new Date(notif.createdAt).toLocaleDateString()}</span>
                      </div>
                      {!notif.isRead && (
                         <button 
                           className="un-notif-mark-read-btn" 
                           onClick={(e) => handleMarkAsRead(e, notif._id, null)}
                           title="Mark as read"
                         >
                           <div className="un-notif-unread-indicator"></div>
                         </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

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
              <Link to="/profile" className="un-dropdown-item" onClick={() => setMenuOpen(false)}>
                Profile
              </Link>
              <Link to="/my-properties?tab=saved" className="un-dropdown-item" onClick={() => setMenuOpen(false)}>
                Saved Properties
              </Link>
              <Link to="/my-properties?tab=listings" className="un-dropdown-item" onClick={() => setMenuOpen(false)}>
                My Listings
              </Link>
              <Link to="/my-properties?tab=rents" className="un-dropdown-item" onClick={() => setMenuOpen(false)}>
                My Rents
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
