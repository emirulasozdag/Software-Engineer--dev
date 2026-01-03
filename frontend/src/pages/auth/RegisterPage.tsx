import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student' as 'student' | 'teacher' | 'admin',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const res: any = await register(formData.email, formData.password, formData.name, formData.role);
      // Help user avoid email mismatch on the next step
      localStorage.setItem('pending_email', formData.email);
      // If backend returns a dev verification token, go directly to verify page.
      if (res?.verification_token) {
        navigate(`/verify-email/${res.verification_token}`);
      } else {
        navigate('/login');
      }
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      const validationMsg =
        Array.isArray(detail) ? detail.map((d: any) => d?.msg).filter(Boolean).join(', ') : undefined;
      setError(err.response?.data?.message || validationMsg || detail || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
      `}</style>

      <div className="row g-0 login-split login-page">
        {/* Left Column (Branding) */}
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
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Form) */}
        <div className="col-lg-7 login-right">
          <div className="login-card-shell">
            <div style={{ marginBottom: 18 }}>
              <div className="login-title">Create Account ✨</div>
              <div style={{ color: '#6c757d' }}>Fill in your details to get started.</div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: 12 }}>
                <label className="form-label">Name</label>
                <input
                  className="input login-input"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Enter your name"
                />
              </div>
              <div className="form-group" style={{ marginBottom: 12 }}>
                <label className="form-label">Email</label>
                <input
                  className="input login-input"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  placeholder="Enter your email"
                />
              </div>
              <div className="form-group" style={{ marginBottom: 12 }}>
                <label className="form-label">Password</label>
                <input
                  className="input login-input"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                  placeholder="Enter your password"
                />
              </div>
              <div className="form-group" style={{ marginBottom: 12 }}>
                <label className="form-label">Confirm Password</label>
                <input
                  className="input login-input"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  minLength={6}
                  placeholder="Confirm your password"
                />
              </div>
              <div className="form-group" style={{ marginBottom: 12 }}>
                <label className="form-label">Role</label>
                <select
                  className="input login-input"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as 'student' | 'teacher' | 'admin' })}
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              {error && <p className="error-message" style={{ marginTop: 6 }}>{error}</p>}
              <button
                className="button button-primary login-button"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Signing up...' : 'Sign Up'}
              </button>
            </form>

            <div style={{ marginTop: 18, textAlign: 'center' }}>
              <span>Already have an account? </span>
              <Link to="/login">Login</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
