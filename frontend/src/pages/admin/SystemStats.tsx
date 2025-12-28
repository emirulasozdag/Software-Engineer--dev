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
        <h2>System Health</h2>
        {error && (
          <div className="card" style={{ borderLeft: '4px solid #e74c3c', marginTop: 12 }}>
            <strong>Error:</strong> {error}
          </div>
        )}
        <div className="kpis" style={{ marginTop: 12 }}>
          <div className="kpi">
            <div className="label">Maintenance</div>
            <div className="value">{stats ? (stats.maintenanceEnabled ? 'Enabled' : 'Disabled') : '—'}</div>
          </div>
          <div className="kpi">
            <div className="label">Maintenance Reason</div>
            <div className="value">{stats ? (stats.maintenanceReason || '—') : '—'}</div>
          </div>
          <div className="kpi">
            <div className="label">CPU Usage</div>
            <div className="value">{stats?.lastPerformance ? String(stats.lastPerformance.cpuUsage) : '—'}</div>
          </div>
          <div className="kpi">
            <div className="label">Memory Usage</div>
            <div className="value">{stats?.lastPerformance ? String(stats.lastPerformance.memoryUsage) : '—'}</div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>User Statistics</h2>
        <div className="kpis" style={{ marginTop: 12 }}>
          <div className="kpi">
            <div className="label">Total Users</div>
            <div className="value">{stats ? stats.totalUsers : '—'}</div>
          </div>
          <div className="kpi">
            <div className="label">Active Students</div>
            <div className="value">{stats ? stats.totalStudents : '—'}</div>
          </div>
          <div className="kpi">
            <div className="label">Active Teachers</div>
            <div className="value">{stats ? stats.totalTeachers : '—'}</div>
          </div>
          <div className="kpi">
            <div className="label">Admins</div>
            <div className="value">{stats ? stats.totalAdmins : '—'}</div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Learning Activity</h2>
        <div className="kpis" style={{ marginTop: 12 }}>
          <div className="kpi">
            <div className="label">Verified Users</div>
            <div className="value">{stats ? stats.verifiedUsers : '—'}</div>
          </div>
          <div className="kpi">
            <div className="label">Active Users (last perf)</div>
            <div className="value">{stats?.lastPerformance ? String(stats.lastPerformance.activeUsers) : '—'}</div>
          </div>
          <div className="kpi">
            <div className="label">Recorded At</div>
            <div className="value">{stats?.lastPerformance ? new Date(stats.lastPerformance.recordedAt).toLocaleString() : '—'}</div>
          </div>
          <div className="kpi">
            <div className="label">Loading</div>
            <div className="value">{isLoading ? 'Yes' : 'No'}</div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Usage Over Time</h2>
        <div className="placeholder">[Usage chart visualization will be displayed here]</div>
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
