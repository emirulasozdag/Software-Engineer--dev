import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { communicationService, learningService, rewardsService, testService } from '@/services/api';
import { LearningPlan } from '@/types/learning.types';
import { PlacementTestResult } from '@/types/test.types';
import { RewardSummary } from '@/types/rewards.types';

const StudentDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [plan, setPlan] = useState<LearningPlan | null>(null);
  const [results, setResults] = useState<PlacementTestResult[]>([]);
  const [unread, setUnread] = useState(0);
  const [rewardSummary, setRewardSummary] = useState<RewardSummary | null>(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [msgs, r, p, summary, notifs] = await Promise.all([
        communicationService.getMessages().catch(() => []),
        testService.getStudentTestResults().catch(() => []),
        learningService.getMyLearningPlan(false).catch(() => null as any),
        rewardsService.getMySummary().catch(() => null as any),
        communicationService.getNotifications().catch(() => []),
      ]);
      const myId = user?.id;
      const unreadCount = myId ? msgs.filter((m: any) => m.receiverId === myId && !m.isRead).length : 0;
      setUnread(unreadCount);
      setResults(r);
      setPlan(p);

      setRewardSummary(summary);
      setUnreadNotifications((notifs || []).filter((n: any) => !n.isRead).length);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const latestResult = useMemo(() => {
    if (!results.length) return null;
    return [...results].sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())[0];
  }, [results]);

  return (
    <div className="container">
      <div className="card dash-hero">
        <div className="hero-row">
          <div>
            <h1 className="hero-title">Welcome, {user?.name}</h1>
            <div className="hero-sub">
              Hızlı özet: seviyen, planın ve mesajların burada.
            </div>
            <div className="action-meta" style={{ marginTop: 12 }}>
              <span className="pill">Email: {user?.email}</span>
              <span className="pill">Role: {user?.role}</span>
              <span className="pill">Unread: {loading ? '…' : unread}</span>
              <span className="pill">Notifications: {loading ? '…' : unreadNotifications}</span>
              <span className="pill">Streak: {loading ? '…' : (rewardSummary?.dailyStreak ?? 0)}</span>
              <span className="pill">Points: {loading ? '…' : (rewardSummary?.totalPoints ?? 0)}</span>
            </div>
          </div>
          <div className="hero-actions">
            <button className="button button-secondary" onClick={load} disabled={loading}>
              {loading ? 'Loading…' : 'Refresh'}
            </button>
            <button className="button button-primary" onClick={logout}>Logout</button>
          </div>
        </div>
      </div>

      <div className="dash-grid">
        <div className="card col-4">
          <div className="text-muted">Latest Placement</div>
          <div className="kpi" style={{ marginTop: 10 }}>
            <div className="label">Overall</div>
            <div className="value">{latestResult?.overallLevel || '—'}</div>
          </div>
          <div className="text-muted" style={{ marginTop: 10 }}>
            {latestResult?.completedAt ? new Date(latestResult.completedAt).toLocaleString() : 'No results yet'}
          </div>
          <div className="divider" />
          <Link to="/student/placement-test" className="link">Go to Placement Test</Link>
        </div>

        <div className="card col-4">
          <div className="text-muted">Learning Plan (UC7)</div>
          <div className="kpi" style={{ marginTop: 10 }}>
            <div className="label">Recommended</div>
            <div className="value">{plan?.recommendedLevel || '—'}</div>
          </div>
          <div className="text-muted" style={{ marginTop: 10 }}>
            Topics: {plan?.topics?.length ?? 0}
          </div>
          <div className="divider" />
          <Link to="/student/learning-plan" className="link">Open Learning Plan</Link>
        </div>

        <div className="card col-4">
          <div className="text-muted">Messages (UC18)</div>
          <div className="kpi" style={{ marginTop: 10 }}>
            <div className="label">Unread</div>
            <div className="value">{loading ? '…' : unread}</div>
          </div>
          <div className="divider" />
          <Link to="/student/messages" className="link">Open Messages</Link>
        </div>

        <Link to="/student/ai-content-delivery" style={{ textDecoration: 'none' }} className="col-6">
          <div className="card click-card action-card">
            <span className="action-icon">AI</span>
            <div>
              <h3 className="action-title">AI Content Delivery (UC8–UC9)</h3>
              <div className="action-desc">Plan’a göre içerik al, progress’e göre güncelle ve “neden seçildi” açıklamasını gör.</div>
              <div className="action-meta">
                <span className="pill">FR17 rationale</span>
                <span className="pill">Update by progress</span>
              </div>
            </div>
          </div>
        </Link>

        <Link to="/student/progress" style={{ textDecoration: 'none' }} className="col-6">
          <div className="card click-card action-card">
            <span className="action-icon green">PG</span>
            <div>
              <h3 className="action-title">My Progress (UC10)</h3>
              <div className="action-desc">Grafik ve timeline ile ilerlemeni takip et.</div>
              <div className="action-meta">
                <span className="pill">Charts</span>
                <span className="pill">Timeline</span>
              </div>
            </div>
          </div>
        </Link>

        <Link to="/student/assignments" style={{ textDecoration: 'none' }} className="col-6">
          <div className="card click-card action-card">
            <span className="action-icon amber">AS</span>
            <div>
              <h3 className="action-title">Assignments</h3>
              <div className="action-desc">Ödevlerini görüntüle ve tamamla.</div>
            </div>
          </div>
        </Link>

        <Link to="/student/chatbot" style={{ textDecoration: 'none' }} className="col-6">
          <div className="card click-card action-card">
            <span className="action-icon">CB</span>
            <div>
              <h3 className="action-title">Chatbot (UC20)</h3>
              <div className="action-desc">Şu an mock modunda: soru sor, örnek açıklama + mini alıştırma al.</div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default StudentDashboard;
