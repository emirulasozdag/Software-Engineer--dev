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
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: 'var(--bg)'
    }}>
      {/* Left Panel - Branding (40%) (copied from LoginPage) */}
      <div style={{
        flex: '0 0 40%',
        background: 'linear-gradient(135deg, #A5B4FC 0%, #C4B5FD 55%, #E9D5FF 100%)',
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
                </div>
              </div>
            </div>
          </div>
        </div>

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
          maxWidth: '520px',
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
              Create Account ✨
            </h2>
            <p style={{
              color: '#64748B',
              fontSize: '16px',
              fontWeight: 400,
              lineHeight: '1.5'
            }}>
              Fill in your details to get started.
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
                Name
              </label>
              <input
                className="input"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Enter your name"
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
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                placeholder="name@example.com"
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

            <div className="form-group" style={{ marginBottom: '24px' }}>
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
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label" style={{
                fontWeight: 600,
                marginBottom: '10px',
                display: 'block',
                color: '#334155',
                fontSize: '14px',
                letterSpacing: '0.01em'
              }}>
                Confirm Password
              </label>
              <input
                className="input"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                minLength={6}
                placeholder="Confirm your password"
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

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label" style={{
                fontWeight: 600,
                marginBottom: '10px',
                display: 'block',
                color: '#334155',
                fontSize: '14px',
                letterSpacing: '0.01em'
              }}>
                Role
              </label>
              <select
                className="input"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as 'student' | 'teacher' | 'admin' })}
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
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
              </select>
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
              {isLoading ? 'Signing up...' : 'Sign Up'}
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
              Already have an account?{' '}
            </span>
            <Link
              to="/login"
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
              Login
            </Link>
          </div>
        </div>
      </div>

      {/* Responsive styles (copied from LoginPage) */}
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

export default RegisterPage;
