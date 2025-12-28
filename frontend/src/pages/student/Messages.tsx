import React from 'react';
import { Link } from 'react-router-dom';

const Messages: React.FC = () => {
  return (
    <div className="container">
      <Link to="/student/dashboard" style={{ marginBottom: '20px', display: 'inline-block' }}>← Back to Dashboard</Link>
      
      <h1 className="page-title">Messages</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
        <div className="card">
          <h2>Inbox</h2>
          <div style={{ marginTop: '20px' }}>
            {[
              { from: 'Teacher Johnson', subject: 'Great progress!', unread: true },
              { from: 'Teacher Smith', subject: 'Assignment feedback', unread: true },
              { from: 'System', subject: 'New badge earned', unread: false },
            ].map((msg, index) => (
              <div
                key={index}
                style={{
                  padding: '15px',
                  marginBottom: '10px',
                  background: msg.unread ? '#fff3cd' : '#f9f9f9',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  borderLeft: msg.unread ? '4px solid #ffc107' : '4px solid transparent'
                }}
              >
                <p style={{ fontWeight: 'bold' }}>{msg.from}</p>
                <p style={{ fontSize: '0.9rem', color: '#666' }}>{msg.subject}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2>Message Content</h2>
          <p style={{ color: '#999', textAlign: 'center', marginTop: '50px' }}>
            Select a message to view its content
          </p>
        </div>
      </div>

      <div className="card">
        <h2>Compose New Message</h2>
        <div className="form-group">
          <label className="form-label">To (Teacher)</label>
          <select className="input">
            <option>Select a teacher...</option>
            <option>Teacher Johnson</option>
            <option>Teacher Smith</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Subject</label>
          <input className="input" type="text" placeholder="Message subject" />
        </div>
        <div className="form-group">
          <label className="form-label">Message</label>
          <textarea
            className="input"
            rows={5}
            placeholder="Type your message here..."
            style={{ resize: 'vertical' }}
          />
        </div>
        <button className="button button-primary">Send Message</button>
      </div>
    </div>
  );
};

export default Messages;
