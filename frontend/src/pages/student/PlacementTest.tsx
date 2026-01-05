import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { testService } from '@/services/api/test.service';
import type {
  PlacementTestResult,
  TestModuleResult,
  TestModuleType,
  TestQuestion,
  TestSubmission,
  ListeningQuestionGroup,
} from '@/types/test.types';
import AILoading from '@/components/AILoading';

const PlacementTest: React.FC = () => {
  const navigate = useNavigate();
  const [isStarting, setIsStarting] = useState(false);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [testId, setTestId] = useState<string | null>(null);
  const [modules, setModules] = useState<TestModuleType[]>([]);
  const [moduleIndex, setModuleIndex] = useState<number>(0);
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [listeningGroups, setListeningGroups] = useState<ListeningQuestionGroup[]>([]);
  const [answersByQuestionId, setAnswersByQuestionId] = useState<Record<string, string>>({});

  const [audioByQuestionId, setAudioByQuestionId] = useState<Record<string, Blob>>({});
  const [audioUrlByQuestionId, setAudioUrlByQuestionId] = useState<Record<string, string>>({});
  const [recordingQuestionId, setRecordingQuestionId] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const [moduleResults, setModuleResults] = useState<Partial<Record<TestModuleType, TestModuleResult>>>({});
  const [finalResult, setFinalResult] = useState<PlacementTestResult | null>(null);
  const [activeTests, setActiveTests] = useState<{ testId: number; currentStep: number; updatedAt: string }[]>([]);

  useEffect(() => {
    testService.listActiveTests().then(setActiveTests).catch(console.error);
  }, []);

  const currentModule = useMemo<TestModuleType | null>(() => {
    if (!modules.length) return null;
    return modules[moduleIndex] ?? null;
  }, [modules, moduleIndex]);

  const isInProgress = Boolean(testId) && !finalResult;
  const isLastModule = currentModule ? moduleIndex >= modules.length - 1 : false;

  useEffect(() => {
    // Cleanup object URLs
    return () => {
      Object.values(audioUrlByQuestionId).forEach((u) => {
        try {
          URL.revokeObjectURL(u);
        } catch {
          // ignore
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveAndExit = async () => {
    if (!testId) return;
    try {
      await testService.saveProgress(testId, moduleIndex, answersByQuestionId);
      alert('Progress saved!');
      navigate('/dashboard');
    } catch (e) {
      console.error(e);
      setError('Failed to save progress');
    }
  };

  const handleResume = async (tid: number) => {
    setIsStarting(true);
    try {
      const data = await testService.resumeTest(tid.toString());
      setTestId(data.testId.toString());
      setModuleIndex(data.currentStep);
      setAnswersByQuestionId(data.answers);
      setModules(['reading', 'writing', 'listening', 'speaking']);
      if (['reading', 'writing', 'listening', 'speaking'][data.currentStep]) {
        await loadModuleQuestions(
          data.testId.toString(),
          ['reading', 'writing', 'listening', 'speaking'][data.currentStep] as TestModuleType
        );
      }
    } catch (e) {
      setError('Failed to resume test');
    } finally {
      setIsStarting(false);
    }
  };

  const loadModuleQuestions = async (tid: string, moduleType: TestModuleType) => {
    setIsLoadingQuestions(true);
    setError(null);
    try {
      // For listening module, load listening groups
      if (moduleType === 'listening') {
        const groups = await testService.getListeningGroups(tid);
        setListeningGroups(groups);
        setQuestions([]);
      } else {
        const qs = await testService.getModuleQuestions(tid, moduleType);
        setQuestions(qs);
        setListeningGroups([]);
      }
      setAnswersByQuestionId({});

      // Reset speaking recordings when switching modules.
      setAudioByQuestionId({});
      Object.values(audioUrlByQuestionId).forEach((u) => {
        try {
          URL.revokeObjectURL(u);
        } catch {
          // ignore
        }
      });
      setAudioUrlByQuestionId({});
      setRecordingQuestionId(null);
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Failed to load module questions');
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const startRecording = async (questionId: string) => {
    setError(null);
    if (recordingQuestionId) {
      setError('Already recording. Stop current recording first.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;

      recorder.ondataavailable = (evt) => {
        if (evt.data && evt.data.size > 0) {
          chunksRef.current.push(evt.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        setAudioByQuestionId((prev) => ({ ...prev, [questionId]: blob }));
        setAudioUrlByQuestionId((prev) => {
          // revoke old
          const old = prev[questionId];
          if (old) {
            try {
              URL.revokeObjectURL(old);
            } catch {
              // ignore
            }
          }
          return { ...prev, [questionId]: URL.createObjectURL(blob) };
        });

        // stop tracks
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        recorderRef.current = null;
        chunksRef.current = [];
        setRecordingQuestionId(null);
      };

      setRecordingQuestionId(questionId);
      recorder.start();
    } catch (e: any) {
      setError(e?.message || 'Microphone permission denied or unavailable');
      setRecordingQuestionId(null);
    }
  };

  const stopRecording = () => {
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
    }
  };

  const start = async () => {
    setIsStarting(true);
    setError(null);
    setFinalResult(null);
    setModuleResults({});
    try {
      const res = await testService.startPlacementTest();
      setTestId(res.testId);
      setModules(res.modules);
      setModuleIndex(0);
      if (res.modules.length) {
        await loadModuleQuestions(res.testId, res.modules[0]);
      }
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Failed to start placement test');
    } finally {
      setIsStarting(false);
    }
  };

  const submitCurrentModule = async () => {
    if (!testId || !currentModule) return;
    setIsSubmitting(true);
    setError(null);
    try {
      // If speaking module, require audio and upload it first.
      if (currentModule === 'speaking') {
        const missing = questions.filter((q) => !audioByQuestionId[q.id]);
        if (missing.length) {
          setError('Please record audio for all speaking questions before submitting.');
          return;
        }

        let lastSpeakingRes: TestModuleResult | null = null;
        for (const q of questions) {
          const blob = audioByQuestionId[q.id];
          if (!blob) continue;
          lastSpeakingRes = await testService.submitSpeakingTest(testId, blob, q.id);
        }

        // Mark module submitted without sending any notes.
        const res = await testService.submitModule(testId, currentModule, []);
        setModuleResults((prev) => ({ ...prev, [currentModule]: lastSpeakingRes ?? res }));
      } else if (currentModule === 'listening' && listeningGroups.length > 0) {
        // For listening module, collect answers from all questions in all groups
        const submissions: TestSubmission[] = [];
        listeningGroups.forEach((group) => {
          group.questions.forEach((q) => {
            submissions.push({
              questionId: q.id,
              answer: answersByQuestionId[q.id] ?? '',
            });
          });
        });

        const res = await testService.submitModule(testId, currentModule, submissions);
        setModuleResults((prev) => ({ ...prev, [currentModule]: res }));
      } else {
        const submissions: TestSubmission[] = questions.map((q) => ({
          questionId: q.id,
          answer: answersByQuestionId[q.id] ?? '',
        }));

        const res = await testService.submitModule(testId, currentModule, submissions);
        setModuleResults((prev) => ({ ...prev, [currentModule]: res }));
      }

      if (!isLastModule) {
        const nextIndex = moduleIndex + 1;
        const nextModule = modules[nextIndex];
        setModuleIndex(nextIndex);
        await loadModuleQuestions(testId, nextModule);
      } else {
        // Single action on last module: submit then complete.
        const completed = await testService.completePlacementTest(testId);
        setFinalResult(completed);
      }
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Failed to submit module');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="placement-page">
      <div className="placement-wrap">
        {isSubmitting && isLastModule && <AILoading message="Analyzing your test results..." />}

        <div className="placement-surface">
          <div className="placement-inner">
            <div className="placement-header">
              <div>
                <Link
                  to="/student/dashboard"
                  className="placement-back"
                  style={{ textDecoration: 'none' }}
                >
                  <span aria-hidden>←</span>
                  <span>Back to Dashboard</span>
                </Link>
                <h1 className="placement-title">Placement Test</h1>
                <p className="placement-subtitle">
                  A calm, step-by-step assessment to personalize your learning plan.
                </p>
              </div>

              <div>
                <div className="placement-status">
                  {isInProgress && currentModule ? (
                    <div>
                      In progress • Module {moduleIndex + 1}/{modules.length}
                    </div>
                  ) : finalResult ? (
                    <div>Completed</div>
                  ) : (
                    <div>Not started</div>
                  )}
                </div>

                <div className="placement-progress">
                  <div className="placement-progress-row">
                    <div className="placement-progress-label">Progress</div>
                    <div className="placement-progress-pct">
                      {finalResult
                        ? '100%'
                        : isInProgress && modules.length
                          ? `${Math.round(((moduleIndex + 1) / modules.length) * 100)}%`
                          : '0%'}
                    </div>
                  </div>
                  <div className="placement-progress-track">
                    <div
                      className="placement-progress-fill"
                      style={{
                        width: finalResult
                          ? '100%'
                          : isInProgress && modules.length
                            ? `${Math.round(((moduleIndex + 1) / modules.length) * 100)}%`
                            : '0%',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div role="alert" aria-live="polite" className="placement-panel">
                <div className="placement-pill-title">There was a problem</div>
                <div className="placement-pill-desc">{error}</div>
              </div>
            )}

            {!isInProgress && !finalResult && (
              <div className="placement-panel">
                <h2>English Level Assessment</h2>
                <p className="placement-muted">
                  This test evaluates your English proficiency across four key areas.
                </p>

                <div className="placement-grid">
                  <div className="placement-pill">
                    <div className="placement-pill-title">Reading</div>
                    <div className="placement-pill-desc">Comprehension & understanding</div>
                  </div>
                  <div className="placement-pill">
                    <div className="placement-pill-title">Writing</div>
                    <div className="placement-pill-desc">Grammar, clarity & structure</div>
                  </div>
                  <div className="placement-pill">
                    <div className="placement-pill-title">Listening</div>
                    <div className="placement-pill-desc">Audio comprehension</div>
                  </div>
                  <div className="placement-pill">
                    <div className="placement-pill-title">Speaking</div>
                    <div className="placement-pill-desc">Voice recording responses</div>
                  </div>
                </div>

                <div className="placement-muted">
                  The test takes about 45–60 minutes. Based on your performance, you will be assigned a CEFR level (A1–C2).
                </div>

                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 16, flexWrap: 'wrap' }}>
                  <button
                    className="button button-gradient button-lift"
                    onClick={start}
                    disabled={isStarting}
                  >
                    {isStarting ? 'Starting...' : 'Start Placement Test'}
                  </button>
                  <div className="placement-pill-desc" style={{ marginTop: 0 }}>
                    Make sure you have time to complete all modules.
                  </div>
                </div>

                {activeTests.length > 0 && (
                  <div style={{ marginTop: 22, borderTop: '1px solid var(--border)', paddingTop: 22 }}>
                    <h3>Resume In-Progress Test</h3>
                    {activeTests.map((t) => (
                      <div
                        key={t.testId}
                        className="placement-pill"
                        style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}
                      >
                        <div>
                          <div className="placement-pill-title">Test #{t.testId}</div>
                          <div className="placement-pill-desc" style={{ marginTop: 6 }}>
                            Last updated: {new Date(t.updatedAt).toLocaleString()}
                          </div>
                        </div>
                        <button
                          className="button button-secondary button-lift"
                          onClick={() => handleResume(t.testId)}
                          disabled={isStarting}
                        >
                          Resume
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {isInProgress && currentModule && (
              <div className="placement-panel">
                <div style={{ display: 'flex', gap: 12, alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                  <div>
                    <h2 style={{ textTransform: 'capitalize' }}>
                      {currentModule} Module
                    </h2>
                    <div className="placement-muted" style={{ marginTop: 8 }}>
                      Module {moduleIndex + 1} of {modules.length}
                    </div>
                  </div>
                  <button
                    className="button button-secondary button-lift"
                    onClick={handleSaveAndExit}
                  >
                    Save & Exit
                  </button>
                </div>

                {currentModule === 'speaking' && (
                  <div className="placement-muted">
                    Record an answer for each question. You can replay your recordings before submitting.
                  </div>
                )}

                {isLoadingQuestions ? (
                  <p className="placement-muted" style={{ marginTop: 16 }}>Loading questions...</p>
                ) : currentModule === 'listening' && listeningGroups.length > 0 ? (
                  // Listening module with grouped questions
                  <div style={{ marginTop: 18 }}>
                    {listeningGroups.map((group, groupIdx) => (
                      <div
                        key={groupIdx}
                        className="placement-pill"
                        style={{ marginBottom: 16, padding: 18 }}
                      >
                        {/* Audio Player Section */}
                        <div style={{ marginBottom: 16 }}>
                          <div className="placement-pill-title">Audio {groupIdx + 1}</div>
                          <p className="placement-pill-desc">
                            Listen to the audio carefully. You can play it multiple times.
                          </p>
                          <audio
                            controls
                            src={`http://localhost:8000${group.audioUrl}`}
                            style={{ marginTop: 12, width: '100%', borderRadius: 12 }}
                            preload="metadata"
                          >
                            Your browser does not support the audio element.
                          </audio>
                        </div>

                        {/* Questions for this audio */}
                        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                          <div className="placement-progress-label">
                            Questions for Audio {groupIdx + 1}
                          </div>
                          {group.questions.map((q, qIdx) => (
                            <div
                              key={q.id}
                              className="placement-pill"
                              style={{ marginTop: 12, padding: 16 }}
                            >
                                }
                                style={{ marginTop: 2 }}
                              <div className="question-title">
                                {qIdx + 1}. {q.question}
                              </div>

                              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
                                {q.options.map((opt) => (
                                  <label
                                    key={opt}
                                    className={`option-card ${(answersByQuestionId[q.id] ?? '') === opt ? 'option-card-selected' : ''}`}
                                  >
                                    <input
                                      type="radio"
                                      name={`q-${q.id}`}
                                      value={opt}
                                      checked={(answersByQuestionId[q.id] ?? '') === opt}
                                      onChange={(e) =>
                                        setAnswersByQuestionId((prev) => ({ ...prev, [q.id]: e.target.value }))
                                      }
                                      style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
                                    />
                                    <div className="option-check" aria-hidden>
                                      ✓
                                    </div>
                                    <div style={{ fontWeight: 700, lineHeight: 1.35 }}>{opt}</div>
                                  </label>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 14, flexWrap: 'wrap' }}>
                      <div className="placement-pill-desc" style={{ marginTop: 0 }}>
                        {isLastModule ? 'Final step: submit and complete the test.' : 'Submit to continue to the next module.'}
                      </div>
                      <button
                        className="button button-gradient button-lift"
                        onClick={submitCurrentModule}
                        disabled={isSubmitting || isLoadingQuestions}
                      >
                        {isSubmitting ? 'Submitting...' : isLastModule ? 'Submit & Complete' : 'Submit Module'}
                      </button>
                    </div>

                    {idx + 1}. {q.question}
                    {currentModule && moduleResults[currentModule] && (
                      <div className="card" style={{ marginTop: 16, background: '#f9f9f9', boxShadow: 'none' }}>
                        <div>
                          {moduleResults[currentModule]?.level} (score {moduleResults[currentModule]?.score})
                        </div>
                        {moduleResults[currentModule]?.feedback && (
                      </div>
                    )}
                  </div>
                ) : (
                  // Other modules (reading, writing, speaking)
                  <div style={{ marginTop: 18 }}>
                    {questions.map((q, idx) => (
                      <div
                        key={q.id}
                        className="placement-pill"
                        style={{ marginBottom: 12, padding: 18 }}
                      >
                        {((q as any).content as string | undefined) && (
                          <div
                            className="placement-pill"
                            style={{ marginBottom: 14, maxHeight: 200, overflowY: 'auto', whiteSpace: 'pre-wrap' }}
                          >
                            {(q as any).content}
                          </div>
                        )}

                        <div className="question-title">
                          {idx + 1}. {q.question}
                        </div>

                        {q.audioUrl && (
                          <audio controls src={q.audioUrl} style={{ marginTop: 12, width: '100%', borderRadius: 12 }} />
                        )}

                        {q.options && q.options.length ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
                            {q.options.map((opt) => (
                              <label
                                key={opt}
                                className={`option-card ${(answersByQuestionId[q.id] ?? '') === opt ? 'option-card-selected' : ''}`}
                              >
                                <input
                                  type="radio"
                                  name={`q-${q.id}`}
                                  value={opt}
                                  checked={(answersByQuestionId[q.id] ?? '') === opt}
                                  onChange={(e) =>
                                    setAnswersByQuestionId((prev) => ({ ...prev, [q.id]: e.target.value }))
                                  }
                                  style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
                                />
                                <div className="option-check" aria-hidden>
                                  ✓
                                </div>
                                <div style={{ fontWeight: 700, lineHeight: 1.35 }}>{opt}</div>
                              </label>
                            ))}
                          </div>
                        ) : (
                          <>
                            {currentModule === 'speaking' && (
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
                                  <button
                                    className="button button-gradient button-lift"
                                    onClick={() => startRecording(q.id)}
                                    disabled={Boolean(recordingQuestionId) && recordingQuestionId !== q.id}
                                  >
                                    {recordingQuestionId === q.id ? 'Recording...' : 'Record'}
                                  </button>
                                  <button
                                    className="button button-danger button-lift"
                                    onClick={stopRecording}
                                    disabled={recordingQuestionId !== q.id}
                                  >
                                    Stop
                                  </button>
                                  <div className="placement-pill-desc" style={{ marginTop: 0 }}>
                                    {audioByQuestionId[q.id]
                                      ? 'Recording saved.'
                                      : 'Record a response for this question.'}
                                  </div>
                                </div>

                                {audioUrlByQuestionId[q.id] && (
                                  <div style={{ marginTop: 12 }}>
                                    <audio controls src={audioUrlByQuestionId[q.id]} style={{ width: '100%', borderRadius: 12 }} />
                                  </div>
                                )}
                              </div>
                            )}

                            {currentModule !== 'speaking' && (
                              <textarea
                                className="input-premium"
                                style={{ minHeight: 110, resize: 'vertical' }}
                                value={answersByQuestionId[q.id] ?? ''}
                                onChange={(e) =>
                                  setAnswersByQuestionId((prev) => ({ ...prev, [q.id]: e.target.value }))
                                }
                                placeholder={'Type your answer...'}
                              />
                            )}
                          </>
                        )}
                      </div>
                    ))}

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 14, flexWrap: 'wrap' }}>
                      <div className="placement-pill-desc" style={{ marginTop: 0 }}>
                        {isLastModule ? 'Final step: submit and complete the test.' : 'Submit to continue to the next module.'}
                      </div>
                      <button
                        className="button button-gradient button-lift"
                        onClick={submitCurrentModule}
                        disabled={isSubmitting || isLoadingQuestions}
                      >
                        {isSubmitting ? 'Submitting...' : isLastModule ? 'Submit & Complete' : 'Submit Module'}
                      </button>
                    </div>

                    {currentModule && moduleResults[currentModule] && (
                      <div className="card" style={{ marginTop: 16, background: '#f9f9f9', boxShadow: 'none' }}>
                        <div style={{ fontWeight: 600, marginBottom: 6 }}>Last submission result</div>
                        <div>
                          {moduleResults[currentModule]?.level} (score {moduleResults[currentModule]?.score})
                        </div>
                        {moduleResults[currentModule]?.feedback && (
                          <div style={{ marginTop: 8, color: '#555' }}>{moduleResults[currentModule]?.feedback}</div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {finalResult && (
              <div className="placement-panel">
                <h2>Placement Result</h2>
                <div style={{ marginTop: 14, display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: 10 }}>
                  <div className="placement-progress-label">Overall Level:</div>
                  <div className="placement-progress-pct">{finalResult.overallLevel}</div>
                </div>

                <div className="placement-grid" style={{ marginTop: 16 }}>
                  <div className="placement-pill">
                    <div className="placement-progress-label">Reading</div>
                    <div className="placement-pill-title" style={{ marginTop: 6 }}>{finalResult.readingLevel}</div>
                  </div>
                  <div className="placement-pill">
                    <div className="placement-progress-label">Writing</div>
                    <div className="placement-pill-title" style={{ marginTop: 6 }}>{finalResult.writingLevel}</div>
                  </div>
                  <div className="placement-pill">
                    <div className="placement-progress-label">Listening</div>
                    <div className="placement-pill-title" style={{ marginTop: 6 }}>{finalResult.listeningLevel}</div>
                  </div>
                  <div className="placement-pill">
                    <div className="placement-progress-label">Speaking</div>
                    <div className="placement-pill-title" style={{ marginTop: 6 }}>{finalResult.speakingLevel}</div>
                  </div>
                </div>

                <div className="placement-muted">
                  Completed at: {new Date(finalResult.completedAt).toLocaleString()}
                </div>
              </div>
            )}

            <div className="placement-panel">
              <h3>Test Instructions</h3>
              <ol style={{ marginTop: 12, paddingLeft: 20, color: 'var(--muted)', lineHeight: 1.7 }}>
                <li>Ensure you have a stable internet connection</li>
                <li>Find a quiet environment for the speaking test</li>
                <li>Allow microphone access when prompted</li>
                <li>Complete all four modules</li>
                <li>You can save progress and continue later</li>
              </ol>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default PlacementTest;
