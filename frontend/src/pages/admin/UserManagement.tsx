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
      <Link to="/admin/dashboard" style={{ marginBottom: '20px', display: 'inline-block' }}>
        ← Back to Dashboard
      </Link>
      
      <h1 className="page-title">User Management</h1>
      
      <div className="card">
        {error && (
          <div style={{ borderLeft: '4px solid #e74c3c', paddingLeft: '10px', marginBottom: '15px' }}>
            <strong>Error:</strong> {error}
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              className={`button ${filter === 'all' ? 'button-primary' : 'button-secondary'}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button 
              className={`button ${filter === 'student' ? 'button-primary' : 'button-secondary'}`}
              onClick={() => setFilter('student')}
            >
              Students
            </button>
            <button 
              className={`button ${filter === 'teacher' ? 'button-primary' : 'button-secondary'}`}
              onClick={() => setFilter('teacher')}
            >
              Teachers
            </button>
            <button 
              className={`button ${filter === 'admin' ? 'button-primary' : 'button-secondary'}`}
              onClick={() => setFilter('admin')}
            >
              Admins
            </button>
          </div>
          <input 
            className="input" 
            type="text" 
            placeholder="Search users..." 
            style={{ width: '300px', marginBottom: 0 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ddd' }}>
              <th style={{ textAlign: 'left', padding: '10px' }}>Name</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Email</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Role</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Status</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Created</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Actions</th>
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
              <tr key={user.userId} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '10px' }}>{user.name}</td>
                <td style={{ padding: '10px' }}>{user.email}</td>
                <td style={{ padding: '10px' }}>
                  <span style={{ 
                    padding: '4px 8px', 
                    borderRadius: '4px', 
                    background: user.role === 'admin' ? '#e74c3c' : user.role === 'teacher' ? '#3498db' : '#2ecc71',
                    color: 'white',
                    fontSize: '0.85rem'
                  }}>
                    {user.role}
                  </span>
                </td>
                <td style={{ padding: '10px' }}>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      checked={user.isVerified}
                      onChange={(e) => handleVerifiedToggle(user.userId, e.target.checked)}
                    />
                    <span style={{ color: user.isVerified ? '#2ecc71' : '#e74c3c' }}>
                      {user.isVerified ? '● Verified' : '● Unverified'}
                    </span>
                  </label>
                </td>
                <td style={{ padding: '10px' }}>{new Date(user.createdAt).toLocaleString()}</td>
                <td style={{ padding: '10px' }}>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <select
                      className="input"
                      style={{ fontSize: '0.8rem', padding: '4px 8px', marginBottom: 0 }}
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.userId, e.target.value as UserAccount['role'])}
                    >
                      <option value="student">student</option>
                      <option value="teacher">teacher</option>
                      <option value="admin">admin</option>
                    </select>
                    <button className="button button-secondary" onClick={refresh} style={{ fontSize: '0.8rem', padding: '4px 8px' }}>
                      Refresh
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
