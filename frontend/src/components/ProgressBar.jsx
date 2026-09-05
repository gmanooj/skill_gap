import React from 'react';

export default function ProgressBar({ current = 0, total = 5, showLabel = true }) {
  const percentage = Math.min(100, Math.max(0, (current / total) * 100));

  const getColor = (val) => {
    if (val >= 4) return '#34c759'; // Apple Green
    if (val === 3) return '#0071e3'; // Apple Blue
    if (val === 2) return '#ff9500'; // Apple Orange
    return '#ff3b30'; // Apple Red
  };

  const activeColor = getColor(current);

  return (
    <div style={styles.container}>
      <div style={styles.track}>
        <div
          style={{
            ...styles.fill,
            width: `${percentage}%`,
            backgroundColor: activeColor,
          }}
        />
      </div>
      {showLabel && (
        <span style={{ ...styles.label, color: activeColor }}>
          {current}/{total}
        </span>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
  },
  track: {
    flex: 1,
    height: '6px',
    backgroundColor: '#e5e5ea',
    borderRadius: '980px',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: '980px',
    transition: 'width 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
  },
  label: {
    fontSize: '12px',
    fontWeight: '600',
    minWidth: '32px',
    textAlign: 'right',
  },
};
