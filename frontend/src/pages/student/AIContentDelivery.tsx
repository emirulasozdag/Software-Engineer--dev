import { useMemo, useState, useEffect } from 'react';
import type { FC } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { learningService } from '@/services/api/learning.service';
import { useAuth } from '@/contexts/AuthContext';

const AIContentDelivery: FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const studentId = useMemo(() => {
    const n = Number(user?.id);
    return Number.isFinite(n) ? n : null;
  }, [user?.id]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      if (!studentId) return;
      setIsLoading(true);
      try {
        // Automatically fetch next content
        const res = await learningService.deliverNextContent({
          studentId,
          contentType: 'LESSON',
        });
        // Redirect to viewer
        navigate(`/student/content/${res.content.contentId}`, {
          state: { rationale: res.rationale }
        });
      } catch (e: any) {
        setError(e?.response?.data?.detail ?? e?.message ?? 'Failed to deliver content');
        setIsLoading(false);
      }
    };
    init();
  }, [studentId, navigate]);

  return (
    <div className="container">
      <Link to="/student/dashboard" style={{ marginBottom: '20px', display: 'inline-block' }}>
        ← Back to Dashboard
      </Link>

      <h1 className="page-title">AI Content Delivery</h1>
      
      {isLoading && <p>Loading your personalized content...</p>}

      {error && (
        <div className="card" style={{ borderLeft: '4px solid #e74c3c' }}>
          <strong>Error:</strong> {error}
          <div style={{ marginTop: 10 }}>
            <button className="button button-secondary" onClick={() => window.location.reload()}>Retry</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIContentDelivery;