import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  Award, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Star, 
  Check, 
  ChevronRight, 
  AlertTriangle,
  Briefcase,
  MapPin,
  TrendingUp,
  SlidersHorizontal,
  FileCheck,
  Zap,
  Filter,
  ArrowUpRight,
  ShieldAlert,
} from 'lucide-react';
import { authFetch } from '../context/AuthContext';
import AdminLayout from '../components/AdminLayout';
import Loader from '../components/Loader';

export default function AdminCandidateScreening() {
  const [companies, setCompanies] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Status Filter within Company
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [onlySingleLag, setOnlySingleLag] = useState(false);

  useEffect(() => {
    fetchScreeningData();
  }, []);

  const fetchScreeningData = async () => {
    try {
      setLoading(true);
      const res = await authFetch('/auth/admin/candidate-screening');
      const data = await res.json();
      if (data.success) {
        setCompanies(data.companies || []);
        if (data.companies && data.companies.length > 0) {
          setSelectedJobId(data.companies[0].job_id);
        }
      } else {
        setError(data.message || 'Failed to load screening data.');
      }
    } catch (err) {
      setError('Error connecting to backend database: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      const res = await authFetch('/auth/admin/update-application-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          application_id: applicationId,
          status: newStatus
        })
      });
      const data = await res.json();
      if (data.success) {
        setToastMessage(data.message);
        setTimeout(() => setToastMessage(''), 4000);
        // Update local state
        setCompanies(prev => prev.map(comp => ({
          ...comp,
          candidates: comp.candidates.map(cand => 
            cand.application_id === applicationId ? { ...cand, status: newStatus } : cand
          )
        })));
      } else {
        alert(data.message || 'Failed to update status.');
      }
    } catch (err) {
      alert('Network error updating status: ' + err.message);
    }
  };

  const activeJob = companies.find(c => c.job_id === selectedJobId) || companies[0];

  const filteredCandidates = activeJob ? activeJob.candidates.filter(c => {
    if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
    if (onlySingleLag && !c.has_single_skill_lag) return false;
    return true;
  }) : [];

  return (
    <AdminLayout
      activeTab="candidates"
      pageTitle="Company Selection & Candidate Screening"
      tagText="Recruitment Intelligence"
      headerAction={
        <div style={styles.liveSyncBadge}>
          <span style={styles.pulseDot} />
          <span>Live MySQL Sync</span>
        </div>
      }
    >
      <div style={styles.container}>
        {/* Toast Notification */}
        {toastMessage && (
          <div style={styles.toast}>
            <FileCheck size={16} color="#ffffff" />
            <span>{toastMessage}</span>
          </div>
        )}

        {loading ? (
          <Loader message="Analyzing applicant scores from MySQL database..." />
        ) : error ? (
          <div style={styles.errorCard}>
            <AlertTriangle size={20} color="#dc2626" />
            <p>{error}</p>
          </div>
        ) : (
          <>
            {/* Company Selection Cards */}
            <div style={styles.sectionHeadingRow}>
              <h3 style={styles.sectionHeading}>Active Hiring Companies &amp; Benchmark Roles</h3>
              <span style={styles.sectionSubtitle}>Select a company to view ranked candidate skill fit matrices</span>
            </div>

            <div style={styles.companiesGrid}>
              {companies.map((comp) => {
                const isSelected = comp.job_id === selectedJobId;
                return (
                  <div
                    key={comp.job_id}
                    onClick={() => setSelectedJobId(comp.job_id)}
                    style={{
                      ...styles.companyCard,
                      borderColor: isSelected ? '#2563eb' : '#e2e8f0',
                      backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                    }}
                  >
                    <div style={styles.companyCardHeader}>
                      <div style={{
                        ...styles.companyIconBox,
                        backgroundColor: isSelected ? '#dbeafe' : '#f8fafc',
                        color: isSelected ? '#2563eb' : '#475569',
                      }}>
                        <Building2 size={18} />
                      </div>
                      <span style={{
                        ...styles.applicantBadge,
                        backgroundColor: isSelected ? '#2563eb' : '#f1f5f9',
                        color: isSelected ? '#ffffff' : '#334155',
                      }}>
                        {comp.total_applicants} Applicants
                      </span>
                    </div>

                    <div style={styles.companyMeta}>
                      <h4 style={styles.companyName}>{comp.company}</h4>
                      <p style={styles.jobTitle}>{comp.title}</p>
                    </div>

                    <div style={styles.companyStatsRow}>
                      <div style={styles.compStat}>
                        <span style={styles.statLabel}>Avg Match</span>
                        <span style={{
                          ...styles.statVal,
                          color: comp.avg_match_percent >= 75 ? '#059669' : comp.avg_match_percent >= 50 ? '#d97706' : '#dc2626'
                        }}>
                          {comp.avg_match_percent}%
                        </span>
                      </div>
                      <div style={styles.compStat}>
                        <span style={styles.statLabel}>Top Candidate</span>
                        <span style={styles.statValSmall}>
                          {comp.best_candidate ? comp.best_candidate.name : 'None'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Active Company Screening Panel */}
            {activeJob && (
              <div style={styles.screeningPanel}>
                {/* Panel Header */}
                <div style={styles.panelHeader}>
                  <div style={styles.panelHeaderLeft}>
                    <div style={styles.activeJobTitleRow}>
                      <h2 style={styles.activeJobTitle}>{activeJob.company} — {activeJob.title}</h2>
                      <span style={styles.reqCountBadge}>{activeJob.requirements_count} Benchmark Requirements</span>
                    </div>
                    <div style={styles.reqChipsRow}>
                      {activeJob.requirements.map(r => (
                        <span key={r.skill} style={styles.reqChip}>
                          <strong>{r.skill}</strong>: {r.required}★ {r.mandatory ? '(Mandatory)' : ''}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Candidate Filters */}
                  <div style={styles.panelHeaderRight}>
                    <label style={styles.singleLagCheckbox}>
                      <input 
                        type="checkbox" 
                        checked={onlySingleLag} 
                        onChange={(e) => setOnlySingleLag(e.target.checked)}
                        style={{ accentColor: '#2563eb' }}
                      />
                      <span>Only Single-Skill Lag</span>
                    </label>

                    <div style={styles.statusTabs}>
                      {['ALL', 'SHORTLISTED', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED'].map(st => (
                        <button
                          key={st}
                          onClick={() => setStatusFilter(st)}
                          style={{
                            ...styles.statusTabBtn,
                            backgroundColor: statusFilter === st ? '#2563eb' : '#f8fafc',
                            color: statusFilter === st ? '#ffffff' : '#64748b',
                            borderColor: statusFilter === st ? '#2563eb' : '#e2e8f0',
                          }}
                        >
                          {st.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Candidate List */}
                <div style={styles.candidateList}>
                  {filteredCandidates.length === 0 ? (
                    <div style={styles.emptyCandidates}>
                      <Users size={32} color="#94a3b8" />
                      <p>No candidates match the selected filters for this role.</p>
                    </div>
                  ) : (
                    filteredCandidates.map((cand, idx) => (
                      <div key={cand.application_id} style={styles.candidateCard}>
                        {/* Top Line: Rank, Name, Match Score, Single Skill Lag Alert */}
                        <div style={styles.candHeader}>
                          <div style={styles.candInfoLeft}>
                            <span style={styles.rankBadge}>#{idx + 1}</span>
                            <div>
                              <div style={styles.candNameRow}>
                                <h3 style={styles.candName}>{cand.name}</h3>
                                <span style={styles.candEmail}>{cand.email}</span>
                              </div>
                              <div style={styles.candTarget}>{cand.target_title}</div>
                            </div>
                          </div>

                          {/* Match Meter */}
                          <div style={styles.candScoreWrap}>
                            <div style={styles.scoreBarBg}>
                              <div 
                                style={{
                                  ...styles.scoreBarFill,
                                  width: `${cand.match_percent}%`,
                                  backgroundColor: cand.match_percent >= 75 ? '#059669' : cand.match_percent >= 50 ? '#d97706' : '#dc2626'
                                }}
                              />
                            </div>
                            <span style={{
                              ...styles.matchPercentText,
                              color: cand.match_percent >= 75 ? '#059669' : cand.match_percent >= 50 ? '#d97706' : '#dc2626'
                            }}>
                              {cand.match_percent}% Fit
                            </span>
                          </div>

                          {/* Application Status Dropdown */}
                          <div style={styles.statusActionWrap}>
                            <select
                              value={cand.status}
                              onChange={(e) => handleStatusChange(cand.application_id, e.target.value)}
                              style={{
                                ...styles.statusSelect,
                                backgroundColor: cand.status === 'ACCEPTED' ? '#ecfdf5' :
                                               cand.status === 'SHORTLISTED' ? '#eff6ff' :
                                               cand.status === 'REJECTED' ? '#fef2f2' : '#fffbeb',
                                color: cand.status === 'ACCEPTED' ? '#059669' :
                                       cand.status === 'SHORTLISTED' ? '#2563eb' :
                                       cand.status === 'REJECTED' ? '#dc2626' : '#d97706',
                                borderColor: cand.status === 'ACCEPTED' ? '#a7f3d0' :
                                             cand.status === 'SHORTLISTED' ? '#bfdbfe' :
                                             cand.status === 'REJECTED' ? '#fecaca' : '#fde68a'
                              }}
                            >
                              <option value="UNDER_REVIEW">UNDER REVIEW</option>
                              <option value="SHORTLISTED">SHORTLISTED</option>
                              <option value="ACCEPTED">ACCEPTED</option>
                              <option value="REJECTED">REJECTED</option>
                            </select>
                          </div>
                        </div>

                        {/* Single-Skill Lag Alert Banner */}
                        {cand.has_single_skill_lag && (
                          <div style={styles.singleLagAlert}>
                            <Sparkles size={16} color="#2563eb" />
                            <span>
                              <strong>Single-Skill Lag Detected:</strong> Candidate is fully qualified except for a minor deficit in <strong>{cand.lag_skill_name}</strong> (-{cand.lag_deficit}★). High recommendation for fast-track onboarding!
                            </span>
                          </div>
                        )}

                        {/* Detailed Skill Breakdown */}
                        <div style={styles.skillsAnalysisRow}>
                          {/* Matched Skills */}
                          <div style={styles.skillsColumn}>
                            <div style={styles.colTitle}>
                              <CheckCircle2 size={14} color="#059669" />
                              <span>Matched Skills ({cand.matched_skills.length})</span>
                            </div>
                            <div style={styles.chipList}>
                              {cand.matched_skills.length === 0 ? (
                                <span style={styles.noChips}>No skills fully meet benchmark</span>
                              ) : (
                                cand.matched_skills.map(m => (
                                  <span key={m.skill} style={styles.matchedChip}>
                                    <Check size={11} />
                                    <strong>{m.skill}</strong>: {m.current}★ (Req: {m.required}★)
                                  </span>
                                ))
                              )}
                            </div>
                          </div>

                          {/* Deficit / Gap Skills */}
                          <div style={styles.skillsColumn}>
                            <div style={styles.colTitle}>
                              <AlertCircle size={14} color="#dc2626" />
                              <span>Skill Gaps ({cand.gap_skills.length})</span>
                            </div>
                            <div style={styles.chipList}>
                              {cand.gap_skills.length === 0 ? (
                                <span style={styles.allMatchedChip}>Perfect Match — 0 Skill Gaps!</span>
                              ) : (
                                cand.gap_skills.map(g => (
                                  <span key={g.skill} style={styles.gapChip}>
                                    <strong>{g.skill}</strong>: {g.current}★ / {g.required}★ (Gap: -{g.gap}★)
                                  </span>
                                ))
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}

const styles = {
  container: {
    padding: '24px 28px 40px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  liveSyncBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#ecfdf5',
    color: '#059669',
    fontSize: '11px',
    fontWeight: '700',
    padding: '4px 10px',
    borderRadius: '999px',
    border: '1px solid #a7f3d0',
  },
  pulseDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#10b981',
  },
  toast: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    backgroundColor: '#0f172a',
    color: '#ffffff',
    padding: '10px 18px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
    zIndex: 1000,
    fontSize: '12px',
    fontWeight: '600',
  },
  sectionHeadingRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  sectionHeading: {
    margin: 0,
    fontSize: '15px',
    fontWeight: '700',
    color: '#0f172a',
  },
  sectionSubtitle: {
    fontSize: '12px',
    color: '#64748b',
  },
  companiesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '14px',
  },
  companyCard: {
    borderRadius: '14px',
    padding: '18px',
    border: '1px solid',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  companyCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  companyIconBox: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  applicantBadge: {
    fontSize: '11px',
    fontWeight: '700',
    padding: '3px 8px',
    borderRadius: '999px',
  },
  companyMeta: {
    marginBottom: '14px',
  },
  companyName: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 3px',
  },
  jobTitle: {
    fontSize: '12px',
    color: '#64748b',
    margin: 0,
  },
  companyStatsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    paddingTop: '10px',
    borderTop: '1px solid #f1f5f9',
  },
  compStat: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  statLabel: {
    fontSize: '10px',
    fontWeight: '700',
    textTransform: 'uppercase',
    color: '#94a3b8',
  },
  statVal: {
    fontSize: '15px',
    fontWeight: '800',
  },
  statValSmall: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#0f172a',
  },
  screeningPanel: {
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
    overflow: 'hidden',
  },
  panelHeader: {
    padding: '18px 22px',
    borderBottom: '1px solid #f1f5f9',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '14px',
  },
  panelHeaderLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  activeJobTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
  },
  activeJobTitle: {
    fontSize: '17px',
    fontWeight: '700',
    color: '#0f172a',
    margin: 0,
  },
  reqCountBadge: {
    fontSize: '11px',
    fontWeight: '700',
    backgroundColor: '#eff6ff',
    color: '#2563eb',
    border: '1px solid #bfdbfe',
    padding: '2px 8px',
    borderRadius: '999px',
  },
  reqChipsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
  },
  reqChip: {
    fontSize: '11px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    color: '#475569',
    padding: '3px 8px',
    borderRadius: '6px',
  },
  panelHeaderRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '8px',
  },
  singleLagCheckbox: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#2563eb',
    cursor: 'pointer',
  },
  statusTabs: {
    display: 'flex',
    gap: '4px',
  },
  statusTabBtn: {
    border: '1px solid',
    borderRadius: '8px',
    padding: '5px 10px',
    fontSize: '11px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.12s ease',
  },
  candidateList: {
    padding: '18px 22px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  candidateCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
  },
  candHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px',
  },
  candInfoLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  rankBadge: {
    fontSize: '12px',
    fontWeight: '800',
    color: '#2563eb',
    backgroundColor: '#eff6ff',
    border: '1px solid #bfdbfe',
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  candNameRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '8px',
  },
  candName: {
    margin: 0,
    fontSize: '14px',
    fontWeight: '700',
    color: '#0f172a',
  },
  candEmail: {
    fontSize: '11px',
    color: '#64748b',
  },
  candTarget: {
    fontSize: '12px',
    color: '#475569',
  },
  candScoreWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  scoreBarBg: {
    width: '70px',
    height: '6px',
    borderRadius: '999px',
    backgroundColor: '#f1f5f9',
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: '999px',
  },
  matchPercentText: {
    fontSize: '13px',
    fontWeight: '800',
  },
  statusActionWrap: {
    position: 'relative',
  },
  statusSelect: {
    fontSize: '11px',
    fontWeight: '700',
    padding: '6px 12px',
    borderRadius: '8px',
    border: '1px solid',
    outline: 'none',
    cursor: 'pointer',
  },
  singleLagAlert: {
    backgroundColor: '#eff6ff',
    border: '1px solid #bfdbfe',
    borderRadius: '8px',
    padding: '8px 12px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    color: '#1e40af',
  },
  skillsAnalysisRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '12px',
    borderTop: '1px solid #f1f5f9',
    paddingTop: '10px',
  },
  skillsColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  colTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '11px',
    fontWeight: '700',
    color: '#0f172a',
  },
  chipList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '5px',
  },
  matchedChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: '#f0fdf4',
    border: '1px solid #86efac',
    color: '#166534',
    fontSize: '10px',
    padding: '3px 7px',
    borderRadius: '6px',
  },
  gapChip: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#dc2626',
    fontSize: '10px',
    padding: '3px 7px',
    borderRadius: '6px',
  },
  allMatchedChip: {
    backgroundColor: '#f0fdf4',
    border: '1px solid #86efac',
    color: '#166534',
    fontSize: '11px',
    fontWeight: '600',
    padding: '4px 10px',
    borderRadius: '6px',
  },
  noChips: {
    fontSize: '11px',
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  emptyCandidates: {
    textAlign: 'center',
    padding: '36px',
    color: '#64748b',
    fontSize: '13px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  stateCard: {
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    border: '1px solid #e2e8f0',
    padding: '48px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    width: '28px',
    height: '28px',
    border: '3px solid #e2e8f0',
    borderTop: '3px solid #7c3aed',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  errorCard: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '12px',
    padding: '16px',
    color: '#dc2626',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
};
