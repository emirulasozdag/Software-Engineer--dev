import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

import { teacherService } from '@/services/api';
import { progressService } from '@/services/api/progress.service';
import { communicationService } from '@/services/api/communication.service';
import { PlacementTestResult } from '@/types/test.types';
import { StudentOverview, TeacherDirective } from '@/types/teacher.types';
import { ProgressResponse } from '@/types/progress.types';

type TeacherTestResult = PlacementTestResult & {
  testId?: string;
  score?: number;
};

const StudentDetails: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const [student, setStudent] = useState<StudentOverview | null>(null);
  const [results, setResults] = useState<TeacherTestResult[]>([]);
  const [progress, setProgress] = useState<ProgressResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [sendingReminder, setSendingReminder] = useState(false);

  // AI Directive state
  const [focusAreas, setFocusAreas] = useState('');
  const [instructions, setInstructions] = useState('');
  const [sendingDirective, setSendingDirective] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const load = async () => {
    if (!studentId) return;
    setLoading(true);
    setError(null);
    try {
      const [details, testResults, progressData] = await Promise.all([
        teacherService.getStudentDetails(studentId),
        teacherService.getStudentTestResults(studentId),
        progressService.getStudentProgress(parseInt(studentId)),
      ]);
      setStudent(details);
      setResults(testResults);
      setProgress(progressData);
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Student details could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  const sorted = useMemo(() => {
    return [...results].sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
  }, [results]);

  const sendPlacementReminder = async () => {
    if (!studentId || !student) return;
    setSendingReminder(true);
    setError(null);
    setNotice(null);
    try {
      const subject = 'Placement Test Reminder (UC6)';
      const content =
        `Hi ${student.name},\n\n` +
        `I noticed you haven't completed your placement test yet.\n` +
        `Please go to: Student Dashboard → Placement Test, and finish all modules (Reading/Writing/Listening/Speaking).\n\n` +
        `Why: We use your results to determine your level and generate a personalized plan (UC7) and content (UC8–UC9).\n\n` +
        `Thank you!`;

      await communicationService.sendMessage(String(studentId), subject, content);
      setNotice('Reminder message sent to the student (UC18).');
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Reminder message could not be sent.');
    } finally {
      setSendingReminder(false);
    }
  };

  const sendAIDirective = async () => {
    if (!studentId) return;
    if (!instructions.trim()) {
      setError('Please provide instructions for the AI engine.');
      return;
    }

    setSendingDirective(true);
    setError(null);
    setNotice(null);

    try {
      // Parse focus areas from comma-separated string
      const focusAreasList = focusAreas
        .split(',')
        .map((area) => area.trim())
        .filter((area) => area.length > 0);

      const directive: TeacherDirective = {
        studentId: studentId,
        contentType: 'general', // Default content type
        focusAreas: focusAreasList,
        instructions: instructions.trim(),
      };

      await teacherService.sendAIDirective(directive);
      setNotice('AI Content Directive saved successfully (FR35). It will be applied to all future content generated for this student.');
      // Clear the form
      setFocusAreas('');
      setInstructions('');
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Failed to save AI directive.');
    } finally {
      setSendingDirective(false);
    }
  };

  const downloadPdf = async () => {
    if (!studentId) return;
    setIsDownloadingPdf(true);
    setError(null);
    try {
      const blob = await progressService.exportProgressPdf(parseInt(studentId));
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `progress-${studentId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.message || 'Failed to export PDF');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  return (
    <div className="container">
      <Link to="/teacher/students" style={{ marginBottom: '20px', display: 'inline-block' }}>
        ← Back to Student List
      </Link>
      
      <div className="toolbar">
        <div>
          <h1 className="page-title" style={{ marginBottom: 0 }}>Student Details (UC6)</h1>
          <div className="subtitle">Öğrencinin placement test sonuçlarını görüntüle.</div>
        </div>
        <div className="actions">
          <button className="button button-primary" onClick={load} disabled={loading}>
            {loading ? 'Loading…' : 'Refresh'}
          </button>
        </div>
      </div>

      {error && <div className="card" style={{ borderColor: 'rgba(220,38,38,0.25)', background: 'rgba(220,38,38,0.06)' }}>{error}</div>}
      {notice && <div className="card" style={{ borderColor: 'rgba(37,99,235,0.25)', background: 'rgba(37,99,235,0.06)' }}>{notice}</div>}
      
      <div className="card">
        {loading ? (
          <div className="loading">Loading…</div>
        ) : (
          <>
            <h2 style={{ marginBottom: 6 }}>{student?.name || 'Student'}</h2>
            <div className="text-muted">{student?.email}</div>
            <div className="divider" />
            <div className="kpis">
              <div className="kpi">
                <div className="label">User ID</div>
                <div className="value">{studentId}</div>
              </div>
              <div className="kpi">
                <div className="label">Current Level</div>
                <div className="value">{student?.currentLevel || '—'}</div>
              </div>
              <div className="kpi">
                <div className="label">Last Activity</div>
                <div className="value" style={{ fontSize: '0.95rem' }}>
                  {student?.lastActivity ? new Date(student.lastActivity).toLocaleDateString() : '—'}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="card">
        <div className="toolbar">
          <div>
            <h2 style={{ marginBottom: 6 }}>Placement Test Results</h2>
            <div className="text-muted">UC6: teacher result view</div>
          </div>
          <span className="pill">{sorted.length} results</span>
        </div>
        <div className="divider" />

        {loading ? (
          <div className="loading">Loading…</div>
        ) : sorted.length === 0 ? (
          <div className="list">
            <div className="list-item" style={{ cursor: 'default' }}>
              <div style={{ fontWeight: 900 }}>No test results yet</div>
              <div className="text-muted" style={{ marginTop: 6 }}>
                Öğrenci placement testi tamamlamadığı için UC6 sonucu oluşmamış.
              </div>
              <div className="divider" />
              <div className="actions">
                <button className="button button-primary" onClick={sendPlacementReminder} disabled={sendingReminder}>
                  {sendingReminder ? 'Sending…' : 'Send Reminder (UC18)'}
                </button>
                <Link to="/teacher/messages" className="link" style={{ alignSelf: 'center' }}>
                  Go to Messages
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="list">
            {sorted.map((r) => (
              <div key={r.id} className="list-item" style={{ cursor: 'default' }}>
                <div className="toolbar">
                  <div>
                    <div style={{ fontWeight: 900 }}>
                      Overall: <span className="pill">{r.overallLevel}</span>
                      {typeof r.score === 'number' && <span className="pill" style={{ marginLeft: 8 }}>Score: {r.score}</span>}
                    </div>
                    <div className="text-muted" style={{ marginTop: 6 }}>
                      {new Date(r.completedAt).toLocaleString()} {r.testId ? `· TestID ${r.testId}` : ''}
                    </div>
                  </div>
                </div>
                <div className="divider" />
                <div className="kpis">
                  <div className="kpi">
                    <div className="label">Reading</div>
                    <div className="value">{r.readingLevel}</div>
                  </div>
                  <div className="kpi">
                    <div className="label">Writing</div>
                    <div className="value">{r.writingLevel}</div>
                  </div>
                  <div className="kpi">
                    <div className="label">Listening</div>
                    <div className="value">{r.listeningLevel}</div>
                  </div>
                  <div className="kpi">
                    <div className="label">Speaking</div>
                    <div className="value">{r.speakingLevel}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h2>Learning Statistics</h2>
        {progress ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '20px' }}>
            <div style={{ padding: '20px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Daily Streak</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{progress.dailyStreak || 0}</div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>days</div>
            </div>
            <div style={{ padding: '20px', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Content Completed</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{progress.completedContentCount || 0}</div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>pieces</div>
            </div>
            <div style={{ padding: '20px', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Current Level</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{progress.currentLevel || 'N/A'}</div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>CEFR</div>
            </div>
          </div>
        ) : (
          <p className="text-muted">Loading progress data...</p>
        )}
      </div>

      <div className="card">
        <h2>Progress Over Time</h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>Track the student's learning journey with completed content and CEFR level progression</p>

        {progress && progress.timeline.length > 0 ? (
          <div style={{ overflowX: 'auto', marginTop: '20px' }}>
            <div style={{ minWidth: '600px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', height: '300px', gap: '8px', padding: '20px', background: '#f9f9f9', borderRadius: '8px' }}>
                {progress.timeline.map((point, idx) => {
                  const maxContent = Math.max(...progress.timeline.map(p => p.completedContentCount), 1);
                  const height = (point.completedContentCount / maxContent) * 100;

                  return (
                    <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div
                        style={{
                          width: '100%',
                          height: `${height}%`,
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          borderRadius: '4px 4px 0 0',
                          position: 'relative',
                          minHeight: '4px',
                          transition: 'all 0.3s ease',
                        }}
                        title={`${point.completedContentCount} content pieces\n${point.cefrLevel || 'No level'}`}
                      >
                        <div style={{
                          position: 'absolute',
                          top: '-25px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          whiteSpace: 'nowrap',
                        }}>
                          {point.completedContentCount}
                        </div>
                        {point.cefrLevel && (
                          <div style={{
                            position: 'absolute',
                            top: '-45px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            fontSize: '11px',
                            color: '#3498db',
                            fontWeight: 'bold',
                            whiteSpace: 'nowrap',
                          }}>
                            {point.cefrLevel}
                          </div>
                        )}
                      </div>
                      <div style={{ marginTop: '8px', fontSize: '11px', color: '#666', transform: 'rotate(-45deg)', whiteSpace: 'nowrap' }}>
                        {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: '20px', padding: '15px', background: '#f0f0f0', borderRadius: '8px' }}>
                <h4 style={{ marginTop: 0, marginBottom: '10px' }}>Legend</h4>
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '20px', height: '20px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '4px' }}></div>
                    <span style={{ fontSize: '14px' }}>Completed Content Count</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '14px', color: '#3498db', fontWeight: 'bold' }}>Level Tag:</span>
                    <span style={{ fontSize: '14px' }}>CEFR Level at that point</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p style={{ color: '#999', padding: '40px', textAlign: 'center', background: '#f9f9f9', borderRadius: '8px' }}>
            {loading ? 'Loading progress data…' : 'No timeline data available yet. Student needs to complete some content to see progress!'}
          </p>
        )}
      </div>

      {/* Content Type Progress */}
      {progress && progress.contentTypeProgress.length > 0 && (
        <div className="card">
          <h2>Content Completion by Type</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginTop: '20px' }}>
            {progress.contentTypeProgress.map((ct) => (
              <div key={ct.contentType} style={{ padding: '15px', background: '#f9f9f9', borderRadius: '8px', textAlign: 'center', border: '2px solid #e0e0e0' }}>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px', textTransform: 'capitalize' }}>{ct.contentType}</div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3498db' }}>{ct.completedCount}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Personal Plan Topic Progress */}
      {progress && progress.topicProgress.length > 0 && (
        <div className="card">
          <h2>Personal Plan Topic Progress</h2>
          <div style={{ marginTop: '20px' }}>
            {progress.topicProgress.map((topic) => (
              <div key={topic.topicName} style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '15px' }}>{topic.topicName}</span>
                  <span style={{ color: '#666', fontSize: '14px' }}>
                    {topic.completedCount}/{topic.totalCount} ({Math.round(topic.progress * 100)}%)
                  </span>
                </div>
                <div style={{ width: '100%', height: '12px', background: '#e0e0e0', borderRadius: '6px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${topic.progress * 100}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                      transition: 'width 0.3s ease',
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <h2>Strengths & Weaknesses</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '15px' }}>
          <div>
            <h3>Strengths</h3>
            {student?.strengths?.length ? (
              <div className="chip-row">
                {student.strengths.map((s) => (
                  <span key={s} className="chip">{s}</span>
                ))}
              </div>
            ) : (
              <div className="text-muted">No strengths detected yet.</div>
            )}
          </div>
          <div>
            <h3>Areas for Improvement</h3>
            {student?.weaknesses?.length ? (
              <div className="chip-row">
                {student.weaknesses.map((w) => (
                  <span key={w} className="chip">{w}</span>
                ))}
              </div>
            ) : (
              <div className="text-muted">No weaknesses detected yet.</div>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <h2>AI Content Directive</h2>
        <p>Provide instructions to the AI engine for personalized content generation (FR35)</p>
        <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '15px' }}>
          These directives will be saved and included in all future AI-generated content for this student.
          Examples: "Provide easier questions", "Focus on speaking fluency", "Challenge with B2-level content".
        </p>
        <div className="form-group">
          <label className="form-label">Focus Areas (comma-separated)</label>
          <input
            className="input"
            type="text"
            placeholder="e.g., Speaking practice, Advanced grammar, Pronunciation"
            value={focusAreas}
            onChange={(e) => setFocusAreas(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Special Instructions</label>
          <textarea
            className="input"
            rows={4}
            placeholder="Specific guidance for AI content generation... e.g., 'Provide lighter questions as the student struggles with complex grammar' or 'Challenge with above-level content to prepare for B2 exam'"
            style={{ resize: 'vertical' }}
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
          />
        </div>
        <button
          className="button button-primary"
          onClick={sendAIDirective}
          disabled={sendingDirective || !instructions.trim()}
        >
          {sendingDirective ? 'Saving…' : 'Send Directive to AI'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <button className="button button-primary" onClick={downloadPdf} disabled={isDownloadingPdf}>
          {isDownloadingPdf ? 'Preparing PDF…' : 'Export Progress (PDF)'}
        </button>
      </div>
    </div>
  );
};

export default StudentDetails;
