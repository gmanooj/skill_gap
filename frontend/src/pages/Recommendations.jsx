import React, { useState, useEffect } from 'react';
import { authFetch, useAuth } from '../context/AuthContext';

export default function Recommendations() {
  const { token } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        const response = await authFetch('/recommendations', {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.recommendations) {
            setRecommendations(data.recommendations);
          }
        }
      } catch (err) {
        console.error('[Recommendations] Error fetching DB recommendations:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchRecommendations();
  }, [token]);

  return (
    <div style={styles.container}>
      <div style={styles.headerCard}>
        <h2 style={styles.headerTitle}>Remediation & Learning Recommendations</h2>
        <p style={styles.headerSubtitle}>
          Prioritized learning milestones and curated courses dynamically retrieved from the database
        </p>
      </div>

      <div style={styles.tableCard}>
        <div style={styles.tableHeader}>
          <div>
            <h3 style={styles.tableTitle}>Actionable Remediation Plan</h3>
            <p style={styles.tableSubtitle}>
              Target level progressions, requirement rationales, and recommended courseware
            </p>
          </div>
        </div>

        <div style={styles.tableResponsive}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.trHead}>
                <th style={{ ...styles.th, textAlign: 'center' }}>Priority</th>
                <th style={styles.th}>Skill</th>
                <th style={{ ...styles.th, textAlign: 'center' }}>Target Progression</th>
                <th style={styles.th}>Reason & Recommendation</th>
                <th style={styles.th}>Courseware</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" style={styles.emptyState}>
                    Loading recommendations from database...
                  </td>
                </tr>
              ) : recommendations.length === 0 ? (
                <tr>
                  <td colSpan="5" style={styles.emptyState}>
                    No recommendations found in the database.
                  </td>
                </tr>
              ) : (
                recommendations.map((item, index) => (
                  <tr
                    key={item.id || item.skill}
                    style={{
                      ...styles.trBody,
                      backgroundColor: index % 2 === 0 ? '#ffffff' : '#fafafa',
                    }}
                  >
                    <td style={{ ...styles.td, textAlign: 'center' }}>
                      <span
                        style={{
                          ...styles.priorityBadge,
                          ...(item.priority === 'High'
                            ? styles.priorityHigh
                            : styles.priorityMedium),
                        }}
                      >
                        {item.priority}
                      </span>
                    </td>
                    <td style={styles.tdSkill}>{item.skill}</td>
                    <td style={{ ...styles.td, textAlign: 'center' }}>
                      <span style={styles.progressionBadge}>
                        <span style={styles.currentVal}>{item.current || 1}</span>
                        <span style={styles.arrow}>→</span>
                        <span style={styles.targetVal}>{item.target || 3}</span>
                        <span style={styles.scale}> / 5</span>
                      </span>
                    </td>
                    <td style={styles.tdReason}>{item.reason}</td>
                    <td style={styles.tdCourse}>
                      {item.courseTitle ? (
                        <div style={styles.courseBlock}>
                          <span style={styles.courseTitle}>{item.courseTitle}</span>
                          {item.provider && (
                            <span style={styles.courseProvider}>Platform: {item.provider}</span>
                          )}
                        </div>
                      ) : (
                        <span style={styles.selfPaced}>Self-paced Project</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '40px 24px 60px 24px',
    width: '100%',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Helvetica Neue", sans-serif',
  },
  headerCard: {
    backgroundColor: '#ffffff',
    borderRadius: '18px',
    padding: '28px',
    border: '1px solid rgba(0, 0, 0, 0.06)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
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
  tableCard: {
    backgroundColor: '#ffffff',
    borderRadius: '18px',
    border: '1px solid rgba(0, 0, 0, 0.06)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
    overflow: 'hidden',
  },
  tableHeader: {
    padding: '24px 28px',
    borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
  },
  tableTitle: {
    margin: '0 0 4px 0',
    fontSize: '18px',
    fontWeight: '600',
    color: '#1d1d1f',
    letterSpacing: '-0.01em',
  },
  tableSubtitle: {
    margin: 0,
    fontSize: '13px',
    color: '#86868b',
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
  td: {
    padding: '16px 24px',
    verticalAlign: 'middle',
  },
  tdSkill: {
    padding: '16px 24px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#1d1d1f',
    whiteSpace: 'nowrap',
  },
  tdReason: {
    padding: '16px 24px',
    fontSize: '13px',
    color: '#515154',
  },
  tdCourse: {
    padding: '16px 24px',
    fontSize: '13px',
  },
  courseBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  courseTitle: {
    fontWeight: '600',
    color: '#0071e3',
    fontSize: '13px',
  },
  courseProvider: {
    fontSize: '11px',
    color: '#86868b',
  },
  selfPaced: {
    color: '#86868b',
    fontSize: '12px',
    fontStyle: 'italic',
  },
  priorityBadge: {
    display: 'inline-block',
    padding: '4px 14px',
    borderRadius: '980px',
    fontSize: '12px',
    fontWeight: '700',
    minWidth: '65px',
  },
  priorityHigh: {
    backgroundColor: '#fff1f0',
    color: '#cf1322',
    border: '1px solid #ffccc7',
  },
  priorityMedium: {
    backgroundColor: '#fef7e0',
    color: '#b06000',
    border: '1px solid #feebc8',
  },
  progressionBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#f5f5f7',
    padding: '4px 12px',
    borderRadius: '980px',
    border: '1px solid rgba(0, 0, 0, 0.06)',
    fontWeight: '600',
    fontSize: '13px',
    whiteSpace: 'nowrap',
  },
  currentVal: {
    color: '#86868b',
  },
  arrow: {
    color: '#0071e3',
    fontWeight: '700',
  },
  targetVal: {
    color: '#137333',
  },
  scale: {
    color: '#a1a1a6',
    fontSize: '11px',
    fontWeight: '400',
  },
  emptyState: {
    padding: '32px',
    textAlign: 'center',
    color: '#86868b',
    fontSize: '14px',
  },
};
