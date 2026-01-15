import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '@/services/api/admin.service';
import type { SystemStats } from '@/types/admin.types';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type ActivityTooltipProps = {
  active?: boolean;
  payload?: Array<{ value?: number; payload?: any }>;
  label?: string;
};

const ActivityTooltip: React.FC<ActivityTooltipProps> = ({ active, payload }) => {
  if (!active || !payload?.length) return null;

  const point = payload[0]?.payload as any;
  const hours = payload[0]?.value ?? point?.hours;
  const dateText = point?.date ? new Date(point.date).toLocaleDateString() : point?.day;

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
        minWidth: 140,
      }}
    >
      <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 6 }}>{dateText}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'baseline' }}>
        <div style={{ fontSize: 12, opacity: 0.85 }}>Hours</div>
        <div style={{ fontSize: 16, fontWeight: 800 }}>{Number(hours ?? 0).toLocaleString()}</div>
      </div>
    </div>
  );
};

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
            <div className="subtitle">High-level system metrics</div>
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
        {isLoading ? (
          <div style={{ width: '100%', textAlign: 'center', color: '#94a3b8', padding: '28px 0' }}>
            Loading activity…
          </div>
        ) : error ? (
          <div style={{ width: '100%', textAlign: 'center', color: '#e74c3c', padding: '28px 0', fontWeight: 600 }}>
            {error}
          </div>
        ) : (stats?.usageHistory?.length ?? 0) > 0 ? (
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={(stats?.usageHistory ?? []).map((d) => ({
                  ...d,
                  hours: d.activity,
                  label: d.day,
                }))}
                margin={{ top: 12, right: 18, bottom: 8, left: 6 }}
              >
                <defs>
                  <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#667EEA" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#667EEA" stopOpacity={0.06} />
                  </linearGradient>
                  <filter id="activityShadow" x="-20%" y="-20%" width="140%" height="140%">
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
                  dataKey="hours"
                  tick={{ fill: '#64748B', fontSize: 12, fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                  width={44}
                  label={{ value: 'Hours', angle: -90, position: 'insideLeft', fill: '#64748B', fontSize: 12 }}
                />

                <Tooltip
                  content={<ActivityTooltip />}
                  cursor={{ stroke: 'rgba(102, 126, 234, 0.18)', strokeWidth: 1 }}
                />

                <Area
                  type="monotone"
                  dataKey="hours"
                  stroke="#667EEA"
                  strokeWidth={3}
                  fill="url(#activityGradient)"
                  fillOpacity={1}
                  dot={false}
                  activeDot={{ r: 6, fill: '#ffffff', stroke: '#667EEA', strokeWidth: 3 }}
                  filter="url(#activityShadow)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div style={{ width: '100%', textAlign: 'center', color: '#94a3b8', padding: '28px 0' }}>
            No activity data available for the last 7 days.
          </div>
        )}
      </div>

      <div className="card">
        <h2>Database Statistics</h2>
        {stats?.databaseStats ? (
          <table className="table" style={{ marginTop: 12 }}>
            <thead className="bg-slate-50">
              <tr>
                <th className="text-slate-500 font-medium">Metric</th>
                <th className="text-slate-500 font-medium">Value</th>
              </tr>
            </thead>
                
            <tbody>
              <tr className="hover:bg-slate-50 transition-colors">
                <td>Database Size</td>
                <td>
                  {stats.databaseStats.sizeMB !== null && stats.databaseStats.sizeMB !== undefined
                    ? `${stats.databaseStats.sizeMB} MB`
                    : 'N/A'}
                </td>
              </tr>
                  
              <tr className="hover:bg-slate-50 transition-colors">
                <td>Total Records</td>
                <td>{stats.databaseStats.totalRecords.toLocaleString()}</td>
              </tr>
                  
              <tr className="hover:bg-slate-50 transition-colors">
                <td>Last Backup</td>
                <td>
                  {stats.databaseStats.lastBackup
                    ? new Date(stats.databaseStats.lastBackup).toLocaleString()
                    : 'No maintenance logs'}
                </td>
              </tr>
                  
              <tr className="hover:bg-slate-50 transition-colors">
                <td>Connection Pool</td>
                <td>
                  Active: {stats.databaseStats.connectionPool.active} / Max:{' '}
                  {stats.databaseStats.connectionPool.max}
                </td>
              </tr>
            </tbody>
          </table>
        ) : (
          <div style={{ width: '100%', textAlign: 'center', color: '#94a3b8', padding: '28px 0' }}>
            Database statistics not available
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemStats;
