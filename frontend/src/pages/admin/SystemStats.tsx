import React from 'react';
import { Link } from 'react-router-dom';

const SystemStats: React.FC = () => {
  return (
    <div className="container">
      <Link to="/admin/dashboard" style={{ marginBottom: '20px', display: 'inline-block' }}>
        ← Back to Dashboard
      </Link>
      
      <h1 className="page-title">System Statistics</h1>
      
      <div className="card">
        <h2>System Health</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '20px' }}>
          <div style={{ padding: '15px', background: '#f9f9f9', borderRadius: '4px' }}>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>System Uptime</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2ecc71' }}>99.8%</p>
          </div>
          <div style={{ padding: '15px', background: '#f9f9f9', borderRadius: '4px' }}>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>Avg Response Time</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3498db' }}>125ms</p>
          </div>
          <div style={{ padding: '15px', background: '#f9f9f9', borderRadius: '4px' }}>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>Active Sessions</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#e74c3c' }}>342</p>
          </div>
          <div style={{ padding: '15px', background: '#f9f9f9', borderRadius: '4px' }}>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>API Calls (24h)</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f39c12' }}>15,847</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>User Statistics</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '20px' }}>
          <div style={{ padding: '15px', background: '#f9f9f9', borderRadius: '4px' }}>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>Total Users</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>1,247</p>
          </div>
          <div style={{ padding: '15px', background: '#f9f9f9', borderRadius: '4px' }}>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>Active Students</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>892</p>
          </div>
          <div style={{ padding: '15px', background: '#f9f9f9', borderRadius: '4px' }}>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>Active Teachers</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>45</p>
          </div>
          <div style={{ padding: '15px', background: '#f9f9f9', borderRadius: '4px' }}>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>New Users (7d)</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>28</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Learning Activity</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '20px' }}>
          <div style={{ padding: '15px', background: '#f9f9f9', borderRadius: '4px' }}>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>Tests Completed</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>3,421</p>
          </div>
          <div style={{ padding: '15px', background: '#f9f9f9', borderRadius: '4px' }}>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>Lessons Completed</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>12,589</p>
          </div>
          <div style={{ padding: '15px', background: '#f9f9f9', borderRadius: '4px' }}>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>Assignments Created</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>567</p>
          </div>
          <div style={{ padding: '15px', background: '#f9f9f9', borderRadius: '4px' }}>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>AI Content Generated</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>8,943</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Usage Over Time</h2>
        <div style={{ height: '300px', background: '#f9f9f9', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' }}>
          <p style={{ color: '#999' }}>[Usage chart visualization will be displayed here]</p>
        </div>
      </div>

      <div className="card">
        <h2>Database Statistics</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ddd' }}>
              <th style={{ textAlign: 'left', padding: '10px' }}>Metric</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '10px' }}>Database Size</td>
              <td style={{ padding: '10px' }}>2.4 GB</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '10px' }}>Last Backup</td>
              <td style={{ padding: '10px' }}>2025-12-27 23:00</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '10px' }}>Connection Pool</td>
              <td style={{ padding: '10px' }}>Active: 12 / Max: 100</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SystemStats;
