import React from 'react';
import { Link } from 'react-router-dom';

import { progressService, rewardsService } from '@/services/api';
import { ProgressResponse } from '@/types/progress.types';
import { Achievement } from '@/types/rewards.types';

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
          <div style={{ overflowX: 'auto', marginTop: '20px' }}>
            {/* Simple bar chart visualization */}
            <div style={{ minWidth: '600px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', height: '300px', gap: '8px', padding: '20px', background: '#f9f9f9', borderRadius: '8px' }}>
                {liveProgress.timeline.map((point, idx) => {
                  const maxContent = Math.max(...liveProgress.timeline.map(p => p.completedContentCount), 1);
                  const height = (point.completedContentCount / maxContent) * 100;

                  return (
                    <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div
                        style={{
                          width: '100%',
                          height: `${height}%`,
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          borderRadius: '4px 4px 0 0',
                          position: 'relative',
                          minHeight: '4px',
                          transition: 'all 0.3s ease',
                        }}
                        title={`${point.completedContentCount} content pieces\n${point.cefrLevel || 'No level'}`}
                      >
                        <div style={{
                          position: 'absolute',
                          top: '-25px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          whiteSpace: 'nowrap',
                        }}>
                          {point.completedContentCount}
                        </div>
                        {point.cefrLevel && (
                          <div style={{
                            position: 'absolute',
                            top: '-45px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            fontSize: '11px',
                            color: '#3498db',
                            fontWeight: 'bold',
                            whiteSpace: 'nowrap',
                          }}>
                            {point.cefrLevel}
                          </div>
                        )}
                      </div>
                      <div style={{ marginTop: '8px', fontSize: '11px', color: '#666', transform: 'rotate(-45deg)', whiteSpace: 'nowrap' }}>
                        {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: '20px', padding: '15px', background: '#f0f0f0', borderRadius: '8px' }}>
                <h4 style={{ marginTop: 0, marginBottom: '10px' }}>Legend</h4>
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '20px', height: '20px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '4px' }}></div>
                    <span style={{ fontSize: '14px' }}>Completed Content Count</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '14px', color: '#3498db', fontWeight: 'bold' }}>Level Tag:</span>
                    <span style={{ fontSize: '14px' }}>CEFR Level at that point</span>
                  </div>
                </div>
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
              <div key={topic.topicName} style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '15px' }}>{topic.topicName}</span>
                  <span style={{ color: '#666', fontSize: '14px' }}>
                    {topic.completedCount}/{topic.totalCount} ({Math.round(topic.progress * 100)}%)
                  </span>
                </div>
                <div style={{ width: '100%', height: '12px', background: '#e0e0e0', borderRadius: '6px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${topic.progress * 100}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                      transition: 'width 0.3s ease',
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
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
  );
};

export default Progress;
