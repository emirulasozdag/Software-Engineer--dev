import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { adminService } from '@/services/api/admin.service';
import type { MaintenanceMode, SystemStats } from '@/types/admin.types';

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [maintenance, setMaintenance] = useState<MaintenanceMode | null>(null);
  const [maintenanceReason, setMaintenanceReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [s, m] = await Promise.all([adminService.getSystemStats(), adminService.getMaintenanceMode()]);
      setStats(s);
      setMaintenance(m);
      setMaintenanceReason(m.reason ?? '');
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? e?.message ?? 'Failed to load admin dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const setMaintenanceEnabled = async (enabled: boolean) => {
    setIsLoading(true);
    setError(null);
    try {
      const m = await adminService.setMaintenanceMode({ enabled, reason: enabled ? maintenanceReason : null });
      setMaintenance(m);
      await refresh();
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? e?.message ?? 'Failed to update maintenance mode');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 className="page-title">Admin Dashboard</h1>
        <button className="button button-secondary" onClick={logout}>Logout</button>
      </div>

      <div className="card">
        <h2>Welcome, {user?.name}!</h2>
        <p>Email: {user?.email}</p>
        <p>Role: {user?.role}</p>
      </div>

      {error && (
        <div className="card" style={{ borderLeft: '4px solid #e74c3c' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
        <Link to="/admin/users" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ cursor: 'pointer', transition: 'transform 0.2s' }}>
            <h3>User Management</h3>
            <p>Manage all user accounts</p>
          </div>
        </Link>

        <Link to="/admin/stats" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ cursor: 'pointer', transition: 'transform 0.2s' }}>
            <h3>System Statistics</h3>
            <p>View system performance metrics</p>
          </div>
        </Link>

        <Link to="/admin/feedback" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ cursor: 'pointer', transition: 'transform 0.2s' }}>
            <h3>Feedback Management</h3>
            <p>Review user feedback and bug reports</p>
          </div>
        </Link>
      </div>

      <div className="card">
        <h2>Quick Stats</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '20px' }}>
          <div style={{ padding: '15px', background: '#3498db', color: 'white', borderRadius: '4px' }}>
            <h3 style={{ color: 'white' }}>Total Users</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats?.totalUsers ?? (isLoading ? '...' : 0)}</p>
          </div>
          <div style={{ padding: '15px', background: '#2ecc71', color: 'white', borderRadius: '4px' }}>
            <h3 style={{ color: 'white' }}>Active Students</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats?.totalStudents ?? (isLoading ? '...' : 0)}</p>
          </div>
          <div style={{ padding: '15px', background: '#e74c3c', color: 'white', borderRadius: '4px' }}>
            <h3 style={{ color: 'white' }}>Teachers</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats?.totalTeachers ?? (isLoading ? '...' : 0)}</p>
          </div>
          <div style={{ padding: '15px', background: '#f39c12', color: 'white', borderRadius: '4px' }}>
            <h3 style={{ color: 'white' }}>Uptime</h3>
            <p style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
              {stats?.maintenanceEnabled ? 'Maintenance enabled' : 'Running'}
            </p>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Maintenance Mode</h2>
        <p>
          Current Status:{' '}
          <strong style={{ color: maintenance?.enabled ? '#e67e22' : '#2ecc71' }}>
            {maintenance?.enabled ? 'ENABLED' : 'DISABLED'}
          </strong>
        </p>
        <label className="form-label" style={{ marginTop: '10px' }}>Reason (optional)</label>
        <input
          className="input"
          value={maintenanceReason}
          onChange={(e) => setMaintenanceReason(e.target.value)}
          placeholder="e.g., Scheduled update at 21:00"
        />
        <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
          <button className="button button-primary" disabled={isLoading} onClick={() => setMaintenanceEnabled(true)}>
            Enable Maintenance
          </button>
          <button className="button button-secondary" disabled={isLoading} onClick={() => setMaintenanceEnabled(false)}>
            Disable Maintenance
          </button>
          <button className="button button-secondary" disabled={isLoading} onClick={refresh}>
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
