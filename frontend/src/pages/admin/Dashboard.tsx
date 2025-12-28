import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();

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
            <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>1,247</p>
          </div>
          <div style={{ padding: '15px', background: '#2ecc71', color: 'white', borderRadius: '4px' }}>
            <h3 style={{ color: 'white' }}>Active Students</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>892</p>
          </div>
          <div style={{ padding: '15px', background: '#e74c3c', color: 'white', borderRadius: '4px' }}>
            <h3 style={{ color: 'white' }}>Teachers</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>45</p>
          </div>
          <div style={{ padding: '15px', background: '#f39c12', color: 'white', borderRadius: '4px' }}>
            <h3 style={{ color: 'white' }}>Uptime</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>99.8%</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Maintenance Mode</h2>
        <p>Current Status: <strong style={{ color: '#2ecc71' }}>Active</strong></p>
        <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
          <button className="button button-primary">Enable Maintenance</button>
          <button className="button button-secondary">Schedule Update</button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
