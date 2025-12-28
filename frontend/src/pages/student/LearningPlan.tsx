import React from 'react';
import { Link } from 'react-router-dom';

const LearningPlan: React.FC = () => {
  return (
    <div className="container">
      <Link to="/student/dashboard" style={{ marginBottom: '20px', display: 'inline-block' }}>← Back to Dashboard</Link>
      
      <h1 className="page-title">My Learning Plan</h1>
      
      <div className="card">
        <h2>Current Level: B1 (Intermediate)</h2>
        <div style={{ marginTop: '20px' }}>
          <h3>Strengths</h3>
          <ul style={{ marginLeft: '20px' }}>
            <li>Reading comprehension</li>
            <li>Basic grammar structures</li>
          </ul>
          
          <h3 style={{ marginTop: '20px' }}>Areas for Improvement</h3>
          <ul style={{ marginLeft: '20px' }}>
            <li>Speaking fluency</li>
            <li>Advanced vocabulary</li>
            <li>Pronunciation</li>
          </ul>
        </div>
      </div>

      <div className="card">
        <h2>Recommended Content</h2>
        <p style={{ fontStyle: 'italic', color: '#666', marginBottom: '20px' }}>
          AI-generated content based on your level and learning goals
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {[1, 2, 3].map((item) => (
            <div key={item} className="card" style={{ background: '#f9f9f9' }}>
              <h3>Lesson {item}: [Content Title]</h3>
              <p>Level: B1 | Duration: 30 minutes | Type: Interactive Exercise</p>
              <p style={{ marginTop: '10px', color: '#666' }}>
                <strong>Why this content:</strong> Focuses on your weak areas while building on your strengths
              </p>
              <button className="button button-primary" style={{ marginTop: '10px' }}>
                Start Lesson
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LearningPlan;
