import React, { useState, useEffect } from 'react';
import { authFetch } from '../context/AuthContext';
import ProgressBar from '../components/ProgressBar';

export default function JobDetails() {
  const [jobInfo, setJobInfo] = useState({
    title: 'Full Stack Developer',
    company: 'Tech Solutions Inc',
    location: 'Remote / Chennai',
    department: 'Core Product Engineering',
    experience: '2–4 Years Experience',
    requirements: [
      { id: 1, skill: 'Java', level: 4, mandatory: true },
      { id: 2, skill: 'Spring Boot', level: 4, mandatory: true },
      { id: 3, skill: 'React', level: 3, mandatory: true },
      { id: 4, skill: 'MySQL', level: 3, mandatory: true },
      { id: 5, skill: 'AWS', level: 2, mandatory: false },
    ],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJobDetails() {
      try {
        const response = await authFetch('/jobs');
        if (response.ok) {
          const data = await response.json();
          if (data.job) {
            setJobInfo(data.job);
          }
        }
      } catch (err) {
        console.error('[JobDetails] Using fallback cache for database job requirements:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchJobDetails();
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.headerCard}>
        <div style={styles.headerTop}>
          <span style={styles.companyBadge}>{jobInfo.company}</span>
          <span style={styles.expBadge}>{jobInfo.experience}</span>
        </div>
        <h2 style={styles.jobTitle}>{jobInfo.title}</h2>
        <div style={styles.metaRow}>
          <span style={styles.metaItem}>📍 {jobInfo.location}</span>
          <span style={styles.metaItem}>🏢 {jobInfo.department}</span>
        </div>
      </div>

      <div style={styles.tableCard}>
        <div style={styles.tableHeader}>
          <h3 style={styles.tableTitle}>Skill Requirements Benchmark</h3>
          <p style={styles.tableSubtitle}>
            Live database requirement competency thresholds and mandatory flags for position eligibility
          </p>
        </div>

        <div style={styles.tableResponsive}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.trHead}>
                <th style={styles.th}>Required Skill</th>
                <th style={{ ...styles.th, width: '45%' }}>Required Level (1–5)</th>
                <th style={{ ...styles.th, textAlign: 'center' }}>Mandatory</th>
              </tr>
            </thead>
            <tbody>
              {jobInfo.requirements.map((item, index) => (
                <tr
                  key={item.id || item.skill}
                  style={{
                    ...styles.trBody,
                    backgroundColor: index % 2 === 0 ? '#ffffff' : '#fafafa',
                  }}
                >
                  <td style={styles.tdSkill}>{item.skill}</td>
                  <td style={styles.td}>
                    <ProgressBar current={item.level} total={5} showLabel={true} />
                  </td>
                  <td style={{ ...styles.td, textAlign: 'center' }}>
                    <span
                      style={{
                        ...styles.badge,
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
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Helvetica Neue", sans-serif',
  },
  headerCard: {
    backgroundColor: '#ffffff',
    borderRadius: '18px',
    padding: '28px',
    border: '1px solid rgba(0, 0, 0, 0.06)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  headerTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  companyBadge: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#0071e3',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  expBadge: {
    fontSize: '12px',
    fontWeight: '500',
    color: '#86868b',
    backgroundColor: '#f5f5f7',
    padding: '3px 10px',
    borderRadius: '980px',
    border: '1px solid rgba(0, 0, 0, 0.06)',
  },
  jobTitle: {
    margin: '4px 0',
    fontSize: '24px',
    fontWeight: '700',
    color: '#1d1d1f',
    letterSpacing: '-0.02em',
  },
  metaRow: {
    display: 'flex',
    gap: '16px',
    fontSize: '13px',
    color: '#86868b',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
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
    padding: '14px 28px',
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
    padding: '16px 28px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#1d1d1f',
  },
  td: {
    padding: '16px 28px',
    verticalAlign: 'middle',
  },
  badge: {
    display: 'inline-block',
    padding: '4px 14px',
    borderRadius: '980px',
    fontSize: '12px',
    fontWeight: '700',
    minWidth: '50px',
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
};
