import React from 'react';
import { Link } from 'react-router-dom';

const Progress: React.FC = () => {
  return (
    <div className="container">
      <Link to="/student/dashboard" style={{ marginBottom: '20px', display: 'inline-block' }}>← Back to Dashboard</Link>
      
      <h1 className="page-title">My Progress</h1>
      
      <div className="card">
        <h2>Learning Statistics</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '20px' }}>
          <div style={{ padding: '15px', background: '#3498db', color: 'white', borderRadius: '4px' }}>
            <h3 style={{ color: 'white' }}>Daily Streak</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>7 days</p>
          </div>
          <div style={{ padding: '15px', background: '#2ecc71', color: 'white', borderRadius: '4px' }}>
            <h3 style={{ color: 'white' }}>Lessons Completed</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>24</p>
          </div>
          <div style={{ padding: '15px', background: '#e74c3c', color: 'white', borderRadius: '4px' }}>
            <h3 style={{ color: 'white' }}>Total Study Time</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>12h</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Progress Chart</h2>
        <div style={{ height: '300px', background: '#f9f9f9', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' }}>
          <p style={{ color: '#999' }}>[Progress chart visualization will be displayed here]</p>
        </div>
      </div>

      <div className="card">
        <h2>Achievements & Badges</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '15px', marginTop: '20px' }}>
          {['First Lesson', 'Week Streak', 'Grammar Master', 'Speaking Pro'].map((badge) => (
            <div key={badge} style={{ padding: '15px', background: '#f9f9f9', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem' }}>🏆</div>
              <p style={{ fontWeight: 'bold' }}>{badge}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h2>Export Progress</h2>
        <p>Download your learning progress report</p>
        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
          <button className="button button-primary">Export as PDF</button>
          <button className="button button-secondary">Export as CSV</button>
        </div>
      </div>
    </div>
  );
};

export default Progress;
