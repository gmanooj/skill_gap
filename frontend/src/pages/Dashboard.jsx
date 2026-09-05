import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Zap,
  Briefcase,
  TrendingDown,
  Lightbulb,
  BarChart3,
  LogOut,
  ChevronDown,
  Building2,
  CheckCircle2,
  Filter,
  Sparkles,
  Layers,
  ArrowUpRight,
  Database,
  Server,
  Monitor,
  Activity,
  Target,
  GraduationCap,
  ClipboardList,
} from 'lucide-react';
import { useAuth, authFetch } from '../context/AuthContext';
import AdminLayout from '../components/AdminLayout';
import Loader from '../components/Loader';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout, token } = useAuth();
  const [activeSidebarItem, setActiveSidebarItem] = useState('dashboard');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);

  const [stats, setStats] = useState({
    totalEmployees: 10,
    totalJobs: 3,
    applications: 12,
    avgSkillMatch: '78%',
    topSkillGaps: [
      { skill: 'Spring Boot', deficitPercent: 78, currentScore: '1.0 / 5', requiredScore: '4.0 / 5', color: '#ef4444', note: 'High Deficit' },
      { skill: 'React', deficitPercent: 62, currentScore: '2.0 / 5', requiredScore: '4.0 / 5', color: '#ef4444', note: 'High Deficit' },
      { skill: 'AWS', deficitPercent: 54, currentScore: '1.0 / 5', requiredScore: '3.0 / 5', color: '#f59e0b', note: 'Moderate Gap' },
      { skill: 'Docker', deficitPercent: 45, currentScore: '1.0 / 5', requiredScore: '3.0 / 5', color: '#f59e0b', note: 'Moderate Gap' },
    ],
  });

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { id: 'students', label: 'Student Directory', path: '/admin/students', icon: Filter },
    { id: 'candidates', label: 'Candidate Screening', path: '/admin/candidates', icon: Sparkles },
    { id: 'jobs', label: 'Job Postings', path: '/job-details', icon: Briefcase },
    { id: 'skillgap', label: 'Gap Matrix', path: '/skill-gap-analysis', icon: TrendingDown },
    { id: 'recommend', label: 'Recommendations', path: '/recommendations', icon: Lightbulb },
  ];

  const kpiCards = [
    { label: 'Total Students', value: stats.totalEmployees?.toString() || '10', sub: 'Enrolled candidate profiles', icon: GraduationCap, light: '#eff6ff', iconColor: '#2563eb' },
    { label: 'Active Jobs', value: stats.totalJobs?.toString() || '3', sub: 'Company benchmark roles', icon: Briefcase, light: '#eff6ff', iconColor: '#2563eb' },
    { label: 'Applications', value: stats.applications?.toString() || '12', sub: 'Evaluated submissions', icon: ClipboardList, light: '#eff6ff', iconColor: '#2563eb' },
    { label: 'Avg Skill Match', value: stats.avgSkillMatch || '78%', sub: 'Across candidate pool', icon: Target, light: '#eff6ff', iconColor: '#2563eb' },
  ];

  useEffect(() => {
    async function fetchDashboardStats() {
      try {
        const response = await authFetch('/dashboard/stats', {
          headers: { Authorization: token ? `Bearer ${token}` : '' },
        });
        if (response.ok) {
          const data = await response.json();
          if (data.stats) setStats(data.stats);
        }
      } catch (err) {
        console.error('[Dashboard] fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardStats();
  }, [token]);

  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSidebarClick = (item) => {
    setActiveSidebarItem(item.id);
    navigate(item.path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = (user?.name || 'GM').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <AdminLayout activeTab="dashboard" pageTitle="Employee Skill Gap Analyzer" tagText="Live Dashboard">
      <main style={s.content}>
        {loading ? (
          <Loader message="Analyzing dashboard benchmarks from MySQL..." />
        ) : (
          <>
            {/* Quick Action Cards */}
            <div style={s.quickRow}>
              <div
                style={s.quickCard}
                onClick={() => navigate('/admin/students')}
              >
                <div style={{ ...s.quickIcon, backgroundColor: '#2563eb' }}>
                  <Filter size={18} color="#ffffff" strokeWidth={2} />
                </div>
                <div style={s.quickBody}>
                  <span style={s.quickTitle}>Student Directory &amp; Filters</span>
                  <span style={s.quickSub}>Filter by skill, gap type, proficiency &amp; more</span>
                </div>
                <ArrowUpRight size={18} color="#2563eb" />
              </div>

              <div
                style={s.quickCard}
                onClick={() => navigate('/admin/candidates')}
              >
                <div style={{ ...s.quickIcon, backgroundColor: '#0f172a' }}>
                  <Sparkles size={18} color="#ffffff" strokeWidth={2} />
                </div>
                <div style={s.quickBody}>
                  <span style={s.quickTitle}>Company Candidate Screening</span>
                  <span style={s.quickSub}>Match candidates to companies by skill fit</span>
                </div>
                <ArrowUpRight size={18} color="#0f172a" />
              </div>
            </div>

            {/* KPI Cards */}
            <div style={s.kpiGrid}>
              {kpiCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div key={card.label} style={s.kpiCard}>
                    <div style={{ ...s.kpiIconBox, backgroundColor: card.light }}>
                      <Icon size={18} color={card.iconColor} strokeWidth={2} />
                    </div>
                    <div style={s.kpiMeta}>
                      <span style={s.kpiLabel}>{card.label}</span>
                      <span style={s.kpiValue}>{card.value}</span>
                      <span style={s.kpiSub}>{card.sub}</span>
                    </div>
                  </div>
                );
              })}
            </div>

          {/* Two-column bottom */}
          <div style={s.bottomGrid}>

            {/* Skill Gap Chart */}
            <div style={s.card}>
              <div style={s.cardHeader}>
                <div>
                  <h2 style={s.cardTitle}>Top Skill Gaps</h2>
                  <p style={s.cardSub}>Highest deficiency vectors from the database</p>
                </div>
                <span style={s.liveBadge}>
                  <span style={s.liveDot} />
                  Live Data
                </span>
              </div>

              <div style={s.gapList}>
                {stats.topSkillGaps && stats.topSkillGaps.length > 0 ? (
                  stats.topSkillGaps.map((item, idx) => (
                    <div key={item.skill} style={s.gapRow}>
                      <div style={s.gapTop}>
                        <div style={s.gapLeft}>
                          <span style={s.gapRank}>#{idx + 1}</span>
                          <span style={s.gapSkill}>{item.skill}</span>
                          <span style={{ ...s.gapBadge, color: item.color, background: `${item.color}18`, border: `1px solid ${item.color}30` }}>
                            {item.note}
                          </span>
                        </div>
                        <span style={{ ...s.gapPct, color: item.color }}>{item.deficitPercent}%</span>
                      </div>
                      <div style={s.gapScores}>
                        <span style={s.gapScore}>Current: <strong>{item.currentScore}</strong></span>
                        <span style={s.gapScore}>Target: <strong>{item.requiredScore}</strong></span>
                      </div>
                      <div style={s.trackBg}>
                        <div style={{
                          ...s.trackFill,
                          width: `${item.deficitPercent}%`,
                          background: `linear-gradient(90deg,${item.color}88,${item.color})`,
                        }} />
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={s.emptyMsg}>No skill gaps found.</p>
                )}
              </div>
            </div>

            {/* System Architecture */}
            <div style={s.card}>
              <div style={s.cardHeader}>
                <div>
                  <h2 style={s.cardTitle}>System Architecture</h2>
                  <p style={s.cardSub}>Full-stack execution pipeline overview</p>
                </div>
                <span style={s.archBadge}>Full Stack</span>
              </div>

              <div style={s.archFlow}>
                {[
                  { icon: Monitor, label: 'Frontend', sub: 'React / Vite', color: '#2563eb', bg: '#eff6ff' },
                  { icon: Server, label: 'REST API', sub: 'Django Backend', color: '#0f172a', bg: '#f8fafc' },
                  { icon: Layers, label: 'ORM Layer', sub: 'Data Access', color: '#2563eb', bg: '#eff6ff' },
                  { icon: Database, label: 'MySQL DB', sub: 'Students & Jobs', color: '#0f172a', bg: '#f8fafc' },
                ].map((node, i, arr) => {
                  const Icon = node.icon;
                  return (
                    <React.Fragment key={node.label}>
                      <div style={{ ...s.archNode, backgroundColor: node.bg, borderColor: `${node.color}40` }}>
                        <div style={{ ...s.archNodeIcon, backgroundColor: node.color }}>
                          <Icon size={14} color="#fff" strokeWidth={2} />
                        </div>
                        <span style={s.archNodeLabel}>{node.label}</span>
                        <span style={s.archNodeSub}>{node.sub}</span>
                      </div>
                      {i < arr.length - 1 && <div style={s.archArrow}>→</div>}
                    </React.Fragment>
                  );
                })}
              </div>

              <div style={s.engineBox}>
                <div style={s.engineLeft}>
                  <div style={s.engineIconBox}>
                    <Sparkles size={16} color="#2563eb" strokeWidth={2} />
                  </div>
                  <div>
                    <span style={s.engineTitle}>Skill Gap Engine</span>
                    <span style={s.engineSub}>Computes student skills vs job requirements</span>
                  </div>
                </div>
                <div style={s.engineRight}>
                  <span style={s.outputGreen}><CheckCircle2 size={12} strokeWidth={2.5} />Roadmaps</span>
                  <span style={s.outputBlue}><Building2 size={12} strokeWidth={2.5} />Job Matrices</span>
                </div>
              </div>
            </div>

          </div>
          </>
        )}
      </main>
    </AdminLayout>
  );
}

/* ─── Styles ─────────────────────────────────────────────────────────────── */
const s = {
  root: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },

  /* Sidebar */
  sidebar: {
    width: '228px',
    minWidth: '228px',
    backgroundColor: '#0f172a',
    display: 'flex',
    flexDirection: 'column',
    position: 'sticky',
    top: 0,
    height: '100vh',
    overflowY: 'auto',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '20px 18px 16px',
    cursor: 'pointer',
    borderBottom: '1px solid rgba(255,255,255,0.07)',
  },
  brandIcon: {
    width: '28px',
    height: '28px',
    borderRadius: '8px',
    background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  brandName: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#f1f5f9',
    letterSpacing: '-0.02em',
  },
  brandSuffix: {
    fontSize: '10px',
    fontWeight: '700',
    color: '#a78bfa',
    backgroundColor: 'rgba(124,58,237,0.2)',
    padding: '2px 7px',
    borderRadius: '6px',
    letterSpacing: '0.03em',
  },
  navSection: {
    fontSize: '10px',
    fontWeight: '700',
    color: '#475569',
    letterSpacing: '0.1em',
    margin: '18px 18px 6px',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    padding: '0 10px',
  },
  navBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '9px 10px',
    borderRadius: '10px',
    border: 'none',
    background: 'transparent',
    color: '#94a3b8',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.15s ease',
    position: 'relative',
    width: '100%',
  },
  navBtnActive: {
    background: 'rgba(124,58,237,0.15)',
    color: '#c4b5fd',
    fontWeight: '600',
  },
  navIconWrap: {
    width: '28px',
    height: '28px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255,255,255,0.05)',
    flexShrink: 0,
  },
  navIconWrapActive: {
    background: 'rgba(124,58,237,0.28)',
    color: '#a78bfa',
  },
  navLabel: { flex: 1 },
  activeDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#7c3aed',
    flexShrink: 0,
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '9px 20px',
    border: 'none',
    background: 'transparent',
    color: '#475569',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    marginBottom: '6px',
    width: '100%',
  },
  userCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 14px 16px',
    borderTop: '1px solid rgba(255,255,255,0.07)',
  },
  userAvatar: {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
    color: '#fff',
    fontSize: '12px',
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
    color: '#e2e8f0',
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
    backgroundColor: '#22c55e',
    flexShrink: 0,
  },

  /* Main */
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    overflow: 'hidden',
  },

  /* Top Bar */
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
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  },
  topLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1px',
  },
  pageTag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
  },
  pageTagText: {
    fontSize: '10px',
    fontWeight: '700',
    color: '#7c3aed',
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
  topRight: { position: 'relative' },
  adminBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    padding: '6px 10px 6px 6px',
    borderRadius: '12px',
    cursor: 'pointer',
    outline: 'none',
  },
  adminAvatar: {
    width: '30px',
    height: '30px',
    borderRadius: '8px',
    background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
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
    color: '#94a3b8',
    fontWeight: '500',
  },
  dropdown: {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    right: 0,
    width: '216px',
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
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

  /* Content */
  content: {
    padding: '24px 28px 40px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    overflowY: 'auto',
  },

  /* Quick Actions */
  quickRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))',
    gap: '14px',
  },
  quickCard: {
    borderRadius: '14px',
    padding: '16px 18px',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    transition: 'transform 0.15s ease,box-shadow 0.15s ease',
  },
  quickIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  quickBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
    flex: 1,
  },
  quickTitle: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#0f172a',
  },
  quickSub: {
    fontSize: '12px',
    color: '#64748b',
  },

  /* KPI Grid */
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit,minmax(185px,1fr))',
    gap: '14px',
  },
  kpiCard: {
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    padding: '18px 18px 22px',
    border: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  },
  kpiIconBox: {
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  kpiLabel: {
    fontSize: '10px',
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
  },
  kpiValue: {
    fontSize: '30px',
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: '-0.03em',
    lineHeight: 1.1,
  },
  kpiSub: {
    fontSize: '11px',
    color: '#94a3b8',
  },
  kpiBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '3px',
  },

  /* Bottom 2-col */
  bottomGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))',
    gap: '18px',
    alignItems: 'start',
  },

  /* Shared card */
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '22px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '12px',
  },
  cardTitle: {
    margin: '0 0 3px',
    fontSize: '16px',
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: '-0.02em',
  },
  cardSub: {
    margin: 0,
    fontSize: '12px',
    color: '#94a3b8',
  },
  liveBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '11px',
    fontWeight: '600',
    color: '#059669',
    backgroundColor: '#d1fae5',
    padding: '4px 10px',
    borderRadius: '980px',
    border: '1px solid #a7f3d0',
    whiteSpace: 'nowrap',
  },
  liveDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#22c55e',
  },

  /* Gap List */
  gapList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  gapRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  gapTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
  },
  gapLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  gapRank: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#cbd5e1',
    minWidth: '18px',
  },
  gapSkill: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#0f172a',
  },
  gapBadge: {
    fontSize: '10px',
    fontWeight: '700',
    padding: '2px 7px',
    borderRadius: '980px',
  },
  gapPct: {
    fontSize: '15px',
    fontWeight: '800',
    flexShrink: 0,
  },
  gapScores: {
    display: 'flex',
    gap: '14px',
  },
  gapScore: {
    fontSize: '11px',
    color: '#94a3b8',
  },
  trackBg: {
    height: '7px',
    backgroundColor: '#f1f5f9',
    borderRadius: '980px',
    overflow: 'hidden',
  },
  trackFill: {
    height: '100%',
    borderRadius: '980px',
    transition: 'width 0.7s cubic-bezier(0.16,1,0.3,1)',
  },
  emptyMsg: {
    fontSize: '13px',
    color: '#94a3b8',
    textAlign: 'center',
    margin: '10px 0',
  },

  /* Architecture */
  archBadge: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#0284c7',
    backgroundColor: '#e0f2fe',
    padding: '4px 10px',
    borderRadius: '980px',
    border: '1px solid #bae6fd',
    whiteSpace: 'nowrap',
  },
  archFlow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    flexWrap: 'wrap',
  },
  archNode: {
    flex: 1,
    minWidth: '72px',
    border: '1.5px solid',
    borderRadius: '12px',
    padding: '10px 8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    textAlign: 'center',
  },
  archNodeIcon: {
    width: '26px',
    height: '26px',
    borderRadius: '7px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  archNodeLabel: {
    fontSize: '10px',
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: '0.02em',
  },
  archNodeSub: {
    fontSize: '9px',
    color: '#64748b',
  },
  archArrow: {
    fontSize: '14px',
    color: '#cbd5e1',
    fontWeight: '700',
    flexShrink: 0,
  },
  engineBox: {
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    padding: '12px 14px',
    border: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    flexWrap: 'wrap',
  },
  engineLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  engineIconBox: {
    width: '32px',
    height: '32px',
    borderRadius: '9px',
    backgroundColor: '#ede9fe',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  engineTitle: {
    display: 'block',
    fontSize: '12px',
    fontWeight: '700',
    color: '#0f172a',
  },
  engineSub: {
    display: 'block',
    fontSize: '10px',
    color: '#64748b',
  },
  engineRight: {
    display: 'flex',
    gap: '7px',
    flexWrap: 'wrap',
  },
  outputGreen: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '11px',
    fontWeight: '600',
    backgroundColor: '#d1fae5',
    color: '#059669',
    border: '1px solid #a7f3d0',
    padding: '4px 9px',
    borderRadius: '980px',
  },
  outputBlue: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '11px',
    fontWeight: '600',
    backgroundColor: '#e0f2fe',
    color: '#0284c7',
    border: '1px solid #bae6fd',
    padding: '4px 9px',
    borderRadius: '980px',
  },
};
