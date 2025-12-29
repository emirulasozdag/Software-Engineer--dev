import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { learningService } from '@/services/api/learning.service';
import { LearningPlan as LearningPlanType } from '@/types/learning.types';
import AILoading from '@/components/AILoading';

const LearningPlan: React.FC = () => {
  const [plan, setPlan] = useState<LearningPlanType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const load = async (refresh: boolean) => {
    setError('');
    setLoading(true);
    if (refresh) setIsRefreshing(true);
    try {
      const p = await learningService.getMyLearningPlan(refresh);
      setPlan(p);
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      const msg =
        err.response?.data?.message ||
        (Array.isArray(detail) ? detail.map((d: any) => d?.msg).filter(Boolean).join(', ') : detail) ||
        'Failed to load learning plan.';
      setError(msg);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    load(false);
  }, []);

  const sortedTopics = useMemo(() => {
    if (!plan) return [];
    return [...plan.topics].sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));
  }, [plan]);

  return (
    <div className="container">
      {isRefreshing && <AILoading message="Generating your personalized plan..." />}
      
      <Link to="/student/dashboard" className="link mb-16" style={{ display: 'inline-block' }}>
        ← Back to Dashboard
      </Link>
      <h1 className="page-title">Learning Plan (UC7)</h1>

      <div className="card lp-hero">
        <div className="lp-topbar">
          <div>
            <div className="topic-meta mb-6">
              <span className="badge">
                Level: <strong>{plan?.recommendedLevel || '—'}</strong>
              </span>
              {plan?.isGeneral ? (
                <span className="badge badge-muted">General Plan (no results yet)</span>
              ) : (
                <span className="badge badge-success">Personalized</span>
              )}
            </div>
            <div className="lp-subtitle">
              {plan
                ? `Updated: ${new Date(plan.updatedAt).toLocaleString()}`
                : 'Generate a plan based on your strengths and weaknesses.'}
            </div>
          </div>

          <div className="lp-actions">
            <button className="button button-primary" onClick={() => load(true)} disabled={loading}>
              {loading ? 'Refreshing...' : 'Refresh Plan'}
            </button>
          </div>
        </div>

        {loading && (
          <div className="mt-12">
            <div className="skeleton skeleton-line lg" style={{ width: '55%' }} />
            <div className="skeleton skeleton-line" style={{ width: '80%' }} />
            <div className="skeleton skeleton-line" style={{ width: '65%' }} />
          </div>
        )}
        {error && <p className="error-message mt-12">{error}</p>}
        <p className="text-muted mt-12">
          This page implements <strong>UC7</strong>: analyze placement test results (strengths/weaknesses) and generate a personalized lesson plan.
        </p>
      </div>

      <div className="lp-grid">
        <div className="card lp-col-6">
          <h2 style={{ marginBottom: 10 }}>Strengths (from test results)</h2>
          {plan?.strengths?.length ? (
            <div className="chip-row">
              {plan.strengths.map((s) => (
                <span key={s} className="chip">{s}</span>
              ))}
            </div>
          ) : (
            <p style={{ color: '#5f6b76' }}>No strengths detected yet.</p>
          )}
        </div>

        <div className="card lp-col-6">
          <h2 style={{ marginBottom: 10 }}>Weaknesses (focus areas)</h2>
          {plan?.weaknesses?.length ? (
            <div className="chip-row">
              {plan.weaknesses.map((w) => (
                <span key={w} className="chip">{w}</span>
              ))}
            </div>
          ) : (
            <p style={{ color: '#5f6b76' }}>No weaknesses detected yet.</p>
          )}
        </div>

        <div className="card lp-col-12">
          <h2>Recommended Topics</h2>
          <p className="text-muted" style={{ marginTop: 6 }}>
            Each topic includes a short rationale (FR17-style explanation) derived from weaknesses.
          </p>

        {!loading && plan && sortedTopics.length === 0 && (
          <p>No topics yet.</p>
        )}

        {!loading && plan && sortedTopics.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }} className="mt-14">
            {sortedTopics.map((t) => (
              <div key={`${t.topicId ?? t.name}-${t.priority}`} className="card topic-card">
                <div className="topic-head">
                  <h3 style={{ margin: 0 }}>{t.priority}. {t.name}</h3>
                  <div className="topic-meta">
                    <span className="badge badge-muted">{t.category}</span>
                    <span className="badge">Difficulty: <strong>{t.difficulty}</strong></span>
                  </div>
                </div>
                
                <div style={{ marginTop: 12, marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 4 }}>
                    <span>Progress</span>
                    <span>{Math.round(t.progress)}%</span>
                  </div>
                  <div style={{ width: '100%', height: 8, background: '#eee', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${t.progress}%`, height: '100%', background: '#2ecc71', transition: 'width 0.3s ease' }} />
                  </div>
                </div>

                <details style={{ marginTop: 10 }}>
                  <summary className="link" style={{ cursor: 'pointer', display: 'inline-block' }}>
                    Why this topic?
                  </summary>
                  <div className="topic-reason">{t.reason}</div>
                  {!!t.evidence?.length && (
                    <div className="chip-row mt-12">
                      {t.evidence.map((e) => (
                        <span key={e} className="chip">{e}</span>
                      ))}
                    </div>
                  )}
                </details>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default LearningPlan;
