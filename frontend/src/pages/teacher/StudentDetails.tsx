import React from 'react';
import { useParams, Link } from 'react-router-dom';

const StudentDetails: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();

  return (
    <div className="container">
      <Link to="/teacher/students" style={{ marginBottom: '20px', display: 'inline-block' }}>
        ← Back to Student List
      </Link>
      
      <h1 className="page-title">Student Details</h1>
      
      <div className="card">
        <h2>John Doe</h2>
        <p>Student ID: {studentId}</p>
        <p>Email: john.doe@example.com</p>
        <p>Current Level: B1 (Intermediate)</p>
      </div>

      <div className="card">
        <h2>Test Results</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ddd' }}>
              <th style={{ textAlign: 'left', padding: '10px' }}>Module</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Level</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Score</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Date</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '10px' }}>Reading</td>
              <td style={{ padding: '10px' }}>B1</td>
              <td style={{ padding: '10px' }}>78%</td>
              <td style={{ padding: '10px' }}>2025-12-15</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '10px' }}>Writing</td>
              <td style={{ padding: '10px' }}>B1</td>
              <td style={{ padding: '10px' }}>72%</td>
              <td style={{ padding: '10px' }}>2025-12-15</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '10px' }}>Listening</td>
              <td style={{ padding: '10px' }}>B2</td>
              <td style={{ padding: '10px' }}>82%</td>
              <td style={{ padding: '10px' }}>2025-12-15</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '10px' }}>Speaking</td>
              <td style={{ padding: '10px' }}>A2</td>
              <td style={{ padding: '10px' }}>65%</td>
              <td style={{ padding: '10px' }}>2025-12-15</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="card">
        <h2>Strengths & Weaknesses</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '15px' }}>
          <div>
            <h3>Strengths</h3>
            <ul style={{ marginLeft: '20px' }}>
              <li>Reading comprehension</li>
              <li>Listening skills</li>
              <li>Basic grammar</li>
            </ul>
          </div>
          <div>
            <h3>Areas for Improvement</h3>
            <ul style={{ marginLeft: '20px' }}>
              <li>Speaking fluency</li>
              <li>Pronunciation</li>
              <li>Advanced vocabulary</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Progress Chart</h2>
        <div style={{ height: '200px', background: '#f9f9f9', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' }}>
          <p style={{ color: '#999' }}>[Student progress visualization will be displayed here]</p>
        </div>
      </div>

      <div className="card">
        <h2>AI Content Directive</h2>
        <p>Provide instructions to the AI engine for personalized content generation</p>
        <div className="form-group">
          <label className="form-label">Focus Areas</label>
          <input className="input" type="text" placeholder="e.g., Speaking practice, Advanced grammar" />
        </div>
        <div className="form-group">
          <label className="form-label">Special Instructions</label>
          <textarea
            className="input"
            rows={4}
            placeholder="Specific guidance for AI content generation..."
            style={{ resize: 'vertical' }}
          />
        </div>
        <button className="button button-primary">Send Directive to AI</button>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <button className="button button-primary">Export Progress (PDF)</button>
        <button className="button button-secondary">Export Progress (CSV)</button>
      </div>
    </div>
  );
};

export default StudentDetails;
