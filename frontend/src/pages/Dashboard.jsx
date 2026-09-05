import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, authFetch } from '../context/AuthContext';
import MetricCard from '../components/MetricCard';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout, token } = useAuth();
  const [activeSidebarItem, setActiveSidebarItem] = useState('dashboard');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalEmployees: 250,
    totalJobs: 45,
    applications: 120,
    avgSkillMatch: '74%',
    topSkillGaps: [
      { skill: 'Spring Boot', deficitPercent: 78, currentScore: '2.0 / 5', requiredScore: '4.5 / 5', color: '#ff3b30', note: 'Highest Deficit' },
      { skill: 'React', deficitPercent: 62, currentScore: '2.4 / 5', requiredScore: '4.0 / 5', color: '#ff9500', note: 'Critical Gap' },
      { skill: 'AWS', deficitPercent: 54, currentScore: '1.8 / 5', requiredScore: '3.8 / 5', color: '#ff9500', note: 'High Priority' },
      { skill: 'Docker', deficitPercent: 45, currentScore: '2.2 / 5', requiredScore: '3.5 / 5', color: '#0071e3', note: 'Moderate Gap' },
    ],
  });

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
    { id: 'employees', label: 'Employees', path: '/student-profile', icon: '👥' },
    { id: 'skills', label: 'Skills', path: '/student-profile', icon: '⚡' },
    { id: 'jobs', label: 'Jobs', path: '/job-details', icon: '💼' },
    { id: 'skillgap', label: 'Skill Gap', path: '/skill-gap-analysis', icon: '📉' },
    { id: 'recommend', label: 'Recommend.', path: '/recommendations', icon: '💡' },
  ];

  useEffect(() => {
    async function fetchDashboardStats() {
      try {
        const response = await authFetch('/dashboard/stats', {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.stats) {
            setStats(data.stats);
          }
        }
      } catch (err) {
        console.error('[Dashboard] Error fetching database stats:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardStats();
  }, [token]);

  const handleSidebarClick = (item) => {
    setActiveSidebarItem(item.id);
    navigate(item.path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={styles.layout}>
      {/* Left Sidebar Navigation */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader} onClick={() => navigate('/admin/dashboard')}>
          <div style={styles.brandLogo}>SG</div>
          <span style={styles.sidebarBrandTitle}>SkillGap Admin</span>
        </div>

        <nav style={styles.sidebarNav}>
          {sidebarItems.map((item) => {
            const isActive = activeSidebarItem === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSidebarClick(item)}
                style={{
                  ...styles.sidebarButton,
                  ...(isActive ? styles.sidebarButtonActive : {}),
                }}
              >
                <span style={styles.sidebarIcon}>{item.icon}</span>
                <span style={styles.sidebarLabel}>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div style={styles.sidebarFooter}>
          <div style={styles.sidebarUserCard}>
            <div style={styles.sidebarAvatar}>{(user?.name || 'A')[0]}</div>
            <div style={styles.sidebarUserInfo}>
              <span style={styles.sidebarUserName}>{user?.name || 'Administrator'}</span>
              <span style={styles.sidebarUserRole}>{user?.role || 'admin'}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={styles.mainWrapper}>
        {/* Top Bar */}
        <header style={styles.topBar}>
          <div style={styles.topBarLeft}>
            <h1 style={styles.topBarTitle}>Employee Skill Gap Analyzer</h1>
            <span style={styles.topBarBadge}>Executive Admin Portal</span>
          </div>

          <div style={styles.topBarRight}>
            <div style={styles.dropdownContainer}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={styles.adminDropdownBtn}
              >
                <div style={styles.adminAvatarSmall}>AD</div>
                <span style={styles.adminNameLabel}>{user?.name || 'Admin'}</span>
                <span style={styles.dropdownCaret}>▾</span>
              </button>

              {dropdownOpen && (
                <div style={styles.dropdownMenu}>
                  <div style={styles.dropdownHeader}>
                    <p style={styles.dropdownEmail}>{user?.email || 'admin@skillgap.com'}</p>
                    <span style={styles.rolePill}>Administrator</span>
                  </div>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate('/student-profile');
                    }}
                    style={styles.dropdownItem}
                  >
                    👤 Student Profiles
                  </button>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate('/skill-gap-analysis');
                    }}
                    style={styles.dropdownItem}
                  >
                    📊 Gap Analysis
                  </button>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate('/recommendations');
                    }}
                    style={styles.dropdownItem}
                  >
                    💡 Recommendations
                  </button>
                  <div style={styles.dropdownDivider} />
                  <button onClick={handleLogout} style={styles.dropdownLogoutItem}>
                    🚪 Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dashboard Body */}
        <main style={styles.contentContainer}>
          {/* Top KPI Grid */}
          <section style={styles.kpiGrid}>
            <MetricCard
              label="Total Employees"
              value={stats.totalEmployees?.toString() || '0'}
              subtext="Enrolled candidates in matrix"
              accentColor="#0071e3"
            />
            <MetricCard
              label="Total Jobs"
              value={stats.totalJobs?.toString() || '0'}
              subtext="Active position profiles"
              accentColor="#5856d6"
            />
            <MetricCard
              label="Applications"
              value={stats.applications?.toString() || '0'}
              subtext="Evaluated role submissions"
              accentColor="#ff2d55"
            />
            <MetricCard
              label="Avg Skill Match"
              value={stats.avgSkillMatch || '0%'}
              subtext="Live across organization roles"
              accentColor="#34c759"
            />
          </section>

          {/* Main Analytics Widget: Top Skill Gaps */}
          <section style={styles.analyticsSection}>
            <div style={styles.analyticsCard}>
              <div style={styles.analyticsHeader}>
                <div>
                  <h2 style={styles.widgetTitle}>Top Skill Gaps</h2>
                  <p style={styles.widgetSubtitle}>
                    Distribution of highest deficiency vectors retrieved dynamically from the database
                  </p>
                </div>
                <span style={styles.timeframePill}>Live Database Analysis</span>
              </div>

              <div style={styles.barsContainer}>
                {stats.topSkillGaps && stats.topSkillGaps.length > 0 ? (
                  stats.topSkillGaps.map((item) => (
                    <div key={item.skill} style={styles.barRow}>
                      <div style={styles.barLabelGroup}>
                        <div style={styles.skillNameWrap}>
                          <span style={styles.barSkillName}>{item.skill}</span>
                          <span
                            style={{
                              ...styles.gapTag,
                              backgroundColor: `${item.color || '#ff3b30'}15`,
                              color: item.color || '#ff3b30',
                              border: `1px solid ${item.color || '#ff3b30'}35`,
                            }}
                          >
                            {item.note || 'Deficit'}
                          </span>
                        </div>
                        <div style={styles.scoreComparison}>
                          <span style={styles.scoreText}>
                            Current: <strong>{item.currentScore}</strong> vs Target: <strong>{item.requiredScore}</strong>
                          </span>
                          <span style={{ ...styles.deficitPercent, color: item.color || '#ff3b30' }}>
                            {item.deficitPercent}% Deficit
                          </span>
                        </div>
                      </div>

                      <div style={styles.barTrack}>
                        <div
                          style={{
                            ...styles.barFill,
                            width: `${item.deficitPercent}%`,
                            backgroundColor: item.color || '#ff3b30',
                          }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ color: '#86868b', fontSize: '14px', textAlign: 'center', margin: '20px 0' }}>
                    No skill gaps found in the current evaluation cycle.
                  </p>
                )}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

const styles = {
  layout: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f5f5f7',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Helvetica Neue", sans-serif',
  },
  sidebar: {
    width: '240px',
    backgroundColor: '#ffffff',
    borderRight: '1px solid rgba(0, 0, 0, 0.08)',
    display: 'flex',
    flexDirection: 'column',
    position: 'sticky',
    top: 0,
    height: '100vh',
    zIndex: 90,
  },
  sidebarHeader: {
    padding: '20px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
    cursor: 'pointer',
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
    fontWeight: '700',
    fontSize: '14px',
  },
  sidebarBrandTitle: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#1d1d1f',
    letterSpacing: '-0.02em',
  },
  sidebarNav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '16px 12px',
    flex: 1,
    overflowY: 'auto',
  },
  sidebarButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 14px',
    borderRadius: '10px',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#515154',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.15s ease',
    outline: 'none',
  },
  sidebarButtonActive: {
    backgroundColor: '#e8f0fe',
    color: '#1a73e8',
    fontWeight: '600',
  },
  sidebarIcon: {
    fontSize: '16px',
  },
  sidebarLabel: {
    letterSpacing: '-0.01em',
  },
  sidebarFooter: {
    padding: '16px 14px',
    borderTop: '1px solid rgba(0, 0, 0, 0.06)',
  },
  sidebarUserCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#f5f5f7',
    padding: '8px 10px',
    borderRadius: '10px',
  },
  sidebarAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#1d1d1f',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '13px',
  },
  sidebarUserInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1px',
    overflow: 'hidden',
  },
  sidebarUserName: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#1d1d1f',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  sidebarUserRole: {
    fontSize: '10px',
    color: '#86868b',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  mainWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  topBar: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'saturate(180%) blur(20px)',
    WebkitBackdropFilter: 'saturate(180%) blur(20px)',
    borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
    padding: '14px 32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky',
    top: 0,
    zIndex: 80,
  },
  topBarLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  topBarTitle: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '700',
    color: '#1d1d1f',
    letterSpacing: '-0.02em',
  },
  topBarBadge: {
    padding: '3px 10px',
    backgroundColor: '#e8f0fe',
    color: '#1a73e8',
    borderRadius: '980px',
    fontSize: '11px',
    fontWeight: '600',
  },
  topBarRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  dropdownContainer: {
    position: 'relative',
  },
  adminDropdownBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#ffffff',
    border: '1px solid rgba(0, 0, 0, 0.12)',
    padding: '6px 14px',
    borderRadius: '980px',
    cursor: 'pointer',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
    outline: 'none',
  },
  adminAvatarSmall: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: '#0071e3',
    color: '#ffffff',
    fontSize: '10px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminNameLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#1d1d1f',
  },
  dropdownCaret: {
    fontSize: '12px',
    color: '#86868b',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    right: 0,
    width: '220px',
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.04)',
    border: '1px solid rgba(0, 0, 0, 0.08)',
    padding: '8px',
    zIndex: 100,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  dropdownHeader: {
    padding: '8px 10px 10px 10px',
    borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  dropdownEmail: {
    margin: 0,
    fontSize: '12px',
    color: '#515154',
    wordBreak: 'break-all',
  },
  rolePill: {
    alignSelf: 'flex-start',
    fontSize: '10px',
    fontWeight: '700',
    textTransform: 'uppercase',
    color: '#0071e3',
    backgroundColor: '#e8f0fe',
    padding: '2px 6px',
    borderRadius: '4px',
  },
  dropdownItem: {
    padding: '8px 10px',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#1d1d1f',
    fontSize: '13px',
    fontWeight: '500',
    borderRadius: '8px',
    textAlign: 'left',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'background-color 0.15s ease',
  },
  dropdownDivider: {
    height: '1px',
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    margin: '4px 0',
  },
  dropdownLogoutItem: {
    padding: '8px 10px',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#cf1322',
    fontSize: '13px',
    fontWeight: '600',
    borderRadius: '8px',
    textAlign: 'left',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  contentContainer: {
    padding: '32px',
    maxWidth: '1200px',
    width: '100%',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '28px',
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
  },
  analyticsSection: {
    width: '100%',
  },
  analyticsCard: {
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    padding: '32px',
    border: '1px solid rgba(0, 0, 0, 0.06)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
    display: 'flex',
    flexDirection: 'column',
    gap: '28px',
  },
  analyticsHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px',
  },
  widgetTitle: {
    margin: '0 0 4px 0',
    fontSize: '20px',
    fontWeight: '700',
    color: '#1d1d1f',
    letterSpacing: '-0.02em',
  },
  widgetSubtitle: {
    margin: 0,
    fontSize: '13px',
    color: '#86868b',
  },
  timeframePill: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#515154',
    backgroundColor: '#f5f5f7',
    padding: '4px 12px',
    borderRadius: '980px',
    border: '1px solid rgba(0, 0, 0, 0.06)',
  },
  barsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '22px',
  },
  barRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  barLabelGroup: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '8px',
  },
  skillNameWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  barSkillName: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#1d1d1f',
  },
  gapTag: {
    fontSize: '11px',
    fontWeight: '700',
    padding: '2px 8px',
    borderRadius: '980px',
  },
  scoreComparison: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  scoreText: {
    fontSize: '12px',
    color: '#86868b',
  },
  deficitPercent: {
    fontSize: '13px',
    fontWeight: '700',
  },
  barTrack: {
    height: '10px',
    backgroundColor: '#e5e5ea',
    borderRadius: '980px',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: '980px',
    transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
  },
};
