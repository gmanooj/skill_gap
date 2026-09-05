import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, Zap, TrendingUp, Layers, ArrowRight, LogIn, UserPlus, CheckCircle2, Award } from 'lucide-react';
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

  const handleLogin = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div style={styles.pageContainer}>
      {/* Navigation Header */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.brand} onClick={() => navigate('/')}>
            <div style={styles.brandLogo}>
              <Layers size={18} color="#ffffff" />
            </div>
            <span style={styles.brandTitle}>Skill Gap Analyzer</span>
          </div>

          <div style={styles.navActions}>
            {isAuthenticated ? (
              <button onClick={() => navigate('/dashboard')} style={styles.primaryNavBtn}>
                Go to Dashboard
              </button>
            ) : (
              <div style={styles.authButtonsRow}>
                <button onClick={handleLogin} style={styles.loginNavBtn} id="nav-login-btn">
                  <LogIn size={15} />
                  <span>Login</span>
                </button>
                <button onClick={() => navigate('/register')} style={styles.primaryNavBtn} id="nav-register-btn">
                  <UserPlus size={15} />
                  <span>Register</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={styles.main}>
        {/* 2-Column Hero Section: Content on Left, Image on Right */}
        <section style={styles.heroGrid}>
          {/* Left Column: Left-aligned content */}
          <div style={styles.heroLeft}>
            <div style={styles.badgePill}>
              <span style={styles.badgeDot} />
              <span>Next-Generation Talent Intelligence</span>
            </div>
            
            <h1 style={styles.heroTitle}>
              AI-Driven Employee & Student <span style={styles.titleAccent}>Skill Gap Analyzer</span>
            </h1>
            
            <p style={styles.heroDescription}>
              Empowering students, educators, and enterprise leaders to systematically benchmark proficiencies against real-world industry requirements, detect critical competency gaps, and execute targeted learning pathways with precision.
            </p>

            {/* Prominent Login & Action Buttons */}
            <div style={styles.heroCtaGroup}>
              <button onClick={handleLogin} style={styles.loginHeroBtn} id="hero-login-btn">
                <LogIn size={18} />
                <span>Login to Account</span>
              </button>

              <button onClick={handleGetStarted} style={styles.registerHeroBtn} id="hero-getstarted-btn">
                <span>Get Started Free</span>
                <ArrowRight size={18} />
              </button>
            </div>

            {/* Quick Feature Highlights */}
            <div style={styles.highlightsRow}>
              <div style={styles.highlightItem}>
                <CheckCircle2 size={16} color="#2563eb" />
                <span>Weighted 1–5 Scoring</span>
              </div>
              <div style={styles.highlightItem}>
                <CheckCircle2 size={16} color="#2563eb" />
                <span>Real-Time Gap Engine</span>
              </div>
              <div style={styles.highlightItem}>
                <CheckCircle2 size={16} color="#2563eb" />
                <span>Automated Recommendations</span>
              </div>
            </div>
          </div>

          {/* Right Column: Student Image from images folder */}
          <div style={styles.heroRight}>
            <div style={styles.imageCardWrapper}>
              <div style={styles.imageCard}>
                <img
                  src="/images/stundent.jpg"
                  alt="Student Skill Gap Analysis"
                  style={styles.heroImage}
                  onError={(e) => {
                    // Fallback to local image path if needed
                    e.target.onerror = null;
                    e.target.src = '/public/images/stundent.jpg';
                  }}
                />
                <div style={styles.imageFloatingBadge}>
                  <div style={styles.floatingIcon}>
                    <Award size={16} color="#ffffff" />
                  </div>
                  <div style={styles.floatingTextWrap}>
                    <span style={styles.floatingTitle}>Live Competency Matrix</span>
                    <span style={styles.floatingSubtitle}>Verified Database Records</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Cards Grid */}
        <section style={styles.featuresSection}>
          <div style={styles.featureCard}>
            <div style={styles.featureIconWrap}>
              <Target size={22} color="#2563eb" />
            </div>
            <h3 style={styles.featureTitle}>Precision Role Benchmarking</h3>
            <p style={styles.featureDesc}>
              Compare student proficiencies against standardized 1–5 scale requirements configured for modern technical job descriptions.
            </p>
          </div>

          <div style={styles.featureCard}>
            <div style={styles.featureIconWrap}>
              <Zap size={22} color="#2563eb" />
            </div>
            <h3 style={styles.featureTitle}>Real-Time Gap Engine</h3>
            <p style={styles.featureDesc}>
              Instantly compute deficit gaps with exact formulas: gap = max(required_level - current_level, 0).
            </p>
          </div>

          <div style={styles.featureCard}>
            <div style={styles.featureIconWrap}>
              <TrendingUp size={22} color="#2563eb" />
            </div>
            <h3 style={styles.featureTitle}>Targeted Remediation</h3>
            <p style={styles.featureDesc}>
              Prioritized action items highlighting mandatory requirements to fast-track hiring readiness.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerInner}>
          <p style={styles.footerText}>
            © 2026 Skill Gap Analyzer Platform. Standardized Color Architecture: White, Black, and Blue.
          </p>
        </div>
      </footer>
    </div>
  );
}

const styles = {
  pageContainer: {
    minHeight: '100vh',
    backgroundColor: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
    color: '#0f172a',
  },
  header: {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  headerInner: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '16px 28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
  },
  brandLogo: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    backgroundColor: '#0f172a',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 6px rgba(15, 23, 42, 0.15)',
  },
  brandTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: '-0.02em',
  },
  navActions: {
    display: 'flex',
    alignItems: 'center',
  },
  authButtonsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  loginNavBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 20px',
    backgroundColor: '#ffffff',
    color: '#0f172a',
    border: '1.5px solid #cbd5e1',
    borderRadius: '980px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  primaryNavBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '9px 22px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: '980px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
  },
  main: {
    flex: 1,
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '48px 28px 80px 28px',
    display: 'flex',
    flexDirection: 'column',
    gap: '64px',
    width: '100%',
    boxSizing: 'border-box',
  },
  heroGrid: {
    display: 'grid',
    gridTemplateColumns: '1.15fr 0.85fr',
    gap: '48px',
    alignItems: 'center',
    width: '100%',
  },
  heroLeft: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    textAlign: 'left',
    gap: '20px',
  },
  badgePill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 14px',
    backgroundColor: '#eff6ff',
    border: '1px solid #dbeafe',
    borderRadius: '980px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#2563eb',
    letterSpacing: '0.01em',
  },
  badgeDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#2563eb',
  },
  heroTitle: {
    margin: 0,
    fontSize: '44px',
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: '-0.03em',
    lineHeight: 1.15,
  },
  titleAccent: {
    color: '#2563eb',
  },
  heroDescription: {
    margin: 0,
    fontSize: '16px',
    color: '#475569',
    lineHeight: '1.6',
    maxWidth: '600px',
  },
  heroCtaGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    marginTop: '8px',
    flexWrap: 'wrap',
  },
  loginHeroBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '13px 28px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: '980px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.28)',
  },
  registerHeroBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 26px',
    backgroundColor: '#ffffff',
    color: '#0f172a',
    border: '1.5px solid #cbd5e1',
    borderRadius: '980px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  highlightsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    marginTop: '12px',
    flexWrap: 'wrap',
  },
  highlightItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#334155',
  },
  heroRight: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  imageCardWrapper: {
    width: '100%',
    maxWidth: '460px',
    position: 'relative',
  },
  imageCard: {
    position: 'relative',
    backgroundColor: '#ffffff',
    borderRadius: '24px',
    padding: '12px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 20px 40px rgba(15, 23, 42, 0.08), 0 4px 12px rgba(15, 23, 42, 0.03)',
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '380px',
    objectFit: 'cover',
    borderRadius: '16px',
    display: 'block',
  },
  imageFloatingBadge: {
    position: 'absolute',
    bottom: '24px',
    left: '24px',
    right: '24px',
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    backdropFilter: 'blur(10px)',
    padding: '12px 18px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    color: '#ffffff',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.25)',
  },
  floatingIcon: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    backgroundColor: '#2563eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  floatingTextWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  floatingTitle: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: '-0.01em',
  },
  floatingSubtitle: {
    fontSize: '11px',
    color: '#94a3b8',
  },
  featuresSection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px',
    width: '100%',
  },
  featureCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '20px',
    padding: '30px 26px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)',
    transition: 'all 0.2s ease',
  },
  featureIconWrap: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    backgroundColor: '#eff6ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '4px',
  },
  featureTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: '-0.01em',
  },
  featureDesc: {
    margin: 0,
    fontSize: '14px',
    color: '#475569',
    lineHeight: '1.55',
  },
  footer: {
    borderTop: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
    padding: '24px',
  },
  footerInner: {
    maxWidth: '1200px',
    margin: '0 auto',
    textAlign: 'center',
  },
  footerText: {
    margin: 0,
    fontSize: '13px',
    color: '#64748b',
  },
};
