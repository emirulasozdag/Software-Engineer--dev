import { useMemo, useState, useEffect } from 'react';
import type { FC } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { learningService } from '@/services/api/learning.service';
import { useAuth } from '@/contexts/AuthContext';
import AILoading from '@/components/AILoading';

const AIContentDelivery: FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const studentId = useMemo(() => {
    const n = Number(user?.id);
    return Number.isFinite(n) ? n : null;
  }, [user?.id]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      if (!studentId) return;
      setIsLoading(true);
      try {
        // Automatically fetch next content
        const res = await learningService.deliverNextContent({
          studentId,
          contentType: 'LESSON',
        });
        // Redirect to viewer
        navigate(`/student/content/${res.content.contentId}`, {
          state: { rationale: res.rationale }
        });
      } catch (e: any) {
        setError(e?.response?.data?.detail ?? e?.message ?? 'Failed to deliver content');
        setIsLoading(false);
      }
    };
    init();
  }, [studentId, navigate]);

  return (
    <div className="ad-page">
      {isLoading && <AILoading message="Generating personalized content..." />}

      <div className="ad-layout">
        <aside className="sd-sidebar">
          <div className="sd-brand">
            <div className="sd-brand-mark" aria-hidden="true">AI</div>
            <div className="sd-brand-text">
              <div className="sd-brand-name">AI Learning</div>
              <div className="sd-brand-sub">Student</div>
            </div>
          </div>

          <nav className="sd-nav">
            <Link to="/student/dashboard" className="sd-nav-link">
              <span className="sd-nav-ico" aria-hidden="true">▦</span>
              <span>Dashboard</span>
            </Link>
            <Link to="/student/learning-plan" className="sd-nav-link">
              <span className="sd-nav-ico" aria-hidden="true">📘</span>
              <span>Learning Plan</span>
            </Link>
            <Link to="/student/messages" className="sd-nav-link">
              <span className="sd-nav-ico" aria-hidden="true">✉</span>
              <span>Messages</span>
            </Link>
            <Link to="/student/progress" className="sd-nav-link">
              <span className="sd-nav-ico" aria-hidden="true">📈</span>
              <span>My Progress</span>
            </Link>
            <Link to="/student/ai-content-delivery" className="sd-nav-link is-active">
              <span className="sd-nav-ico" aria-hidden="true">✦</span>
              <span>AI Delivery</span>
            </Link>
            <Link to="/student/chatbot" className="sd-nav-link">
              <span className="sd-nav-ico" aria-hidden="true">🤖</span>
              <span>Chatbot</span>
            </Link>
          </nav>

          <div className="sd-sidebar-footer">
            <button className="sd-logout" onClick={logout}>Logout</button>
          </div>
        </aside>

        <main className="ad-main">
          <div className="ad-container">
            <div className="ad-top">
              <Link to="/student/dashboard" className="ad-back">← Back to Dashboard</Link>
            </div>

            <section className="ad-hero">
              <div>
                <h1>AI Content Delivery</h1>
                <p>We’re preparing a tailored lesson and sending you to the content viewer.</p>
              </div>
              <div className="ad-hero-meta">
                <span className="ad-pill">Auto-delivery</span>
                <span className="ad-pill ad-pill-muted">Personalized</span>
                <span className={`ad-pill ${isLoading ? 'ad-pill-live' : 'ad-pill-muted'}`}>
                  {isLoading ? 'Generating…' : 'Queued'}
                </span>
              </div>
            </section>

            {!isLoading && error && (
              <div className="ad-card ad-card-error">
                <div className="ad-card-title">Unable to deliver content</div>
                <p className="ad-card-desc">{error}</p>
                <div className="ad-actions">
                  <button className="ad-retry" onClick={() => window.location.reload()}>Retry</button>
                </div>
              </div>
            )}

            {!error && (
              <div className="ad-card">
                <div className="ad-card-title">What happens next?</div>
                <p className="ad-card-desc">
                  Your next activity is opening automatically. If it doesn’t, please refresh this page.
                </p>
                <ul className="ad-steps">
                  <li>We assemble content based on your recent progress.</li>
                  <li>You’ll be redirected to the lesson viewer.</li>
                  <li>Complete the activity to unlock the next step.</li>
                </ul>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AIContentDelivery;