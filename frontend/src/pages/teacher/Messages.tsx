import React from 'react';
import { Link } from 'react-router-dom';

const TeacherMessages: React.FC = () => {
  return (
    <div className="container">
      <Link to="/teacher/dashboard" style={{ marginBottom: '20px', display: 'inline-block' }}>← Back to Dashboard</Link>
      
      <h1 className="page-title">Messages</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
        <div className="card">
          <h2>Inbox</h2>
          <div style={{ marginTop: '20px' }}>
            {[
              { from: 'John Doe', subject: 'Question about assignment', unread: true },
              { from: 'Sarah Smith', subject: 'Request for feedback', unread: true },
              { from: 'System', subject: 'New student enrolled', unread: false },
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
          <label className="form-label">To (Student)</label>
          <select className="input">
            <option>Select a student...</option>
            <option>John Doe</option>
            <option>Sarah Smith</option>
            <option>Mike Johnson</option>
            <option>All Students</option>
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

      <div className="card">
        <h2>Create Announcement</h2>
        <div className="form-group">
          <label className="form-label">Title</label>
          <input className="input" type="text" placeholder="Announcement title" />
        </div>
        <div className="form-group">
          <label className="form-label">Content</label>
          <textarea
            className="input"
            rows={4}
            placeholder="Announcement content..."
            style={{ resize: 'vertical' }}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Target Audience</label>
          <select className="input">
            <option value="students">My Students</option>
            <option value="all">All Users</option>
          </select>
        </div>
        <button className="button button-primary">Post Announcement</button>
      </div>
    </div>
  );
};

export default TeacherMessages;
