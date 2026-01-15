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
    <div className="ch-page">
      <main className="ch-main">
        <div className="ch-container">
          <div className="ch-top">
            <Link to="/student/learning-plan" className="ch-back">← Back to Learning Plan</Link>
          </div>

          <section className="ch-hero">
            <div>
              <h1>Content History</h1>
              <p>Review completed lessons and revisit feedback anytime.</p>
            </div>
            <div className="ch-hero-meta">
              <span className="ch-pill">Completed: {history.length}</span>
              <span className="ch-pill ch-pill-muted">Auto-saved</span>
            </div>
          </section>

          <div className="card ch-card">
            {isLoading && <p>Loading history...</p>}

            {!isLoading && error && (
              <div className="ch-error">
                <strong>Error:</strong> {error}
              </div>
            )}

            {!isLoading && !error && history.length === 0 && (
              <p className="ch-empty">No completed content yet. Start learning to build your history!</p>
            )}

            {!isLoading && !error && history.length > 0 && (
              <div className="ch-list">
                {history.map((item) => (
                  <div
                    key={item.contentId}
                    className="ch-item"
                    onClick={() => handleViewContent(item.contentId)}
                  >
                    <div className="ch-item-row">
                      <div className="ch-item-main">
                        <h3>{item.title}</h3>
                        <div className="ch-item-meta">
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
                      <div className="ch-item-actions">
                        {item.hasFeedback && (
                          <span className="ch-badge">Has Feedback</span>
                        )}
                        <button
                          className="button button-secondary ch-review"
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
      </main>
    </div>
  );
};

export default ContentHistory;
