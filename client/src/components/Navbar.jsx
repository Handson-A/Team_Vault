import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand" onClick={() => setMenuOpen(false)}>
          <Lock className="vault-icon" size={20} strokeWidth={2.2} />
          <span>Team Vault</span>
        </Link>

        {/* Mobile Hamburger Toggle Button */}
        <button
          className={`navbar-hamburger ${menuOpen ? 'active' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>

        {/* Navigation Items (Desktop & Mobile Drawer) */}
        <div className={`navbar-nav ${menuOpen ? 'open' : ''}`}>
          {isAuthenticated ? (
            <div className="navbar-user">
              <div className="user-info-row">
                <div className="user-avatar">
                  {getInitials(user?.username || user?.email)}
                </div>
                <div className="user-tag">
                  <span className="user-name">{user?.username || 'User'}</span>
                  <span className="user-email">{user?.email}</span>
                </div>
              </div>
              <button onClick={handleLogout} className="btn-logout" title="Sign Out">
                Sign Out
              </button>
            </div>
          ) : (
            <div className="navbar-auth-links">
              <Link
                to="/login"
                className="btn-secondary"
                onClick={() => setMenuOpen(false)}
                style={{ padding: '8px 16px', fontSize: '0.9rem' }}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="btn-primary"
                onClick={() => setMenuOpen(false)}
                style={{ padding: '8px 16px', fontSize: '0.9rem' }}
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;