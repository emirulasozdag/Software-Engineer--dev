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
      <div className="card dash-hero">
        <div className="hero-row">
          <div>
            <h1 className="hero-title">Admin Dashboard</h1>
            <div className="hero-sub">System overview, users, and feedback management.</div>
            <div className="action-meta" style={{ marginTop: 12 }}>
              <span className="pill">Name: {user?.name}</span>
              <span className="pill">Email: {user?.email}</span>
              <span className="pill">Role: {user?.role}</span>
            </div>
          </div>
          <div className="hero-actions">
            <button className="button button-primary" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="dash-grid">
        <Link to="/admin/users" style={{ textDecoration: 'none' }} className="col-4">
          <div className="card click-card action-card">
            <span className="action-icon">UM</span>
            <div>
              <h3 className="action-title">User Management</h3>
              <div className="action-desc">Manage user accounts and roles.</div>
              <div className="action-meta">
                <span className="pill">CRUD</span>
                <span className="pill">Roles</span>
              </div>
            </div>
          </div>
        </Link>

        <Link to="/admin/stats" style={{ textDecoration: 'none' }} className="col-4">
          <div className="card click-card action-card">
            <span className="action-icon green">SS</span>
            <div>
              <h3 className="action-title">System Statistics</h3>
              <div className="action-desc">View system-level metrics and status.</div>
              <div className="action-meta">
                <span className="pill">Metrics</span>
                <span className="pill">Health</span>
              </div>
            </div>
          </div>
        </Link>

        <Link to="/admin/feedback" style={{ textDecoration: 'none' }} className="col-4">
          <div className="card click-card action-card">
            <span className="action-icon amber">FB</span>
            <div>
              <h3 className="action-title">Feedback Management</h3>
              <div className="action-desc">Review user feedback and bug reports.</div>
              <div className="action-meta">
                <span className="pill">Triage</span>
                <span className="pill">Notes</span>
              </div>
            </div>
          </div>
        </Link>

        <div className="card col-8">
          <div className="toolbar">
            <div>
              <h2 style={{ marginBottom: 6 }}>Quick Stats</h2>
              <div className="text-muted">Demo numbers (replace with API later)</div>
            </div>
            <span className="pill">Overview</span>
          </div>
          <div className="divider" />
          <div className="kpis">
            <div className="kpi">
              <div className="label">Total Users</div>
              <div className="value">1,247</div>
            </div>
            <div className="kpi">
              <div className="label">Active Students</div>
              <div className="value">892</div>
            </div>
            <div className="kpi">
              <div className="label">Teachers</div>
              <div className="value">45</div>
            </div>
            <div className="kpi">
              <div className="label">Uptime</div>
              <div className="value">99.8%</div>
            </div>
          </div>
        </div>

        <div className="card col-4">
          <div className="toolbar">
            <div>
              <h2 style={{ marginBottom: 6 }}>Maintenance</h2>
              <div className="text-muted">Admin controls (demo)</div>
            </div>
            <span className="pill">Status: Active</span>
          </div>
          <div className="divider" />
          <div className="actions">
            <button className="button button-primary" type="button">
              Enable Maintenance
            </button>
            <button className="button button-secondary" type="button">
              Schedule Update
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
