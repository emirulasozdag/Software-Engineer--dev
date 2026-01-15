import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { communicationService, teacherService } from '@/services/api';

const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const [studentCount, setStudentCount] = useState<number | null>(null);
  const [unread, setUnread] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [students, msgs] = await Promise.all([
        teacherService.getMyStudents().catch(() => []),
        communicationService.getMessages().catch(() => []),
      ]);
      setStudentCount(students.length);
      const myId = user?.id;
      const unreadCount = myId ? msgs.filter((m: any) => m.receiverId === myId && !m.isRead).length : 0;
      setUnread(unreadCount);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const displayName = user?.name ?? 'Teacher';
  const firstName = displayName.split(' ')[0] || displayName;
  const rosterCount = studentCount ?? 0;
  const rosterPct = Math.max(18, Math.min(100, 18 + rosterCount * 10));

  return (
    <>
      <section className="sd-hero" aria-label="Welcome">
        <div className="sd-hero-inner">
          <div className="sd-hero-title">Welcome back, {firstName}</div>
          <div className="sd-hero-actions">
            <button
              type="button"
              className="sd-hero-chip sd-hero-chip-solid"
              onClick={load}
              disabled={loading}
            >
              {loading ? 'Loading…' : 'Refresh'}
            </button>
            <Link to="/teacher/students" className="sd-hero-chip sd-hero-chip-outline">
              Review Students
            </Link>
            <Link to="/teacher/assignments/create" className="sd-hero-chip sd-hero-chip-outline">
              Create Assignment
            </Link>
          </div>
        </div>
      </section>

      <section className="sd-grid" aria-label="Dashboard Cards">
        <div className="sd-row sd-row-3">
          <div className="sd-card sd-card-sm bg-white rounded-2xl shadow-sm border border-slate-100">
            <div className="sd-card-head">
              <div className="sd-card-title">My Students</div>
              <Link to="/teacher/students" className="sd-card-action" aria-label="Open my students">👥</Link>
            </div>

            <div className="sd-level">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  aria-hidden="true"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 14,
                    display: 'grid',
                    placeItems: 'center',
                    background: 'rgba(139, 92, 246, 0.12)',
                    border: '1px solid rgba(139, 92, 246, 0.18)',
                    color: 'rgba(88, 28, 135, 1)',
                    fontSize: 18,
                  }}
                >
                  👥
                </div>
                <div>
                  <div className="sd-level-value">{loading ? '…' : rosterCount}</div>
                  <div className="sd-level-sub">Students</div>
                </div>
              </div>
            </div>

            <div className="sd-progress">
              <div className="sd-progress-track" aria-hidden="true">
                <div className="sd-progress-fill" style={{ width: `${loading ? 18 : rosterPct}%` }} />
              </div>
              <div className="sd-progress-meta">Roster size</div>
            </div>
          </div>

          <div className="sd-card sd-card-sm bg-white rounded-2xl shadow-sm border border-slate-100">
            <div className="sd-card-head">
              <div className="sd-card-title">Messages</div>
              <Link to="/teacher/messages" className="sd-card-action" aria-label="Open messages">💬</Link>
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

          <div className="sd-card sd-card-sm bg-white rounded-2xl shadow-sm border border-slate-100">
            <div className="sd-card-head">
              <div className="sd-card-title">Create Assignment</div>
              <Link to="/teacher/assignments/create" className="sd-card-action" aria-label="Create assignment">🗓</Link>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10 }}>
              <div
                aria-hidden="true"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 14,
                  display: 'grid',
                  placeItems: 'center',
                  background: 'rgba(236, 72, 153, 0.10)',
                  border: '1px solid rgba(236, 72, 153, 0.16)',
                  color: 'rgba(157, 23, 77, 1)',
                  fontSize: 18,
                }}
              >
                🗓
              </div>
              <div className="sd-card-desc">Draft a new assignment and send it to students.</div>
            </div>
            <div className="sd-pill-row">
              <span className="sd-pill sd-pill-cool">Templates</span>
              <span className="sd-pill sd-pill-warm">AI Assist</span>
            </div>
          </div>

          <div className="sd-card sd-card-sm">
            <div className="sd-card-head">
              <div className="sd-card-title">AI Drafts</div>
              <Link to="/teacher/ai-drafts" className="sd-card-action" aria-label="Open AI drafts">✦</Link>
            </div>
            <div className="sd-card-desc">Generate and refine learning content drafts.</div>
          </div>
        </div>

        <div className="sd-row sd-row-2">
          <div className="sd-card sd-card-lg">
            <div className="sd-card-head">
              <div className="sd-card-title">Student Insights</div>
              <Link to="/teacher/students" className="sd-card-action" aria-label="Open student list">📊</Link>
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
              <div className="sd-card-title">Next Steps</div>
              <Link to="/teacher/students" className="sd-card-action" aria-label="Open students">≡</Link>
            </div>

            <div className="sd-list">
              <div className="sd-list-item">
                <div className="sd-list-title">Review placement results</div>
                <div className="sd-list-sub">Identify strengths and weaknesses</div>
              </div>
              <div className="sd-list-item">
                <div className="sd-list-title">Update learning plans</div>
                <div className="sd-list-sub">Adjust topics based on needs</div>
              </div>
              <div className="sd-list-item">
                <div className="sd-list-title">Send a quick message</div>
                <div className="sd-list-sub">Nudge students to complete tasks</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default TeacherDashboard;
