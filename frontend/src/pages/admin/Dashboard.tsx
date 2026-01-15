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
  const [maintenanceAnnouncement, setMaintenanceAnnouncement] = useState('');
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
      setMaintenanceAnnouncement(m.announcement ?? '');
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
      const m = await adminService.setMaintenanceMode({ 
        enabled, 
        reason: enabled ? maintenanceReason : null,
        announcement: enabled ? maintenanceAnnouncement : null
      });
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
              <div className="text-muted">Real-time system data</div>
            </div>
            <span className="pill">Overview</span>
          </div>
          <div className="divider" />
          <div className="kpis">
            <div className="kpi">
              <div className="label">Total Users</div>
              <div className="value">{stats?.totalUsers ?? '-'}</div>
            </div>
            <div className="kpi">
              <div className="label">Active Students</div>
              <div className="value">{stats?.totalStudents ?? '-'}</div>
            </div>
            <div className="kpi">
              <div className="label">Teachers</div>
              <div className="value">{stats?.totalTeachers ?? '-'}</div>
            </div>
            <div className="kpi">
              <div className="label">Verified Users</div>
              <div className="value">{stats?.verifiedUsers ?? '-'}</div>
            </div>
          </div>
        </div>

        <div className="card col-4">
          <div className="toolbar">
            <div>
              <h2 style={{ marginBottom: 6 }}>Maintenance</h2>
              <div className="text-muted">
                {maintenance?.enabled ? 'Maintenance mode is currently enabled' : 'System is operational'}
              </div>
            </div>

            {/* Demo-style pill, but driven by real state */}
            <span className="pill sd-pill-row" style={{ display: 'inline-flex', gap: 8 }}>
              <span className="sd-pill sd-pill-cool">Current</span>
              <span className="sd-pill sd-pill-warm">{maintenance?.enabled ? 'Enabled' : 'Disabled'}</span>
            </span>
          </div>

          <div className="divider" />

          {error && (
            <div style={{ color: '#e74c3c', marginBottom: 12, fontSize: 14, fontWeight: 600 }}>
              {error}
            </div>
          )}

          {/* Demo-style short status line, but real data */}
          <div className="sd-card-desc" style={{ marginBottom: 12 }}>
            {maintenance?.enabled
              ? (maintenance?.reason ? `Enabled: ${maintenance.reason}` : 'Enabled')
              : 'Disabled'}
          </div>
            
          {maintenance?.enabled && maintenance.announcement && (
            <div style={{ marginBottom: 12, fontSize: 14, color: '#64748b' }}>
              <strong>Announcement:</strong> {maintenance.announcement}
            </div>
          )}

          {/* Keep teacheradmin inputs (real, not demo), shown only when disabled */}
          {!maintenance?.enabled && (
            <>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600 }}>
                  Reason (optional):
                </label>
                <input
                  type="text"
                  placeholder="e.g., Scheduled system update"
                  value={maintenanceReason}
                  onChange={(e) => setMaintenanceReason(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: 14,
                    border: '1px solid #cbd5e1',
                    borderRadius: 8,
                  }}
                />
              </div>
                
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600 }}>
                  User Announcement (optional):
                </label>
                <textarea
                  placeholder="e.g., We are performing scheduled maintenance. The system will be back online by 2:00 PM EST."
                  value={maintenanceAnnouncement}
                  onChange={(e) => setMaintenanceAnnouncement(e.target.value)}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: 14,
                    border: '1px solid #cbd5e1',
                    borderRadius: 8,
                    resize: 'vertical',
                    fontFamily: 'inherit',
                  }}
                />
              </div>
            </>
          )}

          {/* Demo-style action chips, but wired to real handlers */}
          <div className="sd-hero-actions" style={{ marginTop: 12 }}>
            <button
              type="button"
              className="sd-hero-chip sd-hero-chip-solid"
              onClick={() => setMaintenanceEnabled(true)}
              disabled={isLoading}
              style={{ cursor: isLoading ? 'not-allowed' : 'pointer' }}
            >
              {isLoading && !maintenance?.enabled ? 'Enabling…' : 'Enable'}
            </button>
        
            <button
              type="button"
              className="sd-hero-chip sd-hero-chip-outline"
              onClick={() => setMaintenanceEnabled(false)}
              disabled={isLoading}
              style={{ cursor: isLoading ? 'not-allowed' : 'pointer' }}
            >
              {isLoading && maintenance?.enabled ? 'Disabling…' : 'Disable'}
            </button>
          </div>
        </div>
      </div>
    </div >
  );
};

export default AdminDashboard;
