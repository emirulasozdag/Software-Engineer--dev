import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const FeedbackManagement: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'in-progress' | 'resolved'>('all');

  const feedbacks = [
    { id: '1', user: 'John Doe', category: 'bug', title: 'Audio not playing in listening test', status: 'pending', createdAt: '2025-12-25' },
    { id: '2', user: 'Sarah Smith', category: 'feature', title: 'Add dark mode option', status: 'in-progress', createdAt: '2025-12-24' },
    { id: '3', user: 'Mike Johnson', category: 'improvement', title: 'Improve mobile responsiveness', status: 'resolved', createdAt: '2025-12-20' },
    { id: '4', user: 'Emily Brown', category: 'bug', title: 'Progress chart not updating', status: 'pending', createdAt: '2025-12-26' },
  ];

  const filteredFeedback = filter === 'all' ? feedbacks : feedbacks.filter(f => f.status === filter);

  return (
    <div className="container">
      <Link to="/admin/dashboard" style={{ marginBottom: '20px', display: 'inline-block' }}>
        ← Back to Dashboard
      </Link>
      
      <h1 className="page-title">Feedback Management</h1>
      
      <div className="card">
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button 
            className={`button ${filter === 'all' ? 'button-primary' : 'button-secondary'}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={`button ${filter === 'pending' ? 'button-primary' : 'button-secondary'}`}
            onClick={() => setFilter('pending')}
          >
            Pending
          </button>
          <button 
            className={`button ${filter === 'in-progress' ? 'button-primary' : 'button-secondary'}`}
            onClick={() => setFilter('in-progress')}
          >
            In Progress
          </button>
          <button 
            className={`button ${filter === 'resolved' ? 'button-primary' : 'button-secondary'}`}
            onClick={() => setFilter('resolved')}
          >
            Resolved
          </button>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ddd' }}>
              <th style={{ textAlign: 'left', padding: '10px' }}>User</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Category</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Title</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Status</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Date</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredFeedback.map((feedback) => (
              <tr key={feedback.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '10px' }}>{feedback.user}</td>
                <td style={{ padding: '10px' }}>
                  <span style={{ 
                    padding: '4px 8px', 
                    borderRadius: '4px', 
                    background: feedback.category === 'bug' ? '#e74c3c' : feedback.category === 'feature' ? '#3498db' : '#f39c12',
                    color: 'white',
                    fontSize: '0.85rem'
                  }}>
                    {feedback.category}
                  </span>
                </td>
                <td style={{ padding: '10px' }}>{feedback.title}</td>
                <td style={{ padding: '10px' }}>
                  <span style={{ 
                    padding: '4px 8px', 
                    borderRadius: '4px', 
                    background: feedback.status === 'resolved' ? '#2ecc71' : feedback.status === 'in-progress' ? '#f39c12' : '#95a5a6',
                    color: 'white',
                    fontSize: '0.85rem'
                  }}>
                    {feedback.status}
                  </span>
                </td>
                <td style={{ padding: '10px' }}>{feedback.createdAt}</td>
                <td style={{ padding: '10px' }}>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button className="button button-primary" style={{ fontSize: '0.8rem', padding: '4px 8px' }}>
                      View
                    </button>
                    <select 
                      className="input" 
                      style={{ fontSize: '0.8rem', padding: '4px 8px', marginBottom: 0 }}
                      defaultValue={feedback.status}
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h2>Feedback Statistics</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginTop: '20px' }}>
          <div style={{ padding: '15px', background: '#f9f9f9', borderRadius: '4px', textAlign: 'center' }}>
            <p style={{ color: '#666' }}>Total</p>
            <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{feedbacks.length}</p>
          </div>
          <div style={{ padding: '15px', background: '#f9f9f9', borderRadius: '4px', textAlign: 'center' }}>
            <p style={{ color: '#666' }}>Pending</p>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#95a5a6' }}>
              {feedbacks.filter(f => f.status === 'pending').length}
            </p>
          </div>
          <div style={{ padding: '15px', background: '#f9f9f9', borderRadius: '4px', textAlign: 'center' }}>
            <p style={{ color: '#666' }}>In Progress</p>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f39c12' }}>
              {feedbacks.filter(f => f.status === 'in-progress').length}
            </p>
          </div>
          <div style={{ padding: '15px', background: '#f9f9f9', borderRadius: '4px', textAlign: 'center' }}>
            <p style={{ color: '#666' }}>Resolved</p>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2ecc71' }}>
              {feedbacks.filter(f => f.status === 'resolved').length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackManagement;
