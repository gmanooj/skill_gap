import React from 'react';

export default function Loader({ message = 'Loading intelligence...', fullPage = false, size = 'medium' }) {
  const spinnerSize = size === 'small' ? 24 : size === 'large' ? 44 : 32;
  const borderWidth = size === 'small' ? 2.5 : size === 'large' ? 4 : 3;

  const content = (
    <div style={styles.container}>
      <div
        style={{
          ...styles.spinner,
          width: `${spinnerSize}px`,
          height: `${spinnerSize}px`,
          borderWidth: `${borderWidth}px`,
        }}
      />
      {message && <p style={styles.message}>{message}</p>}
    </div>
  );

  if (fullPage) {
    return <div style={styles.fullPage}>{content}</div>;
  }

  return <div style={styles.card}>{content}</div>;
}

const styles = {
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '48px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    boxSizing: 'border-box',
  },
  fullPage: {
    minHeight: '60vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '14px',
  },
  spinner: {
    borderStyle: 'solid',
    borderColor: '#e2e8f0',
    borderTopColor: '#2563eb', // Clean primary blue
    borderRadius: '50%',
    animation: 'spin 0.75s linear infinite',
  },
  message: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#0f172a',
    letterSpacing: '-0.01em',
    margin: 0,
  },
};
