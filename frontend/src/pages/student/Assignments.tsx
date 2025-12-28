import React from 'react';
import { Link } from 'react-router-dom';

const Assignments: React.FC = () => {
  return (
    <div className="container">
      <Link to="/student/dashboard" style={{ marginBottom: '20px', display: 'inline-block' }}>← Back to Dashboard</Link>
      
      <h1 className="page-title">My Assignments</h1>
      
      <div className="card">
        <h2>Pending Assignments</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
          {[
            { title: 'Grammar Exercise: Present Perfect', due: '2025-01-05', status: 'pending' },
            { title: 'Essay: My Favorite Book', due: '2025-01-08', status: 'pending' },
            { title: 'Speaking Practice: Daily Routine', due: '2025-01-10', status: 'pending' },
          ].map((assignment, index) => (
            <div key={index} className="card" style={{ background: '#fff3cd', borderLeft: '4px solid #ffc107' }}>
              <h3>{assignment.title}</h3>
              <p>Due Date: {assignment.due}</p>
              <p>Status: <strong>{assignment.status.toUpperCase()}</strong></p>
              <button className="button button-primary" style={{ marginTop: '10px' }}>
                Start Assignment
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h2>Completed Assignments</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
          {[
            { title: 'Vocabulary Quiz: Unit 3', submitted: '2024-12-20', grade: 'A' },
            { title: 'Listening Exercise: News Report', submitted: '2024-12-18', grade: 'B+' },
          ].map((assignment, index) => (
            <div key={index} className="card" style={{ background: '#d4edda', borderLeft: '4px solid #28a745' }}>
              <h3>{assignment.title}</h3>
              <p>Submitted: {assignment.submitted}</p>
              <p>Grade: <strong>{assignment.grade}</strong></p>
              <button className="button button-secondary" style={{ marginTop: '10px' }}>
                View Feedback
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Assignments;
