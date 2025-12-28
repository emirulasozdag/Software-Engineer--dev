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
      <Link to="/admin/dashboard" style={{ marginBottom: '20px', display: 'inline-block' }}>
        ← Back to Dashboard
      </Link>
      
      <h1 className="page-title">User Management</h1>
      
      <div className="card">
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
            {filteredUsers.map((user) => (
              <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
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
                  <span style={{ color: user.isActive ? '#2ecc71' : '#e74c3c' }}>
                    {user.isActive ? '● Active' : '● Inactive'}
                  </span>
                </td>
                <td style={{ padding: '10px' }}>{user.createdAt}</td>
                <td style={{ padding: '10px' }}>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button className="button button-primary" style={{ fontSize: '0.8rem', padding: '4px 8px' }}>
                      Edit
                    </button>
                    <button className="button button-danger" style={{ fontSize: '0.8rem', padding: '4px 8px' }}>
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
