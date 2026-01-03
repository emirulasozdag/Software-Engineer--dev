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
    <div className="container-fluid min-vh-100 p-0">
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
        .login-card-shell {
          background: #ffffff;
          border-radius: 22px;
          box-shadow: 0 18px 40px rgba(16, 24, 40, 0.10);
          padding: 34px;
          width: 100%;
          max-width: 460px;
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
        .login-input:focus {
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
            <div style={{
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
            }}>
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
                <div className="login-feature-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <div>
                  <div className="login-feature-title">Clear Progress Tracking</div>
                  <div className="login-feature-desc">See your improvement with simple milestones.</div>
                </div>
              </div>

              <div className="login-feature">
                <div className="login-feature-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                </div>
                <div>
                  <div className="login-feature-title">Instant Feedback</div>
                  <div className="login-feature-desc">Get guidance that keeps you motivated.</div>
                </div>
              </div>
            </div>
          </div>
        </div>

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
                  className="input login-input form-control"
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
                  className="input login-input form-control"
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
                <Link to="/forgot-password" style={{ color: '#5A67FF', textDecoration: 'none', fontWeight: 500 }}>
                  Forgot Password?
                </Link>
              </div>

              {error && <div className="alert alert-danger" style={{ fontSize: '0.9rem', padding: '10px' }}>{error}</div>}

              <button
                className="button button-primary login-button"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <div style={{ marginTop: 18, textAlign: 'center', fontSize: '0.95rem' }}>
              <span style={{ color: '#64748B' }}>Don't have an account? </span>
              <Link to="/register" style={{ color: '#5A67FF', fontWeight: 700, textDecoration: 'none' }}>
                Register
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;