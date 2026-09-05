import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ activeTab, onSelectTab }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();

  const navItems = [
    { id: 'dashboard', path: '/dashboard', label: 'Dashboard' },
    { id: 'profile', path: '/student-profile', label: 'Student Profile' },
    { id: 'jobs', path: '/job-details', label: 'Job Requirements' },
    { id: 'analysis', path: '/skill-gap-analysis', label: 'Skill Gap Analysis' },
    { id: 'recommendations', path: '/recommendations', label: 'Recommendations' },
  ];

  const handleNavClick = (item) => {
    if (onSelectTab) {
      onSelectTab(item.id);
    }
    navigate(item.path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header style={styles.header}>
      <div style={styles.innerHeader}>
        <div style={styles.brandContainer} onClick={() => navigate('/dashboard')}>
          <div style={styles.brandLogo}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span style={styles.brandTitle}>Skill Gap Analyzer</span>
        </div>

        <nav style={styles.nav}>
          <div style={styles.segmentedControl}>
            {navItems.map((item) => {
              const isActive =
                activeTab === item.id ||
                location.pathname === item.path ||
                (item.id === 'profile' && location.pathname === '/profile') ||
                (item.id === 'jobs' && location.pathname === '/jobs') ||
                (item.id === 'analysis' && location.pathname === '/analysis');

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item)}
                  style={{
                    ...styles.navButton,
                    ...(isActive ? styles.activeNavButton : {}),
                  }}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </nav>

        <div style={styles.userSection}>
          {isAuthenticated ? (
            <div style={styles.userControls}>
              <div style={styles.userBadge}>
                <span style={styles.userName}>{user?.fullName || 'User'}</span>
              </div>
              <button onClick={handleLogout} style={styles.logoutBtn} title="Sign Out">
                Sign Out
              </button>
            </div>
          ) : (
            <button onClick={() => navigate('/login')} style={styles.loginBtn}>
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

const styles = {
  header: {
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
    backdropFilter: 'saturate(180%) blur(20px)',
    WebkitBackdropFilter: 'saturate(180%) blur(20px)',
    borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  innerHeader: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '10px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    flexWrap: 'wrap',
  },
  brandContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
    userSelect: 'none',
  },
  brandLogo: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    backgroundColor: '#1d1d1f',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1d1d1f',
    letterSpacing: '-0.02em',
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
  },
  segmentedControl: {
    display: 'flex',
    backgroundColor: '#e5e5ea',
    padding: '3px',
    borderRadius: '980px',
    gap: '2px',
  },
  navButton: {
    padding: '6px 14px',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#515154',
    fontSize: '13px',
    fontWeight: '500',
    borderRadius: '980px',
    cursor: 'pointer',
    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
    outline: 'none',
  },
  activeNavButton: {
    backgroundColor: '#ffffff',
    color: '#1d1d1f',
    fontWeight: '600',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
  },
  userControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  userBadge: {
    padding: '4px 10px',
    backgroundColor: '#f5f5f7',
    borderRadius: '980px',
    border: '1px solid rgba(0, 0, 0, 0.08)',
  },
  userName: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#1d1d1f',
  },
  logoutBtn: {
    padding: '6px 12px',
    backgroundColor: 'transparent',
    border: '1px solid rgba(0, 0, 0, 0.12)',
    borderRadius: '980px',
    fontSize: '12px',
    fontWeight: '500',
    color: '#cf1322',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  loginBtn: {
    padding: '6px 14px',
    backgroundColor: '#0071e3',
    color: '#ffffff',
    border: 'none',
    borderRadius: '980px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
  },
};
