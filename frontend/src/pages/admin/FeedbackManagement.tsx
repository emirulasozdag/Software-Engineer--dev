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
      <Link to="/admin/dashboard" className="link" style={{ display: 'inline-block', marginBottom: 16 }}>
        ← Back to Dashboard
      </Link>

      <div className="card">
        <div className="toolbar">
          <div>
            <h1 className="page-title" style={{ marginBottom: 0 }}>Feedback Management</h1>
            <div className="subtitle">Review incoming feedback (demo data)</div>
          </div>
          <span className="pill">Triage</span>
        </div>

        <div className="divider" />

        <div className="tabs" style={{ marginBottom: 10 }}>
          <button className={`tab ${filter === 'all' ? 'active' : ''}`} type="button" onClick={() => setFilter('all')}>
            All
          </button>
          <button className={`tab ${filter === 'pending' ? 'active' : ''}`} type="button" onClick={() => setFilter('pending')}>
            Pending
          </button>
          <button className={`tab ${filter === 'in-progress' ? 'active' : ''}`} type="button" onClick={() => setFilter('in-progress')}>
            In Progress
          </button>
          <button className={`tab ${filter === 'resolved' ? 'active' : ''}`} type="button" onClick={() => setFilter('resolved')}>
            Resolved
          </button>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>User</th>
              <th>Category</th>
              <th>Title</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredFeedback.map((feedback) => (
              <tr key={feedback.id}>
                <td>{feedback.user}</td>
                <td>
                  <span className={feedback.category === 'bug' ? 'badge-success' : feedback.category === 'feature' ? 'badge' : 'badge-muted'}>
                    {feedback.category}
                  </span>
                </td>
                <td>{feedback.title}</td>
                <td>
                  <span className={feedback.status === 'resolved' ? 'badge-success' : feedback.status === 'in-progress' ? 'badge' : 'badge-muted'}>
                    {feedback.status}
                  </span>
                </td>
                <td>{feedback.createdAt}</td>
                <td>
                  <div className="actions">
                    <button className="button button-primary button-sm" type="button">View</button>
                    <select className="input input-sm" defaultValue={feedback.status}>
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
        <div className="kpis" style={{ marginTop: 12 }}>
          <div className="kpi">
            <div className="label">Total</div>
            <div className="value">{feedbacks.length}</div>
          </div>
          <div className="kpi">
            <div className="label">Pending</div>
            <div className="value">{feedbacks.filter(f => f.status === 'pending').length}</div>
          </div>
          <div className="kpi">
            <div className="label">In Progress</div>
            <div className="value">{feedbacks.filter(f => f.status === 'in-progress').length}</div>
          </div>
          <div className="kpi">
            <div className="label">Resolved</div>
            <div className="value">{feedbacks.filter(f => f.status === 'resolved').length}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackManagement;
