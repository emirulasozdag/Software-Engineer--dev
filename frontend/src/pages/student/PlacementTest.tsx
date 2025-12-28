import React from 'react';
import { Link } from 'react-router-dom';

const PlacementTest: React.FC = () => {
  return (
    <div className="container">
      <Link to="/student/dashboard" style={{ marginBottom: '20px', display: 'inline-block' }}>← Back to Dashboard</Link>
      
      <h1 className="page-title">Placement Test</h1>
      
      <div className="card">
        <h2>English Level Assessment</h2>
        <p>This test will evaluate your English proficiency across four key areas:</p>
        <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
          <li>Reading Comprehension</li>
          <li>Writing Skills</li>
          <li>Listening Comprehension</li>
          <li>Speaking Ability</li>
        </ul>
        <p style={{ marginTop: '20px' }}>
          The test will take approximately 45-60 minutes to complete. 
          Based on your performance, you will be assigned a CEFR level (A1-C2).
        </p>
        
        <button className="button button-primary" style={{ marginTop: '20px' }}>
          Start Placement Test
        </button>
      </div>

      <div className="card">
        <h3>Test Instructions</h3>
        <ol style={{ marginLeft: '20px' }}>
          <li>Ensure you have a stable internet connection</li>
          <li>Find a quiet environment for the speaking test</li>
          <li>Allow microphone access when prompted</li>
          <li>Complete all four modules</li>
          <li>You can save progress and continue later</li>
        </ol>
      </div>
    </div>
  );
};

export default PlacementTest;
