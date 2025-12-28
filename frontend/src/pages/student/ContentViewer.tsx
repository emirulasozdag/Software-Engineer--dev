import React from 'react';
import { useParams, Link } from 'react-router-dom';

const ContentViewer: React.FC = () => {
  const { contentId } = useParams<{ contentId: string }>();

  return (
    <div className="container">
      <Link to="/student/learning-plan" style={{ marginBottom: '20px', display: 'inline-block' }}>
        ← Back to Learning Plan
      </Link>
      
      <h1 className="page-title">Content Viewer</h1>
      
      <div className="card">
        <h2>Lesson Title: [To be loaded]</h2>
        <p>Content ID: {contentId}</p>
        <p style={{ marginTop: '20px', color: '#666' }}>
          This component will display the actual lesson content, exercises, and interactive elements.
        </p>
        
        <div style={{ marginTop: '30px', padding: '20px', background: '#f9f9f9', borderRadius: '4px' }}>
          <h3>Lesson Content</h3>
          <p>[Interactive lesson content will be displayed here]</p>
          <p>[Exercises, questions, audio/video elements]</p>
        </div>

        <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
          <button className="button button-primary">Complete Lesson</button>
          <button className="button button-secondary">Save Progress</button>
        </div>
      </div>
    </div>
  );
};

export default ContentViewer;
