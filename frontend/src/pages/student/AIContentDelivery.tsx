import { useMemo, useState } from 'react';
import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { learningService } from '@/services/api/learning.service';
import { useAuth } from '@/contexts/AuthContext';
import type { BackendContentOut } from '@/services/api/learning.service';

const AIContentDelivery: FC = () => {
  const { user } = useAuth();
  const studentId = useMemo(() => {
    const n = Number(user?.id);
    return Number.isFinite(n) ? n : null;
  }, [user?.id]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [delivered, setDelivered] = useState<BackendContentOut | null>(null);
  const [deliverRationale, setDeliverRationale] = useState<string | null>(null);

  const [correctAnswerRate, setCorrectAnswerRate] = useState<number>(0.65);
  const [updated, setUpdated] = useState<boolean | null>(null);
  const [updatedContent, setUpdatedContent] = useState<BackendContentOut | null>(null);
  const [updateRationale, setUpdateRationale] = useState<string | null>(null);

  const planTopics = useMemo(
    () => ['Grammar: Present Simple', 'Vocabulary: Daily routines', 'Speaking: Basic introductions'],
    []
  );

  const runDeliver = async () => {
    if (!studentId) {
      setError('Student id not available. Please re-login.');
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      const res = await learningService.deliverNextContent({
        studentId,
        contentType: 'LESSON',
        planTopics,
      });
      setDelivered(res.content);
      setDeliverRationale(res.rationale);
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? e?.message ?? 'Failed to deliver content');
    } finally {
      setIsLoading(false);
    }
  };

  const runUpdate = async () => {
    if (!studentId) {
      setError('Student id not available. Please re-login.');
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      const res = await learningService.updateContentByProgress({
        studentId,
        correctAnswerRate,
        planTopics,
      });
      setUpdated(Boolean(res.updated));
      setUpdatedContent(res.content);
      setUpdateRationale(res.rationale);
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? e?.message ?? 'Failed to update content');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <Link to="/student/dashboard" style={{ marginBottom: '20px', display: 'inline-block' }}>
        ← Back to Dashboard
      </Link>

      <h1 className="page-title">AI Content Delivery</h1>
      <p style={{ color: '#666' }}>
        UC8 (Deliver) + UC9 (Update by progress) with FR17 rationale.
      </p>

      {error && (
        <div className="card" style={{ borderLeft: '4px solid #e74c3c' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="card">
        <h2>UC8 – Deliver next content</h2>
        <p style={{ color: '#666' }}>
          Calls <code>/api/content-delivery</code> and shows the returned content + why selected.
        </p>
        <button className="button button-primary" disabled={isLoading} onClick={runDeliver}>
          {isLoading ? 'Loading...' : 'Generate next content'}
        </button>

        {delivered && (
          <div style={{ marginTop: '15px', padding: '12px', background: '#f9f9f9', borderRadius: '4px' }}>
            <div>
              <strong>Content ID:</strong> {String(delivered.contentId)}
            </div>
            <div>
              <strong>Title:</strong> {String(delivered.title)}
            </div>
            <div style={{ marginTop: '10px' }}>
              <strong>Body:</strong>
            </div>
            <pre style={{ whiteSpace: 'pre-wrap', marginTop: '6px' }}>{String(delivered.body)}</pre>
            <div style={{ marginTop: '10px', color: '#666' }}>
              <strong>Why this content:</strong> {deliverRationale}
            </div>
            <div style={{ marginTop: '10px' }}>
              <Link to={`/student/content/${delivered.contentId}`} state={{ rationale: deliverRationale }}>
                <button className="button button-secondary">Open in Content Viewer</button>
              </Link>
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <h2>UC9 – Update based on progress</h2>
        <p style={{ color: '#666' }}>
          Calls <code>/api/content-update</code> using a progress signal (correctAnswerRate).
        </p>

        <label style={{ display: 'block', marginTop: '10px', marginBottom: '6px' }}>Correct answer rate (0..1)</label>
        <input
          className="input"
          type="number"
          min={0}
          max={1}
          step={0.01}
          value={correctAnswerRate}
          onChange={(e) => setCorrectAnswerRate(Number(e.target.value))}
        />

        <button className="button button-primary" disabled={isLoading} onClick={runUpdate} style={{ marginTop: '10px' }}>
          {isLoading ? 'Loading...' : 'Update content by progress'}
        </button>

        {updatedContent && (
          <div style={{ marginTop: '15px', padding: '12px', background: '#f9f9f9', borderRadius: '4px' }}>
            <div>
              <strong>Updated?:</strong> {String(updated)}
            </div>
            <div>
              <strong>Content ID:</strong> {String(updatedContent.contentId)}
            </div>
            <div>
              <strong>Title:</strong> {String(updatedContent.title)}
            </div>
            <div style={{ marginTop: '10px', color: '#666' }}>
              <strong>Why this update:</strong> {updateRationale}
            </div>
            <div style={{ marginTop: '10px' }}>
              <Link to={`/student/content/${updatedContent.contentId}`} state={{ rationale: updateRationale }}>
                <button className="button button-secondary">Open in Content Viewer</button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIContentDelivery;