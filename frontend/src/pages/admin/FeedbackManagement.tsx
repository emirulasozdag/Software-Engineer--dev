import React, { useEffect, useMemo, useState } from 'react';
import { adminService } from '@/services/api';
import { SystemFeedback } from '@/types/admin.types';

// Eğer SystemFeedback tipinde 'user' veya 'userName' karmaşası varsa diye
// API'den ne geliyorsa onu karşılaması için basit bir tip tanımı
type FeedbackItem = SystemFeedback & {
  user?: string;
  userName?: string;
};

const FeedbackManagement: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'in-progress' | 'resolved'>('all');
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // MANTIK (Upstream): Verileri API'den çekme fonksiyonu
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
      {/* Back Link kaldırıldı, Sidebar zaten var */}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100" style={{ padding: 20, marginBottom: 20 }}>
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

        {/* Refresh Butonu (Upstream'den gelen özellik) */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
          <button className="button button-sm" type="button" onClick={load} disabled={loading}>
            {loading ? 'Loading…' : 'Refresh'}
          </button>
          <div style={{ color: '#666' }}>{loading ? 'Fetching feedback…' : `${feedbacks.length} total`}</div>
        </div>

        <table className="table">
          {/* TASARIM (Stashed): Slate-50 arka planlı başlık */}
          <thead className="bg-slate-50">
            <tr>
              <th className="text-slate-500 font-medium">User</th>
              <th className="text-slate-500 font-medium">Category</th>
              <th className="text-slate-500 font-medium">Title</th>
              <th className="text-slate-500 font-medium">Status</th>
              <th className="text-slate-500 font-medium">Date</th>
              <th className="text-slate-500 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredFeedback.map((feedback) => (
              /* TASARIM (Stashed): Hover efekti */
              <tr key={feedback.id} className="hover:bg-slate-50 transition-colors">
                {/* Veri garantisi: userName veya user hangisi varsa */}
                <td>{feedback.userName || feedback.user}</td>
                <td>
                  <span
                    className={
                      feedback.category === 'bug'
                        ? 'rounded-full bg-rose-50 text-rose-600 px-3 py-1 text-sm font-medium'
                        : feedback.category === 'feature'
                          ? 'rounded-full bg-violet-50 text-violet-600 px-3 py-1 text-sm font-medium'
                          : 'rounded-full bg-slate-100 text-slate-700 px-3 py-1 text-sm font-medium'
                    }
                  >
                    {feedback.category}
                  </span>
                </td>
                <td>{feedback.title}</td>
                <td>
                  <span
                    className={
                      feedback.status === 'resolved'
                        ? 'rounded-full bg-green-100 text-green-700 px-3 py-1 text-sm font-medium'
                        : feedback.status === 'in-progress'
                          ? 'rounded-full bg-blue-100 text-blue-700 px-3 py-1 text-sm font-medium'
                          : 'rounded-full bg-yellow-100 text-yellow-700 px-3 py-1 text-sm font-medium'
                    }
                  >
                    {feedback.status}
                  </span>
                </td>
                <td>{new Date(feedback.createdAt).toLocaleDateString()}</td>
                <td>
                  <div className="actions">
                    {/* BİRLEŞTİRME: Upstream'in 'onClick' özelliği + Stashed'in 'Violet' tasarımı */}
                    <button
                      className="px-3 py-2 rounded-lg bg-violet-50 text-violet-600 hover:bg-violet-100 transition-colors font-medium text-sm"
                      type="button"
                      onClick={() => window.alert(`${feedback.title}\n\n${feedback.description}`)}
                    >
                      View
                    </button>

                    {/* Select Input */}
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
                <td colSpan={6} style={{ color: '#666', textAlign: 'center', padding: 20 }}>No feedback found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100" style={{ padding: 20, marginBottom: 20 }}>
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