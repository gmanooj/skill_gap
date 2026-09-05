import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminRoute({ children }) {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} />
        <span style={styles.loadingText}>Verifying administrator privileges...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/student-profile" replace />;
  }

  return children;
}

const styles = {
  loadingContainer: {
    minHeight: '80vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    backgroundColor: '#f5f5f7',
  },
  spinner: {
    width: '36px',
    height: '36px',
    border: '3px solid rgba(0, 113, 227, 0.2)',
    borderTop: '3px solid #0071e3',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  loadingText: {
    fontSize: '14px',
    color: '#86868b',
    fontWeight: '500',
  },
};
