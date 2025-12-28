import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const TeacherDashboard: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 className="page-title">Teacher Dashboard</h1>
        <button className="button button-secondary" onClick={logout}>Logout</button>
      </div>

      <div className="card">
        <h2>Welcome, {user?.name}!</h2>
        <p>Email: {user?.email}</p>
        <p>Role: {user?.role}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
        <Link to="/teacher/students" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ cursor: 'pointer', transition: 'transform 0.2s' }}>
            <h3>My Students</h3>
            <p>View and manage student progress</p>
          </div>
        </Link>

        <Link to="/teacher/assignments/create" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ cursor: 'pointer', transition: 'transform 0.2s' }}>
            <h3>Create Assignment</h3>
            <p>Assign homework and tasks to students</p>
          </div>
        </Link>

        <Link to="/teacher/ai-drafts" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ cursor: 'pointer', transition: 'transform 0.2s' }}>
            <h3>Teacher–AI Drafts</h3>
            <p>Generate draft lesson content with AI directives</p>
          </div>
        </Link>

        <Link to="/teacher/messages" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ cursor: 'pointer', transition: 'transform 0.2s' }}>
            <h3>Messages</h3>
            <p>Communicate with students</p>
          </div>
        </Link>
      </div>

      <div className="card">
        <h2>Recent Activity</h2>
        <ul style={{ marginLeft: '20px', marginTop: '15px' }}>
          <li>Student John completed "Grammar Exercise: Present Perfect"</li>
          <li>Student Sarah submitted "Essay: My Favorite Book"</li>
          <li>Student Mike started placement test</li>
        </ul>
      </div>
    </div>
  );
};

export default TeacherDashboard;
