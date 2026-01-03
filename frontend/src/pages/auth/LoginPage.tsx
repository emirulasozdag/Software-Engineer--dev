import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      const redirectPath = `/${user.role}/dashboard`;
      navigate(redirectPath);
    }
  }, [user, navigate]);

  // Prefill email from registration flow to avoid mismatch
  React.useEffect(() => {
    if (!email) {
      const pending = localStorage.getItem('pending_email');
      if (pending) setEmail(pending);
    }
  }, [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setIsLoading(true);

    try {
      await login(email, password);
      // Navigation will happen via the useEffect above
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      const validationMsg =
        Array.isArray(detail) ? detail.map((d: any) => d?.msg).filter(Boolean).join(', ') : undefined;
      setError(err.response?.data?.message || validationMsg || detail || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
<<<<<<< Updated upstream
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh',
      background: 'var(--bg)'
    }}>
      {/* Left Panel - Branding (40%) */}
      <div style={{
        flex: '0 0 40%',
        background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '60px 40px',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '4px 0 24px rgba(0, 0, 0, 0.08)'
      }}
      className="login-brand-panel"
      >
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: '520px' }}>
          <div style={{
            width: '88px',
            height: '88px',
            background: 'rgba(255, 255, 255, 0.18)',
            backdropFilter: 'blur(12px)',
            borderRadius: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 26px',
            border: '2px solid rgba(255, 255, 255, 0.25)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)'
          }}>
            <span style={{ fontSize: '40px', fontWeight: 900 }}>🎓</span>
          </div>

          <h1 style={{
            fontSize: '56px',
            fontWeight: 900,
            marginBottom: '18px',
            letterSpacing: '-0.04em',
            textShadow: '0 6px 32px rgba(0, 0, 0, 0.25)',
            lineHeight: '1.05'
          }}>
            AI Learning
          </h1>

          <div style={{
            background: 'rgba(255, 255, 255, 0.12)',
            backdropFilter: 'blur(8px)',
            borderRadius: '16px',
            padding: '16px 22px',
            border: '1px solid rgba(255, 255, 255, 0.22)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.10)',
            display: 'inline-block',
            margin: '0 auto'
          }}>
            <p style={{
              fontSize: '16px',
              opacity: 0.96,
              lineHeight: '1.6',
              fontWeight: 500,
              letterSpacing: '0.01em',
              margin: 0
            }}>
              Personalized education driven by AI.
            </p>
          </div>

          <div style={{
            marginTop: '28px',
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '12px',
            textAlign: 'left'
          }}>
            <div className="login-feature-card" style={{
              background: 'rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.22)',
              borderRadius: '16px',
              padding: '14px 16px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.10)'
            }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '14px',
                  background: 'rgba(255, 255, 255, 0.18)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flex: '0 0 auto'
                }}>
                  <span style={{ fontWeight: 900 }}>AI</span>
                </div>
                <div>
                  <div style={{ fontWeight: 900, fontSize: '15px', marginBottom: '2px' }}>Personalized Learning</div>
                  <div style={{ opacity: 0.92, fontSize: '13px', lineHeight: '1.4' }}>Adaptive content tailored to your level and goals.</div>
                </div>
              </div>
            </div>

            <div className="login-feature-card" style={{
              background: 'rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.22)',
              borderRadius: '16px',
              padding: '14px 16px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.10)'
            }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '14px',
                  background: 'rgba(255, 255, 255, 0.18)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flex: '0 0 auto'
                }}>
                  <span style={{ fontWeight: 900 }}>✓</span>
                </div>
                <div>
                  <div style={{ fontWeight: 900, fontSize: '15px', marginBottom: '2px' }}>Clear Progress Tracking</div>
                  <div style={{ opacity: 0.92, fontSize: '13px', lineHeight: '1.4' }}>See your improvement with simple milestones and insights.</div>
                </div>
              </div>
            </div>

            <div className="login-feature-card" style={{
              background: 'rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.22)',
              borderRadius: '16px',
              padding: '14px 16px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.10)'
            }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '14px',
                  background: 'rgba(255, 255, 255, 0.18)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flex: '0 0 auto'
                }}>
                  <span style={{ fontWeight: 900 }}>★</span>
                </div>
                <div>
                  <div style={{ fontWeight: 900, fontSize: '15px', marginBottom: '2px' }}>Instant Feedback</div>
                  <div style={{ opacity: 0.92, fontSize: '13px', lineHeight: '1.4' }}>Get guidance that keeps you motivated and consistent.</div>
=======
    <div className="container-fluid min-vh-100">
      <style>{`
        :root {
          --brand-start: #5A67FF;
          --brand-end: #7C3AED;
        }
        .login-page {
          min-height: 100vh;
          background: #fff;
        }
        .login-split {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        .login-left {
          background: linear-gradient(135deg, var(--brand-start) 0%, var(--brand-end) 100%);
          color: #fff;
          padding: 48px;
          display: none;
          position: relative;
          overflow: hidden;
          align-items: center;
          justify-content: center;
        }
        .login-left-bg {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }
        .login-left-circle {
          position: absolute;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.14);
          filter: blur(2px);
        }
        .login-left-content {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 520px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        .login-iconbox {
          width: 68px;
          height: 68px;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.16);
          border: 1px solid rgba(255, 255, 255, 0.18);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 22px;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          box-shadow: 0 10px 26px rgba(0, 0, 0, 0.10);
        }
        .login-left-title {
          font-size: 3.4rem;
          line-height: 1.02;
          font-weight: 800;
          letter-spacing: -0.02em;
          margin: 0 0 16px 0;
        }
        .login-pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 10px 20px;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.16);
          border: 1px solid rgba(255, 255, 255, 0.18);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          margin-bottom: 28px;
          font-size: 0.95rem;
          opacity: 0.98;
          box-shadow: 0 10px 22px rgba(0, 0, 0, 0.10);
        }
        .login-features {
          width: 100%;
          max-width: 420px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-top: 8px;
          text-align: left;
        }
        .login-feature {
          width: 100%;
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 16px;
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.14);
          border: 1px solid rgba(255, 255, 255, 0.18);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          box-shadow: 0 16px 30px rgba(0, 0, 0, 0.10);
          transition: transform 0.3s ease, background-color 0.3s ease;
        }
        .login-feature:hover {
          transform: translateY(-5px);
          background: rgba(255, 255, 255, 0.20);
        }
        .login-feature-icon {
          width: 46px;
          height: 46px;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.16);
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 auto;
          border: 1px solid rgba(255, 255, 255, 0.18);
        }
        .login-feature-title {
          font-weight: 700;
          font-size: 1rem;
          margin: 0;
        }
        .login-feature-desc {
          margin: 2px 0 0 0;
          opacity: 0.82;
          font-size: 0.92rem;
          line-height: 1.35;
        }
        .login-right {
          background: #fff;
          padding: 32px 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 1 1 auto;
        }
        .login-card {
          width: 100%;
          max-width: 420px;
          border-radius: 16px;
        }
        .login-title {
          font-size: 1.75rem;
          font-weight: 800;
          margin-bottom: 18px;
        }
        .login-input {
          border-radius: 12px;
          padding: 12px;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }
        .login-input:focus,
        .login-input:focus-visible {
          outline: none;
          border-color: var(--brand-end);
          box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.18);
        }
        .login-button {
          width: 100%;
          border-radius: 12px;
          padding: 12px;
          box-shadow: 0 10px 18px rgba(67, 97, 238, 0.18);
          background: linear-gradient(135deg, var(--brand-start) 0%, var(--brand-end) 100%) !important;
          border: 0 !important;
          color: #fff !important;
          font-weight: 700;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .login-button:not(:disabled):hover {
          transform: scale(1.02);
          box-shadow: 0 18px 28px rgba(67, 97, 238, 0.24);
        }
        .login-button:disabled {
          opacity: 0.8;
        }
        @media (prefers-reduced-motion: reduce) {
          .login-feature,
          .login-button,
          .login-input {
            transition: none;
          }
          .login-feature:hover,
          .login-button:not(:disabled):hover {
            transform: none;
          }
        }
        .login-card-shell {
          background: #ffffff;
          border-radius: 22px;
          box-shadow: 0 18px 40px rgba(16, 24, 40, 0.10);
          padding: 34px;
          width: 100%;
          max-width: 460px;
        }
        @media (min-width: 992px) {
          .login-split { flex-direction: row; }
          .login-left { display: flex; flex: 0 0 42%; }
          .login-right { flex: 0 0 58%; padding: 56px; }
          .login-card-shell { padding: 42px; }
        }
      `}</style>

      <div className="row g-0 login-split login-page">
        {/* Left Column (Branding - 40%) */}
        <div className="col-lg-5 d-none d-lg-flex login-left">
          <div className="login-left-bg" aria-hidden="true">
            <div className="login-left-circle" style={{ width: 240, height: 240, top: -60, left: -60 }} />
            <div className="login-left-circle" style={{ width: 180, height: 180, bottom: 40, left: 60 }} />
            <div className="login-left-circle" style={{ width: 320, height: 320, top: 80, right: -140 }} />
            <div className="login-left-circle" style={{ width: 140, height: 140, bottom: -40, right: 40 }} />
          </div>

          <div className="login-left-content">
            <div
              style={{
                width: '80px',
                height: '80px',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '24px',
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
              }}
            >
              <span style={{ fontSize: '40px' }}>🎓</span>
            </div>

            <div className="login-left-title">AI Learning</div>

            <div className="login-pill">Personalized education driven by AI.</div>

            <div className="login-features">
              <div className="login-feature">
                <div className="login-feature-icon" style={{ fontWeight: 800 }}>AI</div>
                <div>
                  <div className="login-feature-title">Personalized Learning</div>
                  <div className="login-feature-desc">Adaptive content tailored to your level and goals.</div>
                </div>
              </div>

              <div className="login-feature">
                <div className="login-feature-icon" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M20 6L9 17L4 12"
                      stroke="rgba(255,255,255,0.92)"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <div className="login-feature-title">Clear Progress Tracking</div>
                  <div className="login-feature-desc">See your improvement with simple milestones and insights.</div>
                </div>
              </div>

              <div className="login-feature">
                <div className="login-feature-icon" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M12 17.3L6.2 20.6L7.6 14.1L2.8 9.9L9.4 9.3L12 3.3L14.6 9.3L21.2 9.9L16.4 14.1L17.8 20.6L12 17.3Z"
                      fill="rgba(255,255,255,0.92)"
                    />
                  </svg>
                </div>
                <div>
                  <div className="login-feature-title">Instant Feedback</div>
                  <div className="login-feature-desc">Get guidance that keeps you motivated and consistent.</div>
>>>>>>> Stashed changes
                </div>
              </div>
            </div>
          </div>
        </div>
<<<<<<< Updated upstream
        {/* Floating Decorative Circles - Glassmorphism */}
        <div className="login-circle login-circle-1" style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.08)',
          top: '-150px',
          left: '-150px',
          zIndex: 1,
          filter: 'blur(2px)'
        }} />
        <div className="login-circle login-circle-2" style={{
          position: 'absolute',
          width: '280px',
          height: '280px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          bottom: '-80px',
          right: '-80px',
          zIndex: 1,
          filter: 'blur(2px)'
        }} />
        <div className="login-circle login-circle-3" style={{
          position: 'absolute',
          width: '180px',
          height: '180px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.07)',
          top: '120px',
          right: '-40px',
          zIndex: 1,
          filter: 'blur(1px)'
        }} />
        <div className="login-circle login-circle-4" style={{
          position: 'absolute',
          width: '220px',
          height: '220px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.06)',
          bottom: '180px',
          left: '-60px',
          zIndex: 1,
          filter: 'blur(1px)'
        }} />
        <div className="login-circle login-circle-5" style={{
          position: 'absolute',
          width: '140px',
          height: '140px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.09)',
          top: '50%',
          left: '10%',
          zIndex: 1,
          filter: 'blur(2px)',
          transform: 'translateY(-50%)'
        }} />
      </div>

      {/* Right Panel - Form (60%) */}
      <div style={{
        flex: '1',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px 20px',
        background: '#FAFBFC'
      }}>
        <div style={{ 
          width: '100%', 
          maxWidth: '480px',
          background: 'white',
          padding: '48px 40px',
          borderRadius: '24px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08), 0 0 1px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ 
              fontSize: '34px', 
              fontWeight: 800, 
              marginBottom: '12px',
              letterSpacing: '-0.03em',
              color: '#1a1a1a',
              lineHeight: '1.2'
            }}>
              Welcome Back! 👋
            </h2>
            <p style={{ 
              color: '#64748B', 
              fontSize: '16px',
              fontWeight: 400,
              lineHeight: '1.5'
            }}>
              Enter your credentials to access your account
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label" style={{ 
                fontWeight: 600, 
                marginBottom: '10px',
                display: 'block',
                color: '#334155',
                fontSize: '14px',
                letterSpacing: '0.01em'
              }}>
                Email Address
              </label>
              <input
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                style={{
                  padding: '15px 18px',
                  fontSize: '15px',
                  borderRadius: '14px',
                  border: '2px solid #E2E8F0',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  background: '#F8FAFC',
                  width: '100%',
                  fontWeight: 500,
                  color: '#1e293b'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#667EEA';
                  e.currentTarget.style.boxShadow = '0 0 0 4px rgba(102, 126, 234, 0.1)';
                  e.currentTarget.style.background = 'white';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#E2E8F0';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.background = '#F8FAFC';
                }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" style={{ 
                fontWeight: 600, 
                marginBottom: '10px',
                display: 'block',
                color: '#334155',
                fontSize: '14px',
                letterSpacing: '0.01em'
              }}>
                Password
              </label>
              <input
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Enter your password"
                style={{
                  padding: '15px 18px',
                  fontSize: '15px',
                  borderRadius: '14px',
                  border: '2px solid #E2E8F0',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  background: '#F8FAFC',
                  width: '100%',
                  fontWeight: 500,
                  color: '#1e293b'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#667EEA';
                  e.currentTarget.style.boxShadow = '0 0 0 4px rgba(102, 126, 234, 0.1)';
                  e.currentTarget.style.background = 'white';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#E2E8F0';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.background = '#F8FAFC';
                }}
              />
            </div>

            <div style={{ textAlign: 'right', marginBottom: '28px' }}>
              <Link 
                to="/forgot-password"
                style={{
                  color: '#667EEA',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: 600,
                  transition: 'color 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#5568D3'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#667EEA'}
              >
                Forgot Password?
              </Link>
            </div>

            {error && (
              <div style={{
                padding: '14px 18px',
                background: '#FEF2F2',
                border: '2px solid #FEE2E2',
                borderRadius: '14px',
                marginBottom: '24px'
              }}>
                <p className="error-message" style={{ 
                  margin: 0,
                  color: '#DC2626',
                  fontSize: '14px',
                  fontWeight: 500
                }}>{error}</p>
              </div>
            )}

            <button 
              className="button button-primary" 
              type="submit" 
              disabled={isLoading}
              style={{ 
                width: '100%',
                padding: '16px',
                fontSize: '16px',
                fontWeight: 700,
                borderRadius: '14px',
                border: 'none',
                background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
                color: 'white',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 8px 24px rgba(102, 126, 234, 0.35)',
                opacity: isLoading ? 0.7 : 1,
                letterSpacing: '0.02em'
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = 'scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 18px 44px rgba(102, 126, 234, 0.50)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.35)';
              }}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div style={{ 
            marginTop: '32px', 
            textAlign: 'center',
            paddingTop: '32px',
            borderTop: '2px solid #F1F5F9'
          }}>
            <span style={{ 
              color: '#64748B', 
              fontSize: '15px',
              fontWeight: 500
            }}>
              Don't have an account?{' '}
            </span>
            <Link 
              to="/register"
              style={{
                color: '#667EEA',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '15px',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#5568D3'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#667EEA'}
            >
              Register
            </Link>
=======

        {/* Right Column (Form - 60%) */}
        <div className="col-lg-7 login-right">
          <div className="login-card-shell">
            <div style={{ marginBottom: 18 }}>
              <div className="login-title">Welcome Back! 👋</div>
              <div style={{ color: '#6c757d' }}>Enter your credentials to access your account</div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: 12 }}>
                <label className="form-label">Email</label>
                <input
                  className="input login-input"
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                />
              </div>
              <div className="form-group" style={{ marginBottom: 12 }}>
                <label className="form-label">Password</label>
                <input
                  className="input login-input"
                  type="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Enter your password"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
                <Link to="/forgot-password">Forgot Password?</Link>
              </div>

              {error && <p className="error-message" style={{ marginTop: 6 }}>{error}</p>}

              <button
                className="button button-primary login-button"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <div style={{ marginTop: 18, textAlign: 'center' }}>
              <span>Don't have an account? </span>
              <Link to="/register">Register</Link>
            </div>
>>>>>>> Stashed changes
          </div>
        </div>
      </div>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 900px) {
          .login-brand-panel {
            display: none !important;
          }
        }

        @keyframes loginFloat {
          0% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(0, -14px, 0); }
          100% { transform: translate3d(0, 0, 0); }
        }

        .login-circle {
          animation: loginFloat 8s ease-in-out infinite;
        }
        .login-circle-2 { animation-duration: 10s; animation-delay: -2s; }
        .login-circle-3 { animation-duration: 12s; animation-delay: -4s; }
        .login-circle-4 { animation-duration: 9s; animation-delay: -3s; }
        .login-circle-5 { animation-duration: 11s; animation-delay: -5s; }

        .login-feature-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease;
        }
        .login-feature-card:hover {
          transform: translateY(-5px);
          background: rgba(255, 255, 255, 0.20) !important;
          box-shadow: 0 18px 48px rgba(0, 0, 0, 0.16);
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
