import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { smartAuthFetch } from '../context/AuthContext';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [generatedToken, setGeneratedToken] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setError('Please provide your registered email address.');
      return;
    }

    setLoading(true);
    setError('');
    setStatusMessage('');
    setGeneratedToken('');

    try {
      const response = await smartAuthFetch('/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to request password reset.');
      }

      setStatusMessage(data.message || 'If an account exists with that email, reset instructions have been dispatched.');
      if (data.resetToken) {
        setGeneratedToken(data.resetToken);
      }
    } catch (err) {
      setError(err.message || 'Network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logoBadge} onClick={() => navigate('/')}>SG</div>
          <h2 style={styles.title}>Reset your Password</h2>
          <p style={styles.subtitle}>
            Enter the email address associated with your account to receive a secure recovery token.
          </p>
        </div>

        {error && (
          <div style={styles.errorBanner}>
            <span style={styles.errorDot} />
            <span>{error}</span>
          </div>
        )}

        {statusMessage && (
          <div style={styles.successBanner}>
            <span style={styles.successDot} />
            <div>
              <p style={styles.successText}>{statusMessage}</p>
              {generatedToken && (
                <div style={styles.tokenBox}>
                  <span style={styles.tokenLabel}>Generated Recovery Token (valid for 1h):</span>
                  <code style={styles.tokenCode}>{generatedToken}</code>
                  <button
                    onClick={() => navigate(`/reset-password?token=${generatedToken}`)}
                    style={styles.resetNowBtn}
                  >
                    Proceed to Set New Password →
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Registered Email Address</label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError('');
              }}
              style={styles.input}
              disabled={loading}
              autoComplete="email"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.submitButton,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Sending Instructions...' : 'Send Recovery Token'}
          </button>
        </form>

        <div style={styles.footer}>
          <Link to="/login" style={styles.backLink}>
            ← Return to Sign In
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
    alignItems: 'flex-start',
    gap: '10px',
  },
  successDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#34c759',
    marginTop: '6px',
    flexShrink: 0,
  },
  successText: {
    margin: 0,
    lineHeight: 1.4,
    fontWeight: '500',
  },
  tokenBox: {
    marginTop: '10px',
    padding: '10px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #c6f0d2',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  tokenLabel: {
    fontSize: '11px',
    color: '#515154',
    fontWeight: '600',
  },
  tokenCode: {
    fontSize: '11px',
    wordBreak: 'break-all',
    backgroundColor: '#f5f5f7',
    padding: '4px 6px',
    borderRadius: '4px',
    color: '#1d1d1f',
  },
  resetNowBtn: {
    marginTop: '6px',
    padding: '8px 12px',
    backgroundColor: '#137333',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
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
