import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

import { teacherService } from '@/services/api';
import { communicationService } from '@/services/api/communication.service';
import { PlacementTestResult } from '@/types/test.types';
import { StudentOverview, TeacherDirective } from '@/types/teacher.types';

type TeacherTestResult = PlacementTestResult & {
  testId?: string;
  score?: number;
};

const StudentDetails: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const [student, setStudent] = useState<StudentOverview | null>(null);
  const [results, setResults] = useState<TeacherTestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [sendingReminder, setSendingReminder] = useState(false);

  // AI Directive state
  const [focusAreas, setFocusAreas] = useState('');
  const [instructions, setInstructions] = useState('');
  const [sendingDirective, setSendingDirective] = useState(false);

  const load = async () => {
    if (!studentId) return;
    setLoading(true);
    setError(null);
    try {
      const [details, testResults] = await Promise.all([
        teacherService.getStudentDetails(studentId),
        teacherService.getStudentTestResults(studentId),
      ]);
      setStudent(details);
      setResults(testResults);
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
        <h2>Progress Chart</h2>
        <div style={{ height: '200px', background: '#f9f9f9', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' }}>
          <p style={{ color: '#999' }}>[Student progress visualization will be displayed here]</p>
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
        <button className="button button-primary">Export Progress (PDF)</button>
        <button className="button button-secondary">Export Progress (CSV)</button>
      </div>
    </div>
  );
};

export default StudentDetails;
