import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { smartAuthFetch } from '../context/AuthContext';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [token, setToken] = useState(searchParams.get('token') || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token.trim() || !newPassword || !confirmPassword) {
      setError('Please fill in all fields including the reset token.');
      return;
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await smartAuthFetch('/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token.trim(),
          newPassword,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password.');
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Error occurred while resetting password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logoBadge} onClick={() => navigate('/')}>SG</div>
          <h2 style={styles.title}>Set New Password</h2>
          <p style={styles.subtitle}>Enter your secure token and specify a new password.</p>
        </div>

        {error && (
          <div style={styles.errorBanner}>
            <span style={styles.errorDot} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div style={styles.successBanner}>
            <span style={styles.successDot} />
            <span>Password updated successfully! Redirecting to sign in...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Reset Security Token</label>
            <input
              type="text"
              placeholder="Paste 64-character token"
              value={token}
              onChange={(e) => {
                setToken(e.target.value);
                if (error) setError('');
              }}
              style={styles.input}
              disabled={loading || success}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>New Password (min. 8 chars)</label>
            <input
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (error) setError('');
              }}
              style={styles.input}
              disabled={loading || success}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Confirm New Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (error) setError('');
              }}
              style={styles.input}
              disabled={loading || success}
            />
          </div>

          <button
            type="submit"
            disabled={loading || success}
            style={{
              ...styles.submitButton,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Updating Password...' : 'Save New Password'}
          </button>
        </form>

        <div style={styles.footer}>
          <Link to="/login" style={styles.backLink}>
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f7',
    padding: '32px 16px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Helvetica Neue", sans-serif',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    padding: '36px 32px',
    width: '100%',
    maxWidth: '440px',
    border: '1px solid rgba(0, 0, 0, 0.06)',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.06)',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '8px',
  },
  logoBadge: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    backgroundColor: '#1d1d1f',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '15px',
    letterSpacing: '0.5px',
    marginBottom: '4px',
    cursor: 'pointer',
  },
  title: {
    margin: 0,
    fontSize: '22px',
    fontWeight: '700',
    color: '#1d1d1f',
    letterSpacing: '-0.02em',
  },
  subtitle: {
    margin: 0,
    fontSize: '13px',
    color: '#86868b',
    lineHeight: '1.4',
  },
  errorBanner: {
    backgroundColor: '#fff1f0',
    border: '1px solid #ffccc7',
    borderRadius: '10px',
    padding: '10px 14px',
    color: '#cf1322',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  errorDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#ff4d4f',
  },
  successBanner: {
    backgroundColor: '#e6f7ed',
    border: '1px solid #c6f0d2',
    borderRadius: '10px',
    padding: '12px 14px',
    color: '#137333',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  successDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#34c759',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#515154',
  },
  input: {
    padding: '11px 14px',
    borderRadius: '10px',
    border: '1px solid rgba(0, 0, 0, 0.12)',
    fontSize: '14px',
    color: '#1d1d1f',
    backgroundColor: '#fbfbfd',
    outline: 'none',
  },
  submitButton: {
    marginTop: '4px',
    padding: '13px',
    borderRadius: '980px',
    border: 'none',
    backgroundColor: '#0071e3',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  footer: {
    textAlign: 'center',
    fontSize: '13px',
    borderTop: '1px solid rgba(0, 0, 0, 0.06)',
    paddingTop: '16px',
  },
  backLink: {
    color: '#0071e3',
    fontWeight: '500',
    textDecoration: 'none',
  },
};
