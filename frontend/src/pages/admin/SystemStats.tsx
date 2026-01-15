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

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100" style={{ padding: 20, marginBottom: 20 }}>
        <div className="toolbar">
          <div>
            <h1 className="page-title" style={{ marginBottom: 0 }}>System Statistics</h1>
            <div className="subtitle">High-level system metrics (demo data)</div>
          </div>
          <span className="pill">Admin</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100" style={{ padding: 20, marginBottom: 20 }}>
        <h2>User Statistics</h2>
        <div className="kpis" style={{ marginTop: 12 }}>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="text-slate-500 font-medium">
              <span style={{ marginRight: 8, opacity: 0.75 }}>👥</span>
              Total Users
            </div>
            <div className="text-3xl font-bold text-violet-600" style={{ marginTop: 10 }}>
              {stats?.totalUsers ?? '-'}
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="text-slate-500 font-medium">
              <span style={{ marginRight: 8, opacity: 0.75 }}>🎓</span>
              Active Students
            </div>
            <div className="text-3xl font-bold text-violet-600" style={{ marginTop: 10 }}>
              {stats?.totalStudents ?? '-'}
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="text-slate-500 font-medium">
              <span style={{ marginRight: 8, opacity: 0.75 }}>🧑‍🏫</span>
              Active Teachers
            </div>
            <div className="text-3xl font-bold text-violet-600" style={{ marginTop: 10 }}>
              {stats?.totalTeachers ?? '-'}
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="text-slate-500 font-medium">
              <span style={{ marginRight: 8, opacity: 0.75 }}>✨</span>
              New Users (7d)
            </div>
            <div className="text-3xl font-bold text-violet-600" style={{ marginTop: 10 }}>
              {stats?.newUsers7d ?? '-'}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100" style={{ padding: 20, marginBottom: 20 }}>
        <h2>Learning Activity</h2>
        <div className="kpis" style={{ marginTop: 12 }}>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="text-slate-500 font-medium">
              <span style={{ marginRight: 8, opacity: 0.75 }}>🧪</span>
              Tests Completed
            </div>
            <div className="text-3xl font-bold text-violet-600" style={{ marginTop: 10 }}>
              {stats?.learningActivity?.testsCompleted ?? '-'}
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="text-slate-500 font-medium">
              <span style={{ marginRight: 8, opacity: 0.75 }}>✅</span>
              Lessons Completed
            </div>
            <div className="text-3xl font-bold text-violet-600" style={{ marginTop: 10 }}>
              {stats?.learningActivity?.lessonsCompleted ?? '-'}
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="text-slate-500 font-medium">
              <span style={{ marginRight: 8, opacity: 0.75 }}>📝</span>
              Assignments Created
            </div>
            <div className="text-3xl font-bold text-violet-600" style={{ marginTop: 10 }}>
              {stats?.learningActivity?.assignmentsCreated ?? '-'}
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="text-slate-500 font-medium">
              <span style={{ marginRight: 8, opacity: 0.75 }}>✦</span>
              AI Content Generated
            </div>
            <div className="text-3xl font-bold text-violet-600" style={{ marginTop: 10 }}>
              {stats?.learningActivity?.aiContentGenerated ?? '-'}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100" style={{ padding: 20, marginBottom: 20 }}>
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
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.38} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.06} />
                  </linearGradient>
                  <filter id="activityShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#8b5cf6" floodOpacity="0.18" />
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
                  tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                  padding={{ left: 8, right: 8 }}
                />

                <YAxis
                  dataKey="hours"
                  tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                  width={44}
                  label={{ value: 'Hours', angle: -90, position: 'insideLeft', fill: '#94A3B8', fontSize: 12 }}
                />

                <Tooltip
                  content={<ActivityTooltip />}
                  cursor={{ stroke: 'rgba(139, 92, 246, 0.18)', strokeWidth: 1 }}
                />

                <Area
                  type="monotone"
                  dataKey="hours"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  fill="url(#activityGradient)"
                  fillOpacity={1}
                  dot={false}
                  activeDot={{ r: 6, fill: '#ffffff', stroke: '#8b5cf6', strokeWidth: 3 }}
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

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100" style={{ padding: 20, marginBottom: 20 }}>
        <h2>Database Statistics</h2>
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
              <td>2.4 GB</td>
            </tr>
            <tr className="hover:bg-slate-50 transition-colors">
              <td>Last Backup</td>
              <td>2025-12-27 23:00</td>
            </tr>
            <tr className="hover:bg-slate-50 transition-colors">
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
