import React from 'react';

export default function MetricCard({ label, value, subtext, accentColor = '#0071e3' }) {
  return (
    <div style={styles.card}>
      <div style={styles.label}>{label}</div>
      <div style={styles.valueRow}>
        <span style={styles.value}>{value}</span>
        <div style={{ ...styles.accentDot, backgroundColor: accentColor }} />
      </div>
      {subtext && <div style={styles.subtext}>{subtext}</div>}
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '18px',
    padding: '24px',
    border: '1px solid rgba(0, 0, 0, 0.06)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flex: 1,
    minWidth: '220px',
    transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
  },
  label: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#86868b',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  valueRow: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: '8px',
  },
  value: {
    fontSize: '34px',
    fontWeight: '700',
    color: '#1d1d1f',
    letterSpacing: '-0.03em',
    lineHeight: 1.1,
  },
  accentDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  subtext: {
    fontSize: '13px',
    color: '#86868b',
    fontWeight: '400',
  },
};
