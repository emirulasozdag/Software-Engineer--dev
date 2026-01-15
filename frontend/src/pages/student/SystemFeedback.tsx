import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { systemFeedbackService } from '@/services/api/systemFeedback.service';
import { SystemFeedback } from '@/types/admin.types';

const StudentSystemFeedback: React.FC = () => {
  const [category, setCategory] = useState<SystemFeedback['category']>('other');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const canSubmit = useMemo(() => title.trim().length >= 3 && description.trim().length >= 3, [title, description]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);
    setSubmitting(true);
    try {
      await systemFeedbackService.submit({
        category,
        title: title.trim(),
        description: description.trim(),
      });
      setTitle('');
      setDescription('');
      setCategory('other');
      setSuccessMsg('Thanks! Your feedback has been sent to the admin team.');
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setErrorMsg(typeof detail === 'string' ? detail : 'Failed to submit feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container">
      <Link to="/student/dashboard" className="link" style={{ display: 'inline-block', marginBottom: 16 }}>
        ← Back to Dashboard
      </Link>

      <div className="card">
        <div className="toolbar">
          <div>
            <h1 className="page-title" style={{ marginBottom: 0 }}>Send Feedback</h1>
            <div className="subtitle">Report a bug, suggest a feature, or share improvements.</div>
          </div>
          <span className="pill">Student</span>
        </div>

        <div className="divider" />

        <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
          {successMsg && <div className="alert alert-success">{successMsg}</div>}
          {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

          <label>
            <div className="label">Category</div>
            <select className="input" value={category} onChange={(e) => setCategory(e.target.value as any)}>
              <option value="bug">Bug</option>
              <option value="feature">Feature</option>
              <option value="improvement">Improvement</option>
              <option value="other">Other</option>
            </select>
          </label>

          <label>
            <div className="label">Title</div>
            <input
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Short summary (e.g., Audio not playing)"
              maxLength={255}
            />
          </label>

          <label>
            <div className="label">Description</div>
            <textarea
              className="input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What happened? Steps to reproduce? Expected behavior?"
              rows={6}
            />
          </label>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button className="button button-primary" type="submit" disabled={!canSubmit || submitting}>
              {submitting ? 'Sending…' : 'Send Feedback'}
            </button>
            <div style={{ color: '#666' }}>{!canSubmit ? 'Title and description must be at least 3 characters.' : ' '}</div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentSystemFeedback;
