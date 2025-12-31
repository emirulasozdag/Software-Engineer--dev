import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '@/services/api/admin.service';
import type { SystemStats } from '@/types/admin.types';

const SystemStats: React.FC = () => {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const s = await adminService.getSystemStats();
        setStats(s);
      } catch (e: any) {
        setError(e?.response?.data?.detail ?? e?.message ?? 'Failed to load system stats');
      } finally {
        setIsLoading(false);
      }
    };
    run();
  }, []);

  return (
    <div className="container">
      <Link to="/admin/dashboard" className="link" style={{ display: 'inline-block', marginBottom: 16 }}>
        ← Back to Dashboard
      </Link>

      <div className="card">
        <div className="toolbar">
          <div>
            <h1 className="page-title" style={{ marginBottom: 0 }}>System Statistics</h1>
            <div className="subtitle">High-level system metrics (demo data)</div>
          </div>
          <span className="pill">Admin</span>
        </div>
      </div>

      <div className="card">
        <h2>User Statistics</h2>
        <div className="kpis" style={{ marginTop: 12 }}>
          <div className="kpi">
            <div className="label">Total Users</div>
            <div className="value">{stats?.totalUsers ?? '-'}</div>
          </div>
          <div className="kpi">
            <div className="label">Active Students</div>
            <div className="value">{stats?.totalStudents ?? '-'}</div>
          </div>
          <div className="kpi">
            <div className="label">Active Teachers</div>
            <div className="value">{stats?.totalTeachers ?? '-'}</div>
          </div>
          <div className="kpi">
            <div className="label">New Users (7d)</div>
            <div className="value">{stats?.newUsers7d ?? '-'}</div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Learning Activity</h2>
        <div className="kpis" style={{ marginTop: 12 }}>
          <div className="kpi">
            <div className="label">Tests Completed</div>
            <div className="value">{stats?.learningActivity?.testsCompleted ?? '-'}</div>
          </div>
          <div className="kpi">
            <div className="label">Lessons Completed</div>
            <div className="value">{stats?.learningActivity?.lessonsCompleted ?? '-'}</div>
          </div>
          <div className="kpi">
            <div className="label">Assignments Created</div>
            <div className="value">{stats?.learningActivity?.assignmentsCreated ?? '-'}</div>
          </div>
          <div className="kpi">
            <div className="label">AI Content Generated</div>
            <div className="value">{stats?.learningActivity?.aiContentGenerated ?? '-'}</div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Usage Over Time</h2>
        <div style={{ display: 'flex', alignItems: 'flex-end', height: 200, gap: 12, paddingTop: 20, paddingBottom: 5 }}>
          {(stats?.usageHistory ?? []).map((day, i) => {
            const maxVal = Math.max(1, ...((stats?.usageHistory ?? []).map((d) => d.activity + d.users)));
            const total = day.activity + day.users;
            const height = Math.round((total / maxVal) * 100);
            return (
              <div key={day.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', width: '100%', justifyContent: 'center' }}>
                  <div
                    style={{
                      width: '60%',
                      height: `${height}%`,
                      backgroundColor: '#3b82f6',
                      borderRadius: '4px 4px 0 0',
                      minHeight: 4,
                      position: 'relative',
                      transition: 'height 0.3s ease',
                    }}
                    title={`Date: ${day.date}\nActivity: ${day.activity}\nNew Users: ${day.users}`}
                  />
                </div>
                <div style={{ marginTop: 8, fontSize: 12, color: '#64748b', fontWeight: 500 }}>{day.day}</div>
              </div>
            );
          })}
          {(!stats?.usageHistory || stats.usageHistory.length === 0) && (
            <div style={{ width: '100%', textAlign: 'center', color: '#94a3b8', alignSelf: 'center' }}>
              No activity data available for the last 7 days.
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <h2>Database Statistics</h2>
        <table className="table" style={{ marginTop: 12 }}>
          <thead>
            <tr>
              <th>Metric</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Database Size</td>
              <td>2.4 GB</td>
            </tr>
            <tr>
              <td>Last Backup</td>
              <td>2025-12-27 23:00</td>
            </tr>
            <tr>
              <td>Connection Pool</td>
              <td>Active: 12 / Max: 100</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SystemStats;
