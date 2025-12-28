import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const UserManagement: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'student' | 'teacher' | 'admin'>('all');

  const users = [
    { id: '1', name: 'John Doe', email: 'john@example.com', role: 'student', isActive: true, createdAt: '2024-01-15' },
    { id: '2', name: 'Sarah Smith', email: 'sarah@example.com', role: 'student', isActive: true, createdAt: '2024-02-20' },
    { id: '3', name: 'Mike Johnson', email: 'mike@example.com', role: 'teacher', isActive: true, createdAt: '2024-01-10' },
    { id: '4', name: 'Admin User', email: 'admin@example.com', role: 'admin', isActive: true, createdAt: '2023-12-01' },
  ];

  const filteredUsers = filter === 'all' ? users : users.filter(u => u.role === filter);

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
