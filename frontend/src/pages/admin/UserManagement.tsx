import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '@/services/api/admin.service';
import type { UserAccount } from '@/types/admin.types';

const UserManagement: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'student' | 'teacher' | 'admin'>('all');
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const all = await adminService.getAllUsers();
      setUsers(all);
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? e?.message ?? 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users
      .filter((u) => (filter === 'all' ? true : u.role === filter))
      .filter((u) => (q ? u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) : true));
  }, [users, filter, search]);

  const handleRoleChange = async (userId: number, newRole: UserAccount['role']) => {
    try {
      const updated = await adminService.updateUserRole(userId, newRole);
      setUsers((prev) => prev.map((u) => (u.userId === userId ? updated : u)));
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? e?.message ?? 'Failed to update role');
    }
  };

  const handleVerifiedToggle = async (userId: number, isVerified: boolean) => {
    try {
      const updated = await adminService.setUserVerified(userId, isVerified);
      setUsers((prev) => prev.map((u) => (u.userId === userId ? updated : u)));
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? e?.message ?? 'Failed to update verification');
    }
  };

  return (
    <div className="container">
      <Link to="/admin/dashboard" className="link" style={{ display: 'inline-block', marginBottom: 16 }}>
        ← Back to Dashboard
      </Link>

      <div className="card">
        <div className="toolbar">
          <div>
            <h1 className="page-title" style={{ marginBottom: 0 }}>User Management</h1>
            <div className="subtitle">Manage user accounts (demo data)</div>
          </div>
          <input
            className="input input-sm"
            type="text"
            placeholder="Search users…"
            style={{ width: 320 }}
          />
        </div>

        <div className="divider" />

        <div className="tabs" style={{ marginBottom: 10 }}>
          <button className={`tab ${filter === 'all' ? 'active' : ''}`} type="button" onClick={() => setFilter('all')}>
            All
          </button>
          <button className={`tab ${filter === 'student' ? 'active' : ''}`} type="button" onClick={() => setFilter('student')}>
            Students
          </button>
          <button className={`tab ${filter === 'teacher' ? 'active' : ''}`} type="button" onClick={() => setFilter('teacher')}>
            Teachers
          </button>
          <button className={`tab ${filter === 'admin' ? 'active' : ''}`} type="button" onClick={() => setFilter('admin')}>
            Admins
          </button>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={6} style={{ padding: '10px' }}>
                  Loading...
                </td>
              </tr>
            )}
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <span className={user.role === 'student' ? 'badge-success' : user.role === 'teacher' ? 'badge' : 'badge-muted'}>
                    {user.role}
                  </span>
                </td>
                <td>
                  <span className={user.isActive ? 'badge-success' : 'badge-muted'}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>{user.createdAt}</td>
                <td>
                  <div className="actions">
                    <button className="button button-primary button-sm" type="button">Edit</button>
                    <button className="button button-danger button-sm" type="button">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
