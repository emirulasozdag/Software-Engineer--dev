import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { assignmentsService, type AssignmentContentType, type QuestionCreate, type QuestionType } from '@/services/api/assignments.service';

type Question = {
  id: string;
  questionType: QuestionType;
  questionText: string;
  correctAnswer: string;
  points: number | null;
  options: { letter: string; text: string }[];
};

const CreateAssignment: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    studentUserIdsCsv: '',
  });
  const [contentType, setContentType] = useState<AssignmentContentType>('TEXT');
  const [contentText, setContentText] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pointError, setPointError] = useState<string | null>(null);

  const addQuestion = (type: QuestionType) => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      questionType: type,
      questionText: '',
      correctAnswer: type === 'TRUE_FALSE' ? 'true' : 'a',
      points: null,
      options: type === 'MULTIPLE_CHOICE' ? [
        { letter: 'a', text: '' },
        { letter: 'b', text: '' },
        { letter: 'c', text: '' },
        { letter: 'd', text: '' },
        { letter: 'e', text: '' },
      ] : [],
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const calculateTotalPoints = () => {
    let total = 0;
    let tfCount = 0;
    let mcCount = 0;
    let manualTotal = 0;

    questions.forEach(q => {
      if (q.points !== null && q.points > 0) {
        manualTotal += q.points;
        total += q.points;
      } else {
        if (q.questionType === 'TRUE_FALSE') tfCount++;
        else if (q.questionType === 'MULTIPLE_CHOICE') mcCount++;
      }
    });

    // Auto-calculate remaining points
    const remaining = 100 - manualTotal;
    if (remaining < 0) {
      return { total: manualTotal, error: `Manual points (${manualTotal}) exceed 100!` };
    }

    if (tfCount > 0 || mcCount > 0) {
      const k = remaining / (2 * tfCount + 5 * mcCount);
      questions.forEach(q => {
        if (q.points === null || q.points === 0) {
          if (q.questionType === 'TRUE_FALSE') {
            total += Math.floor(2 * k);
          } else if (q.questionType === 'MULTIPLE_CHOICE') {
            total += Math.floor(5 * k);
          }
        }
      });
    }

    return { total: Math.round(total), error: null };
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    setPointError(null);

    try {
      // Validate
      if (!formData.title) {
        throw new Error('Title is required');
      }

      if (contentType === 'TEXT' && !contentText) {
        throw new Error('TEXT assignments must have content');
      }

      if (contentType === 'TEST' && questions.length === 0) {
        throw new Error('TEST assignments must have at least one question');
      }

      // Validate points for TEST
      if (contentType === 'TEST') {
        const { total, error: calcError } = calculateTotalPoints();
        if (calcError) {
          setPointError(calcError);
          setIsLoading(false);
          return;
        }
        if (Math.abs(total - 100) > 1) {
          setPointError(`Total points must equal 100. Current: ${total}. Please review point allocation.`);
          setIsLoading(false);
          return;
        }

        // Validate all questions have text and correct answers
        for (const q of questions) {
          if (!q.questionText.trim()) {
            throw new Error('All questions must have text');
          }
          if (q.questionType === 'MULTIPLE_CHOICE') {
            const hasEmptyOption = q.options.some(opt => !opt.text.trim());
            if (hasEmptyOption) {
              throw new Error('All multiple choice options must have text');
            }
          }
        }
      }

      const due = formData.dueDate ? new Date(`${formData.dueDate}T00:00:00.000Z`).toISOString() : new Date().toISOString();
      const ids = formData.studentUserIdsCsv
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean)
        .map((x) => Number(x))
        .filter((n) => Number.isFinite(n) && n > 0);

      const questionsPayload: QuestionCreate[] = questions.map((q, idx) => ({
        questionType: q.questionType,
        questionText: q.questionText,
        questionOrder: idx,
        points: q.points,
        correctAnswer: q.correctAnswer,
        options: q.questionType === 'MULTIPLE_CHOICE' ? q.options.map(opt => ({
          optionLetter: opt.letter,
          optionText: opt.text,
        })) : [],
      }));

      await assignmentsService.createAssignment({
        title: formData.title,
        description: formData.description,
        dueDate: due,
        assignmentType: 'homework',
        contentType,
        contentText: contentType === 'TEXT' ? contentText : null,
        questions: contentType === 'TEST' ? questionsPayload : [],
        studentUserIds: ids,
      });

      alert('Assignment created successfully!');
      navigate('/teacher/dashboard');
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? e?.message ?? 'Failed to create assignment');
    } finally {
      setIsLoading(false);
    }
  };

  const pointCalc = calculateTotalPoints();

  return (
    <div className="container">
      <Link to="/teacher/dashboard" style={{ marginBottom: '20px', display: 'inline-block' }}>
        ← Back to Dashboard
      </Link>

      <h1 className="page-title">Create Assignment</h1>

      <div className="card">
        {error && (
          <div style={{ borderLeft: '4px solid #e74c3c', paddingLeft: '10px', marginBottom: '15px', background: '#fee' }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {pointError && (
          <div style={{ borderLeft: '4px solid #f39c12', paddingLeft: '10px', marginBottom: '15px', background: '#ffeaa7' }}>
            <strong>Point Allocation Issue:</strong> {pointError}
          </div>
        )}

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <>
            <h2>Step 1: Basic Information</h2>
            <div className="form-group">
              <label className="form-label">Assignment Title</label>
              <input
                className="input"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="e.g., Grammar Exercise: Present Perfect"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="input"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Provide detailed instructions..."
                style={{ resize: 'vertical' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input
                className="input"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Assign To (Student User IDs)</label>
              <input
                className="input"
                type="text"
                value={formData.studentUserIdsCsv}
                onChange={(e) => setFormData({ ...formData, studentUserIdsCsv: e.target.value })}
                placeholder="e.g., 12, 15, 22"
              />
              <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '5px' }}>
                Comma-separated user IDs (from Admin → User Management)
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">Assignment Type</label>
              <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setContentType('TEXT')}
                  className={contentType === 'TEXT' ? 'button button-primary' : 'button button-secondary'}
                  style={{ flex: 1 }}
                >
                  📄 TEXT (Reading Material)
                </button>
                <button
                  type="button"
                  onClick={() => setContentType('TEST')}
                  className={contentType === 'TEST' ? 'button button-primary' : 'button button-secondary'}
                  style={{ flex: 1 }}
                >
                  📝 TEST (Quiz)
                </button>
              </div>
            </div>

            <button className="button button-primary" onClick={() => setStep(2)}>
              Next →
            </button>
          </>
        )}

        {/* Step 2: Content */}
        {step === 2 && (
          <>
            <h2>Step 2: {contentType === 'TEXT' ? 'Text Content' : 'Test Questions'}</h2>

            {contentType === 'TEXT' ? (
              <div className="form-group">
                <label className="form-label">Content Text</label>
                <textarea
                  className="input"
                  rows={10}
                  value={contentText}
                  onChange={(e) => setContentText(e.target.value)}
                  placeholder="Enter the text content for students to read..."
                  style={{ resize: 'vertical', fontFamily: 'monospace' }}
                />
              </div>
            ) : (
              <>
                <div style={{ marginBottom: '20px', padding: '15px', background: '#f0f0f0', borderRadius: '8px' }}>
                  <h3 style={{ margin: '0 0 10px 0' }}>Point Allocation</h3>
                  <p style={{ margin: 0, fontSize: '0.9rem' }}>
                    <strong>Total Points: {pointCalc.total}/100</strong>
                    {pointCalc.error && <span style={{ color: '#e74c3c', marginLeft: '10px' }}>⚠️ {pointCalc.error}</span>}
                  </p>
                  <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: '#666' }}>
                    💡 Leave points blank for auto-calculation: T/F = 2pts, Multiple Choice = 5pts
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={() => addQuestion('TRUE_FALSE')}
                  >
                    + True/False Question
                  </button>
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={() => addQuestion('MULTIPLE_CHOICE')}
                  >
                    + Multiple Choice Question
                  </button>
                </div>

                {questions.map((q, idx) => (
                  <div key={q.id} style={{ border: '2px solid #ddd', borderRadius: '8px', padding: '15px', marginBottom: '15px', background: '#fff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <h4 style={{ margin: 0 }}>
                        Question {idx + 1} - {q.questionType === 'TRUE_FALSE' ? 'True/False' : 'Multiple Choice'}
                      </h4>
                      <button
                        type="button"
                        onClick={() => deleteQuestion(q.id)}
                        style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Delete
                      </button>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Question Text</label>
                      <input
                        className="input"
                        type="text"
                        value={q.questionText}
                        onChange={(e) => updateQuestion(q.id, { questionText: e.target.value })}
                        placeholder="Enter your question..."
                      />
                    </div>

                    {q.questionType === 'MULTIPLE_CHOICE' && (
                      <div className="form-group">
                        <label className="form-label">Options</label>
                        {q.options.map((opt) => (
                          <div key={opt.letter} style={{ display: 'flex', gap: '10px', marginBottom: '8px', alignItems: 'center' }}>
                            <span style={{ fontWeight: 'bold', minWidth: '30px' }}>{opt.letter.toUpperCase()})</span>
                            <input
                              className="input"
                              type="text"
                              value={opt.text}
                              onChange={(e) => {
                                const newOptions = q.options.map(o =>
                                  o.letter === opt.letter ? { ...o, text: e.target.value } : o
                                );
                                updateQuestion(q.id, { options: newOptions });
                              }}
                              placeholder={`Option ${opt.letter.toUpperCase()}`}
                              style={{ flex: 1 }}
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="form-group">
                      <label className="form-label">Correct Answer</label>
                      {q.questionType === 'TRUE_FALSE' ? (
                        <select
                          className="input"
                          value={q.correctAnswer}
                          onChange={(e) => updateQuestion(q.id, { correctAnswer: e.target.value })}
                        >
                          <option value="true">True</option>
                          <option value="false">False</option>
                        </select>
                      ) : (
                        <select
                          className="input"
                          value={q.correctAnswer}
                          onChange={(e) => updateQuestion(q.id, { correctAnswer: e.target.value })}
                        >
                          {q.options.map(opt => (
                            <option key={opt.letter} value={opt.letter}>{opt.letter.toUpperCase()}</option>
                          ))}
                        </select>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label">Points (optional - leave blank for auto-calculation)</label>
                      <input
                        className="input"
                        type="number"
                        min="0"
                        max="100"
                        value={q.points ?? ''}
                        onChange={(e) => updateQuestion(q.id, { points: e.target.value ? Number(e.target.value) : null })}
                        placeholder={q.questionType === 'TRUE_FALSE' ? 'Auto: 2 pts' : 'Auto: 5 pts'}
                      />
                    </div>
                  </div>
                ))}

                {questions.length === 0 && (
                  <p style={{ textAlign: 'center', color: '#666', padding: '40px 0' }}>
                    No questions yet. Click the buttons above to add questions.
                  </p>
                )}
              </>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button className="button button-secondary" onClick={() => setStep(1)}>
                ← Back
              </button>
              <button className="button button-primary" onClick={() => setStep(3)}>
                Review →
              </button>
            </div>
          </>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <>
            <h2>Step 3: Review & Submit</h2>

            <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
              <h3>Assignment Details</h3>
              <p><strong>Title:</strong> {formData.title}</p>
              <p><strong>Description:</strong> {formData.description || 'None'}</p>
              <p><strong>Due Date:</strong> {formData.dueDate}</p>
              <p><strong>Type:</strong> {contentType}</p>
              <p><strong>Students:</strong> {formData.studentUserIdsCsv || 'None'}</p>

              {contentType === 'TEXT' && (
                <div>
                  <strong>Content Preview:</strong>
                  <div style={{ background: 'white', padding: '10px', marginTop: '5px', borderRadius: '4px', maxHeight: '200px', overflow: 'auto' }}>
                    {contentText.substring(0, 500)}{contentText.length > 500 ? '...' : ''}
                  </div>
                </div>
              )}

              {contentType === 'TEST' && (
                <div>
                  <strong>Questions:</strong> {questions.length}
                  <br />
                  <strong>Total Points:</strong> {pointCalc.total}/100
                  {pointCalc.error && <span style={{ color: '#e74c3c' }}> - {pointCalc.error}</span>}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="button button-secondary" onClick={() => setStep(2)}>
                ← Back
              </button>
              <button
                className="button button-primary"
                onClick={handleSubmit}
                disabled={isLoading || (contentType === 'TEST' && pointCalc.error !== null)}
              >
                {isLoading ? 'Creating...' : 'Create Assignment'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CreateAssignment;
