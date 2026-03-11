import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Menu,
  X,
  Home,
  LayoutDashboard,
  History,
  PlusCircle,
  LogIn,
  LogOut,
} from 'lucide-react';

const baseNavItems = [
  { path: '/', label: 'Home', icon: Home },
];

const privateNavItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/historic', label: 'History', icon: History },
  { path: '/insert-receipt', label: 'Insert', icon: PlusCircle },
];

const Navbar: React.FC = () => {
  const location = useLocation();
  const { isLoggedIn, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navItems = isLoggedIn ? [...baseNavItems, ...privateNavItems] : [];

  const authItems = isLoggedIn
    ? [{ action: signOut, label: 'Sign Out', icon: LogOut }]
    : [
        { path: '/signin', label: 'Sign In', icon: LogIn },
        { path: '/signup', label: 'Sign Up', icon: LogIn },
      ];

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        backgroundColor: '#fff',
        borderBottom: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}
    >
      <nav
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 24px',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          gap: '32px',
        }}
      >
        {/* Logo */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            flexShrink: 0,
          }}
          className="hover:opacity-70"
          aria-label="Receipt Scanner"
        >
          <img
            src="/logo.jpg"
            alt="Receipt Scanner"
            style={{
              height: '72px',
              width: 'auto',
              borderRadius: '6px',
              objectFit: 'cover',
            }}
          />
        </Link>

        {/* Desktop navigation */}
        <div className="navbar-desktop">
          {navItems.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 0',
                  fontSize: '15px',
                  fontWeight: 500,
                  color: isActive ? '#111' : '#374151',
                  textDecoration: 'none',
                  borderBottom: isActive ? '2px solid #111' : '2px solid transparent',
                }}
                className="hover:text-gray-600"
              >
                <Icon size={18} style={{ flexShrink: 0 }} />
                <span>{label}</span>
              </Link>
            );
          })}
          <div
            style={{
              width: '1px',
              height: '20px',
              backgroundColor: '#e5e7eb',
              marginLeft: 'auto',
              marginRight: '8px',
            }}
          />
          {authItems.map((item) =>
            'path' in item ? (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 0',
                  fontSize: '15px',
                  fontWeight: 500,
                  color: location.pathname === item.path ? '#111' : '#374151',
                  textDecoration: 'none',
                  borderBottom: location.pathname === item.path ? '2px solid #111' : '2px solid transparent',
                }}
              >
                <item.icon size={18} style={{ flexShrink: 0 }} />
                <span>{item.label}</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={item.action}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 0',
                  fontSize: '15px',
                  fontWeight: 500,
                  color: '#374151',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <item.icon size={18} style={{ flexShrink: 0 }} />
                <span>{item.label}</span>
              </button>
            )
          )}
        </div>

        {/* Mobile toggle button */}
        <button
          type="button"
          onClick={() => setMobileOpen((o) => !o)}
          style={{
            padding: '8px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#111',
          }}
          className="navbar-mobile-btn"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="navbar-mobile-menu"
          style={{
            position: 'absolute',
            top: '64px',
            left: 0,
            right: 0,
            backgroundColor: '#fff',
            borderTop: '1px solid #e5e7eb',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
            padding: '16px 24px 24px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  fontSize: '15px',
                  fontWeight: 500,
                  color: location.pathname === path ? '#111' : '#4b5563',
                  textDecoration: 'none',
                  borderLeft: location.pathname === path ? '3px solid #111' : '3px solid transparent',
                  marginLeft: '-3px',
                }}
              >
                <Icon size={18} style={{ flexShrink: 0 }} />
                <span>{label}</span>
              </Link>
            ))}
          </div>
          <div
            style={{
              marginTop: '16px',
              paddingTop: '16px',
              borderTop: '1px solid #e5e7eb',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            {authItems.map((item) =>
              'path' in item ? (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    fontSize: '15px',
                    fontWeight: 500,
                    color: location.pathname === item.path ? '#111' : '#4b5563',
                    textDecoration: 'none',
                  }}
                >
                  <item.icon size={18} style={{ flexShrink: 0 }} />
                  <span>{item.label}</span>
                </Link>
              ) : (
                <button
                  type="button"
                  key={item.label}
                  onClick={() => { item.action(); setMobileOpen(false); }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    fontSize: '15px',
                    fontWeight: 500,
                    color: '#4b5563',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <item.icon size={18} style={{ flexShrink: 0 }} />
                  <span>{item.label}</span>
                </button>
              )
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
