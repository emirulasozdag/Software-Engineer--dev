import React, { useEffect, useState } from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import { learningService, BackendContentOut } from '@/services/api/learning.service';

const ContentViewer: React.FC = () => {
  const { contentId } = useParams<{ contentId: string }>();
  const location = useLocation();
  const rationaleFromNav = (location.state as any)?.rationale as string | undefined;

  const [content, setContent] = useState<BackendContentOut | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCompleting, setIsCompleting] = useState<boolean>(false);
  const [completeMsg, setCompleteMsg] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!contentId) {
        setError('Missing contentId');
        setIsLoading(false);
        return;
      }
      setError(null);
      setIsLoading(true);
      try {
        const c = await learningService.getDeliveredContentById(contentId);
        setContent(c);
      } catch (e: any) {
        setError(e?.response?.data?.detail ?? e?.message ?? 'Failed to load content');
      } finally {
        setIsLoading(false);
      }
    };
    run();
  }, [contentId]);

  return (
    <div className="container">
      <Link to="/student/learning-plan" style={{ marginBottom: '20px', display: 'inline-block' }}>
        ← Back to Learning Plan
      </Link>
      
      <h1 className="page-title">Content Viewer</h1>
      
      <div className="card">
        {isLoading && <p>Loading...</p>}
        {!isLoading && error && (
          <div style={{ borderLeft: '4px solid #e74c3c', paddingLeft: '10px' }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {!isLoading && !error && content && (
          <>
            <h2>{content.title}</h2>
            <p>Content ID: {content.contentId}</p>
            <p style={{ color: '#666' }}>
              Level: <strong>{content.level}</strong> | Type: <strong>{content.contentType}</strong>
            </p>

            {rationaleFromNav && (
              <p style={{ marginTop: '10px', color: '#666' }}>
                <strong>Why this content:</strong> {rationaleFromNav}
              </p>
            )}

            {completeMsg && (
              <p style={{ marginTop: '10px', color: '#2ecc71' }}>
                <strong>{completeMsg}</strong>
              </p>
            )}
            
            <div style={{ marginTop: '20px', padding: '20px', background: '#f9f9f9', borderRadius: '4px' }}>
              <h3>Lesson Content</h3>
              <pre style={{ whiteSpace: 'pre-wrap' }}>{content.body}</pre>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
              <button
                className="button button-primary"
                disabled={isCompleting}
                onClick={async () => {
                  if (!contentId) return;
                  setIsCompleting(true);
                  setCompleteMsg(null);
                  try {
                    const res = await learningService.completeContent(contentId);
                    setCompleteMsg(res.message || 'Completed');
                  } catch (e: any) {
                    setCompleteMsg(null);
                    setError(e?.response?.data?.detail ?? e?.message ?? 'Failed to complete content');
                  } finally {
                    setIsCompleting(false);
                  }
                }}
              >
                {isCompleting ? 'Completing...' : 'Complete Lesson'}
              </button>
              <button className="button button-secondary" disabled title="Progress module will be implemented separately">
                Save Progress
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ContentViewer;
