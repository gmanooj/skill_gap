import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, authFetch } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email.trim() || !formData.password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authFetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid email or password.');
      }

      login(data.token, data.user);

      if (data.user?.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/student-profile', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logoBadge} onClick={() => navigate('/')}>SG</div>
          <h2 style={styles.title}>Sign in to Skill Gap Analyzer</h2>
          <p style={styles.subtitle}>Enter your credentials to access your personalized workspace</p>
        </div>

        {error && (
          <div style={styles.errorBanner}>
            <span style={styles.errorDot} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              style={styles.input}
              disabled={loading}
              autoComplete="email"
            />
          </div>

          <div style={styles.inputGroup}>
            <div style={styles.labelRow}>
              <label style={styles.label}>Password</label>
              <Link to="/forgot-password" style={styles.forgotLink}>
                Forgot Password?
              </Link>
            </div>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              style={styles.input}
              disabled={loading}
              autoComplete="current-password"
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
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>



        <div style={styles.footer}>
          <span style={styles.footerText}>Don't have an account? </span>
          <Link to="/register" style={styles.registerLink}>
            Create an Account
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
    maxWidth: '430px',
    border: '1px solid rgba(0, 0, 0, 0.06)',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.06)',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
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
  labelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#515154',
  },
  forgotLink: {
    fontSize: '12px',
    color: '#0071e3',
    textDecoration: 'none',
    fontWeight: '500',
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
    marginTop: '6px',
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
  footerText: {
    color: '#86868b',
  },
  registerLink: {
    color: '#0071e3',
    fontWeight: '600',
    textDecoration: 'none',
  },
};
