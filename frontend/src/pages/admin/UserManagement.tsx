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

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100" style={{ padding: 20, marginBottom: 20 }}>
        <div className="toolbar">
          <div>
            <h1 className="page-title" style={{ marginBottom: 0 }}>User Management</h1>
            <div className="subtitle">Manage user accounts</div>
          </div>
          <input
            className="input input-sm"
            type="text"
            placeholder="Search users…"
            style={{ width: 320 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
          <thead className="bg-slate-50">
            <tr>
              <th className="text-slate-500 font-medium">Name</th>
              <th className="text-slate-500 font-medium">Email</th>
              <th className="text-slate-500 font-medium">Role</th>
              <th className="text-slate-500 font-medium">Status</th>
              <th className="text-slate-500 font-medium">Created</th>
              <th className="text-slate-500 font-medium">Actions</th>
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
              <tr key={user.userId} className="hover:bg-slate-50 transition-colors">
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <span
                    className={
                      user.role === 'student'
                        ? 'rounded-full bg-green-100 text-green-700 px-3 py-1 text-sm font-medium'
                        : user.role === 'teacher'
                          ? 'rounded-full bg-blue-100 text-blue-700 px-3 py-1 text-sm font-medium'
                          : 'rounded-full bg-slate-100 text-slate-700 px-3 py-1 text-sm font-medium'
                    }
                  >
                    {user.role}
                  </span>
                </td>
                <td>
                  <span
                    className={
                      user.isVerified
                        ? 'rounded-full bg-green-100 text-green-700 px-3 py-1 text-sm font-medium'
                        : 'rounded-full bg-yellow-100 text-yellow-700 px-3 py-1 text-sm font-medium'
                    }
                  >
                    {user.isVerified ? 'Verified' : 'Unverified'}
                  </span>
                </td>
                <td>{user.createdAt}</td>
                <td>
                  <div className="actions">
                    <button
                      className="px-3 py-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                      type="button"
                    >
                      Delete
                    </button>
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
