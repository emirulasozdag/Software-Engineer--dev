import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { adminService } from '@/services/api/admin.service';
import type { MaintenanceMode, SystemStats } from '@/types/admin.types';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
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

  const displayName = user?.name ?? 'Admin';
  const firstName = displayName.split(' ')[0] || displayName;
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

  const totalUsers = stats?.totalUsers;
  const totalStudents = stats?.totalStudents;
  const totalTeachers = stats?.totalTeachers;
  const verifiedUsers = stats?.verifiedUsers;

  return (
    <>
      <section className="sd-hero" aria-label="Welcome">
        <div className="sd-hero-inner">
          <div className="sd-hero-title">Welcome back, {firstName}</div>
          <div className="sd-hero-actions">
            <button type="button" className="sd-hero-chip sd-hero-chip-solid" onClick={refresh} disabled={isLoading}>
              {isLoading ? 'Loading…' : 'Refresh'}
            </button>
            <Link to="/admin/users" className="sd-hero-chip sd-hero-chip-outline">
              Manage Users
            </Link>
            <Link to="/admin/stats" className="sd-hero-chip sd-hero-chip-outline">
              View System Stats
            </Link>
          </div>
        </div>
      </section>

      <section className="sd-grid" aria-label="Dashboard Cards">
        {error && (
          <div className="sd-card sd-card-sm" role="alert">
            <div className="sd-card-head">
              <div className="sd-card-title">Error</div>
              <button
                type="button"
                className="sd-card-action"
                onClick={() => setError(null)}
                aria-label="Dismiss error"
                style={{ cursor: 'pointer' }}
              >
                ×
              </button>
            </div>
            <div className="sd-card-desc">{error}</div>
          </div>
        )}

        <div className="sd-row sd-row-3">
          <div className="sd-card sd-card-sm">
            <div className="sd-card-head">
              <div className="sd-card-title">Total Users</div>
              <Link to="/admin/users" className="sd-card-action" aria-label="Open user management">👤</Link>
            </div>
            <div className="sd-metric">{isLoading ? '…' : (totalUsers ?? '—')}</div>
            <div className="sd-card-desc">All accounts</div>
            <div className="sd-pill-row">
              <span className="sd-pill sd-pill-cool">Users</span>
              <span className="sd-pill sd-pill-warm">Roles</span>
            </div>
          </div>

          <div className="sd-card sd-card-sm">
            <div className="sd-card-head">
              <div className="sd-card-title">Active Students</div>
              <Link to="/admin/stats" className="sd-card-action" aria-label="Open system statistics">📈</Link>
            </div>
            <div className="sd-metric">{isLoading ? '…' : (totalStudents ?? '—')}</div>
            <div className="sd-card-desc">Students in the system</div>
            <div className="sd-pill-row">
              <span className="sd-pill sd-pill-cool">Metrics</span>
              <span className="sd-pill sd-pill-warm">Live</span>
            </div>
          </div>

          <div className="sd-card sd-card-sm">
            <div className="sd-card-head">
              <div className="sd-card-title">Teachers</div>
              <Link to="/admin/stats" className="sd-card-action" aria-label="Open system stats">🧑‍🏫</Link>
            </div>
            <div className="sd-metric">{isLoading ? '…' : (totalTeachers ?? '—')}</div>
            <div className="sd-card-desc">Educators onboarded</div>
            <div className="sd-pill-row">
              <span className="sd-pill sd-pill-cool">Staff</span>
              <span className="sd-pill sd-pill-warm">Access</span>
            </div>
          </div>

          <div className="sd-card sd-card-sm">
            <div className="sd-card-head">
              <div className="sd-card-title">Maintenance</div>
              <button
                type="button"
                className="sd-card-action"
                onClick={() => setMaintenanceEnabled(!(maintenance?.enabled ?? false))}
                disabled={isLoading}
                aria-label="Toggle maintenance"
                style={{ cursor: isLoading ? 'not-allowed' : 'pointer' }}
              >
                {maintenance?.enabled ? '⏻' : '⭘'}
              </button>
            </div>
            <div className="sd-card-desc">
              Status: {isLoading ? '…' : (maintenance?.enabled ? 'Enabled' : 'Disabled')}
            </div>
            <div className="sd-pill-row">
              <span className="sd-pill sd-pill-cool">Controls</span>
              <span className="sd-pill sd-pill-warm">Demo</span>
            </div>
          </div>
        </div>

        <div className="sd-row sd-row-2">
          <div className="sd-card sd-card-lg">
            <div className="sd-card-head">
              <div className="sd-card-title">Quick Stats</div>
              <Link to="/admin/stats" className="sd-card-action" aria-label="Open stats">📊</Link>
            </div>
            <div className="sd-list">
              <div className="sd-list-item">
                <div className="sd-list-title">Total users</div>
                <div className="sd-list-sub">{isLoading ? '…' : (totalUsers ?? '—')}</div>
              </div>
              <div className="sd-list-item">
                <div className="sd-list-title">Active students</div>
                <div className="sd-list-sub">{isLoading ? '…' : (totalStudents ?? '—')}</div>
              </div>
              <div className="sd-list-item">
                <div className="sd-list-title">Teachers</div>
                <div className="sd-list-sub">{isLoading ? '…' : (totalTeachers ?? '—')}</div>
              </div>
              <div className="sd-list-item">
                <div className="sd-list-title">Verified users</div>
                <div className="sd-list-sub">{isLoading ? '…' : (verifiedUsers ?? '—')}</div>
              </div>
            </div>
          </div>

          <div className="sd-card sd-card-lg">
            <div className="sd-card-head">
              <div className="sd-card-title">Maintenance Mode</div>
              <button
                type="button"
                className="sd-card-action"
                onClick={() => setMaintenanceEnabled(!(maintenance?.enabled ?? false))}
                disabled={isLoading}
                aria-label="Toggle maintenance mode"
                style={{ cursor: isLoading ? 'not-allowed' : 'pointer' }}
              >
                {maintenance?.enabled ? '⏻' : '⭘'}
              </button>
            </div>

            <div className="sd-card-desc">
              {maintenance?.enabled
                ? (maintenance?.reason ? `Enabled: ${maintenance.reason}` : 'Enabled')
                : 'Disabled'}
            </div>

            <div className="sd-hero-actions" style={{ marginTop: 12 }}>
              <button
                type="button"
                className="sd-hero-chip sd-hero-chip-solid"
                onClick={() => setMaintenanceEnabled(true)}
                disabled={isLoading}
                style={{ cursor: isLoading ? 'not-allowed' : 'pointer' }}
              >
                Enable
              </button>
              <button
                type="button"
                className="sd-hero-chip sd-hero-chip-outline"
                onClick={() => setMaintenanceEnabled(false)}
                disabled={isLoading}
                style={{ cursor: isLoading ? 'not-allowed' : 'pointer' }}
              >
                Disable
              </button>
            </div>

            <div className="sd-pill-row" style={{ marginTop: 12 }}>
              <span className="sd-pill sd-pill-cool">Current</span>
              <span className="sd-pill sd-pill-warm">{maintenance?.enabled ? 'Enabled' : 'Disabled'}</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default AdminDashboard;
