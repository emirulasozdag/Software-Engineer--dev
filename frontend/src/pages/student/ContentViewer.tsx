import React, { useEffect, useState } from 'react';
import { useLocation, useParams, Link, useNavigate } from 'react-router-dom';
import { learningService, BackendContentOut } from '@/services/api/learning.service';
import { useAuth } from '@/contexts/AuthContext';

type ContentBlock =
  | { type: 'text'; id: string; text: string }
  | {
      type: 'matching';
      id: string;
      title?: string;
      prompt: string;
      left: Array<{ id: string; text: string }>;
      right: Array<{ id: string; text: string }>;
    }
  | {
      type: 'fill_blanks';
      id: string;
      title?: string;
      prompt: string;
      wordBank: string[];
      textWithBlanks: string; // uses {{b1}} placeholders
    };

type StructuredContentBody = {
  formatVersion: 1;
  title?: string;
  rationale?: string;
  blocks: ContentBlock[];
};

const tryParseStructuredBody = (raw: string): StructuredContentBody | null => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && parsed.formatVersion === 1 && Array.isArray(parsed.blocks)) {
      return parsed as StructuredContentBody;
    }
    return null;
  } catch {
    return null;
  }
};

const ContentViewer: React.FC = () => {
  const { contentId } = useParams<{ contentId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const rationaleFromNav = (location.state as any)?.rationale as string | undefined;

  const [content, setContent] = useState<BackendContentOut | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCompleting, setIsCompleting] = useState<boolean>(false);
  const [completeMsg, setCompleteMsg] = useState<string | null>(null);

  // answers payload keyed by blockId
  const [answers, setAnswers] = useState<Record<string, any>>({});

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

        // Reset answers for new content
        setAnswers({});
      } catch (e: any) {
        setError(e?.response?.data?.detail ?? e?.message ?? 'Failed to load content');
      } finally {
        setIsLoading(false);
      }
    };
    run();
  }, [contentId]);

  const structured = content ? tryParseStructuredBody(content.body) : null;

  const renderFillBlanks = (b: Extract<ContentBlock, { type: 'fill_blanks' }>) => {
    const current = (answers[b.id] as Record<string, string> | undefined) ?? {};
    const parts: Array<{ kind: 'text'; value: string } | { kind: 'blank'; id: string }> = [];

    const re = /\{\{([^}]+)\}\}/g;
    let lastIndex = 0;
    let m: RegExpExecArray | null = null;
    while ((m = re.exec(b.textWithBlanks)) !== null) {
      if (m.index > lastIndex) {
        parts.push({ kind: 'text', value: b.textWithBlanks.slice(lastIndex, m.index) });
      }
      parts.push({ kind: 'blank', id: m[1] });
      lastIndex = m.index + m[0].length;
    }
    if (lastIndex < b.textWithBlanks.length) {
      parts.push({ kind: 'text', value: b.textWithBlanks.slice(lastIndex) });
    }

    return (
      <div style={{ marginTop: '16px' }}>
        {b.title && <h4 style={{ marginBottom: '6px' }}>{b.title}</h4>}
        <p style={{ color: '#666', marginBottom: '8px' }}>{b.prompt}</p>
        {Array.isArray(b.wordBank) && b.wordBank.length > 0 && (
          <p style={{ color: '#666', marginBottom: '10px' }}>
            <strong>Word bank:</strong> {b.wordBank.join(', ')}
          </p>
        )}
        <div style={{ padding: '12px', background: '#f9f9f9', borderRadius: '4px' }}>
          <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
            {parts.map((p, idx) => {
              if (p.kind === 'text') return <span key={`${b.id}-t-${idx}`}>{p.value}</span>;
              return (
                <input
                  key={`${b.id}-b-${p.id}-${idx}`}
                  className="input"
                  style={{ display: 'inline-block', width: '160px', margin: '0 6px' }}
                  value={current[p.id] ?? ''}
                  onChange={(e) => {
                    const next = { ...current, [p.id]: e.target.value };
                    setAnswers((prev) => ({ ...prev, [b.id]: next }));
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);

  const renderMatching = (b: Extract<ContentBlock, { type: 'matching' }>) => {
    const current = (answers[b.id] as Record<string, string> | undefined) ?? {};
    
    // Helper to check if a right item is already matched
    const isMatched = (rightId: string) => Object.values(current).includes(rightId);
    
    const handleLeftClick = (leftId: string) => {
      if (current[leftId]) {
        // Unmatch
        const next = { ...current };
        delete next[leftId];
        setAnswers(prev => ({ ...prev, [b.id]: next }));
      } else {
        setSelectedLeft(leftId);
      }
    };

    const handleRightClick = (rightId: string) => {
      if (selectedLeft) {
        // Create match
        const next = { ...current, [selectedLeft]: rightId };
        setAnswers(prev => ({ ...prev, [b.id]: next }));
        setSelectedLeft(null);
      }
    };

    return (
      <div style={{ marginTop: '24px', padding: '20px', background: '#fff', borderRadius: '8px', border: '1px solid #eee' }}>
        {b.title && <h4 style={{ marginBottom: '12px' }}>{b.title}</h4>}
        <p style={{ color: '#666', marginBottom: '16px' }}>{b.prompt}</p>
        <p style={{ fontSize: '0.9em', color: '#888', marginBottom: '16px' }}>
          Click an item on the left, then click its match on the right. Click a matched item on the left to unmatch.
        </p>

        <div style={{ display: 'flex', gap: '40px' }}>
          {/* Left Column */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {b.left.map((l) => {
              const matchedRightId = current[l.id];
              const isSelected = selectedLeft === l.id;
              const isCompleted = !!matchedRightId;
              
              return (
                <div
                  key={l.id}
                  onClick={() => handleLeftClick(l.id)}
                  style={{
                    padding: '12px',
                    border: isSelected ? '2px solid #3498db' : isCompleted ? '2px solid #2ecc71' : '1px solid #ddd',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    background: isSelected ? '#eaf2f8' : isCompleted ? '#eafaf1' : '#fff',
                    transition: 'all 0.2s',
                    position: 'relative'
                  }}
                >
                  {l.text}
                  {isCompleted && <span style={{ position: 'absolute', right: 10, color: '#2ecc71' }}>✓</span>}
                </div>
              );
            })}
          </div>

          {/* Right Column */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {b.right.map((r) => {
              const isUsed = isMatched(r.id);
              // Find which left item matches this right item (for visual feedback)
              const matchingLeftId = Object.keys(current).find(key => current[key] === r.id);
              
              return (
                <div
                  key={r.id}
                  onClick={() => !isUsed && handleRightClick(r.id)}
                  style={{
                    padding: '12px',
                    border: isUsed ? '2px solid #2ecc71' : '1px solid #ddd',
                    borderRadius: '6px',
                    cursor: isUsed ? 'default' : 'pointer',
                    background: isUsed ? '#eafaf1' : '#fff',
                    opacity: isUsed ? 0.8 : 1,
                    transition: 'all 0.2s'
                  }}
                >
                  {r.text}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const handleComplete = async () => {
    if (!content || !contentId || !user) return;
    setIsCompleting(true);
    setCompleteMsg(null);
    try {
      // Calculate score (dummy logic for now)
      let score = 100;
      // In a real app, we would validate answers against the correct ones here
      // For now, we just assume completion is enough

      await learningService.completeContent(contentId, {
        answers,
        score,
      });

      setCompleteMsg('Completed! Loading next lesson...');

      // Seamless transition
      try {
        const next = await learningService.deliverNextContent({
          studentId: parseInt(user.id),
          contentType: 'LESSON',
        });
        navigate(`/student/content/${next.content.contentId}`);
      } catch (err) {
        // If no next content, go back to plan
        navigate('/student/learning-plan');
      }
      
    } catch (e: any) {
      setCompleteMsg(null);
      setError(e?.response?.data?.detail ?? e?.message ?? 'Failed to complete content');
    } finally {
      setIsCompleting(false);
    }
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

              {/* Structured rendering if body is JSON */}
              {structured ? (
                <>
                  {structured.rationale && !rationaleFromNav && (
                    <p style={{ marginTop: '0', color: '#666' }}>
                      <strong>Why this content:</strong> {structured.rationale}
                    </p>
                  )}

                  {structured.blocks.map((b) => {
                    if (b.type === 'text') {
                      return (
                        <div key={b.id} style={{ marginTop: '20px', marginBottom: '20px' }}>
                          <div style={{ 
                            whiteSpace: 'pre-wrap', 
                            margin: 0, 
                            fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                            fontSize: '1.1rem',
                            lineHeight: '1.6',
                            color: '#2c3e50'
                          }}>
                            {b.text}
                          </div>
                        </div>
                      );
                    }
                    if (b.type === 'matching') return <div key={b.id}>{renderMatching(b)}</div>;
                    if (b.type === 'fill_blanks') return <div key={b.id}>{renderFillBlanks(b)}</div>;
                    return null;
                  })}
                </>
              ) : (
                <div style={{ 
                  whiteSpace: 'pre-wrap', 
                  fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                  fontSize: '1.1rem',
                  lineHeight: '1.6',
                  color: '#2c3e50'
                }}>
                  {content.body}
                </div>
              )}
            </div>

            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
              <button
                className="button button-primary"
                disabled={isCompleting}
                onClick={handleComplete}
              >
                {isCompleting ? 'Submitting...' : 'Submit & Complete'}
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
