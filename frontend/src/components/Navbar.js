import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const S = {
  nav: {
    background: 'white',
    borderBottom: '1px solid #e2e8f0',
    boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    fontFamily: "'Segoe UI', Roboto, sans-serif",
  },
  inner: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 24px',
    height: '64px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none',
  },
  logoIcon: {
    width: '38px', height: '38px',
    background: 'linear-gradient(135deg, #059669, #0891b2)',
    borderRadius: '10px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '20px',
    boxShadow: '0 4px 12px rgba(5,150,105,0.3)',
  },
  logoText: { fontSize: '20px', fontWeight: '800', color: '#1e293b' },
  navLinks: { display: 'flex', alignItems: 'center', gap: '4px' },
  navLink: (active) => ({
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '8px 12px',
    borderRadius: '10px',
    textDecoration: 'none',
    fontSize: '13px',
    fontWeight: active ? '700' : '500',
    color: active ? '#059669' : '#64748b',
    background: active ? '#f0fdf4' : 'transparent',
    transition: 'all 0.2s',
    border: active ? '1px solid #bbf7d0' : '1px solid transparent',
  }),
  rightSection: { display: 'flex', alignItems: 'center', gap: '10px' },
  userBadge: {
    display: 'flex', alignItems: 'center', gap: '8px',
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
    padding: '6px 14px',
    borderRadius: '999px',
  },
  userAvatar: {
    width: '26px', height: '26px',
    background: 'linear-gradient(135deg, #059669, #0891b2)',
    borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'white', fontSize: '12px', fontWeight: '800',
  },
  userName: { color: '#166534', fontSize: '13px', fontWeight: '600' },
  emergencyBtn: {
    background: '#dc2626',
    color: 'white',
    padding: '7px 14px',
    borderRadius: '10px',
    textDecoration: 'none',
    fontSize: '12px',
    fontWeight: '700',
    display: 'flex', alignItems: 'center', gap: '4px',
  },
  logoutBtn: {
    background: 'none',
    border: '1px solid #e2e8f0',
    color: '#64748b',
    padding: '7px 14px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    fontFamily: 'inherit',
    transition: 'all 0.2s',
    display: 'flex', alignItems: 'center', gap: '4px',
  },
};

const navLinks = [
  { path: '/dashboard', icon: '🏠', label: 'Dashboard' },
  { path: '/symptom-checker', icon: '🩺', label: 'Symptoms' },
  { path: '/hospitals', icon: '🏨', label: 'Hospitals' },
  { path: '/reports', icon: '📄', label: 'Reports' },
  { path: '/history', icon: '📋', label: 'History' },
  { path: '/profile', icon: '👤', label: 'Profile' },
];

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav style={S.nav}>
      <div style={S.inner}>
        {/* Logo */}
        <Link to="/dashboard" style={S.logo}>
          <div style={S.logoIcon}>🏥</div>
          <span style={S.logoText}>
            Health<span style={{ color: '#059669' }}>Mitra</span>
          </span>
        </Link>

        {/* Nav Links - Desktop */}
        <div style={{ ...S.navLinks, display: window.innerWidth < 900 ? 'none' : 'flex' }}>
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              style={S.navLink(location.pathname === link.path)}
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
        </div>

        {/* Right */}
        <div style={S.rightSection}>
          <div style={S.userBadge}>
            <div style={S.userAvatar}>
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <span style={S.userName}>
              {user?.full_name?.split(' ')[0] || 'User'}
            </span>
          </div>

          <a href="tel:108" style={S.emergencyBtn}>
            🚨 108
          </a>

          <button onClick={handleLogout} style={S.logoutBtn}>
            ↩ Logout
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div style={{
          background: 'white',
          borderTop: '1px solid #e2e8f0',
          padding: '12px 24px',
        }}>
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileOpen(false)}
              style={{
                ...S.navLink(location.pathname === link.path),
                display: 'flex',
                marginBottom: '4px',
              }}
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}

export default Navbar;