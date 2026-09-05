import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Building2,
  Clock,
  Search,
  CheckCircle2,
  Check,
  X,
  Star,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useAuth, authFetch } from '../context/AuthContext';
import ProgressBar from '../components/ProgressBar';
import Loader from '../components/Loader';

export default function JobDetails() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [selectedJobIndex, setSelectedJobIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Analyze Candidate Modal state
  const [isAnalyzeModalOpen, setIsAnalyzeModalOpen] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [analyzeLoading, setAnalyzeLoading] = useState(false);
  const [applyLoading, setApplyLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const fetchJobs = async () => {
    try {
      const response = await authFetch('/jobs', {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.jobs && data.jobs.length > 0) {
          setJobs(data.jobs);
        }
      }
    } catch (err) {
      console.error('[JobDetails] Error fetching jobs from database:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [token]);

  const currentJob = jobs[selectedJobIndex] || null;

  const handleAnalyzeCandidate = async (jobId) => {
    setAnalyzeLoading(true);
    setIsAnalyzeModalOpen(true);
    setAnalysisData(null);

    try {
      const response = await authFetch(`/analysis?job_id=${jobId}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAnalysisData(data);
      }
    } catch (err) {
      console.error('[AnalyzeCandidate Error]:', err);
    } finally {
      setAnalyzeLoading(false);
    }
  };

  const handleApplyJob = async (jobId) => {
    setApplyLoading(true);
    try {
      const response = await authFetch(`/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFeedbackMessage(data.message || 'Application submitted successfully!');
        await fetchJobs();
        if (analysisData) {
          setAnalysisData({
            ...analysisData,
            selectedJob: {
              ...analysisData.selectedJob,
              isApplied: true,
            },
          });
        }
      }
    } catch (err) {
      console.error('[ApplyJob Error]:', err);
    } finally {
      setApplyLoading(false);
      setTimeout(() => setFeedbackMessage(''), 4000);
    }
  };

  const renderStars = (count) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const isFilled = i <= count;
      stars.push(
        <Star
          key={i}
          size={14}
          color={isFilled ? '#f59e0b' : '#cbd5e1'}
          fill={isFilled ? '#f59e0b' : 'none'}
          strokeWidth={1.8}
          style={{ marginRight: '1px' }}
        />
      );
    }
    return <span style={{ display: 'inline-flex', alignItems: 'center' }}>{stars}</span>;
  };

  if (loading) {
    return <Loader message="Querying active job opportunities from database..." />;
  }

  if (!currentJob) {
    return (
      <div style={styles.container}>
        <div style={styles.emptyCard}>No job profiles currently posted in the database.</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {feedbackMessage && (
        <div style={styles.feedbackBanner}>
          <Check size={16} color="#137333" strokeWidth={2.5} />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Multi-Company Selector Tabs */}
      {jobs.length > 1 && (
        <div style={styles.companyTabsContainer}>
          <span style={styles.tabsLabel}>Explore Posted Roles:</span>
          <div style={styles.companyTabs}>
            {jobs.map((j, idx) => {
              const isSelected = idx === selectedJobIndex;
              return (
                <button
                  key={j.id}
                  onClick={() => setSelectedJobIndex(idx)}
                  style={{
                    ...styles.tabButton,
                    ...(isSelected ? styles.tabButtonActive : {}),
                  }}
                >
                  <span style={styles.tabCompany}>{j.company}</span>
                  <span style={styles.tabTitle}>{j.title}</span>
                  {j.isApplied && (
                    <span style={styles.appliedPill}>
                      <Check size={10} strokeWidth={3} />
                      <span>Applied</span>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Job Screen matching specification */}
      <div style={styles.jobScreenCard}>
        {/* Header Block */}
        <div style={styles.headerBlock}>
          <div style={styles.headerTitleRow}>
            <span style={styles.companyNameBadge}>{currentJob.company}</span>
            {currentJob.isApplied && (
              <span style={styles.statusBadgeGreen}>
                <CheckCircle2 size={13} color="#137333" />
                <span>Application Status: {currentJob.applicationStatus || 'Applied'}</span>
              </span>
            )}
          </div>
          <h2 style={styles.jobTitle}>{currentJob.title}</h2>
          <div style={styles.metaRow}>
            <span style={styles.metaItem}>
              <MapPin size={13} color="#86868b" />
              <span>{currentJob.location}</span>
            </span>
            <span style={styles.metaItem}>
              <Building2 size={13} color="#86868b" />
              <span>{currentJob.department}</span>
            </span>
            <span style={styles.metaItem}>
              <Clock size={13} color="#86868b" />
              <span>{currentJob.experience}</span>
            </span>
          </div>
          {currentJob.description && (
            <p style={styles.jobDescription}>{currentJob.description}</p>
          )}
        </div>

        {/* Required Skills Section */}
        <div style={styles.requirementsSection}>
          <div style={styles.reqSectionHeader}>
            <h3 style={styles.reqSectionTitle}>Required Skills Benchmark</h3>
            <span style={styles.reqCountBadge}>{currentJob.requirements?.length || 0} Competencies</span>
          </div>

          <div style={styles.reqTableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.trHead}>
                  <th style={styles.th}>Required Skill</th>
                  <th style={{ ...styles.th, textAlign: 'center' }}>Required Score</th>
                  <th style={{ ...styles.th, textAlign: 'center' }}>Star Benchmark</th>
                  <th style={{ ...styles.th, textAlign: 'center' }}>Mandatory</th>
                </tr>
              </thead>
              <tbody>
                {currentJob.requirements.map((item, index) => (
                  <tr
                    key={item.id || item.skill}
                    style={{
                      ...styles.trBody,
                      backgroundColor: index % 2 === 0 ? '#ffffff' : '#fafafa',
                    }}
                  >
                    <td style={styles.tdSkill}>{item.skill}</td>
                    <td style={{ ...styles.td, textAlign: 'center' }}>
                      <span style={styles.scorePill}>Required: {item.level} / 5</span>
                    </td>
                    <td style={{ ...styles.td, textAlign: 'center' }}>
                      <div style={styles.starsWrapper}>
                        <span style={styles.starText}>Required: {item.level}</span>
                        {renderStars(item.level)}
                      </div>
                    </td>
                    <td style={{ ...styles.td, textAlign: 'center' }}>
                      <span
                        style={{
                          ...styles.mandatoryBadge,
                          ...(item.mandatory ? styles.mandatoryYes : styles.mandatoryNo),
                        }}
                      >
                        {item.mandatory ? 'Yes' : 'No'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Action Footer: [ Analyze Candidate ] */}
        <div style={styles.footerActionRow}>
          <button
            onClick={() => handleAnalyzeCandidate(currentJob.id)}
            style={styles.analyzeCandidateBtn}
          >
            <Search size={15} strokeWidth={2.2} />
            <span>Analyze Candidate</span>
          </button>
          {!currentJob.isApplied ? (
            <button
              onClick={() => handleApplyJob(currentJob.id)}
              disabled={applyLoading}
              style={styles.applyBtn}
            >
              {applyLoading ? 'Applying...' : 'Apply for this Position'}
            </button>
          ) : (
            <div style={styles.alreadyAppliedNote}>
              <CheckCircle2 size={15} color="#137333" />
              <span>You have already applied for this role</span>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Candidate Skill Gap Modal Popup */}
      {isAnalyzeModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <div>
                <h3 style={styles.modalTitle}>Candidate Skill Gap Analysis</h3>
                <p style={styles.modalSubtitle}>
                  Comparing candidate database profile against <strong>{currentJob.company}</strong> ({currentJob.title})
                </p>
              </div>
              <button onClick={() => setIsAnalyzeModalOpen(false)} style={styles.closeBtn}>
                <X size={18} />
              </button>
            </div>

            {analyzeLoading ? (
              <div style={{ padding: '30px 0' }}>
                <Loader message="Computing dynamic skill gap comparison..." />
              </div>
            ) : analysisData ? (
              <div style={styles.modalContent}>
                {/* Match Summary Banner */}
                <div style={styles.modalMatchBanner}>
                  <div style={styles.matchCandidateInfo}>
                    <span style={styles.matchLabel}>Target Role</span>
                    <span style={styles.matchValue}>{analysisData.selectedJob?.title}</span>
                  </div>
                  <div style={styles.matchScoreBadge}>
                    <span style={styles.matchPercent}>{analysisData.overallMatch}</span>
                    <span style={styles.matchScoreText}>Overall Match</span>
                  </div>
                </div>

                {/* Gap Comparison Table */}
                <div style={styles.modalTableWrap}>
                  <table style={styles.modalTable}>
                    <thead>
                      <tr style={styles.modalTrHead}>
                        <th style={styles.modalTh}>Skill</th>
                        <th style={{ ...styles.modalTh, textAlign: 'center' }}>Current</th>
                        <th style={{ ...styles.modalTh, textAlign: 'center' }}>Required</th>
                        <th style={{ ...styles.modalTh, textAlign: 'center' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysisData.analysis.map((row, idx) => (
                        <tr
                          key={row.skill}
                          style={{
                            ...styles.modalTrBody,
                            backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fcfcfd',
                          }}
                        >
                          <td style={styles.modalTdSkill}>{row.skill}</td>
                          <td style={{ ...styles.modalTd, textAlign: 'center' }}>
                            <span style={styles.modalCurrentScore}>{row.current} / 5</span>
                          </td>
                          <td style={{ ...styles.modalTd, textAlign: 'center' }}>
                            <span style={styles.modalRequiredScore}>{row.required} / 5</span>
                          </td>
                          <td style={{ ...styles.modalTd, textAlign: 'center' }}>
                            <span
                              style={{
                                ...styles.modalStatusPill,
                                ...(row.isMatched ? styles.statusMatched : styles.statusGap),
                              }}
                            >
                              {row.isMatched ? (
                                <span style={styles.statusInline}>
                                  <Check size={11} strokeWidth={3} /> Matched
                                </span>
                              ) : (
                                <span>Gap: {row.gap}</span>
                              )}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Modal Actions */}
                <div style={styles.modalFooterActions}>
                  {!analysisData.selectedJob?.isApplied ? (
                    <button
                      onClick={() => handleApplyJob(analysisData.selectedJob?.id)}
                      disabled={applyLoading}
                      style={styles.modalApplyBtn}
                    >
                      {applyLoading ? 'Submitting Application...' : 'Apply for Job'}
                    </button>
                  ) : (
                    <span style={styles.modalAppliedBadge}>
                      <Check size={12} strokeWidth={3} /> Applied
                    </span>
                  )}
                  <button
                    onClick={() => {
                      setIsAnalyzeModalOpen(false);
                      navigate('/skill-gap-analysis');
                    }}
                    style={styles.modalViewFullBtn}
                  >
                    <span>View All Companies Matrix</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '40px 24px 60px 24px',
    width: '100%',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Helvetica Neue", sans-serif',
  },
  loadingContainer: {
    padding: '60px',
    textAlign: 'center',
  },
  loadingText: {
    color: '#86868b',
    fontSize: '15px',
  },
  feedbackBanner: {
    padding: '12px 18px',
    backgroundColor: '#e6f7ed',
    border: '1px solid #c6f0d2',
    borderRadius: '12px',
    color: '#137333',
    fontSize: '13px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  companyTabsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  tabsLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#86868b',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  companyTabs: {
    display: 'flex',
    gap: '12px',
    overflowX: 'auto',
    paddingBottom: '4px',
  },
  tabButton: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: '12px 18px',
    backgroundColor: '#ffffff',
    border: '1px solid rgba(0, 0, 0, 0.08)',
    borderRadius: '14px',
    cursor: 'pointer',
    minWidth: '200px',
    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
    position: 'relative',
    textAlign: 'left',
  },
  tabButtonActive: {
    backgroundColor: '#ffffff',
    borderColor: '#0071e3',
    boxShadow: '0 4px 16px rgba(0, 113, 227, 0.15)',
  },
  tabCompany: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#0071e3',
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
  },
  tabTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1d1d1f',
    marginTop: '2px',
  },
  appliedPill: {
    position: 'absolute',
    top: '10px',
    right: '12px',
    fontSize: '10px',
    fontWeight: '700',
    backgroundColor: '#e6f7ed',
    color: '#137333',
    padding: '2px 6px',
    borderRadius: '980px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '3px',
  },
  jobScreenCard: {
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    border: '1px solid rgba(0, 0, 0, 0.06)',
    boxShadow: '0 6px 24px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  headerBlock: {
    padding: '28px 32px',
    borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  headerTitleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  companyNameBadge: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#0071e3',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  statusBadgeGreen: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#137333',
    backgroundColor: '#e6f7ed',
    padding: '3px 10px',
    borderRadius: '980px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
  },
  jobTitle: {
    margin: '2px 0 6px 0',
    fontSize: '24px',
    fontWeight: '700',
    color: '#1d1d1f',
    letterSpacing: '-0.02em',
  },
  metaRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
    fontSize: '13px',
    color: '#86868b',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  jobDescription: {
    margin: '8px 0 0 0',
    fontSize: '13px',
    color: '#515154',
    lineHeight: '1.5',
  },
  requirementsSection: {
    padding: '24px 32px',
  },
  reqSectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  reqSectionTitle: {
    margin: 0,
    fontSize: '17px',
    fontWeight: '700',
    color: '#1d1d1f',
  },
  reqCountBadge: {
    fontSize: '12px',
    color: '#86868b',
    backgroundColor: '#f5f5f7',
    padding: '3px 10px',
    borderRadius: '980px',
  },
  reqTableWrapper: {
    width: '100%',
    overflowX: 'auto',
    borderRadius: '12px',
    border: '1px solid rgba(0, 0, 0, 0.06)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  trHead: {
    backgroundColor: '#fbfbfd',
    borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
  },
  th: {
    padding: '12px 20px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#86868b',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  trBody: {
    borderBottom: '1px solid rgba(0, 0, 0, 0.04)',
  },
  tdSkill: {
    padding: '14px 20px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#1d1d1f',
  },
  td: {
    padding: '14px 20px',
    verticalAlign: 'middle',
  },
  scorePill: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#515154',
  },
  starsWrapper: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
  },
  starText: {
    fontSize: '12px',
    color: '#515154',
    fontWeight: '600',
  },
  mandatoryBadge: {
    display: 'inline-block',
    padding: '3px 12px',
    borderRadius: '980px',
    fontSize: '11px',
    fontWeight: '700',
    minWidth: '45px',
  },
  mandatoryYes: {
    backgroundColor: '#fff1f0',
    color: '#cf1322',
    border: '1px solid #ffccc7',
  },
  mandatoryNo: {
    backgroundColor: '#f5f5f7',
    color: '#86868b',
    border: '1px solid rgba(0, 0, 0, 0.06)',
  },
  footerActionRow: {
    padding: '20px 32px',
    backgroundColor: '#fbfbfd',
    borderTop: '1px solid rgba(0, 0, 0, 0.06)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px',
  },
  analyzeCandidateBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '11px 24px',
    backgroundColor: '#1d1d1f',
    color: '#ffffff',
    border: 'none',
    borderRadius: '980px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
  },
  applyBtn: {
    padding: '11px 24px',
    backgroundColor: '#0071e3',
    color: '#ffffff',
    border: 'none',
    borderRadius: '980px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    boxShadow: '0 2px 8px rgba(0, 113, 227, 0.25)',
  },
  alreadyAppliedNote: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#137333',
  },
  emptyCard: {
    padding: '40px',
    textAlign: 'center',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    color: '#86868b',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '16px',
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: '22px',
    padding: '30px',
    maxWidth: '560px',
    width: '100%',
    boxShadow: '0 24px 48px rgba(0, 0, 0, 0.16)',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    maxHeight: '90vh',
    overflowY: 'auto',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '12px',
  },
  modalTitle: {
    margin: '0 0 4px 0',
    fontSize: '19px',
    fontWeight: '700',
    color: '#1d1d1f',
  },
  modalSubtitle: {
    margin: 0,
    fontSize: '13px',
    color: '#86868b',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#86868b',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  modalLoading: {
    padding: '40px',
    textAlign: 'center',
    color: '#86868b',
  },
  modalContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  modalMatchBanner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f5f5f7',
    padding: '14px 18px',
    borderRadius: '14px',
  },
  matchCandidateInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  matchLabel: {
    fontSize: '11px',
    color: '#86868b',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  matchValue: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#1d1d1f',
  },
  matchScoreBadge: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#e8f0fe',
    padding: '6px 14px',
    borderRadius: '10px',
    border: '1px solid #d2e3fc',
  },
  matchPercent: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#1a73e8',
  },
  matchScoreText: {
    fontSize: '10px',
    fontWeight: '700',
    color: '#1a73e8',
    textTransform: 'uppercase',
  },
  modalTableWrap: {
    borderRadius: '12px',
    border: '1px solid rgba(0, 0, 0, 0.08)',
    overflow: 'hidden',
  },
  modalTable: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  modalTrHead: {
    backgroundColor: '#fbfbfd',
    borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
  },
  modalTh: {
    padding: '10px 14px',
    fontSize: '11px',
    fontWeight: '700',
    color: '#86868b',
    textTransform: 'uppercase',
  },
  modalTrBody: {
    borderBottom: '1px solid rgba(0, 0, 0, 0.04)',
  },
  modalTdSkill: {
    padding: '12px 14px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#1d1d1f',
  },
  modalTd: {
    padding: '12px 14px',
    fontSize: '12px',
    verticalAlign: 'middle',
  },
  modalCurrentScore: {
    color: '#515154',
    fontWeight: '600',
  },
  modalRequiredScore: {
    color: '#86868b',
    fontWeight: '600',
  },
  modalStatusPill: {
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: '980px',
    fontSize: '11px',
    fontWeight: '700',
  },
  statusInline: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '3px',
  },
  statusMatched: {
    backgroundColor: '#e6f7ed',
    color: '#137333',
    border: '1px solid #c6f0d2',
  },
  statusGap: {
    backgroundColor: '#fff1f0',
    color: '#cf1322',
    border: '1px solid #ffccc7',
  },
  modalFooterActions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    marginTop: '6px',
  },
  modalApplyBtn: {
    padding: '10px 20px',
    backgroundColor: '#0071e3',
    color: '#ffffff',
    border: 'none',
    borderRadius: '980px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  modalAppliedBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '13px',
    fontWeight: '700',
    color: '#137333',
    backgroundColor: '#e6f7ed',
    padding: '6px 14px',
    borderRadius: '980px',
  },
  modalViewFullBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 18px',
    backgroundColor: '#f5f5f7',
    color: '#1d1d1f',
    border: '1px solid rgba(0, 0, 0, 0.08)',
    borderRadius: '980px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
};
