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

  const level = plan?.recommendedLevel || '—';
  const updatedText = plan?.updatedAt ? new Date(plan.updatedAt).toLocaleString() : '—';
  const planTypeText = plan ? (plan.isGeneral ? 'General Plan' : 'Personalized') : '—';
  const statusText = plan ? 'On Track' : 'Pending';

  const getTypeLabel = (category?: string) => {
    if (!category) return 'TOPIC';
    const upper = String(category).toUpperCase();
    if (upper.includes('SPEAK')) return 'SPEAKING';
    if (upper.includes('GRAM')) return 'GRAMMAR';
    if (upper.includes('VOC')) return 'VOCABULARY';
    if (upper.includes('LISTEN')) return 'LISTENING';
    if (upper.includes('READ')) return 'READING';
    if (upper.includes('WRITE')) return 'WRITING';
    return upper;
  };

  const getTypeClass = (label: string) => {
    if (label === 'SPEAKING') return 'lp5-tag lp5-tag-blue';
    if (label === 'GRAMMAR') return 'lp5-tag lp5-tag-green';
    if (label === 'VOCABULARY') return 'lp5-tag lp5-tag-purple';
    if (label === 'LISTENING') return 'lp5-tag lp5-tag-blue';
    if (label === 'READING') return 'lp5-tag lp5-tag-purple';
    if (label === 'WRITING') return 'lp5-tag lp5-tag-pink';
    return 'lp5-tag lp5-tag-gray';
  };

  return (
    <div className="lp5-page">
      {isRefreshing && <AILoading message="Generating your personalized plan..." />}
      <main className="lp5-main">
        <div className="lp5-container">
          <div className="lp5-top-nav">
            <Link to="/student/dashboard" className="lp5-back-link">← Back to Dashboard</Link>
          </div>

          <div className="lp5-hero">
            <div className="lp5-hero-content">
              <h1>Learning Plan</h1>
              <p>Professional, goal-driven learning tailored to your pace.</p>
            </div>
            <div className="lp5-hero-actions">
              <button className="lp5-refresh" onClick={() => load(true)} disabled={loading}>
                {loading ? 'Refreshing…' : '↻ Refresh Plan'}
              </button>
              <div className="lp5-stats">
                <div className="lp5-stat">
                  <span className="lp5-stat-label">Level</span>
                  <span className="lp5-stat-value">{level}</span>
                </div>
                <div className="lp5-stat">
                  <span className="lp5-stat-label">Type</span>
                  <span className="lp5-stat-value">{planTypeText}</span>
                </div>
                <div className="lp5-stat lp5-stat-status">
                  <span className="lp5-stat-label">Status</span>
                  <span className="lp5-stat-value">{statusText}</span>
                </div>
                <div className="lp5-stat">
                  <span className="lp5-stat-label">Updated</span>
                  <span className="lp5-stat-value">{updatedText}</span>
                </div>
              </div>
            </div>
          </div>

          {error && <div className="lp5-error">{error}</div>}

          <div className="lp5-grid">
            <div className="lp5-card">
              <div className="lp5-status-header">
                <div className="lp5-status-icon lp5-icon-green">✓</div>
                <span className="lp5-status-title">Strengths</span>
              </div>
              {plan?.strengths?.length ? (
                <div className="lp5-chip-row">
                  {plan.strengths.map((s) => (
                    <span key={s} className="lp5-chip">{s}</span>
                  ))}
                </div>
              ) : (
                <p className="lp5-status-desc">No specific strengths detected yet. Start a lesson to reveal them.</p>
              )}
            </div>
            <div className="lp5-card">
              <div className="lp5-status-header">
                <div className="lp5-status-icon lp5-icon-orange">!</div>
                <span className="lp5-status-title">Focus Areas</span>
              </div>
              {plan?.weaknesses?.length ? (
                <div className="lp5-chip-row">
                  {plan.weaknesses.map((w) => (
                    <span key={w} className="lp5-chip">{w}</span>
                  ))}
                </div>
              ) : (
                <p className="lp5-status-desc">We’ll highlight focus areas once we gather more performance data.</p>
              )}
            </div>
          </div>

          <div className="lp5-section">
            <h3>Recommended Topics</h3>
            <span>Prioritized by your goals and progress</span>
          </div>

          {!loading && plan && sortedTopics.length === 0 && <div className="lp5-empty">No topics yet.</div>}

          {!loading && plan && sortedTopics.length > 0 && (
            <div className="lp5-topic-list">
              {sortedTopics.map((t) => {
                const typeLabel = getTypeLabel(t.category);
                const typeClass = getTypeClass(typeLabel);
                const order = String(t.priority ?? 0);

                return (
                  <div key={`${t.topicId ?? t.name}-${t.priority}`} className="lp5-card lp5-lesson-card">
                    <div className="lp5-lesson-main">
                      <div className="lp5-lesson-tags">
                        <span className={typeClass}>{typeLabel}</span>
                        <span className="lp5-tag lp5-tag-gray">{t.difficulty}</span>
                      </div>
                      <h2 className="lp5-lesson-title">
                        <span className="lp5-lesson-number">{order}</span>
                        {t.name}
                      </h2>
                      <p className="lp5-lesson-desc">{t.reason}</p>
                      <div className="lp5-ai-note">✨ Generated by AI based on your profile.</div>
                    </div>
                    <div className="lp5-lesson-action">
                      <div className="lp5-progress-label">
                        <span>Progress</span>
                        <span>{Math.round(t.progress)}%</span>
                      </div>
                      <div className="lp5-progress-bar" aria-hidden="true">
                        <div className="lp5-progress-fill" style={{ width: `${Math.round(t.progress)}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default LearningPlan;
