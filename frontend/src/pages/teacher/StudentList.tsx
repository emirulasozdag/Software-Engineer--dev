import React from 'react';
import { Link } from 'react-router-dom';

const StudentList: React.FC = () => {
  const students = [
    { id: '1', name: 'John Doe', level: 'B1', completionRate: 75, lastActivity: '2025-12-27' },
    { id: '2', name: 'Sarah Smith', level: 'A2', completionRate: 60, lastActivity: '2025-12-26' },
    { id: '3', name: 'Mike Johnson', level: 'B2', completionRate: 85, lastActivity: '2025-12-28' },
  ];

  return (
    <div className="container">
      <Link to="/teacher/dashboard" style={{ marginBottom: '20px', display: 'inline-block' }}>
        ← Back to Dashboard
      </Link>
      
      <h1 className="page-title">My Students</h1>
      
      <div className="card">
        <h2>Student Overview</h2>
        <p style={{ marginBottom: '20px' }}>Total Students: {students.length}</p>
        
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ddd' }}>
              <th style={{ textAlign: 'left', padding: '10px' }}>Name</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Level</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Completion Rate</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Last Activity</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '10px' }}>{student.name}</td>
                <td style={{ padding: '10px' }}>{student.level}</td>
                <td style={{ padding: '10px' }}>{student.completionRate}%</td>
                <td style={{ padding: '10px' }}>{student.lastActivity}</td>
                <td style={{ padding: '10px' }}>
                  <Link to={`/teacher/students/${student.id}`}>
                    <button className="button button-primary" style={{ fontSize: '0.9rem', padding: '5px 10px' }}>
                      View Details
                    </button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentList;
