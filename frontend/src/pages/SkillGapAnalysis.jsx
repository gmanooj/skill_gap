import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check,
  AlertCircle,
  ArrowRight,
  Building2,
  Sparkles,
  TrendingUp,
  BarChart3,
  CheckCircle2,
} from 'lucide-react';
import { useAuth, authFetch } from '../context/AuthContext';
import Loader from '../components/Loader';

export default function SkillGapAnalysis() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [selectedJobId, setSelectedJobId] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalysis = async (jobId = null) => {
    try {
      const url = jobId ? `/analysis?job_id=${jobId}` : '/analysis';
      const response = await authFetch(url, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAnalysisResult(data);
        if (!selectedJobId && data.selectedJob?.id) {
          setSelectedJobId(data.selectedJob.id);
        }
      }
    } catch (err) {
      console.error('[SkillGapAnalysis] Error loading matrix from database:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis(selectedJobId);
  }, [token, selectedJobId]);

  if (loading && !analysisResult) {
    return <Loader message="Analyzing live skill gaps and company benchmarks..." />;
  }

  const selectedJob = analysisResult?.selectedJob || {};
  const employee = analysisResult?.employee || { name: 'Arun' };
  const overallMatch = analysisResult?.overallMatch || '72%';
  const analysisRows = analysisResult?.analysis || [];
  const companyComparisons = analysisResult?.companyComparisons || [];
  const appliedCount = analysisResult?.appliedCount || 0;
  const averageAppliedGap = analysisResult?.averageAppliedGap || 0.0;

  return (
    <div style={styles.container}>
      {/* 1. Multi-Company Job Application & Selection Probability Section */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div>
            <h2 style={styles.sectionHeading}>Company Applications & Selection Probability</h2>
            <p style={styles.sectionSubtitle}>
              Comparative gap overview across applied and open company opportunities
            </p>
          </div>
          <div style={styles.summaryBadgesRow}>
            <div style={styles.summaryPill}>
              <span style={styles.summaryLabel}>Applications</span>
              <span style={styles.summaryVal}>{appliedCount} Active</span>
            </div>
            <div style={styles.summaryPill}>
              <span style={styles.summaryLabel}>Average Skill Gap</span>
              <span style={styles.summaryVal}>{averageAppliedGap} pts</span>
            </div>
          </div>
        </div>

        {/* Multi-Company Cards Grid with Selection Probability Indicators */}
        <div style={styles.companyGrid}>
          {companyComparisons.map((item) => {
            const isSelected = item.jobId === selectedJobId;
            return (
              <div
                key={item.jobId}
                onClick={() => setSelectedJobId(item.jobId)}
                style={{
                  ...styles.companyCard,
                  borderColor: isSelected ? '#0071e3' : 'rgba(0, 0, 0, 0.08)',
                  boxShadow: isSelected
                    ? '0 6px 20px rgba(0, 113, 227, 0.15)'
                    : '0 2px 8px rgba(0, 0, 0, 0.04)',
                }}
              >
                <div style={styles.companyCardTop}>
                  <div style={styles.companyMetaWrap}>
                    <span style={styles.companyName}>{item.company}</span>
                    <span style={styles.companyRoleTitle}>{item.title}</span>
                  </div>
                  <div style={styles.probabilityDotWrap}>
                    <span
                      style={{
                        ...styles.statusDot,
                        backgroundColor: item.colorDot,
                      }}
                    />
                    <span style={{ ...styles.probabilityLabel, color: item.colorDot }}>
                      {item.probability} Chance
                    </span>
                  </div>
                </div>

                <div style={styles.companyCardStats}>
                  <div style={styles.statBox}>
                    <span style={styles.statVal}>{item.matchPercentage}%</span>
                    <span style={styles.statTitle}>Match Score</span>
                  </div>
                  <div style={styles.statBox}>
                    <span style={styles.statVal}>{item.gapCount}</span>
                    <span style={styles.statTitle}>Skill Gaps</span>
                  </div>
                  <div style={styles.statBox}>
                    <span
                      style={{
                        ...styles.applicationStatusPill,
                        backgroundColor: item.isApplied ? '#e6f7ed' : '#f5f5f7',
                        color: item.isApplied ? '#137333' : '#86868b',
                      }}
                    >
                      {item.applicationStatus}
                    </span>
                  </div>
                </div>

                <div style={styles.cardSelectAction}>
                  <span style={styles.selectText}>
                    {isSelected ? (
                      <span style={styles.inspectedLabel}>
                        <Check size={12} strokeWidth={3} /> Currently Inspected
                      </span>
                    ) : (
                      <span style={styles.inspectActionLabel}>
                        <span>Inspect Gap Matrix</span>
                        <ArrowRight size={12} />
                      </span>
                    )}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Detailed Skill Gap Analyzer Card matching Image 1 */}
      <div style={styles.card}>
        <div style={styles.matrixHeader}>
          <div style={styles.matrixHeaderInfo}>
            <div style={styles.matrixTitleRow}>
              <h2 style={styles.matrixTitle}>SKILL GAP ANALYZER</h2>
              <span style={styles.matrixTargetPill}>{selectedJob.company}</span>
            </div>
            <div style={styles.metaRow}>
              <span style={styles.metaItem}>
                Employee: <strong>{employee.name}</strong>
              </span>
              <span style={styles.metaDivider}>•</span>
              <span style={styles.metaItem}>
                Job: <strong>{selectedJob.title || employee.targetTitle}</strong>
              </span>
            </div>
          </div>

          <div style={styles.overallMatchBox}>
            <span style={styles.overallMatchLabel}>OVERALL MATCH</span>
            <span style={styles.overallMatchValue}>{overallMatch}</span>
          </div>
        </div>

        {/* Main Matrix Table */}
        <div style={styles.tableResponsive}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.trHead}>
                <th style={styles.th}>Skill</th>
                <th style={{ ...styles.th, textAlign: 'center' }}>Current</th>
                <th style={{ ...styles.th, textAlign: 'center' }}>Required</th>
                <th style={{ ...styles.th, textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {analysisRows.map((item, index) => {
                const isMatched = item.isMatched || item.gap === 0;
                return (
                  <tr
                    key={item.skill}
                    style={{
                      ...styles.trBody,
                      backgroundColor: index % 2 === 0 ? '#ffffff' : '#fafafa',
                    }}
                  >
                    <td style={styles.tdSkill}>{item.skill}</td>
                    <td style={{ ...styles.td, textAlign: 'center' }}>
                      <span style={styles.scoreText}>{item.current}</span>
                    </td>
                    <td style={{ ...styles.td, textAlign: 'center' }}>
                      <span style={styles.scoreText}>{item.required}</span>
                    </td>
                    <td style={{ ...styles.td, textAlign: 'center' }}>
                      <span
                        style={{
                          ...styles.statusBadge,
                          ...(isMatched ? styles.statusMatched : styles.statusGap),
                        }}
                      >
                        {isMatched ? (
                          <span style={styles.statusInline}>
                            <Check size={12} strokeWidth={3} /> Matched
                          </span>
                        ) : (
                          <span>Gap: {item.gap}</span>
                        )}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Action: [ View Recommendations ] */}
        <div style={styles.cardFooter}>
          <button
            onClick={() => navigate('/recommendations')}
            style={styles.ctaButton}
          >
            <span>View Recommendations</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '28px',
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '40px 24px 60px 24px',
    width: '100%',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Helvetica Neue", sans-serif',
  },
  loadingState: {
    padding: '60px',
    textAlign: 'center',
    color: '#86868b',
    fontSize: '15px',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    border: '1px solid rgba(0, 0, 0, 0.06)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  cardHeader: {
    padding: '24px 28px',
    borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
  },
  sectionHeading: {
    margin: '0 0 4px 0',
    fontSize: '18px',
    fontWeight: '700',
    color: '#1d1d1f',
    letterSpacing: '-0.01em',
  },
  sectionSubtitle: {
    margin: 0,
    fontSize: '13px',
    color: '#86868b',
  },
  summaryBadgesRow: {
    display: 'flex',
    gap: '12px',
  },
  summaryPill: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    backgroundColor: '#f5f5f7',
    padding: '6px 14px',
    borderRadius: '10px',
    border: '1px solid rgba(0, 0, 0, 0.06)',
  },
  summaryLabel: {
    fontSize: '10px',
    fontWeight: '600',
    color: '#86868b',
    textTransform: 'uppercase',
  },
  summaryVal: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#1d1d1f',
  },
  companyGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '16px',
    padding: '24px 28px',
    backgroundColor: '#fbfbfd',
  },
  companyCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '18px',
    border: '1.5px solid rgba(0, 0, 0, 0.08)',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
  },
  companyCardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '8px',
  },
  companyMetaWrap: {
    display: 'flex',
    flexDirection: 'column',
  },
  companyName: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#1d1d1f',
  },
  companyRoleTitle: {
    fontSize: '12px',
    color: '#86868b',
  },
  probabilityDotWrap: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#f5f5f7',
    padding: '4px 10px',
    borderRadius: '980px',
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    display: 'inline-block',
  },
  probabilityLabel: {
    fontSize: '11px',
    fontWeight: '700',
  },
  companyCardStats: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f5f5f7',
    padding: '10px 14px',
    borderRadius: '12px',
  },
  statBox: {
    display: 'flex',
    flexDirection: 'column',
  },
  statVal: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#1d1d1f',
  },
  statTitle: {
    fontSize: '10px',
    color: '#86868b',
    textTransform: 'uppercase',
  },
  applicationStatusPill: {
    fontSize: '11px',
    fontWeight: '700',
    padding: '3px 8px',
    borderRadius: '980px',
  },
  cardSelectAction: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  selectText: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#0071e3',
  },
  inspectedLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    color: '#0071e3',
  },
  inspectActionLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    color: '#0071e3',
  },
  matrixHeader: {
    padding: '24px 28px',
    borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
  },
  matrixHeaderInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  matrixTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  matrixTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '800',
    color: '#1d1d1f',
    letterSpacing: '0.04em',
  },
  matrixTargetPill: {
    padding: '2px 8px',
    backgroundColor: '#e8f0fe',
    color: '#1a73e8',
    borderRadius: '980px',
    fontSize: '11px',
    fontWeight: '700',
  },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    color: '#515154',
  },
  metaItem: {
    color: '#515154',
  },
  metaDivider: {
    color: '#d1d1d6',
  },
  overallMatchBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#e8f0fe',
    border: '1px solid #d2e3fc',
    padding: '8px 18px',
    borderRadius: '14px',
  },
  overallMatchLabel: {
    fontSize: '10px',
    fontWeight: '700',
    color: '#1a73e8',
    letterSpacing: '0.04em',
  },
  overallMatchValue: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#1a73e8',
  },
  tableResponsive: {
    width: '100%',
    overflowX: 'auto',
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
    padding: '14px 28px',
    fontSize: '12px',
    fontWeight: '700',
    color: '#86868b',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  trBody: {
    borderBottom: '1px solid rgba(0, 0, 0, 0.04)',
  },
  tdSkill: {
    padding: '16px 28px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#1d1d1f',
  },
  td: {
    padding: '16px 28px',
    fontSize: '14px',
    verticalAlign: 'middle',
  },
  scoreText: {
    color: '#515154',
    fontWeight: '600',
  },
  statusBadge: {
    display: 'inline-block',
    padding: '4px 14px',
    borderRadius: '980px',
    fontSize: '12px',
    fontWeight: '700',
    minWidth: '85px',
  },
  statusInline: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
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
  cardFooter: {
    padding: '20px 28px',
    backgroundColor: '#fbfbfd',
    display: 'flex',
    justifyContent: 'flex-end',
    borderTop: '1px solid rgba(0, 0, 0, 0.06)',
  },
  ctaButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 24px',
    backgroundColor: '#0071e3',
    color: '#ffffff',
    border: 'none',
    borderRadius: '980px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
};
