import "./Navbar.css";
import { Link } from "react-router-dom";
import { useState } from "react";
import logo from "../../../../assets/icons/logo.jpg";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar">

      <div className="logo">
        <img src={logo}  alt="logo" className="logo-icon" />
        <h2>
          Urban<span>Nest</span>
        </h2>
      </div>

      <button
        className={`hamburger${menuOpen ? " open" : ""}`}
        onClick={toggleMenu}
        aria-label="Toggle navigation menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <ul className={`nav-links${menuOpen ? " nav-open" : ""}`}>
        <li><a href="#features" onClick={closeMenu}>Features</a></li>
        <li><a href="#works" onClick={closeMenu}>How It Works</a></li>
        <li><a href="#reviews" onClick={closeMenu}>Reviews</a></li>
        <li><a href="#faq" onClick={closeMenu}>FAQ</a></li>
      </ul>

      <div className={`nav-buttons${menuOpen ? " nav-open" : ""}`}>
        <Link to="/login" className="login-btn" onClick={closeMenu}>
          Log In
        </Link>

        <Link to="/register" className="get-btn" onClick={closeMenu}>
          Get Started
        </Link>
      </div>

    </nav>
  );
}

export default Navbar;