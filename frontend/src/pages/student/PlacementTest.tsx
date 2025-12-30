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
    <div className="container">
      {isSubmitting && isLastModule && <AILoading message="Analyzing your test results..." />}
      
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          gap: '12px',
          marginBottom: '20px',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <Link to="/student/dashboard" style={{ display: 'inline-block', marginBottom: '8px' }}>
            ← Back to Dashboard
          </Link>
          <h1 className="page-title" style={{ marginBottom: 0 }}>
            Placement Test
          </h1>
        </div>

        <div style={{ textAlign: 'right', color: '#555' }}>
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
      </div>
      
      {error && (
        <div className="card" role="alert" aria-live="polite">
          <div className="error-message" style={{ marginBottom: 6, fontWeight: 600 }}>
            There was a problem
          </div>
          <div>{error}</div>
        </div>
      )}

      {!isInProgress && !finalResult && (
        <div className="card">
          <h2 style={{ marginBottom: 10 }}>English Level Assessment</h2>
          <p style={{ color: '#555' }}>
            This test evaluates your English proficiency across four key areas.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '12px',
              marginTop: 16,
            }}
          >
            <div className="card" style={{ background: '#f9f9f9', boxShadow: 'none', marginBottom: 0 }}>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>Reading</div>
              <div style={{ color: '#666' }}>Comprehension & understanding</div>
            </div>
            <div className="card" style={{ background: '#f9f9f9', boxShadow: 'none', marginBottom: 0 }}>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>Writing</div>
              <div style={{ color: '#666' }}>Grammar, clarity & structure</div>
            </div>
            <div className="card" style={{ background: '#f9f9f9', boxShadow: 'none', marginBottom: 0 }}>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>Listening</div>
              <div style={{ color: '#666' }}>Audio comprehension</div>
            </div>
            <div className="card" style={{ background: '#f9f9f9', boxShadow: 'none', marginBottom: 0 }}>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>Speaking</div>
              <div style={{ color: '#666' }}>Voice recording responses</div>
            </div>
          </div>

          <div style={{ marginTop: 16, color: '#555' }}>
            The test takes about 45–60 minutes. Based on your performance, you will be assigned a CEFR level
            (A1–C2).
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 18, flexWrap: 'wrap' }}>
            <button className="button button-primary" onClick={start} disabled={isStarting}>
              {isStarting ? 'Starting...' : 'Start Placement Test'}
            </button>
            <div style={{ color: '#666' }}>Make sure you have time to complete all modules.</div>
          </div>

          {activeTests.length > 0 && (
            <div style={{ marginTop: 20, borderTop: '1px solid #eee', paddingTop: 20 }}>
              <h3 style={{ marginBottom: 10 }}>Resume In-Progress Test</h3>
              {activeTests.map((t) => (
                <div
                  key={t.testId}
                  className="card"
                  style={{
                    marginBottom: 10,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: '#f9f9f9',
                    boxShadow: 'none',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>Test #{t.testId}</div>
                    <div style={{ fontSize: '0.9em', color: '#666' }}>
                      Last updated: {new Date(t.updatedAt).toLocaleString()}
                    </div>
                  </div>
                  <button
                    className="button button-secondary"
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
        <div className="card">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              gap: '10px',
              flexWrap: 'wrap',
            }}
          >
            <h2 style={{ textTransform: 'capitalize', marginBottom: 6 }}>{currentModule} Module</h2>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button className="button button-secondary" onClick={handleSaveAndExit}>
                Save & Exit
              </button>
              <div style={{ color: '#666' }}>
                Module {moduleIndex + 1} of {modules.length}
              </div>
            </div>
          </div>

          {currentModule === 'speaking' && (
            <div style={{ color: '#666', marginTop: 6 }}>
              Record an answer for each question. You can replay your recordings before submitting.
            </div>
          )}

          {isLoadingQuestions ? (
            <p style={{ marginTop: 16, color: '#666' }}>Loading questions...</p>
          ) : currentModule === 'listening' && listeningGroups.length > 0 ? (
            // Listening module with grouped questions
            <div style={{ marginTop: 16 }}>
              {listeningGroups.map((group, groupIdx) => (
                <div
                  key={groupIdx}
                  className="card"
                  style={{ background: '#f9f9f9', boxShadow: 'none', marginBottom: 20 }}
                >
                  {/* Audio Player Section */}
                  <div style={{ marginBottom: 20 }}>
                    <h3 style={{ marginBottom: 12, fontSize: '1.1em' }}>
                      Audio {groupIdx + 1}
                    </h3>
                    <p style={{ color: '#666', marginBottom: 12 }}>
                      Listen to the audio carefully. You can play it multiple times.
                    </p>
                    <audio 
                      controls 
                      src={`http://localhost:8000${group.audioUrl}`}
                      style={{ 
                        width: '100%', 
                        marginBottom: 12,
                        borderRadius: 6,
                      }}
                      preload="metadata"
                    >
                      Your browser does not support the audio element.
                    </audio>
                  </div>

                  {/* Questions for this audio */}
                  <div style={{ borderTop: '1px solid #e0e0e0', paddingTop: 16 }}>
                    <h4 style={{ marginBottom: 12, fontSize: '1em', color: '#555' }}>
                      Questions for Audio {groupIdx + 1}
                    </h4>
                    {group.questions.map((q, qIdx) => (
                      <div
                        key={q.id}
                        className="card"
                        style={{ 
                          background: '#fff', 
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)', 
                          marginBottom: 12,
                          padding: 16,
                        }}
                      >
                        <div style={{ fontWeight: 600, marginBottom: 10 }}>
                          {qIdx + 1}. {q.question}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {q.options.map((opt) => (
                            <label
                              key={opt}
                              style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 10,
                                cursor: 'pointer',
                                padding: 10,
                                borderRadius: 6,
                                background: '#f9f9f9',
                                border: answersByQuestionId[q.id] === opt 
                                  ? '2px solid #007bff' 
                                  : '2px solid transparent',
                                transition: 'all 0.2s',
                              }}
                            >
                              <input
                                type="radio"
                                name={`q-${q.id}`}
                                value={opt}
                                checked={(answersByQuestionId[q.id] ?? '') === opt}
                                onChange={(e) =>
                                  setAnswersByQuestionId((prev) => ({ ...prev, [q.id]: e.target.value }))
                                }
                                style={{ marginTop: 2 }}
                              />
                              <div>{opt}</div>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 12,
                  marginTop: 10,
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ color: '#666' }}>
                  {isLastModule ? 'Final step: submit and complete the test.' : 'Submit to continue to the next module.'}
                </div>
                <button
                  className="button button-primary"
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
          ) : (
            // Other modules (reading, writing, speaking)
            <div style={{ marginTop: 16 }}>
              {questions.map((q, idx) => (
                <div
                  key={q.id}
                  className="card"
                  style={{ background: '#f9f9f9', boxShadow: 'none', marginBottom: 12 }}
                >
                  {q.content && (
                    <div
                      style={{
                        marginBottom: 12,
                        padding: 10,
                        background: '#eee',
                        borderRadius: 6,
                        maxHeight: '200px',
                        overflowY: 'auto',
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {q.content}
                    </div>
                  )}

                  <div style={{ fontWeight: 600, marginBottom: 10 }}>
                    {idx + 1}. {q.question}
                  </div>

                  {q.audioUrl && (
                    <audio controls src={q.audioUrl} style={{ width: '100%', marginBottom: 12 }} />
                  )}

                  {q.options && q.options.length ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {q.options.map((opt) => (
                        <label
                          key={opt}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 10,
                            cursor: 'pointer',
                            padding: 10,
                            borderRadius: 6,
                            background: 'white',
                          }}
                        >
                          <input
                            type="radio"
                            name={`q-${q.id}`}
                            value={opt}
                            checked={(answersByQuestionId[q.id] ?? '') === opt}
                            onChange={(e) =>
                              setAnswersByQuestionId((prev) => ({ ...prev, [q.id]: e.target.value }))
                            }
                            style={{ marginTop: 2 }}
                          />
                          <div>{opt}</div>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <>
                      {currentModule === 'speaking' && (
                        <div>
                          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                            <button
                              className="button button-primary"
                              onClick={() => startRecording(q.id)}
                              disabled={Boolean(recordingQuestionId) && recordingQuestionId !== q.id}
                            >
                              {recordingQuestionId === q.id ? 'Recording...' : 'Record'}
                            </button>
                            <button
                              className="button button-danger"
                              onClick={stopRecording}
                              disabled={recordingQuestionId !== q.id}
                            >
                              Stop
                            </button>
                            <div style={{ color: '#666' }}>
                              {audioByQuestionId[q.id]
                                ? 'Recording saved.'
                                : 'Record a response for this question.'}
                            </div>
                          </div>

                          {audioUrlByQuestionId[q.id] && (
                            <div style={{ marginTop: 12 }}>
                              <audio controls src={audioUrlByQuestionId[q.id]} style={{ width: '100%' }} />
                            </div>
                          )}
                        </div>
                      )}

                      {currentModule !== 'speaking' && (
                        <textarea
                          className="input"
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

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 12,
                  marginTop: 10,
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ color: '#666' }}>
                  {isLastModule ? 'Final step: submit and complete the test.' : 'Submit to continue to the next module.'}
                </div>
                <button
                  className="button button-primary"
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
        <div className="card">
          <h2>Placement Result</h2>
          <div style={{ marginTop: 10, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'baseline' }}>
            <div style={{ fontWeight: 600 }}>Overall Level:</div>
            <div>{finalResult.overallLevel}</div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 12,
              marginTop: 14,
            }}
          >
            <div className="card" style={{ background: '#f9f9f9', boxShadow: 'none', marginBottom: 0 }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Reading</div>
              <div>{finalResult.readingLevel}</div>
            </div>
            <div className="card" style={{ background: '#f9f9f9', boxShadow: 'none', marginBottom: 0 }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Writing</div>
              <div>{finalResult.writingLevel}</div>
            </div>
            <div className="card" style={{ background: '#f9f9f9', boxShadow: 'none', marginBottom: 0 }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Listening</div>
              <div>{finalResult.listeningLevel}</div>
            </div>
            <div className="card" style={{ background: '#f9f9f9', boxShadow: 'none', marginBottom: 0 }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Speaking</div>
              <div>{finalResult.speakingLevel}</div>
            </div>
          </div>

          <div style={{ marginTop: 12, color: '#666' }}>
            Completed at: {new Date(finalResult.completedAt).toLocaleString()}
          </div>
        </div>
      )}

      <div className="card">
        <h3>Test Instructions</h3>
        <ol style={{ marginLeft: 20, marginTop: 10, color: '#555' }}>
          <li>Ensure you have a stable internet connection</li>
          <li>Find a quiet environment for the speaking test</li>
          <li>Allow microphone access when prompted</li>
          <li>Complete all four modules</li>
          <li>You can save progress and continue later</li>
        </ol>
      </div>
    </div>
  );
};

export default PlacementTest;
