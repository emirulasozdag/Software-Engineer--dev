import React, { useEffect, useState } from 'react';
import { useLocation, useParams, Link, useNavigate } from 'react-router-dom';
import { learningService, BackendContentOut } from '@/services/api/learning.service';
import { useAuth } from '@/contexts/AuthContext';
import AILoading from '@/components/AILoading';
import AudioRecorder from '@/components/AudioRecorder';
import { AchievementNotificationContainer } from '@/components/AchievementNotification';
import { useAchievementNotifications } from '@/hooks/useAchievementNotifications';

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
  }
  | {
    type: 'audio';
    id: string;
    audioUrl: string;
    transcript?: string;
  }
  | {
    type: 'multiple_choice';
    id: string;
    question: string;
    options: string[];
    correctAnswer: string;
  }
  | {
    type: 'speaking';
    id: string;
    prompt: string;
    title?: string;
    maxDuration?: number;
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
  const { newAchievements, clearAchievements, checkForNewAchievements } = useAchievementNotifications();

  const [content, setContent] = useState<BackendContentOut | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCompleting, setIsCompleting] = useState<boolean>(false);
  const [isLoadingNext, setIsLoadingNext] = useState<boolean>(false);
  const [completeMsg, setCompleteMsg] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [feedbackData, setFeedbackData] = useState<any>(null);

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
      setShowFeedback(false);
      setFeedbackData(null);
      try {
        const c = await learningService.getDeliveredContentById(contentId);
        setContent(c);

        // If completed, load saved answers
        if (c.isCompleted && c.userAnswers) {
          try {
            const savedAnswers = JSON.parse(c.userAnswers);
            setAnswers(savedAnswers);
          } catch {
            setAnswers({});
          }
        } else {
          setAnswers({});
        }

        // If completed, load speaking feedback from saved feedback
        if (c.isCompleted && c.feedback) {
          try {
            const savedFeedback = JSON.parse(c.feedback);
            if (savedFeedback.speakingFeedback) {
              setSpeakingFeedback(savedFeedback.speakingFeedback);
            }
          } catch {
            // Ignore parsing errors
          }
        }
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

    const isCompleted = content?.isCompleted || false;

    return (
      <div className="cv-ex">
        {b.title && <h4 className="cv-ex-title">{b.title}</h4>}
        <p className="cv-ex-prompt">{b.prompt}</p>
        {Array.isArray(b.wordBank) && b.wordBank.length > 0 && (
          <p className="cv-ex-hint">
            <strong>Word bank:</strong> {b.wordBank.join(', ')}
          </p>
        )}
        <div className="cv-ex-box">
          <div className="cv-prose cv-prose-block" style={{ lineHeight: 1.8 }}>
            {parts.map((p, idx) => {
              if (p.kind === 'text') return <span key={`${b.id}-t-${idx}`}>{p.value}</span>;
              return (
                <input
                  key={`${b.id}-b-${p.id}-${idx}`}
                  className="input"
                  style={{ display: 'inline-block', width: '160px', margin: '0 6px' }}
                  value={current[p.id] ?? ''}
                  onChange={(e) => {
                    if (!isCompleted) {
                      const next = { ...current, [p.id]: e.target.value };
                      setAnswers((prev) => ({ ...prev, [b.id]: next }));
                    }
                  }}
                  disabled={isCompleted}
                />
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [speakingFeedback, setSpeakingFeedback] = useState<Record<string, any>>({});
  const [speakingLoading, setSpeakingLoading] = useState<Record<string, boolean>>({});
  const [speakingAudio, setSpeakingAudio] = useState<Record<string, Blob>>({});

  const renderSpeaking = (b: Extract<ContentBlock, { type: 'speaking' }>) => {
    const isCompleted = content?.isCompleted || false;
    const hasFeedback = speakingFeedback[b.id];
    const isAnalyzing = speakingLoading[b.id];
    const hasRecording = speakingAudio[b.id];

    const handleRecordingComplete = (audioBlob: Blob) => {
      // Just store the audio, don't submit yet
      setSpeakingAudio(prev => ({ ...prev, [b.id]: audioBlob }));
      setAnswers(prev => ({ ...prev, [b.id]: { audioRecorded: true } }));
    };

    return (
      <div style={{ marginTop: '20px', padding: '20px', background: '#fff', borderRadius: '8px', border: '1px solid #eee' }}>
        <h4 style={{ marginBottom: '12px' }}>🎤 Speaking Exercise</h4>
        {b.title && <div style={{ fontWeight: 600, marginBottom: 8 }}>{b.title}</div>}
        <p style={{ color: '#666', marginBottom: '16px' }}>{b.prompt}</p>

        {!isCompleted && !hasFeedback && !isAnalyzing && (
          <AudioRecorder
            onRecordingComplete={handleRecordingComplete}
            maxDuration={b.maxDuration || 120}
            disabled={isCompleted}
          />
        )}

        {hasRecording && !hasFeedback && !isAnalyzing && (
          <div style={{
            marginTop: '12px',
            padding: '12px',
            background: '#d1ecf1',
            border: '1px solid #bee5eb',
            borderRadius: '6px',
            color: '#0c5460'
          }}>
            ✓ Recording saved! Click <strong>"Submit & Complete"</strong> below to get feedback.
          </div>
        )}

        {isAnalyzing && (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <AILoading message="Analyzing your speaking..." />
          </div>
        )}

        {hasFeedback && (
          <div style={{ marginTop: '20px' }}>
            <div style={{
              padding: '16px',
              background: '#d4edda',
              border: '1px solid #c3e6cb',
              borderRadius: '6px',
              marginBottom: '16px'
            }}>
              <strong>✓ Audio analyzed successfully!</strong>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h5 style={{ marginBottom: '8px' }}>Transcript:</h5>
              <div style={{ padding: '12px', background: '#f9f9f9', borderRadius: '6px', fontStyle: 'italic' }}>
                "{hasFeedback.transcript}"
              </div>
            </div>

            <h5 style={{ marginTop: '20px', marginBottom: '12px' }}>Detailed Feedback:</h5>

            {/* Pronunciation */}
            <div style={{ marginBottom: '16px', padding: '12px', background: '#fff', border: '1px solid #eee', borderRadius: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <strong>Pronunciation</strong>
                <span style={{ padding: '4px 12px', background: '#007bff', color: 'white', borderRadius: '12px', fontSize: '0.9em' }}>
                  {hasFeedback.feedback.pronunciation.score.toFixed(0)}/100
                </span>
              </div>
              <p style={{ color: '#666', margin: 0 }}>{hasFeedback.feedback.pronunciation.feedback}</p>
            </div>

            {/* Fluency */}
            <div style={{ marginBottom: '16px', padding: '12px', background: '#fff', border: '1px solid #eee', borderRadius: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <strong>Fluency</strong>
                <span style={{ padding: '4px 12px', background: '#007bff', color: 'white', borderRadius: '12px', fontSize: '0.9em' }}>
                  {hasFeedback.feedback.fluency.score.toFixed(0)}/100
                </span>
              </div>
              <p style={{ color: '#666', margin: 0 }}>{hasFeedback.feedback.fluency.feedback}</p>
            </div>

            {/* Grammar */}
            <div style={{ marginBottom: '16px', padding: '12px', background: '#fff', border: '1px solid #eee', borderRadius: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <strong>Grammar</strong>
                <span style={{ padding: '4px 12px', background: '#007bff', color: 'white', borderRadius: '12px', fontSize: '0.9em' }}>
                  {hasFeedback.feedback.grammar.score.toFixed(0)}/100
                </span>
              </div>
              <p style={{ color: '#666', margin: 0 }}>{hasFeedback.feedback.grammar.feedback}</p>
            </div>

            {/* Vocabulary */}
            <div style={{ marginBottom: '16px', padding: '12px', background: '#fff', border: '1px solid #eee', borderRadius: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <strong>Vocabulary</strong>
                <span style={{ padding: '4px 12px', background: '#007bff', color: 'white', borderRadius: '12px', fontSize: '0.9em' }}>
                  {hasFeedback.feedback.vocabulary.score.toFixed(0)}/100
                </span>
              </div>
              <p style={{ color: '#666', margin: 0 }}>{hasFeedback.feedback.vocabulary.feedback}</p>
            </div>

            {/* Overall */}
            <div style={{ padding: '16px', background: '#e3f2fd', border: '1px solid #90caf9', borderRadius: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <strong>Overall Assessment</strong>
                <span style={{ padding: '4px 12px', background: '#2196F3', color: 'white', borderRadius: '12px', fontSize: '1em' }}>
                  {hasFeedback.feedback.overall.score.toFixed(0)}/100
                </span>
              </div>
              <p style={{ color: '#1976d2', margin: 0, fontWeight: 500 }}>{hasFeedback.feedback.overall.feedback}</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderAudio = (b: Extract<ContentBlock, { type: 'audio' }>) => {
    return (
      <div style={{ marginTop: '20px', padding: '20px', background: '#fff', borderRadius: '8px', border: '1px solid #eee' }}>
        <h4 style={{ marginBottom: '12px' }}>🎧 Listen to the Audio</h4>
        <p style={{ color: '#666', marginBottom: '12px' }}>
          Listen carefully to the audio. You can play it multiple times.
        </p>
        <audio
          controls
          src={`http://localhost:8000${b.audioUrl}`}
          style={{
            width: '100%',
            marginBottom: 12,
            borderRadius: 6,
          }}
          preload="metadata"
        >
          Your browser does not support the audio element.
        </audio>
        {b.transcript && (
          <details style={{ marginTop: 12 }}>
            <summary style={{ cursor: 'pointer', color: '#666', fontSize: '0.9em' }}>
              Show transcript
            </summary>
            <div
              style={{
                marginTop: 8,
                padding: 10,
                background: '#f9f9f9',
                borderRadius: 6,
                fontSize: '0.9em',
                color: '#555',
                whiteSpace: 'pre-wrap',
              }}
            >
              {b.transcript}
            </div>
          </details>
        )}
      </div>
    );
  };

  const renderMultipleChoice = (b: Extract<ContentBlock, { type: 'multiple_choice' }>) => {
    const current = answers[b.id] as string | undefined;
    const isCompleted = content?.isCompleted || false;

    return (
      <div style={{ marginTop: '20px', padding: '20px', background: '#fff', borderRadius: '8px', border: '1px solid #eee' }}>
        <div style={{ fontWeight: 600, marginBottom: 12, fontSize: '1.05em' }}>
          {b.question}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {b.options.map((opt, idx) => {
            const isSelected = current === opt;
            const showCorrect = isCompleted && b.correctAnswer === opt;
            const showIncorrect = isCompleted && isSelected && current !== b.correctAnswer;

            return (
              <label
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  cursor: isCompleted ? 'default' : 'pointer',
                  padding: 12,
                  borderRadius: 6,
                  background: showCorrect ? '#d4edda' : showIncorrect ? '#f8d7da' : isSelected ? '#e3f2fd' : '#f9f9f9',
                  border: isSelected ? '2px solid #2196F3' : '2px solid transparent',
                  transition: 'all 0.2s',
                }}
              >
                <input
                  type="radio"
                  name={`mc-${b.id}`}
                  value={opt}
                  checked={isSelected}
                  onChange={(e) => {
                    if (!isCompleted) {
                      setAnswers((prev) => ({ ...prev, [b.id]: e.target.value }));
                    }
                  }}
                  disabled={isCompleted}
                  style={{ marginTop: 2 }}
                />
                <div style={{ flex: 1 }}>
                  {opt}
                  {showCorrect && <span style={{ marginLeft: 8, color: '#28a745' }}>✓ Correct</span>}
                  {showIncorrect && <span style={{ marginLeft: 8, color: '#dc3545' }}>✗ Incorrect</span>}
                </div>
              </label>
            );
          })}
        </div>
      </div>
    );
  };

  const renderMatching = (b: Extract<ContentBlock, { type: 'matching' }>) => {
    const current = (answers[b.id] as Record<string, string> | undefined) ?? {};
    const isCompleted = content?.isCompleted || false;

    // Helper to check if a right item is already matched
    const isMatched = (rightId: string) => Object.values(current).includes(rightId);

    const handleLeftClick = (leftId: string) => {
      if (isCompleted) return;
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
      if (isCompleted) return;
      if (selectedLeft) {
        // Create match
        const next = { ...current, [selectedLeft]: rightId };
        setAnswers(prev => ({ ...prev, [b.id]: next }));
        setSelectedLeft(null);
      }
    };

    return (
      <div className="cv-ex cv-ex-card">
        {b.title && <h4 className="cv-ex-title">{b.title}</h4>}
        <p className="cv-ex-prompt">{b.prompt}</p>
        <p className="cv-ex-hint">
          Click an item on the left, then click its match on the right. Click a matched item on the left to unmatch.
        </p>

        <div className="cv-match-grid">
          {/* Left Column */}
          <div className="cv-match-col">
            {b.left.map((l) => {
              const matchedRightId = current[l.id];
              const isSelected = selectedLeft === l.id;
              const isMatched = !!matchedRightId;

              return (
                <div
                  key={l.id}
                  onClick={() => handleLeftClick(l.id)}
                  className={`cv-match-item ${isSelected ? 'is-selected' : ''} ${isMatched ? 'is-matched' : ''}`}
                  style={{
                    padding: '12px',
                    border: isSelected ? '2px solid #3498db' : isMatched ? '2px solid #9b59b6' : '1px solid #ddd',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    background: isSelected ? '#eaf2f8' : isMatched ? '#f4ecf7' : '#fff',
                    transition: 'all 0.2s',
                    position: 'relative'
                  }}
                >
                  {l.text}
                  {isMatched && <span style={{ position: 'absolute', right: 10, color: '#9b59b6' }}>🔗</span>}
                </div>
              );
            })}
          </div>

          {/* Right Column */}
          <div className="cv-match-col">
            {b.right.map((r) => {
              const isUsed = isMatched(r.id);

              return (
                <div
                  key={r.id}
                  onClick={() => !isUsed && handleRightClick(r.id)}
                  className={`cv-match-item ${isUsed ? 'is-used' : ''}`}
                  style={{
                    padding: '12px',
                    border: isUsed ? '2px solid #9b59b6' : '1px solid #ddd',
                    borderRadius: '6px',
                    cursor: isUsed ? 'default' : 'pointer',
                    background: isUsed ? '#f4ecf7' : '#fff',
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
      // First, analyze any speaking audio
      const speakingBlocks = structured?.blocks.filter((b: ContentBlock) => b.type === 'speaking') || [];
      const speakingResults: Record<string, any> = {};
      const hasSpeakingContent = speakingBlocks.length > 0;

      for (const block of speakingBlocks) {
        const audioBlob = speakingAudio[block.id];
        if (audioBlob) {
          setSpeakingLoading(prev => ({ ...prev, [block.id]: true }));
          try {
            const speakingBlock = block as Extract<ContentBlock, { type: 'speaking' }>;
            const feedback = await learningService.submitSpeakingAudio(
              contentId,
              block.id,
              audioBlob,
              speakingBlock.prompt
            );
            speakingResults[block.id] = feedback;
            setSpeakingFeedback(prev => ({ ...prev, [block.id]: feedback }));
          } catch (err: any) {
            console.error(`Failed to analyze speaking block ${block.id}:`, err);
          } finally {
            setSpeakingLoading(prev => ({ ...prev, [block.id]: false }));
          }
        }
      }

      // Include speaking results in answers
      const finalAnswers = { ...answers };
      for (const [blockId, feedback] of Object.entries(speakingResults)) {
        finalAnswers[blockId] = {
          audioSubmitted: true,
          feedback: feedback
        };
      }

      // For speaking content, pass the speaking feedback to be saved
      const completionPayload: any = { answers: finalAnswers };
      if (hasSpeakingContent && Object.keys(speakingResults).length > 0) {
        completionPayload.speakingFeedback = speakingResults;
      }

      const response = await learningService.completeContent(contentId, completionPayload);

      // Check for new achievements after content completion
      await checkForNewAchievements();

      // For speaking content, don't show the feedback popup - feedback is already displayed inline
      if (hasSpeakingContent && Object.keys(speakingResults).length > 0) {
        setCompleteMsg('Speaking exercise completed! Your feedback is displayed above.');
        // Refresh content to show completion state
        const updatedContent = await learningService.getDeliveredContentById(contentId);
        setContent(updatedContent);
      } else if (response.feedback) {
        // Non-speaking content: show feedback popup
        setFeedbackData(response.feedback);
        setShowFeedback(true);
      } else {
        // No feedback, proceed to next
        setCompleteMsg('Content completed! Moving to next lesson...');
        setTimeout(() => proceedToNext(), 1000);
      }

    } catch (e: any) {
      setCompleteMsg(null);
      setError(e?.response?.data?.detail ?? e?.message ?? 'Failed to complete content');
    } finally {
      setIsCompleting(false);
    }
  };

  const proceedToNext = async () => {
    if (!user) return;
    setIsLoadingNext(true);
    try {
      const next = await learningService.deliverNextContent({
        studentId: parseInt(user.id),
        contentType: 'LESSON',
      });
      navigate(`/student/content/${next.content.contentId}`);
    } catch (err) {
      // If no next content, go back to plan
      navigate('/student/learning-plan');
    } finally {
      setIsLoadingNext(false);
    }
  };

  return (
    <div className="cv-page">
      {newAchievements && newAchievements.length > 0 && (
        <AchievementNotificationContainer
          achievements={newAchievements}
          onClose={clearAchievements}
        />
      )}

      {/* AI Loading Overlays */}
      {isCompleting && <AILoading message="Analyzing your answers..." />}
      {isLoadingNext && <AILoading message="Generating your next lesson..." />}

      <main className="cv-main">
        <div className="cv-container">
          <div className="cv-top">
            <Link to="/student/learning-plan" className="cv-back">
              ← Back to Learning Plan
            </Link>
            <Link to="/student/content/history" className="button button-secondary">
              View History
            </Link>
          </div>

          <section className="cv-hero">
            <div>
              <h1>Content Viewer</h1>
              <p>Stay focused and complete this lesson to move forward in your plan.</p>
            </div>
            <div className="cv-hero-meta">
              <span className="cv-pill">Level: {content?.level || '—'}</span>
              <span className="cv-pill cv-pill-muted">Type: {content?.contentType || '—'}</span>
              <span className="cv-pill">ID: {content?.contentId || '—'}</span>
            </div>
          </section>

          {/* Feedback Modal */}
          {showFeedback && feedbackData && !isLoadingNext && (
            <div className="cv-modal-overlay">
              <div className="cv-modal">
                <h2 className="cv-modal-title">Great Job! 🎉</h2>
                <div style={{ marginTop: '20px' }}>
                  <h3>Feedback</h3>
                  <p style={{ lineHeight: 1.6, fontSize: '1.05rem', color: '#2c3e50' }}>{feedbackData.feedback}</p>
                </div>

                <button
                  className="button button-primary"
                  style={{ marginTop: '30px', width: '100%' }}
                  onClick={proceedToNext}
                >
                  Continue to Next Lesson
                </button>
              </div>
            </div>
          )}

          <div className="card cv-card">
            {isLoading && <p>Loading...</p>}
            {!isLoading && error && (
              <div className="cv-error">
                <strong>Error:</strong> {error}
              </div>
            )}

            {!isLoading && !error && content && (
              <>
                <h2 className="cv-title">{content.title}</h2>
                <div className="cv-meta">
                  <span>Content ID: {content.contentId}</span>
                  <span>Level: <strong>{content.level}</strong></span>
                  <span>Type: <strong>{content.contentType}</strong></span>
                </div>

                {rationaleFromNav && (
                  <p className="cv-rationale">
                    <strong>Why this content:</strong> {rationaleFromNav}
                  </p>
                )}

                {completeMsg && !isLoadingNext && (
                  <div className="cv-banner cv-banner-success">
                    <strong className="cv-banner__title">{completeMsg}</strong>
                    <div style={{ marginTop: '12px' }}>
                      <button
                        className="button button-primary"
                        onClick={proceedToNext}
                        disabled={isLoadingNext}
                      >
                        Continue to Next Lesson →
                      </button>
                    </div>
                  </div>
                )}

                <div className="cv-section">
                  <h3>Lesson Content</h3>

                  {/* Structured rendering if body is JSON */}
                  {structured ? (
                    <>
                      {structured.rationale && !rationaleFromNav && (
                        <p className="cv-prose cv-prose-muted" style={{ marginTop: '0' }}>
                          <strong>Why this content:</strong> {structured.rationale}
                        </p>
                      )}

                      {structured.blocks.map((b) => {
                        if (b.type === 'text') {
                          return (
                            <div key={b.id} style={{ marginTop: '20px', marginBottom: '20px' }}>
                              <div className="cv-prose cv-prose-block" style={{ margin: 0 }}>
                                {b.text}
                              </div>
                            </div>
                          );
                        }
                        if (b.type === 'audio') return <div key={b.id}>{renderAudio(b)}</div>;
                        if (b.type === 'speaking') return <div key={b.id}>{renderSpeaking(b)}</div>;
                        if (b.type === 'multiple_choice') return <div key={b.id}>{renderMultipleChoice(b)}</div>;
                        if (b.type === 'matching') return <div key={b.id}>{renderMatching(b)}</div>;
                        if (b.type === 'fill_blanks') return <div key={b.id}>{renderFillBlanks(b)}</div>;
                        return null;
                      })}
                    </>
                  ) : (
                    <div className="cv-prose cv-prose-block">
                      {content.body}
                    </div>
                  )}
                </div>

                {content.isCompleted && (
                  <div className="cv-banner cv-banner-complete">
                    <strong className="cv-banner__title">✓ Completed on {new Date(content.completedAt || '').toLocaleDateString()}</strong>
                    {content.feedback && (() => {
                      try {
                        const parsed = JSON.parse(content.feedback);
                        // Check if this is speaking feedback (displayed inline above) or other feedback
                        if (parsed.speakingFeedback) {
                          return (
                            <div style={{ marginTop: '8px', color: '#666', fontSize: '0.9em' }}>
                              Speaking feedback is displayed above with your recordings.
                            </div>
                          );
                        }
                        // For other feedback types, show the View Feedback button
                        return (
                          <div style={{ marginTop: '10px' }}>
                            <button
                              className="button button-secondary"
                              onClick={() => {
                                setFeedbackData(parsed);
                                setShowFeedback(true);
                              }}
                            >
                              View Feedback
                            </button>
                          </div>
                        );
                      } catch (e) {
                        return null;
                      }
                    })()}
                  </div>
                )}

                {!content.isCompleted && (
                  <div className="cv-actions">
                    <button
                      className="button button-primary"
                      disabled={isCompleting}
                      onClick={handleComplete}
                    >
                      {isCompleting ? 'Submitting...' : 'Submit & Complete'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ContentViewer;
