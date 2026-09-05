import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Zap,
  Briefcase,
  TrendingDown,
  Lightbulb,
  LogOut,
  ChevronDown,
  Filter,
  Sparkles,
  Activity,
  ArrowUpRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout({
  activeTab = 'dashboard',
  pageTitle = 'Employee Skill Gap Analyzer',
  tagText = 'Live Admin Portal',
  headerAction = null,
  children,
}) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { id: 'students', label: 'Student Directory', path: '/admin/students', icon: Filter },
    { id: 'candidates', label: 'Candidate Screening', path: '/admin/candidates', icon: Sparkles },
    { id: 'jobs', label: 'Job Postings', path: '/job-details', icon: Briefcase },
    { id: 'skillgap', label: 'Gap Matrix', path: '/skill-gap-analysis', icon: TrendingDown },
    { id: 'recommend', label: 'Recommendations', path: '/recommendations', icon: Lightbulb },
  ];

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = (user?.name || 'GM')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div style={styles.root}>
      {/* ── LIGHT THEME SIDEBAR ── */}
      <aside style={styles.sidebar}>
        {/* Brand */}
        <div style={styles.brand} onClick={() => navigate('/admin/dashboard')}>
          <div style={styles.brandIcon}>
            <Zap size={15} color="#ffffff" strokeWidth={2.5} />
          </div>
          <span style={styles.brandName}>SkillGap</span>
          <span style={styles.brandSuffix}>Admin</span>
        </div>

        <p style={styles.navSection}>MAIN MENU</p>

        {/* Navigation Items */}
        <nav style={styles.nav}>
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                style={{
                  ...styles.navBtn,
                  ...(active ? styles.navBtnActive : {}),
                }}
              >
                <span
                  style={{
                    ...styles.navIconWrap,
                    ...(active ? styles.navIconWrapActive : {}),
                  }}
                >
                  <Icon size={15} strokeWidth={active ? 2.5 : 2} />
                </span>
                <span style={styles.navLabel}>{item.label}</span>
                {active && <span style={styles.activeDot} />}
              </button>
            );
          })}
        </nav>

        <div style={{ flex: 1 }} />

        {/* Sign Out Action */}
        <button onClick={handleLogout} style={styles.logoutBtn}>
          <LogOut size={15} strokeWidth={2} />
          <span>Sign Out</span>
        </button>

        {/* Admin User Card */}
        <div style={styles.userCard}>
          <div style={styles.userAvatar}>{initials}</div>
          <div style={styles.userInfo}>
            <span style={styles.userName}>{user?.name || 'G.MANOJ'}</span>
            <span style={styles.userRole}>Administrator</span>
          </div>
          <div style={styles.onlineDot} title="Online" />
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ── */}
      <div style={styles.main}>
        {/* ── TOP BAR ── */}
        <header style={styles.topBar}>
          <div style={styles.topLeft}>
            <div style={styles.pageTag}>
              <Activity size={13} color="#2563eb" strokeWidth={2.5} />
              <span style={styles.pageTagText}>{tagText}</span>
            </div>
            <h1 style={styles.pageTitle}>{pageTitle}</h1>
          </div>

          <div style={styles.topRightArea}>
            {headerAction}

            {/* Profile Dropdown */}
            <div style={styles.topRight} ref={dropdownRef}>
              <button
                style={styles.adminBtn}
                onClick={() => setDropdownOpen((v) => !v)}
              >
                <div style={styles.adminAvatar}>{initials}</div>
                <div style={styles.adminMeta}>
                  <span style={styles.adminName}>{user?.name || 'G.MANOJ'}</span>
                  <span style={styles.adminRoleLabel}>Admin</span>
                </div>
                <ChevronDown
                  size={13}
                  color="#94a3b8"
                  style={{
                    transform: dropdownOpen ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.2s',
                  }}
                />
              </button>

              {dropdownOpen && (
                <div style={styles.dropdown}>
                  <div style={styles.dropEmail}>{user?.email || 'gmanooj2@gmail.com'}</div>
                  <div style={styles.dropDivider} />
                  {[
                    { label: 'Admin Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
                    { label: 'Student Directory', path: '/admin/students', icon: Filter },
                    { label: 'Candidate Screening', path: '/admin/candidates', icon: Sparkles },
                    { label: 'Gap Matrix', path: '/skill-gap-analysis', icon: TrendingDown },
                  ].map(({ label, path, icon: Icon }) => (
                    <button
                      key={path}
                      style={styles.dropItem}
                      onClick={() => {
                        setDropdownOpen(false);
                        navigate(path);
                      }}
                    >
                      <Icon size={13} color="#2563eb" />
                      <span>{label}</span>
                    </button>
                  ))}
                  <div style={styles.dropDivider} />
                  <button style={styles.dropLogout} onClick={handleLogout}>
                    <LogOut size={13} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ── WORKSPACE BODY ── */}
        <div style={styles.contentBody}>{children}</div>
      </div>
    </div>
  );
}

const styles = {
  root: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    color: '#0f172a',
  },

  /* ── Light Sidebar ── */
  sidebar: {
    width: '232px',
    minWidth: '232px',
    backgroundColor: '#ffffff',
    borderRight: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    position: 'sticky',
    top: 0,
    height: '100vh',
    overflowY: 'auto',
    zIndex: 90,
    boxShadow: '1px 0 4px rgba(0, 0, 0, 0.02)',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '18px 18px 16px',
    cursor: 'pointer',
    borderBottom: '1px solid #f1f5f9',
  },
  brandIcon: {
    width: '28px',
    height: '28px',
    borderRadius: '8px',
    background: '#2563eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  brandName: {
    fontSize: '15px',
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: '-0.02em',
  },
  brandSuffix: {
    fontSize: '10px',
    fontWeight: '700',
    color: '#2563eb',
    backgroundColor: '#eff6ff',
    border: '1px solid #dbeafe',
    padding: '2px 6px',
    borderRadius: '6px',
    letterSpacing: '0.04em',
  },
  navSection: {
    fontSize: '10px',
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: '0.08em',
    margin: '18px 18px 8px',
    textTransform: 'uppercase',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
    padding: '0 10px',
  },
  navBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '9px 10px',
    borderRadius: '10px',
    border: '1px solid transparent',
    background: 'transparent',
    color: '#64748b',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.15s ease',
    position: 'relative',
    width: '100%',
  },
  navBtnActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#dbeafe',
    color: '#2563eb',
    fontWeight: '600',
  },
  navIconWrap: {
    width: '28px',
    height: '28px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    color: '#64748b',
    flexShrink: 0,
    transition: 'all 0.15s ease',
  },
  navIconWrapActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
    color: '#ffffff',
  },
  navLabel: { flex: 1 },
  activeDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#2563eb',
    flexShrink: 0,
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '9px 18px',
    border: 'none',
    background: 'transparent',
    color: '#64748b',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    marginBottom: '8px',
    width: '100%',
    transition: 'color 0.15s ease',
  },
  userCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 14px',
    margin: '0 10px 14px',
    borderRadius: '12px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
  },
  userAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    background: '#2563eb',
    color: '#ffffff',
    fontSize: '11px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1px',
    overflow: 'hidden',
    flex: 1,
  },
  userName: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#0f172a',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  userRole: {
    fontSize: '10px',
    color: '#64748b',
    fontWeight: '500',
  },
  onlineDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#10b981',
    flexShrink: 0,
  },

  /* ── Main Workspace ── */
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    overflow: 'hidden',
  },

  /* ── Top Bar ── */
  topBar: {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    padding: '12px 28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky',
    top: 0,
    zIndex: 80,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
  },
  topLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  pageTag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
  },
  pageTagText: {
    fontSize: '10px',
    fontWeight: '700',
    color: '#2563eb',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  pageTitle: {
    margin: 0,
    fontSize: '17px',
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: '-0.02em',
  },
  topRightArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  topRight: { position: 'relative' },
  adminBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    padding: '5px 10px 5px 6px',
    borderRadius: '10px',
    cursor: 'pointer',
    outline: 'none',
  },
  adminAvatar: {
    width: '28px',
    height: '28px',
    borderRadius: '7px',
    background: '#2563eb',
    color: '#fff',
    fontSize: '11px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  adminMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1px',
    textAlign: 'left',
  },
  adminName: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#0f172a',
    lineHeight: 1,
  },
  adminRoleLabel: {
    fontSize: '10px',
    color: '#64748b',
    fontWeight: '500',
  },
  dropdown: {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    right: 0,
    width: '216px',
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0',
    padding: '8px',
    zIndex: 100,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  dropEmail: {
    padding: '6px 10px',
    fontSize: '11px',
    color: '#64748b',
    wordBreak: 'break-all',
    fontWeight: '500',
  },
  dropDivider: {
    height: '1px',
    backgroundColor: '#f1f5f9',
    margin: '4px 0',
  },
  dropItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 10px',
    border: 'none',
    background: 'transparent',
    color: '#1e293b',
    fontSize: '13px',
    fontWeight: '500',
    borderRadius: '8px',
    cursor: 'pointer',
    textAlign: 'left',
    width: '100%',
  },
  dropLogout: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 10px',
    border: 'none',
    background: 'transparent',
    color: '#ef4444',
    fontSize: '13px',
    fontWeight: '600',
    borderRadius: '8px',
    cursor: 'pointer',
    textAlign: 'left',
    width: '100%',
  },
  contentBody: {
    flex: 1,
    overflowY: 'auto',
    backgroundColor: '#f8fafc',
  },
};
