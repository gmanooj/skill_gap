import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function SkillGapAnalysis({ onNavigate }) {
  const navigate = useNavigate();

  const analysisData = [
    { skill: 'Java', current: 4, required: 4, gap: 0, status: 'Matched' },
    { skill: 'MySQL', current: 4, required: 3, gap: 0, status: 'Matched' },
    { skill: 'Spring Boot', current: 2, required: 4, gap: 2, status: 'Gap' },
    { skill: 'React', current: 2, required: 3, gap: 1, status: 'Gap' },
    { skill: 'AWS', current: 1, required: 2, gap: 1, status: 'Gap' },
  ];

  const overallMatch = '68%';

  const handleGoToRecommendations = () => {
    if (onNavigate) onNavigate('recommendations');
    navigate('/recommendations');
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerCard}>
        <div style={styles.headerContent}>
          <div>
            <h2 style={styles.headerTitle}>Skill Gap Analysis Matrix</h2>
            <p style={styles.headerSubtitle}>
              Benchmarking student profile proficiencies against target position benchmarks
            </p>
          </div>
          <div style={styles.scoreBadgeContainer}>
            <span style={styles.scoreLabel}>Overall Match Score</span>
            <div style={styles.scoreBadge}>{overallMatch} Match</div>
          </div>
        </div>
      </div>

      <div style={styles.tableCard}>
        <div style={styles.tableResponsive}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.trHead}>
                <th style={styles.th}>Skill</th>
                <th style={{ ...styles.th, textAlign: 'center' }}>Current Level (1–5)</th>
                <th style={{ ...styles.th, textAlign: 'center' }}>Required Level (1–5)</th>
                <th style={{ ...styles.th, textAlign: 'center' }}>Gap</th>
                <th style={{ ...styles.th, textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {analysisData.map((item, index) => (
                <tr
                  key={item.skill}
                  style={{
                    ...styles.trBody,
                    backgroundColor: index % 2 === 0 ? '#ffffff' : '#fafafa',
                  }}
                >
                  <td style={styles.tdSkill}>{item.skill}</td>
                  <td style={{ ...styles.td, textAlign: 'center' }}>
                    <span style={styles.scorePill}>{item.current} / 5</span>
                  </td>
                  <td style={{ ...styles.td, textAlign: 'center' }}>
                    <span style={styles.scorePill}>{item.required} / 5</span>
                  </td>
                  <td style={{ ...styles.td, textAlign: 'center' }}>
                    <span
                      style={{
                        ...styles.gapPill,
                        ...(item.gap > 0 ? styles.gapPositive : styles.gapZero),
                      }}
                    >
                      {item.gap > 0 ? `-${item.gap}` : '0'}
                    </span>
                  </td>
                  <td style={{ ...styles.td, textAlign: 'center' }}>
                    <span
                      style={{
                        ...styles.statusBadge,
                        ...(item.status === 'Matched' ? styles.statusMatched : styles.statusGap),
                      }}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={styles.cardFooter}>
          <button
            onClick={handleGoToRecommendations}
            style={styles.ctaButton}
          >
            View Recommendations →
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
    gap: '24px',
    maxWidth: '960px',
    margin: '0 auto',
    padding: '40px 24px 60px 24px',
    width: '100%',
  },
  headerCard: {
    backgroundColor: '#ffffff',
    borderRadius: '18px',
    padding: '28px',
    border: '1px solid rgba(0, 0, 0, 0.06)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
  },
  headerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
  },
  headerTitle: {
    margin: '0 0 4px 0',
    fontSize: '22px',
    fontWeight: '700',
    color: '#1d1d1f',
    letterSpacing: '-0.02em',
  },
  headerSubtitle: {
    margin: 0,
    fontSize: '14px',
    color: '#86868b',
  },
  scoreBadgeContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '4px',
  },
  scoreLabel: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#86868b',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  scoreBadge: {
    padding: '8px 18px',
    backgroundColor: '#e8f0fe',
    border: '1px solid #d2e3fc',
    borderRadius: '980px',
    color: '#1a73e8',
    fontSize: '15px',
    fontWeight: '700',
  },
  tableCard: {
    backgroundColor: '#ffffff',
    borderRadius: '18px',
    border: '1px solid rgba(0, 0, 0, 0.06)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
    overflow: 'hidden',
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
    padding: '14px 24px',
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
    padding: '16px 24px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#1d1d1f',
  },
  td: {
    padding: '16px 24px',
    fontSize: '14px',
    verticalAlign: 'middle',
  },
  scorePill: {
    color: '#515154',
    fontWeight: '600',
  },
  gapPill: {
    padding: '3px 12px',
    borderRadius: '980px',
    fontSize: '12px',
    fontWeight: '700',
  },
  gapPositive: {
    backgroundColor: '#fff1f0',
    color: '#cf1322',
    border: '1px solid #ffccc7',
  },
  gapZero: {
    backgroundColor: '#e6f7ed',
    color: '#137333',
    border: '1px solid #c6f0d2',
  },
  statusBadge: {
    display: 'inline-block',
    padding: '4px 14px',
    borderRadius: '980px',
    fontSize: '12px',
    fontWeight: '700',
    minWidth: '70px',
  },
  statusMatched: {
    backgroundColor: '#e6f7ed',
    color: '#137333',
    border: '1px solid #c6f0d2',
  },
  statusGap: {
    backgroundColor: '#fef7e0',
    color: '#b06000',
    border: '1px solid #feebc8',
  },
  cardFooter: {
    padding: '20px 28px',
    backgroundColor: '#fbfbfd',
    display: 'flex',
    justifyContent: 'flex-end',
    borderTop: '1px solid rgba(0, 0, 0, 0.06)',
  },
  ctaButton: {
    padding: '10px 22px',
    backgroundColor: '#0071e3',
    color: '#ffffff',
    border: 'none',
    borderRadius: '980px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
};
