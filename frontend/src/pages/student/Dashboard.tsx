import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const StudentDashboard: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 className="page-title">Student Dashboard</h1>
        <button className="button button-secondary" onClick={logout}>Logout</button>
      </div>

      <div className="card">
        <h2>Welcome, {user?.name}!</h2>
        <p>Email: {user?.email}</p>
        <p>Role: {user?.role}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
        <Link to="/student/placement-test" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ cursor: 'pointer', transition: 'transform 0.2s' }}>
            <h3>Placement Test</h3>
            <p>Take your English level assessment test</p>
          </div>
        </Link>

        <Link to="/student/learning-plan" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ cursor: 'pointer', transition: 'transform 0.2s' }}>
            <h3>Learning Plan</h3>
            <p>View your personalized learning path</p>
          </div>
        </Link>

        <Link to="/student/progress" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ cursor: 'pointer', transition: 'transform 0.2s' }}>
            <h3>My Progress</h3>
            <p>Track your learning progress</p>
          </div>
        </Link>

        <Link to="/student/assignments" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ cursor: 'pointer', transition: 'transform 0.2s' }}>
            <h3>Assignments</h3>
            <p>View and complete assignments</p>
          </div>
        </Link>

        <Link to="/student/chatbot" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ cursor: 'pointer', transition: 'transform 0.2s' }}>
            <h3>AI Chatbot</h3>
            <p>Get help from your AI tutor</p>
          </div>
        </Link>

        <Link to="/student/messages" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ cursor: 'pointer', transition: 'transform 0.2s' }}>
            <h3>Messages</h3>
            <p>Communicate with teachers</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default StudentDashboard;
