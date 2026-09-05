import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError('');
  };

  const validateForm = () => {
    const { fullName, email, password, confirmPassword } = formData;

    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      setError('Please fill in all required fields.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address format.');
      return false;
    }

    if (password.length < 8) {
      setError('Password must contain at least 8 characters.');
      return false;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const response = await register({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      setModalMessage(response.message || 'The data has been updated to the DB');
      setShowSuccessModal(true);

      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {showSuccessModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.successIcon}>✓</div>
            <h3 style={styles.modalTitle}>Registration Successful</h3>
            <p style={styles.modalText}>{modalMessage}</p>
            <span style={styles.modalSubtext}>Redirecting to login in 2 seconds...</span>
          </div>
        </div>
      )}

      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logoBadge}>SG</div>
          <h2 style={styles.title}>Create your Account</h2>
          <p style={styles.subtitle}>Enter your details to register for the Skill Gap Analyzer</p>
        </div>

        {error && (
          <div style={styles.errorBanner}>
            <span style={styles.errorDot} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Full Name</label>
            <input
              type="text"
              name="fullName"
              placeholder="e.g. John Doe"
              value={formData.fullName}
              onChange={handleChange}
              style={styles.input}
              disabled={loading || showSuccessModal}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              style={styles.input}
              disabled={loading || showSuccessModal}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password (min. 8 characters)</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              style={styles.input}
              disabled={loading || showSuccessModal}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              style={styles.input}
              disabled={loading || showSuccessModal}
            />
          </div>

          <button
            type="submit"
            disabled={loading || showSuccessModal}
            style={{
              ...styles.submitButton,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Registering...' : 'Create Account'}
          </button>
        </form>

        <div style={styles.footer}>
          <span style={styles.footerText}>Already have an account? </span>
          <Link to="/login" style={styles.loginLink}>
            Sign in
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
  label: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#515154',
    letterSpacing: '0.01em',
  },
  input: {
    padding: '11px 14px',
    borderRadius: '10px',
    border: '1px solid rgba(0, 0, 0, 0.12)',
    fontSize: '14px',
    color: '#1d1d1f',
    backgroundColor: '#fbfbfd',
    outline: 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
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
    outline: 'none',
  },
  footer: {
    textAlign: 'center',
    fontSize: '13px',
    color: '#86868b',
    borderTop: '1px solid rgba(0, 0, 0, 0.06)',
    paddingTop: '16px',
  },
  footerText: {
    color: '#86868b',
  },
  loginLink: {
    color: '#0071e3',
    fontWeight: '600',
    textDecoration: 'none',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '16px',
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: '22px',
    padding: '36px 32px',
    maxWidth: '380px',
    width: '100%',
    textAlign: 'center',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },
  successIcon: {
    width: '54px',
    height: '54px',
    borderRadius: '50%',
    backgroundColor: '#e6f7ed',
    color: '#137333',
    fontSize: '26px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '4px',
  },
  modalTitle: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '700',
    color: '#1d1d1f',
  },
  modalText: {
    margin: 0,
    fontSize: '14px',
    color: '#515154',
    lineHeight: 1.4,
    fontWeight: '500',
  },
  modalSubtext: {
    fontSize: '12px',
    color: '#86868b',
    marginTop: '6px',
  },
};
