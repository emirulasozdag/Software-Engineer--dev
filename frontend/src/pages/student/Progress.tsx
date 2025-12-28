import React from 'react';
import { Link } from 'react-router-dom';

import { progressService } from '@/services/api';
import { ProgressResponse } from '@/types/progress.types';

const Progress: React.FC = () => {

  const [liveProgress, setLiveProgress] = React.useState<ProgressResponse | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isDownloadingCsv, setIsDownloadingCsv] = React.useState(false);

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

  React.useEffect(() => {
    loadLiveProgress();
  }, [loadLiveProgress]);

  const downloadCsv = React.useCallback(async () => {
    setIsDownloadingCsv(true);
    setError(null);
    try {
      const blob = await progressService.exportMyProgressCsv();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'my-progress.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.message || 'Failed to export CSV');
    } finally {
      setIsDownloadingCsv(false);
    }
  }, []);

  return (
    <div className="container">
      <Link to="/student/dashboard" style={{ marginBottom: '20px', display: 'inline-block' }}>← Back to Dashboard</Link>
      
      <h1 className="page-title">My Progress</h1>

      <div className="card">
        <h2>Live Progress (Backend)</h2>
        <p style={{ marginTop: '8px', color: '#666' }}>
          View your latest learning metrics and progress timeline. You can also export your progress report as CSV.
        </p>

        <div style={{ display: 'flex', gap: '10px', marginTop: '12px', alignItems: 'center' }}>
          <button className="button button-secondary" onClick={loadLiveProgress} disabled={isLoading}>
            {isLoading ? 'Refreshing…' : 'Refresh'}
          </button>
          <button className="button button-primary" onClick={downloadCsv} disabled={isDownloadingCsv}>
            {isDownloadingCsv ? 'Preparing CSV…' : 'Download CSV'}
          </button>
          {error ? <span style={{ color: '#e74c3c' }}>{error}</span> : null}
        </div>

        {liveProgress ? (
          <div style={{ marginTop: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              <div style={{ padding: '12px', background: '#f9f9f9', borderRadius: '4px' }}>
                <div style={{ fontWeight: 600 }}>Correct Answer Rate</div>
                <div style={{ fontSize: '1.5rem' }}>{Math.round(liveProgress.correctAnswerRate * 100)}%</div>
              </div>
              <div style={{ padding: '12px', background: '#f9f9f9', borderRadius: '4px' }}>
                <div style={{ fontWeight: 600 }}>Completed Lessons</div>
                <div style={{ fontSize: '1.5rem' }}>{liveProgress.completedLessons.length}</div>
              </div>
              <div style={{ padding: '12px', background: '#f9f9f9', borderRadius: '4px' }}>
                <div style={{ fontWeight: 600 }}>Completion Rate (heuristic)</div>
                <div style={{ fontSize: '1.5rem' }}>{Math.round(liveProgress.completionRate * 100)}%</div>
              </div>
            </div>

            <div style={{ marginTop: '16px' }}>
              <h3 style={{ marginBottom: '10px' }}>Timeline (for charts)</h3>
              {liveProgress.timeline.length === 0 ? (
                <p style={{ color: '#999' }}>No timeline data available yet.</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #eee' }}>Date</th>
                        <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #eee' }}>Correct Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {liveProgress.timeline.map((p) => (
                        <tr key={p.date}>
                          <td style={{ padding: '8px', borderBottom: '1px solid #f3f3f3' }}>{p.date}</td>
                          <td style={{ padding: '8px', borderBottom: '1px solid #f3f3f3' }}>{Math.round(p.correctAnswerRate * 100)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : (
          <p style={{ marginTop: '12px', color: '#999' }}>
            {isLoading ? 'Loading progress…' : 'No data loaded yet.'}
          </p>
        )}
      </div>
      
      <div className="card">
        <h2>Learning Statistics</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '20px' }}>
          <div style={{ padding: '15px', background: '#3498db', color: 'white', borderRadius: '4px' }}>
            <h3 style={{ color: 'white' }}>Daily Streak</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>7 days</p>
          </div>
          <div style={{ padding: '15px', background: '#2ecc71', color: 'white', borderRadius: '4px' }}>
            <h3 style={{ color: 'white' }}>Lessons Completed</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>24</p>
          </div>
          <div style={{ padding: '15px', background: '#e74c3c', color: 'white', borderRadius: '4px' }}>
            <h3 style={{ color: 'white' }}>Total Study Time</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>12h</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Progress Chart</h2>
        <div style={{ height: '300px', background: '#f9f9f9', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' }}>
          <p style={{ color: '#999' }}>[Progress chart visualization will be displayed here]</p>
        </div>
      </div>

      <div className="card">
        <h2>Achievements & Badges</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '15px', marginTop: '20px' }}>
          {['First Lesson', 'Week Streak', 'Grammar Master', 'Speaking Pro'].map((badge) => (
            <div key={badge} style={{ padding: '15px', background: '#f9f9f9', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem' }}>🏆</div>
              <p style={{ fontWeight: 'bold' }}>{badge}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h2>Export Progress</h2>
        <p>Download your learning progress report</p>
        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
          <button
            className="button button-primary"
            disabled
            title="PDF export will be available in a future update."
            style={{ opacity: 0.7, cursor: 'not-allowed' }}
          >
            Export as PDF (Coming soon)
          </button>
          <button className="button button-secondary" onClick={downloadCsv} disabled={isDownloadingCsv}>
            {isDownloadingCsv ? 'Preparing CSV…' : 'Export as CSV'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Progress;
