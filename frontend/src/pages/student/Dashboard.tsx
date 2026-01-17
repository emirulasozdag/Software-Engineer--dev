import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { communicationService, learningService, progressService, testService } from '@/services/api';
import { LearningPlan } from '@/types/learning.types';
import { PlacementTestResult } from '@/types/test.types';
import type { ProgressResponse } from '@/types/progress.types';
import { AchievementNotificationContainer } from '@/components/AchievementNotification';
import { useAchievementNotifications } from '@/hooks/useAchievementNotifications';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [plan, setPlan] = useState<LearningPlan | null>(null);
  const [results, setResults] = useState<PlacementTestResult[]>([]);
  const [unread, setUnread] = useState(0);
  const [progress, setProgress] = useState<ProgressResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const { newAchievements, clearAchievements, checkForNewAchievements } = useAchievementNotifications();

  const load = async () => {
    setLoading(true);
    try {
      const [msgs, r, p, pr] = await Promise.all([
        communicationService.getMessages().catch(() => []),
        testService.getStudentTestResults().catch(() => []),
        learningService.getMyLearningPlan(false).catch(() => null as any),
        progressService.getMyProgress().catch(() => null as any),
      ]);
      const myId = user?.id;
      const unreadCount = myId ? msgs.filter((m: any) => m.receiverId === myId && !m.isRead).length : 0;
      setUnread(unreadCount);
      setResults(r);
      setPlan(p);
      setProgress(pr);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // Check for new achievements after dashboard loads
    checkForNewAchievements().catch(() => {
      // Silently fail if achievements endpoint is not available
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const latestResult = useMemo(() => {
    if (!results.length) return null;
    return [...results].sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())[0];
  }, [results]);

  const displayName = user?.name ?? 'Student';
  const firstName = displayName.split(' ')[0] || displayName;

  const planTopicsCount = plan?.topics?.length ?? 0;
  const planPct = Math.max(18, Math.min(100, 18 + planTopicsCount * 10));

  return (
    <>
      {newAchievements && newAchievements.length > 0 && (
        <AchievementNotificationContainer achievements={newAchievements} onClose={clearAchievements} />
      )}

      <section className="sd-hero" aria-label="Welcome">
        <div className="sd-hero-inner">
          <div className="sd-hero-title">Welcome back, {firstName}</div>
          <div className="sd-hero-actions">
            <Link to="/student/dashboard" className="sd-hero-chip sd-hero-chip-solid">
              Welcome back
            </Link>
            <Link to="/student/placement-test" className="sd-hero-chip sd-hero-chip-outline">
              Get Started
            </Link>
          </div>
        </div>
      </section>

      <section className="sd-grid" aria-label="Dashboard Cards">
        <div className="sd-row sd-row-3">
          <div className="sd-card sd-card-sm bg-white rounded-2xl shadow-sm border border-slate-100">
            <div className="sd-card-head">
              <div className="sd-card-title">Streak</div>
              <span className="sd-card-action" aria-hidden="true">🔥</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                aria-hidden="true"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 14,
                  display: 'grid',
                  placeItems: 'center',
                  background: 'rgba(249, 115, 22, 0.12)',
                  border: '1px solid rgba(249, 115, 22, 0.18)',
                  color: 'rgba(154, 52, 18, 1)',
                  fontSize: 18,
                }}
              >
                🔥
              </div>
              <div className="sd-metric">{loading ? '…' : (progress?.dailyStreak ?? 0)}</div>
            </div>
            <div className="sd-card-desc">Days in a row</div>
          </div>

          <div className="sd-card sd-card-sm">
            <div className="sd-card-head">
              <div className="sd-card-title">Learning Plan</div>
              <Link to="/student/learning-plan" className="sd-card-action" aria-label="Open learning plan">≡</Link>
            </div>

            <div className="sd-level">
              <div className="sd-level-value">{plan?.recommendedLevel || '—'}</div>
              <div className="sd-level-sub">Level {plan?.recommendedLevel || '—'}</div>
            </div>

            <div className="sd-progress">
              <div className="sd-progress-track" aria-hidden="true">
                <div className="sd-progress-fill" style={{ width: `${planPct}%` }} />
              </div>
              <div className="sd-progress-meta">Topics: {planTopicsCount}</div>
            </div>
          </div>

          <div className="sd-card sd-card-sm">
            <div className="sd-card-head">
              <div className="sd-card-title">AI Content Delivery</div>
              <Link to="/student/ai-content-delivery" className="sd-card-action" aria-label="Open AI content delivery">✦</Link>
            </div>
            <div className="sd-card-desc">Learn in waves with rotating tasks.</div>
            <div className="sd-pill-row">
              <span className="sd-pill sd-pill-cool">Adaptive</span>
              <span className="sd-pill sd-pill-warm">Updated</span>
            </div>
          </div>

          <div className="sd-card sd-card-sm bg-white rounded-2xl shadow-sm border border-slate-100">
            <div className="sd-card-head">
              <div className="sd-card-title">Messages</div>
              <Link to="/student/messages" className="sd-card-action" aria-label="Open messages">💬</Link>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                aria-hidden="true"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 14,
                  display: 'grid',
                  placeItems: 'center',
                  background: 'rgba(59, 130, 246, 0.12)',
                  border: '1px solid rgba(59, 130, 246, 0.18)',
                  color: 'rgba(30, 58, 138, 1)',
                  fontSize: 18,
                }}
              >
                💬
              </div>
              <div className="sd-metric">{loading ? '…' : unread}</div>
            </div>
            <div className="sd-card-desc">Unread</div>
          </div>

          <div className="sd-card sd-card-sm">
            <div className="sd-card-head">
              <div className="sd-card-title">Chatbot</div>
              <Link to="/student/chatbot" className="sd-card-action" aria-label="Open chatbot">🤖</Link>
            </div>
            <div className="sd-card-desc">Ask questions and get practice with instant feedback.</div>
          </div>
        </div>

        <div className="sd-row sd-row-2">
          <div className="sd-card sd-card-lg">
            <div className="sd-card-head">
              <div className="sd-card-title">My Progress</div>
              <Link to="/student/progress" className="sd-card-action" aria-label="Open progress">📊</Link>
            </div>
            <div className="sd-spark" aria-hidden="true">
              <span className="sd-bar" />
              <span className="sd-bar" />
              <span className="sd-bar" />
              <span className="sd-bar is-accent" />
              <span className="sd-bar" />
              <span className="sd-bar" />
              <span className="sd-bar" />
            </div>
          </div>

          <div className="sd-card sd-card-lg">
            <div className="sd-card-head">
              <div className="sd-card-title">Assignments</div>
              <Link to="/student/assignments" className="sd-card-action" aria-label="Open assignments">🗓</Link>
            </div>

            <div className="sd-list">
              <div className="sd-list-item">
                <div className="sd-list-title">Open assignments</div>
                <div className="sd-list-sub">View tasks and due dates</div>
              </div>
              <div className="sd-list-item">
                <div className="sd-list-title">Latest placement</div>
                <div className="sd-list-sub">{latestResult?.overallLevel ? `Level ${latestResult.overallLevel}` : 'No results yet'}</div>
              </div>
              <div className="sd-list-item">
                <div className="sd-list-title">Next step</div>
                <div className="sd-list-sub">Start with a quick placement test</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default StudentDashboard;
