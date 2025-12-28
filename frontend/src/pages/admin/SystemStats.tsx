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
      <Link to="/admin/dashboard" style={{ marginBottom: '20px', display: 'inline-block' }}>
        ← Back to Dashboard
      </Link>
      
      <h1 className="page-title">System Statistics</h1>
      
      <div className="card">
        <h2>Overview</h2>
        {isLoading && <p>Loading...</p>}
        {!isLoading && error && (
          <div style={{ borderLeft: '4px solid #e74c3c', paddingLeft: '10px' }}>
            <strong>Error:</strong> {error}
          </div>
        )}
        {!isLoading && !error && stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '20px' }}>
            <div style={{ padding: '15px', background: '#f9f9f9', borderRadius: '4px' }}>
              <p style={{ color: '#666', fontSize: '0.9rem' }}>Total Users</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.totalUsers}</p>
            </div>
            <div style={{ padding: '15px', background: '#f9f9f9', borderRadius: '4px' }}>
              <p style={{ color: '#666', fontSize: '0.9rem' }}>Students</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.totalStudents}</p>
            </div>
            <div style={{ padding: '15px', background: '#f9f9f9', borderRadius: '4px' }}>
              <p style={{ color: '#666', fontSize: '0.9rem' }}>Teachers</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.totalTeachers}</p>
            </div>
            <div style={{ padding: '15px', background: '#f9f9f9', borderRadius: '4px' }}>
              <p style={{ color: '#666', fontSize: '0.9rem' }}>Admins</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.totalAdmins}</p>
            </div>
            <div style={{ padding: '15px', background: '#f9f9f9', borderRadius: '4px' }}>
              <p style={{ color: '#666', fontSize: '0.9rem' }}>Verified Users</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.verifiedUsers}</p>
            </div>
            <div style={{ padding: '15px', background: stats.maintenanceEnabled ? '#fff3cd' : '#d4edda', borderRadius: '4px' }}>
              <p style={{ color: '#666', fontSize: '0.9rem' }}>Maintenance</p>
              <p style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                {stats.maintenanceEnabled ? 'ENABLED' : 'DISABLED'}
              </p>
              {stats.maintenanceEnabled && stats.maintenanceReason && (
                <p style={{ marginTop: '6px', color: '#666' }}>{stats.maintenanceReason}</p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <h2>Last Performance Snapshot</h2>
        {!stats?.lastPerformance && <p style={{ color: '#666' }}>No data yet (table `system_performance` is empty).</p>}
        {stats?.lastPerformance && (
          <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
            <li>CPU usage: {stats.lastPerformance.cpuUsage}%</li>
            <li>Memory usage: {stats.lastPerformance.memoryUsage}%</li>
            <li>Active users: {stats.lastPerformance.activeUsers}</li>
            <li>Recorded at: {new Date(stats.lastPerformance.recordedAt).toLocaleString()}</li>
          </ul>
        )}
      </div>
    </div>
  );
};

export default SystemStats;
