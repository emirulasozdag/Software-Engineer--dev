import React from 'react';
import { Link } from 'react-router-dom';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { progressService, rewardsService } from '@/services/api';
import { ProgressResponse } from '@/types/progress.types';
import { Achievement } from '@/types/rewards.types';

type ProgressChartTooltipProps = {
  active?: boolean;
  payload?: Array<{ value?: number; payload?: any }>;
};

const ProgressChartTooltip: React.FC<ProgressChartTooltipProps> = ({ active, payload }) => {
  if (!active || !payload?.length) return null;

  const point = payload[0]?.payload as any;
  const value = payload[0]?.value ?? point?.value;
  const dateText = point?.date ? new Date(point.date).toLocaleDateString() : '';

  return (
    <div
      style={{
        background: 'rgba(15, 23, 42, 0.86)',
        color: '#ffffff',
        padding: '10px 12px',
        borderRadius: 12,
        boxShadow: '0 18px 48px rgba(0, 0, 0, 0.28)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        minWidth: 170,
      }}
    >
      {dateText ? <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 6 }}>{dateText}</div> : null}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'baseline' }}>
        <div style={{ fontSize: 12, opacity: 0.85 }}>Completed</div>
        <div style={{ fontSize: 16, fontWeight: 800 }}>{Number(value ?? 0).toLocaleString()}</div>
      </div>
      {point?.cefrLevel ? (
        <div style={{ marginTop: 6, fontSize: 12, opacity: 0.85 }}>
          Level: <span style={{ fontWeight: 800, opacity: 1 }}>{point.cefrLevel}</span>
        </div>
      ) : null}
    </div>
  );
};

const Progress: React.FC = () => {

  const [liveProgress, setLiveProgress] = React.useState<ProgressResponse | null>(null);
  const [achievements, setAchievements] = React.useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = React.useState(false);

  const loadLiveProgress = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await progressService.getMyProgress();
      setLiveProgress(data);
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.message || 'Failed to load progress');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadAchievements = React.useCallback(async () => {
    try {
      const data = await rewardsService.getMyAchievements();
      setAchievements(data);
    } catch (e: any) {
      console.error('Failed to load achievements:', e);
    }
  }, []);

  React.useEffect(() => {
    loadLiveProgress();
    loadAchievements();
  }, [loadLiveProgress, loadAchievements]);

  const downloadPdf = React.useCallback(async () => {
    setIsDownloadingPdf(true);
    setError(null);
    try {
      const blob = await progressService.exportMyProgressPdf();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'my-progress.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.message || 'Failed to export PDF');
    } finally {
      setIsDownloadingPdf(false);
    }
  }, []);

  // Group achievements by category for better display
  const achievementCategories = React.useMemo(() => {
    const categories: Record<string, Achievement[]> = {
      'Getting Started': [],
      'Content Mastery': [],
      'Skill Specific': [],
      'Milestones': [],
    };

    achievements.forEach((ach) => {
      if (ach.name.includes('First') || ach.name.includes('Starter')) {
        categories['Getting Started'].push(ach);
      } else if (ach.name.includes('Dedicated') || ach.name.includes('Explorer')) {
        categories['Content Mastery'].push(ach);
      } else if (ach.name.includes('Listening') || ach.name.includes('Grammar') || ach.name.includes('Vocabulary') || ach.name.includes('Speaking') || ach.name.includes('Reading')) {
        categories['Skill Specific'].push(ach);
      } else {
        categories['Milestones'].push(ach);
      }
    });

    return categories;
  }, [achievements]);

  return (
    <div
      style={{
        minHeight: '100vh',
      }}
      className="w-full p-6"
    >
      <div className="container">
        <Link to="/student/dashboard" style={{ marginBottom: '20px', display: 'inline-block' }}>← Back to Dashboard</Link>

        <h1 className="page-title">My Progress</h1>

        {/* Key Metrics */}
        <div className="card">
          <h2>Learning Statistics</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '20px' }}>
            <div style={{ padding: '20px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Daily Streak</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{liveProgress?.dailyStreak || 0}</div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>days</div>
            </div>
            <div style={{ padding: '20px', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Content Completed</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{liveProgress?.completedContentCount || 0}</div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>pieces</div>
            </div>
            <div style={{ padding: '20px', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Current Level</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{liveProgress?.currentLevel || 'N/A'}</div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>CEFR</div>
            </div>
          </div>
        </div>

        {/* Progress Chart */}
        <div className="card">
          <h2>Progress Over Time</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>Track your learning journey with completed content and CEFR level progression</p>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', alignItems: 'center' }}>
            <button className="button button-secondary" onClick={loadLiveProgress} disabled={isLoading}>
              {isLoading ? 'Refreshing…' : 'Refresh Data'}
            </button>
            <button className="button button-primary" onClick={downloadPdf} disabled={isDownloadingPdf}>
              {isDownloadingPdf ? 'Preparing PDF…' : 'Export PDF'}
            </button>
            {error ? <span style={{ color: '#e74c3c', fontSize: '14px' }}>{error}</span> : null}
          </div>

          {liveProgress && liveProgress.timeline.length > 0 ? (
            <div style={{ marginTop: '20px', overflow: 'hidden' }}>
              <div style={{ width: '100%', overflow: 'hidden' }}>
                <div style={{ width: '100%', height: 300, overflow: 'hidden' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={liveProgress.timeline.map((p) => ({
                        ...p,
                        value: p.completedContentCount,
                        label: new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                      }))}
                      margin={{ top: 12, right: 18, bottom: 8, left: 6 }}
                    >
                      <defs>
                        <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#667EEA" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="#667EEA" stopOpacity={0.06} />
                        </linearGradient>
                        <filter id="progressShadow" x="-20%" y="-20%" width="140%" height="140%">
                          <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#667EEA" floodOpacity="0.18" />
                        </filter>
                      </defs>

                      <CartesianGrid
                        vertical={false}
                        stroke="#E2E8F0"
                        strokeDasharray="3 3"
                        opacity={0.65}
                      />

                      <XAxis
                        dataKey="label"
                        tick={{ fill: '#64748B', fontSize: 12, fontWeight: 500 }}
                        axisLine={false}
                        tickLine={false}
                        padding={{ left: 8, right: 8 }}
                      />

                      <YAxis
                        dataKey="value"
                        tick={{ fill: '#64748B', fontSize: 12, fontWeight: 500 }}
                        axisLine={false}
                        tickLine={false}
                        width={44}
                      />

                      <Tooltip
                        content={<ProgressChartTooltip />}
                        cursor={{ stroke: 'rgba(102, 126, 234, 0.18)', strokeWidth: 1 }}
                      />

                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#667EEA"
                        strokeWidth={3}
                        fill="url(#progressGradient)"
                        fillOpacity={1}
                        dot={false}
                        activeDot={{ r: 6, fill: '#ffffff', stroke: '#667EEA', strokeWidth: 3 }}
                        filter="url(#progressShadow)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          ) : (
            <p style={{ color: '#999', padding: '40px', textAlign: 'center', background: '#f9f9f9', borderRadius: '8px' }}>
              {isLoading ? 'Loading progress data…' : 'No timeline data available yet. Complete some content to see your progress!'}
            </p>
          )}
        </div>

        {/* Content Type Progress */}
        {liveProgress && liveProgress.contentTypeProgress.length > 0 && (
          <div className="card">
            <h2>Content Completion by Type</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginTop: '20px' }}>
              {liveProgress.contentTypeProgress.map((ct) => (
                <div key={ct.contentType} style={{ padding: '15px', background: '#f9f9f9', borderRadius: '8px', textAlign: 'center', border: '2px solid #e0e0e0' }}>
                  <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px', textTransform: 'capitalize' }}>{ct.contentType}</div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3498db' }}>{ct.completedCount}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Personal Plan Topic Progress */}
        {liveProgress && liveProgress.topicProgress.length > 0 && (
          <div className="card">
            <h2>Personal Plan Topic Progress</h2>
            <div style={{ marginTop: '20px' }}>
              {liveProgress.topicProgress.map((topic) => (
                <div
                  key={topic.topicName}
                  className="topic-row topic-row-group"
                  style={{
                    marginBottom: 12,
                    background: '#FFFFFF',
                    border: '1px solid transparent',
                    borderRadius: 16,
                    padding: '14px 16px',
                    cursor: 'pointer',
                    boxShadow: '0 1px 2px rgba(15, 23, 42, 0.06)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 999,
                          background: 'linear-gradient(135deg, #6366F1 0%, #7C3AED 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flex: '0 0 auto',
                          boxShadow: '0 10px 20px rgba(99, 102, 241, 0.22)',
                        }}
                        aria-hidden="true"
                      >
                        {topic.progress > 0 ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                              d="M12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22Z"
                              stroke="#FFFFFF"
                              strokeWidth="2"
                            />
                            <path
                              d="M10 8.5V15.5L16 12L10 8.5Z"
                              fill="#FFFFFF"
                            />
                          </svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                              d="M7 4H17C18.1046 4 19 4.89543 19 6V20L12 16.5L5 20V6C5 4.89543 5.89543 4 7 4Z"
                              stroke="#FFFFFF"
                              strokeWidth="2"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M9 8H15"
                              stroke="#FFFFFF"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                            <path
                              d="M9 11H14"
                              stroke="#FFFFFF"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                          </svg>
                        )}
                      </div>

                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontWeight: 800,
                            fontSize: 15,
                            color: '#0F172A',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                          title={topic.topicName}
                        >
                          {topic.topicName}
                        </div>
                        <div style={{ marginTop: 4, color: '#64748B', fontSize: 13, fontWeight: 500 }}>
                          {topic.completedCount}/{topic.totalCount} • {Math.round(topic.progress * 100)}%
                        </div>
                      </div>
                    </div>

                    {topic.progress >= 0.999 ? (
                      <span
                        style={{
                          padding: '6px 10px',
                          borderRadius: 999,
                          background: '#DCFCE7',
                          color: '#15803D',
                          fontSize: 12,
                          fontWeight: 800,
                          letterSpacing: '0.01em',
                          flex: '0 0 auto',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                          <path d="M20 6L9 17L4 12" stroke="#15803D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Completed
                      </span>
                    ) : topic.progress === 0 ? (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, flex: '0 0 auto' }}>
                        <span
                          style={{
                            padding: '6px 10px',
                            borderRadius: 999,
                            background: '#F1F5F9',
                            color: '#64748B',
                            fontSize: 12,
                            fontWeight: 800,
                            letterSpacing: '0.01em',
                          }}
                        >
                          Not Started
                        </span>
                        <span className="topic-cta" aria-hidden="true" style={{ display: 'inline-flex', alignItems: 'center', color: '#9CA3AF' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                      </div>
                    ) : (
                      <span
                        style={{
                          padding: '6px 10px',
                          borderRadius: 999,
                          background: 'rgba(102, 126, 234, 0.14)',
                          color: '#4F46E5',
                          fontSize: 12,
                          fontWeight: 800,
                          letterSpacing: '0.01em',
                          flex: '0 0 auto',
                        }}
                      >
                        In Progress
                      </span>
                    )}
                  </div>

                  <div style={{ marginTop: 12 }}>
                    <div
                      style={{
                        width: '100%',
                        height: 14,
                        background: '#F1F5F9',
                        borderRadius: 999,
                        overflow: 'hidden',
                      }}
                      aria-label={`Topic progress: ${Math.round(topic.progress * 100)}%`}
                    >
                      <div
                        style={{
                          width: `${Math.max(0, Math.min(100, topic.progress * 100))}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, #6366F1 0%, #A855F7 100%)',
                          borderRadius: 999,
                          transition: 'width 0.35s ease',
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <style>{`
            .topic-row {
              transition: all 200ms ease;
            }

            .topic-row:hover {
              background: rgba(79, 70, 229, 0.06);
              box-shadow: 0 10px 24px rgba(15, 23, 42, 0.10);
              transform: translateY(-2px);
              border-color: #E0E7FF;
            }

            .topic-cta {
              transition: transform 200ms ease, color 200ms ease;
            }

            .topic-row:hover .topic-cta {
              color: #4F46E5;
              transform: translateX(4px);
            }
          `}</style>
          </div>
        )}

        {/* Achievements & Badges */}
        <div className="card">
          <h2>Achievements & Badges</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            You've earned {achievements.length} achievement{achievements.length !== 1 ? 's' : ''}!
          </p>

          {achievements.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', background: '#f9f9f9', borderRadius: '8px' }}>
              <div style={{ fontSize: '60px', marginBottom: '15px' }}>🎯</div>
              <p style={{ color: '#999' }}>Start learning to unlock achievements!</p>
            </div>
          ) : (
            Object.entries(achievementCategories).map(([category, categoryAchievements]) => (
              categoryAchievements.length > 0 && (
                <div key={category} style={{ marginBottom: '30px' }}>
                  <h3 style={{ fontSize: '18px', marginBottom: '15px', color: '#555' }}>{category}</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '15px' }}>
                    {categoryAchievements.map((achievement) => (
                      <div
                        key={achievement.rewardId}
                        style={{
                          padding: '20px',
                          background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)',
                          borderRadius: '8px',
                          textAlign: 'center',
                          border: '2px solid #e0e0e0',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                          transition: 'transform 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-4px)';
                          e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                        }}
                      >
                        <div style={{ fontSize: '50px', marginBottom: '10px' }}>{achievement.badge_icon || '🏆'}</div>
                        <div style={{ fontWeight: 'bold', fontSize: '15px', marginBottom: '5px' }}>{achievement.name}</div>
                        {achievement.description && (
                          <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>{achievement.description}</div>
                        )}
                        <div style={{ fontSize: '12px', color: '#3498db', fontWeight: 'bold' }}>+{achievement.points} pts</div>
                        <div style={{ fontSize: '11px', color: '#999', marginTop: '8px' }}>
                          {new Date(achievement.earned_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Progress;
