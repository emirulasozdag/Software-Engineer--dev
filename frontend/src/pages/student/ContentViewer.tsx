import React, { useEffect, useState } from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import { learningService, BackendContentOut, ContentAutoFeedbackOut } from '@/services/api/learning.service';

const ContentViewer: React.FC = () => {
  const { contentId } = useParams<{ contentId: string }>();
  const location = useLocation();
  const rationaleFromNav = (location.state as any)?.rationale as string | undefined;

  const [content, setContent] = useState<BackendContentOut | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCompleting, setIsCompleting] = useState<boolean>(false);
  const [completeMsg, setCompleteMsg] = useState<string | null>(null);
  const [autoFeedback, setAutoFeedback] = useState<ContentAutoFeedbackOut | null>(null);
  const [mistakesText, setMistakesText] = useState<string>('');
  const [correctAnswerRateText, setCorrectAnswerRateText] = useState<string>('');

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



        // Load existing UC12 auto-feedback for this content (if any)
        try {
          const fb = await learningService.getAutoFeedbackForContent(contentId, 1);
          setAutoFeedback(fb.items && fb.items.length > 0 ? fb.items[0] : null);
        } catch {
          setAutoFeedback(null);
        }
      } catch (e: any) {
        setError(e?.response?.data?.detail ?? e?.message ?? 'Failed to load content');
      } finally {
        setIsLoading(false);
      }
    };
    run();
  }, [contentId]);

  const parseMistakes = (raw: string): string[] => {
    const parts = raw
      .split(/\r?\n|,/g)
      .map((x) => x.trim())
      .filter(Boolean);
    // Keep it small to avoid spamming payloads
    return parts.slice(0, 20);
  };

  const parseCorrectAnswerRate = (raw: string): number | undefined => {
    const t = raw.trim();
    if (!t) return undefined;
    const n = Number(t);
    if (!Number.isFinite(n)) return undefined;
    if (n < 0 || n > 1) return undefined;
    return n;
  };

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
                    const mistakes = parseMistakes(mistakesText);
                    const correctAnswerRate = parseCorrectAnswerRate(correctAnswerRateText);
                    const res = await learningService.completeContent(contentId, {
                      mistakes: mistakes.length > 0 ? mistakes : undefined,
                      correctAnswerRate,
                    });

                    const extra =
                      typeof res.pointsAdded === 'number' || typeof res.dailyStreak === 'number'
                        ? ` (+${res.pointsAdded ?? 0} pts, streak ${res.dailyStreak ?? 0})`
                        : '';
                    setCompleteMsg((res.message || 'Completed') + extra);

                    // Fetch UC12 auto-feedback generated on completion
                    try {
                      const fb = await learningService.getAutoFeedbackForContent(contentId, 1);
                      setAutoFeedback(fb.items && fb.items.length > 0 ? fb.items[0] : null);
                    } catch {
                      // keep existing
                    }
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

            <div style={{ marginTop: '16px', display: 'grid', gap: '10px' }}>
              <div style={{ padding: '12px', background: '#f9f9f9', borderRadius: '4px' }}>
                <div style={{ fontWeight: 600, marginBottom: '6px' }}>Optional: mistakes (UC12)</div>
                <textarea
                  value={mistakesText}
                  onChange={(e) => setMistakesText(e.target.value)}
                  placeholder="Write mistakes (one per line or comma-separated)"
                  style={{ width: '100%', minHeight: '80px' }}
                />
                <div style={{ marginTop: '10px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <label style={{ color: '#666' }}>Correct answer rate (0..1):</label>
                  <input
                    value={correctAnswerRateText}
                    onChange={(e) => setCorrectAnswerRateText(e.target.value)}
                    placeholder="e.g. 0.8"
                    style={{ width: '120px' }}
                  />
                </div>
                <div style={{ marginTop: '6px', color: '#999', fontSize: '0.9rem' }}>
                  If you leave these empty, feedback will be generic.
                </div>
              </div>

              <div style={{ padding: '12px', background: '#f9f9f9', borderRadius: '4px' }}>
                <div style={{ fontWeight: 600, marginBottom: '6px' }}>Automatic Feedback (UC12)</div>
                {!autoFeedback ? (
                  <div style={{ color: '#999' }}>No automatic feedback yet. Complete the lesson to generate it.</div>
                ) : autoFeedback.feedbackList.length === 0 ? (
                  <div style={{ color: '#999' }}>No feedback items available.</div>
                ) : (
                  <ul style={{ margin: 0, paddingLeft: '18px' }}>
                    {autoFeedback.feedbackList.map((item, idx) => (
                      <li key={idx} style={{ marginBottom: '6px' }}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ContentViewer;
