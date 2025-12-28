import React from 'react';
import { Link } from 'react-router-dom';

const SystemStats: React.FC = () => {
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
        <div className="kpis" style={{ marginTop: 12 }}>
          <div className="kpi">
            <div className="label">System Uptime</div>
            <div className="value">99.8%</div>
          </div>
          <div className="kpi">
            <div className="label">Avg Response Time</div>
            <div className="value">125ms</div>
          </div>
          <div className="kpi">
            <div className="label">Active Sessions</div>
            <div className="value">342</div>
          </div>
          <div className="kpi">
            <div className="label">API Calls (24h)</div>
            <div className="value">15,847</div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>User Statistics</h2>
        <div className="kpis" style={{ marginTop: 12 }}>
          <div className="kpi">
            <div className="label">Total Users</div>
            <div className="value">1,247</div>
          </div>
          <div className="kpi">
            <div className="label">Active Students</div>
            <div className="value">892</div>
          </div>
          <div className="kpi">
            <div className="label">Active Teachers</div>
            <div className="value">45</div>
          </div>
          <div className="kpi">
            <div className="label">New Users (7d)</div>
            <div className="value">28</div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Learning Activity</h2>
        <div className="kpis" style={{ marginTop: 12 }}>
          <div className="kpi">
            <div className="label">Tests Completed</div>
            <div className="value">3,421</div>
          </div>
          <div className="kpi">
            <div className="label">Lessons Completed</div>
            <div className="value">12,589</div>
          </div>
          <div className="kpi">
            <div className="label">Assignments Created</div>
            <div className="value">567</div>
          </div>
          <div className="kpi">
            <div className="label">AI Content Generated</div>
            <div className="value">8,943</div>
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
