import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '@/services/api';
import { SystemFeedback } from '@/types/admin.types';

const FeedbackManagement: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'in-progress' | 'resolved'>('all');
  const [feedbacks, setFeedbacks] = useState<SystemFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getAllFeedback();
      setFeedbacks(Array.isArray(data) ? data : []);
    } catch (e: any) {
      const detail = e?.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Failed to load feedback.');
      setFeedbacks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredFeedback = useMemo(() => {
    if (filter === 'all') return feedbacks;
    return feedbacks.filter((f) => f.status === filter);
  }, [feedbacks, filter]);

  const onChangeStatus = async (feedbackId: string, status: SystemFeedback['status']) => {
    try {
      const updated = await adminService.updateFeedbackStatus(feedbackId, status);
      setFeedbacks((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
    } catch (e: any) {
      const detail = e?.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Failed to update status.');
    }
  };

  return (
    <div className="container">
      <Link to="/admin/dashboard" className="link" style={{ display: 'inline-block', marginBottom: 16 }}>
        ← Back to Dashboard
      </Link>

      <div className="card">
        <div className="toolbar">
          <div>
            <h1 className="page-title" style={{ marginBottom: 0 }}>Feedback Management</h1>
			<div className="subtitle">Review incoming student feedback</div>
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

        {error && <div className="alert alert-danger" style={{ marginBottom: 12 }}>{error}</div>}
		<div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
			<button className="button button-sm" type="button" onClick={load} disabled={loading}>
				{loading ? 'Loading…' : 'Refresh'}
			</button>
			<div style={{ color: '#666' }}>{loading ? 'Fetching feedback…' : `${feedbacks.length} total`}</div>
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
                <td>{feedback.userName}</td>
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
                <td>{new Date(feedback.createdAt).toLocaleDateString()}</td>
                <td>
                  <div className="actions">
                    <button
						className="button button-primary button-sm"
						type="button"
						onClick={() => window.alert(`${feedback.title}\n\n${feedback.description}`)}
					>
						View
					</button>
                    <select
						className="input input-sm"
						value={feedback.status}
						onChange={(e) => onChangeStatus(feedback.id, e.target.value as any)}
					>
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>
                </td>
              </tr>
            ))}
			{!loading && filteredFeedback.length === 0 && (
				<tr>
					<td colSpan={6} style={{ color: '#666' }}>No feedback found.</td>
				</tr>
			)}
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
