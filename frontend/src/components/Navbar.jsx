import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();

  const isAdmin = user?.role === 'admin';

  const adminNavItems = [
    { id: 'dashboard', path: '/admin/dashboard', label: 'Admin Dashboard' },
    { id: 'students', path: '/admin/students', label: 'Student Directory & Filters' },
    { id: 'candidates', path: '/admin/candidates', label: 'Candidate Screening' },
    { id: 'jobs', path: '/job-details', label: 'Job Postings' },
    { id: 'analysis', path: '/skill-gap-analysis', label: 'Gap Matrix' },
  ];

  const studentNavItems = [
    { id: 'profile', path: '/student-profile', label: 'My Profile (Skills)' },
    { id: 'jobs', path: '/job-details', label: 'Job Postings' },
    { id: 'analysis', path: '/skill-gap-analysis', label: 'Skill Gap Analysis' },
    { id: 'recommendations', path: '/recommendations', label: 'Recommendations' },
  ];

  const navItems = isAdmin ? adminNavItems : studentNavItems;

  const handleNavClick = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const brandDestination = isAuthenticated
    ? isAdmin
      ? '/admin/dashboard'
      : '/student-profile'
    : '/';

  return (
    <header style={styles.header}>
      <div style={styles.innerHeader}>
        {/* Brand Logo & Title */}
        <div style={styles.brandContainer} onClick={() => navigate(brandDestination)}>
          <div style={styles.brandLogo}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span style={styles.brandTitle}>Skill Gap Analyzer</span>
          {isAuthenticated && (
            <span
              style={{
                ...styles.roleIndicator,
                backgroundColor: isAdmin ? '#e8f0fe' : '#e6f7ed',
                color: isAdmin ? '#1a73e8' : '#137333',
              }}
            >
              {isAdmin ? 'Admin Portal' : 'Student Workspace'}
            </span>
          )}
        </div>

        {/* Dynamic Navigation according to Role */}
        {isAuthenticated && (
          <nav style={styles.nav}>
            <div style={styles.segmentedControl}>
              {navItems.map((item) => {
                const isActive =
                  location.pathname === item.path ||
                  (item.id === 'dashboard' && location.pathname === '/dashboard') ||
                  (item.id === 'profile' && location.pathname === '/profile') ||
                  (item.id === 'jobs' && location.pathname === '/jobs') ||
                  (item.id === 'analysis' && location.pathname === '/analysis');

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.path)}
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
        )}

        {/* User Controls & Logout */}
        <div style={styles.userSection}>
          {isAuthenticated ? (
            <div style={styles.userControls}>
              <div style={styles.userBadge}>
                <div style={styles.userAvatar}>{(user?.name || 'U')[0]}</div>
                <div style={styles.userMeta}>
                  <span style={styles.userName}>{user?.name || 'User'}</span>
                  <span style={styles.userRoleText}>{user?.role || 'student'}</span>
                </div>
              </div>
              <button onClick={handleLogout} style={styles.logoutBtn} title="Sign Out">
                Sign Out
              </button>
            </div>
          ) : (
            <div style={styles.authButtons}>
              <button onClick={() => navigate('/login')} style={styles.loginBtn}>
                Sign In
              </button>
              <button onClick={() => navigate('/register')} style={styles.registerBtn}>
                Register
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

const styles = {
  header: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
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
    fontWeight: '700',
    color: '#1d1d1f',
    letterSpacing: '-0.02em',
  },
  roleIndicator: {
    fontSize: '11px',
    fontWeight: '600',
    padding: '2px 8px',
    borderRadius: '980px',
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
    gap: '12px',
  },
  userBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '4px 10px 4px 6px',
    backgroundColor: '#f5f5f7',
    borderRadius: '980px',
    border: '1px solid rgba(0, 0, 0, 0.06)',
  },
  userAvatar: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: '#1d1d1f',
    color: '#ffffff',
    fontSize: '11px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userMeta: {
    display: 'flex',
    flexDirection: 'column',
    lineHeight: 1.1,
  },
  userName: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#1d1d1f',
  },
  userRoleText: {
    fontSize: '9px',
    color: '#86868b',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  logoutBtn: {
    padding: '6px 14px',
    backgroundColor: 'transparent',
    border: '1px solid rgba(207, 19, 34, 0.25)',
    borderRadius: '980px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#cf1322',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  authButtons: {
    display: 'flex',
    gap: '8px',
  },
  loginBtn: {
    padding: '6px 14px',
    backgroundColor: '#f5f5f7',
    color: '#1d1d1f',
    border: '1px solid rgba(0, 0, 0, 0.08)',
    borderRadius: '980px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  registerBtn: {
    padding: '6px 16px',
    backgroundColor: '#0071e3',
    color: '#ffffff',
    border: 'none',
    borderRadius: '980px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
  },
};
