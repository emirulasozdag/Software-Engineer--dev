import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { assignmentsService, type QuestionOut } from '@/services/api/assignments.service';

const AssignmentDetail: React.FC = () => {
    const { studentAssignmentId } = useParams<{ studentAssignmentId: string }>();
    const navigate = useNavigate();
    const [assignment, setAssignment] = useState<any>(null);
    const [questions, setQuestions] = useState<QuestionOut[]>([]);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!studentAssignmentId) return;

            setIsLoading(true);
            setError(null);

            try {
                // Get assignment info from student assignments list
                const myAssignments = await assignmentsService.getMyAssignments();
                const found = myAssignments.assignments.find(a => a.studentAssignmentId === Number(studentAssignmentId));

                if (!found || !found.assignment) {
                    throw new Error('Assignment not found');
                }

                setAssignment(found);

                // If TEST, fetch questions
                if (found.assignment.contentType === 'TEST') {
                    const qs = await assignmentsService.getAssignmentQuestions(found.assignmentId);
                    setQuestions(qs);

                    // Initialize answers
                    const initialAnswers: Record<number, string> = {};
                    qs.forEach(q => {
                        initialAnswers[q.questionId] = q.questionType === 'TRUE_FALSE' ? 'true' : 'a';
                    });
                    setAnswers(initialAnswers);
                }
            } catch (e: any) {
                setError(e?.response?.data?.detail ?? e?.message ?? 'Failed to load assignment');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [studentAssignmentId]);

    const handleSubmit = async () => {
        if (!studentAssignmentId || !assignment) return;

        setIsSubmitting(true);
        setError(null);

        try {
            if (assignment.assignment.contentType === 'TEXT') {
                // Just mark as submitted
                await assignmentsService.submitMyAssignment(Number(studentAssignmentId));
                alert('Assignment submitted successfully!');
            } else {
                // Submit test answers
                const answerArray = Object.entries(answers).map(([questionId, answer]) => ({
                    questionId: Number(questionId),
                    answer,
                }));

                await assignmentsService.submitTestAnswers(Number(studentAssignmentId), answerArray);
                alert('Test submitted and graded!');
            }

            navigate('/student/assignments');
        } catch (e: any) {
            setError(e?.response?.data?.detail ?? e?.message ?? 'Failed to submit assignment');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="container">
                <p>Loading...</p>
            </div>
        );
    }

    if (error || !assignment) {
        return (
            <div className="container">
                <Link to="/student/assignments" style={{ marginBottom: '20px', display: 'inline-block' }}>
                    ← Back to Assignments
                </Link>
                <div className="card" style={{ borderLeft: '4px solid #e74c3c' }}>
                    <strong>Error:</strong> {error || 'Assignment not found'}
                </div>
            </div>
        );
    }

    const isText = assignment.assignment.contentType === 'TEXT';

    return (
        <div className="container">
            <Link to="/student/assignments" style={{ marginBottom: '20px', display: 'inline-block' }}>
                ← Back to Assignments
            </Link>

            <h1 className="page-title">{assignment.assignment.title}</h1>

            <div className="card">
                <div style={{ marginBottom: '20px', padding: '15px', background: '#f0f0f0', borderRadius: '8px' }}>
                    <p style={{ margin: '5px 0' }}>
                        <strong>Type:</strong> {isText ? '📄 TEXT' : '📝 TEST'}
                    </p>
                    <p style={{ margin: '5px 0' }}>
                        <strong>Due Date:</strong> {new Date(assignment.assignment.dueDate).toLocaleDateString()}
                    </p>
                    {assignment.assignment.description && (
                        <p style={{ margin: '5px 0' }}>
                            <strong>Description:</strong> {assignment.assignment.description}
                        </p>
                    )}
                </div>

                {error && (
                    <div style={{ borderLeft: '4px solid #e74c3c', paddingLeft: '10px', marginBottom: '15px', background: '#fee' }}>
                        <strong>Error:</strong> {error}
                    </div>
                )}

                {isText ? (
                    <>
                        <h2>Content</h2>
                        <div style={{
                            background: 'white',
                            padding: '20px',
                            borderRadius: '8px',
                            border: '1px solid #ddd',
                            whiteSpace: 'pre-wrap',
                            lineHeight: '1.6',
                            fontFamily: 'Georgia, serif',
                            fontSize: '1.05rem'
                        }}>
                            {assignment.assignment.contentText}
                        </div>

                        <div style={{ marginTop: '30px', textAlign: 'center' }}>
                            <button
                                className="button button-primary"
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                style={{ minWidth: '200px' }}
                            >
                                {isSubmitting ? 'Submitting...' : 'Mark as Read & Submit'}
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <h2>Test Questions</h2>
                        <p style={{ color: '#666', marginBottom: '20px' }}>
                            Answer all questions below and click Submit when ready.
                        </p>

                        {questions.map((q, idx) => (
                            <div
                                key={q.questionId}
                                style={{
                                    border: '2px solid #ddd',
                                    borderRadius: '8px',
                                    padding: '20px',
                                    marginBottom: '20px',
                                    background: '#fafafa'
                                }}
                            >
                                <h3 style={{ marginTop: 0 }}>
                                    Question {idx + 1} ({q.points} points)
                                </h3>
                                <p style={{ fontSize: '1.1rem', marginBottom: '15px' }}>{q.questionText}</p>

                                {q.questionType === 'TRUE_FALSE' ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                            <input
                                                type="radio"
                                                name={`question-${q.questionId}`}
                                                value="true"
                                                checked={answers[q.questionId] === 'true'}
                                                onChange={(e) => setAnswers({ ...answers, [q.questionId]: e.target.value })}
                                            />
                                            <span style={{ fontSize: '1.05rem' }}>True</span>
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                            <input
                                                type="radio"
                                                name={`question-${q.questionId}`}
                                                value="false"
                                                checked={answers[q.questionId] === 'false'}
                                                onChange={(e) => setAnswers({ ...answers, [q.questionId]: e.target.value })}
                                            />
                                            <span style={{ fontSize: '1.05rem' }}>False</span>
                                        </label>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {q.options.map((opt) => (
                                            <label
                                                key={opt.optionLetter}
                                                style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
                                            >
                                                <input
                                                    type="radio"
                                                    name={`question-${q.questionId}`}
                                                    value={opt.optionLetter}
                                                    checked={answers[q.questionId] === opt.optionLetter}
                                                    onChange={(e) => setAnswers({ ...answers, [q.questionId]: e.target.value })}
                                                />
                                                <span style={{ fontSize: '1.05rem' }}>
                                                    <strong>{opt.optionLetter.toUpperCase()})</strong> {opt.optionText}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}

                        <div style={{ marginTop: '30px', textAlign: 'center' }}>
                            <button
                                className="button button-primary"
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                style={{ minWidth: '200px', fontSize: '1.1rem', padding: '12px 24px' }}
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Test'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AssignmentDetail;
