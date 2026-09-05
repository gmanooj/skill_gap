import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  return (
    <div style={styles.pageContainer}>
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.brand} onClick={() => navigate('/')}>
            <div style={styles.brandLogo}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <span style={styles.brandTitle}>Skill Gap Analyzer</span>
          </div>

          <div style={styles.navActions}>
            {isAuthenticated ? (
              <button onClick={() => navigate('/dashboard')} style={styles.loginBtn}>
                Go to Dashboard
              </button>
            ) : (
              <button onClick={() => navigate('/login')} style={styles.loginBtn}>
                Login
              </button>
            )}
          </div>
        </div>
      </header>

      <main style={styles.main}>
        <section style={styles.heroSection}>
          <div style={styles.badgePill}>Next-Generation Talent Intelligence</div>
          <h1 style={styles.heroTitle}>AI-Driven Employee & Student Skill Gap Analyzer</h1>
          <p style={styles.heroDescription}>
            Empowering students, educators, and enterprise leaders to systematically benchmark competencies against real-world industry benchmarks, detect critical deficiency vectors, and execute targeted learning pathways with precision.
          </p>
          <div style={styles.heroCtaGroup}>
            <button onClick={handleGetStarted} style={styles.primaryCta}>
              Get Started
            </button>
            {!isAuthenticated && (
              <button onClick={() => navigate('/login')} style={styles.secondaryCta}>
                Sign In to Account
              </button>
            )}
          </div>
        </section>

        <section style={styles.featuresSection}>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>🎯</div>
            <h3 style={styles.featureTitle}>Precision Role Benchmarking</h3>
            <p style={styles.featureDesc}>
              Compare student proficiencies against standardized 1–5 scale requirements configured for modern technical job descriptions.
            </p>
          </div>

          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>⚡</div>
            <h3 style={styles.featureTitle}>Real-Time Gap Engine</h3>
            <p style={styles.featureDesc}>
              Instantly compute deficit gaps ($Required - Current$) with categorized indicators and severity flags.
            </p>
          </div>

          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>📈</div>
            <h3 style={styles.featureTitle}>Targeted Remediation</h3>
            <p style={styles.featureDesc}>
              Prioritized action items (Current → Target) highlighting mandatory requirements to fast-track readiness.
            </p>
          </div>
        </section>
      </main>

      <footer style={styles.footer}>
        <p style={styles.footerText}>
          © 2026 Skill Gap Analyzer Platform. Apple-Standard Design System.
        </p>
      </footer>
    </div>
  );
}

const styles = {
  pageContainer: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f7',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Helvetica Neue", sans-serif',
  },
  header: {
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
    backdropFilter: 'saturate(180%) blur(20px)',
    WebkitBackdropFilter: 'saturate(180%) blur(20px)',
    borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  headerInner: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '14px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
  },
  brandLogo: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    backgroundColor: '#1d1d1f',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: '17px',
    fontWeight: '600',
    color: '#1d1d1f',
    letterSpacing: '-0.02em',
  },
  navActions: {
    display: 'flex',
    alignItems: 'center',
  },
  loginBtn: {
    padding: '8px 20px',
    backgroundColor: '#0071e3',
    color: '#ffffff',
    border: 'none',
    borderRadius: '980px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    outline: 'none',
  },
  main: {
    flex: 1,
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '60px 24px 80px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '64px',
    alignItems: 'center',
  },
  heroSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    maxWidth: '820px',
    gap: '20px',
  },
  badgePill: {
    display: 'inline-block',
    padding: '6px 16px',
    backgroundColor: '#e8f0fe',
    color: '#1a73e8',
    borderRadius: '980px',
    fontSize: '12px',
    fontWeight: '600',
    letterSpacing: '0.02em',
  },
  heroTitle: {
    margin: 0,
    fontSize: '44px',
    fontWeight: '700',
    color: '#1d1d1f',
    letterSpacing: '-0.035em',
    lineHeight: 1.15,
  },
  heroDescription: {
    margin: 0,
    fontSize: '17px',
    color: '#86868b',
    lineHeight: 1.5,
    maxWidth: '720px',
  },
  heroCtaGroup: {
    display: 'flex',
    gap: '14px',
    marginTop: '12px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  primaryCta: {
    padding: '14px 32px',
    backgroundColor: '#0071e3',
    color: '#ffffff',
    border: 'none',
    borderRadius: '980px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 14px rgba(0, 113, 227, 0.3)',
  },
  secondaryCta: {
    padding: '14px 28px',
    backgroundColor: '#ffffff',
    color: '#1d1d1f',
    border: '1px solid rgba(0, 0, 0, 0.12)',
    borderRadius: '980px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  featuresSection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px',
    width: '100%',
  },
  featureCard: {
    backgroundColor: '#ffffff',
    borderRadius: '18px',
    padding: '32px 28px',
    border: '1px solid rgba(0, 0, 0, 0.06)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  featureIcon: {
    fontSize: '28px',
    marginBottom: '4px',
  },
  featureTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '600',
    color: '#1d1d1f',
    letterSpacing: '-0.015em',
  },
  featureDesc: {
    margin: 0,
    fontSize: '14px',
    color: '#86868b',
    lineHeight: 1.5,
  },
  footer: {
    borderTop: '1px solid rgba(0, 0, 0, 0.06)',
    padding: '24px',
    textAlign: 'center',
    backgroundColor: '#ffffff',
  },
  footerText: {
    margin: 0,
    fontSize: '13px',
    color: '#a1a1a6',
  },
};
