import React from 'react';
import { useNavigate } from 'react-router-dom';
import MetricCard from '../components/MetricCard';

export default function Dashboard({ onNavigate }) {
  const navigate = useNavigate();
  const topGaps = ['Spring Boot', 'React', 'AWS', 'Docker'];

  const handleNav = (targetPath, tabKey) => {
    if (onNavigate) onNavigate(tabKey);
    navigate(targetPath);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.eyebrow}>Analytics Overview</span>
        <h2 style={styles.title}>Operational Dashboard</h2>
        <p style={styles.subtitle}>
          Real-time organizational insights, skill readiness metrics, and talent gap intelligence.
        </p>
      </div>

      <div style={styles.metricsGrid}>
        <MetricCard
          label="Total Employees / Students"
          value="250"
          subtext="Active learners enrolled"
          accentColor="#0071e3"
        />
        <MetricCard
          label="Total Jobs"
          value="45"
          subtext="Configured benchmark profiles"
          accentColor="#5856d6"
        />
        <MetricCard
          label="Applications"
          value="120"
          subtext="Evaluated candidate matches"
          accentColor="#ff2d55"
        />
        <MetricCard
          label="Average Skill Match"
          value="74%"
          subtext="+4.2% from previous evaluation"
          accentColor="#34c759"
        />
      </div>

      <div style={styles.contentGrid}>
        <div style={styles.card}>
          <div>
            <h3 style={styles.cardTitle}>Top Critical Skill Gaps</h3>
            <p style={styles.cardSubtitle}>
              Highest deficiency frequency detected across active job requirements
            </p>
          </div>
          <div style={styles.chipContainer}>
            {topGaps.map((skill) => (
              <span key={skill} style={styles.chip}>
                <span style={styles.chipDot} />
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div style={styles.card}>
          <div>
            <h3 style={styles.cardTitle}>Quick Navigation</h3>
            <p style={styles.cardSubtitle}>
              Jump directly to candidate evaluation matrices and gap resolution plans
            </p>
          </div>
          <div style={styles.actionRow}>
            <button
              onClick={() => handleNav('/student-profile', 'profile')}
              style={styles.primaryButton}
            >
              View Student Profile
            </button>
            <button
              onClick={() => handleNav('/skill-gap-analysis', 'analysis')}
              style={styles.secondaryButton}
            >
              Open Skill Gap Analysis
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '40px 24px 60px 24px',
    width: '100%',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  eyebrow: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#0071e3',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  title: {
    margin: 0,
    fontSize: '32px',
    fontWeight: '700',
    color: '#1d1d1f',
    letterSpacing: '-0.025em',
  },
  subtitle: {
    margin: 0,
    fontSize: '15px',
    color: '#86868b',
    maxWidth: '640px',
    lineHeight: '1.45',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
    gap: '16px',
  },
  contentGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '20px',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '18px',
    padding: '28px',
    border: '1px solid rgba(0, 0, 0, 0.06)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: '24px',
  },
  cardTitle: {
    margin: '0 0 6px 0',
    fontSize: '19px',
    fontWeight: '600',
    color: '#1d1d1f',
    letterSpacing: '-0.015em',
  },
  cardSubtitle: {
    margin: 0,
    fontSize: '14px',
    color: '#86868b',
    lineHeight: '1.4',
  },
  chipContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
  },
  chip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    backgroundColor: '#fff1f0',
    border: '1px solid #ffccc7',
    borderRadius: '980px',
    color: '#cf1322',
    fontSize: '13px',
    fontWeight: '600',
  },
  chipDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#ff4d4f',
  },
  actionRow: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  primaryButton: {
    flex: 1,
    minWidth: '150px',
    padding: '12px 20px',
    backgroundColor: '#0071e3',
    color: '#ffffff',
    border: 'none',
    borderRadius: '980px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease, transform 0.1s ease',
    outline: 'none',
  },
  secondaryButton: {
    flex: 1,
    minWidth: '150px',
    padding: '12px 20px',
    backgroundColor: '#f5f5f7',
    color: '#1d1d1f',
    border: '1px solid rgba(0, 0, 0, 0.08)',
    borderRadius: '980px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    outline: 'none',
  },
};
