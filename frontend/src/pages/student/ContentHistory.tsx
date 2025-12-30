import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { learningService, ContentHistoryItem } from '@/services/api/learning.service';

const ContentHistory: React.FC = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<ContentHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await learningService.getContentHistory();
        setHistory(result.history);
      } catch (e: any) {
        setError(e?.response?.data?.detail ?? e?.message ?? 'Failed to load history');
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handleViewContent = (contentId: number) => {
    navigate(`/student/content/${contentId}`);
  };

  return (
    <div className="container">
      <Link to="/student/learning-plan" style={{ marginBottom: '20px', display: 'inline-block' }}>
        ← Back to Learning Plan
      </Link>

      <h1 className="page-title">Content History</h1>

      <div className="card">
        {isLoading && <p>Loading history...</p>}

        {!isLoading && error && (
          <div style={{ borderLeft: '4px solid #e74c3c', paddingLeft: '10px' }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {!isLoading && !error && history.length === 0 && (
          <p style={{ color: '#666' }}>No completed content yet. Start learning to build your history!</p>
        )}

        {!isLoading && !error && history.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {history.map((item) => (
              <div
                key={item.contentId}
                style={{
                  padding: '20px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  background: '#fff',
                  cursor: 'pointer',
                  transition: 'box-shadow 0.2s',
                }}
                onClick={() => handleViewContent(item.contentId)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: 0, marginBottom: '8px' }}>{item.title}</h3>
                    <div style={{ display: 'flex', gap: '15px', fontSize: '0.9em', color: '#666' }}>
                      <span>
                        <strong>Type:</strong> {item.contentType}
                      </span>
                      {item.level && (
                        <span>
                          <strong>Level:</strong> {item.level}
                        </span>
                      )}
                      <span>
                        <strong>Completed:</strong>{' '}
                        {item.completedAt
                          ? new Date(item.completedAt).toLocaleDateString()
                          : 'Unknown'}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {item.hasFeedback && (
                      <span
                        style={{
                          padding: '4px 8px',
                          background: '#2ecc71',
                          color: 'white',
                          borderRadius: '4px',
                          fontSize: '0.85em',
                        }}
                      >
                        Has Feedback
                      </span>
                    )}
                    <button
                      className="button button-secondary"
                      style={{ padding: '6px 12px', fontSize: '0.9em' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewContent(item.contentId);
                      }}
                    >
                      Review →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentHistory;
